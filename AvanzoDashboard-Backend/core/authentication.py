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

        # ── Step 2: Enforce token type — only ACCESS tokens allowed here ──────
        # Prevents refresh tokens from being used as access tokens directly.
        token_type = token.get("token_type", "")
        if token_type != "access":
            logger.warning(
                "Rejected non-access token type '%s' used as bearer token.", token_type
            )
            raise AuthenticationFailed(
                "Invalid token type. Only access tokens are accepted.",
                code="token_type_invalid",
            )

        # ── Step 3: Enforce tenant boundary ───────────────────────────────────
        # A token issued by tenant "company_a" must NOT authenticate at "company_b".
        # The tenant schema name is embedded into the JWT at login time by
        # CustomTokenObtainPairSerializer.
        token_tenant = token.get("tenant_schema")
        current_tenant = connection.tenant.schema_name if hasattr(connection, "tenant") else None

        if token_tenant and current_tenant and token_tenant != current_tenant:
            # Deliberately ambiguous message — don't reveal schema names to attackers.
            logger.warning(
                "Tenant mismatch: token issued for '%s' used against '%s'.",
                token_tenant,
                current_tenant,
            )
            raise AuthenticationFailed(
                "Authentication credentials are invalid for this workspace.",
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
