"""
core/authentication.py
══════════════════════
TenantAwareJWTAuthentication
━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHY THIS EXISTS
───────────────
The default JWTAuthentication from djangorestframework-simplejwt only checks:
  1. Is the token's signature valid?
  2. Has the token expired?

It does NOT check which tenant issued the token.

Attack scenario this prevents:
  • Alice logs in at company-a.avanzo.com → gets a valid JWT.
  • Alice (or a hacker with her token) sends it to company-b.avanzo.com.
  • django-tenants switches to company_b schema.
  • Without this class: Alice is authenticated and reads Company B's data. 🚨
  • With this class: Request is REJECTED with 401. ✅

HOW IT WORKS
────────────
Step 1: At login, CustomTokenObtainPairSerializer stamps the schema name into
        the JWT payload (e.g. {"tenant_schema": "company_a", ...}).

Step 2: On every subsequent request, this class runs get_validated_token().
        It does the standard validation, THEN compares:
            token["tenant_schema"]  vs  connection.tenant.schema_name

Step 3: If they don't match → raise AuthenticationFailed (HTTP 401).
        The error message deliberately doesn't reveal schema names — it's
        ambiguous to prevent schema enumeration attacks.

USAGE
─────
In config/settings.py:
    REST_FRAMEWORK = {
        "DEFAULT_AUTHENTICATION_CLASSES": (
            "core.authentication.TenantAwareJWTAuthentication",
        ),
    }
"""

import logging

from django.db import connection
from drf_spectacular.extensions import OpenApiAuthenticationExtension
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication

# Use Django's standard logger — never print() in production code.
# Logs are captured by your server's log aggregator (e.g. Coolify's log viewer).
logger = logging.getLogger(__name__)


class TenantAwareJWTAuthentication(JWTAuthentication):
    """
    Extends JWTAuthentication with a tenant-boundary enforcement check.

    This is a drop-in replacement — it does everything the default class does,
    plus one extra check: the token MUST have been issued by the same tenant
    schema that this request is being made against.

    Raises:
        AuthenticationFailed: If the token's tenant_schema does not match the
            current active PostgreSQL schema (i.e. the request subdomain).
    """

    def get_validated_token(self, raw_token: bytes):
        """
        Validate the token normally, then enforce the tenant boundary.

        Args:
            raw_token: The raw bytes of the JWT from the Authorization header.

        Returns:
            The validated token object (same as parent class).

        Raises:
            AuthenticationFailed: On any validation failure including tenant mismatch.
        """
        # ── Step 1: Run the full standard JWT validation ─────────────────────
        # This checks: signature integrity, expiry, token type (access vs refresh).
        # If any standard check fails, it raises InvalidToken here and we never
        # reach our custom check. That's exactly what we want.
        token = super().get_validated_token(raw_token)

        # ── Step 2: Extract the tenant claim we embedded at login ─────────────
        # token.get() returns None if the claim is missing (e.g. old tokens
        # issued before this feature was added — we allow those gracefully
        # during a rolling deployment to avoid locking everyone out).
        token_schema: str | None = token.get("tenant_schema")

        # ── Step 3: Get the currently active schema from django-tenants ───────
        # connection.tenant is set by TenantMainMiddleware BEFORE authentication
        # runs. It reads the subdomain from the request's Host header.
        current_schema: str = connection.tenant.schema_name

        # ── Step 4: Enforce the boundary ──────────────────────────────────────
        if token_schema is not None and token_schema != current_schema:
            # Log the mismatch for security audit trail (server-side only).
            # We intentionally do NOT include schema names in the client error
            # to prevent attackers from learning valid schema names.
            logger.warning(
                "Tenant boundary violation: token issued for schema '%s' "
                "was used against schema '%s'. Request blocked.",
                token_schema,
                current_schema,
            )
            raise AuthenticationFailed(
                "Authentication credentials are not valid for this workspace. Please log in again.",
                code="tenant_mismatch",
            )

        return token


# ── drf-spectacular extension ──────────────────────────────────────────────────
# drf-spectacular introspects every authentication class on every view to build
# the OpenAPI security scheme section.  When it encounters a class it doesn't
# recognise it emits a warning and skips it.  Subclassing
# OpenApiAuthenticationExtension and setting `target_class` to the dotted path
# of our authenticator registers it globally — no other wiring is required.
#
# Because this module is imported by Django when it resolves
# DEFAULT_AUTHENTICATION_CLASSES, the extension is always registered before
# `manage.py spectacular` runs its introspection pass.
class TenantAwareJWTAuthenticationExtension(OpenApiAuthenticationExtension):
    """
    Tells drf-spectacular that TenantAwareJWTAuthentication uses the
    standard HTTP Bearer / JWT scheme.

    The security definition produced here is what appears in the generated
    schema.yaml 'securitySchemes' section and on each endpoint that requires
    authentication.
    """

    # Must be the full dotted import path — exactly as written in settings.py.
    target_class = "core.authentication.TenantAwareJWTAuthentication"

    # The name that appears in the OpenAPI 'securitySchemes' map.
    name = "jwtAuth"

    def get_security_definition(self, auto_schema):
        """
        Returns the OpenAPI 3.0 security scheme object for this authenticator.

        We declare it as an HTTP Bearer scheme so tools like Swagger UI
        render the padlock icon and a 'Authorize' dialog with a token input.
        """
        return {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": (
                "JWT Bearer token obtained from `POST /api/auth/login/`. "
                "Tokens are **tenant-scoped** — a token issued for one workspace "
                "(`company-a.avanzo.com`) will be rejected by any other workspace. "
                "Pass the access token as: `Authorization: Bearer <token>`."
            ),
        }
