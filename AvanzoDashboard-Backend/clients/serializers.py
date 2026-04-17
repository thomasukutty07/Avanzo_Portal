"""
clients/serializers.py
══════════════════════
OrganizationRegistrationSerializer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHY THIS EXISTS
───────────────
When a new company wants to use Avanzo, the CEO / IT admin fills out a
registration form on the public landing page (no subdomain yet).

This serializer validates that input:
  1. Company name (display name shown in the dashboard)
  2. Subdomain slug (e.g. "acme" → acme.avanzo.com)
  3. Admin email + password + name (first super-user inside the new tenant)

Security considerations:
  • The subdomain is sanitised to lowercase alphanumeric + hyphens.
  • A deny-list blocks reserved words like "admin", "api", "www".
  • Password is validated against Django's AUTH_PASSWORD_VALIDATORS.
  • No secrets are accepted or returned — the response only contains
    the new subdomain so the frontend can redirect.
"""

import re

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import Client, Domain

# ── Subdomain deny-list ──────────────────────────────────────────────────────
# Slugs that must never be used as tenant subdomains because they would
# collide with infrastructure routes (e.g. api.avanzo.com, www.avanzo.com)
# or be misleading to users (e.g. "admin", "support").
RESERVED_SUBDOMAINS = frozenset(
    {
        "admin",
        "api",
        "app",
        "blog",
        "dev",
        "docs",
        "ftp",
        "mail",
        "pop",
        "smtp",
        "staging",
        "static",
        "status",
        "support",
        "test",
        "www",
    }
)

# Only lowercase letters, digits, and hyphens. No leading/trailing hyphens.
SUBDOMAIN_REGEX = re.compile(r"^[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?$")


class OrganizationRegistrationSerializer(serializers.Serializer):
    """
    Validates input for the public organization registration endpoint.

    This is a plain Serializer (not ModelSerializer) because one request
    creates records across TWO models (Client + Domain) in the public
    schema AND an Employee in the new tenant schema.  A ModelSerializer
    can only map to a single model, so a plain Serializer gives us full
    control over the create() logic.
    """

    # ── Organization fields ──────────────────────────────────────────
    company_name = serializers.CharField(
        max_length=100,
        help_text="Display name of the organization, e.g. 'Acme Corporation'.",
    )
    subdomain = serializers.CharField(
        max_length=63,
        help_text=(
            "URL-safe slug for the workspace subdomain. "
            "Lowercase letters, digits, and hyphens only. "
            "Example: 'acme' → acme.avanzo.com"
        ),
    )

    # ── Admin user fields ────────────────────────────────────────────
    admin_email = serializers.EmailField(
        help_text="Email for the first Admin user inside the new workspace.",
    )
    admin_password = serializers.CharField(
        write_only=True,
        min_length=10,
        help_text="Password for the admin user (min 10 characters).",
    )
    admin_first_name = serializers.CharField(
        max_length=150,
        help_text="First name of the admin user.",
    )
    admin_last_name = serializers.CharField(
        max_length=150,
        help_text="Last name of the admin user.",
    )

    # ── Subdomain validation ─────────────────────────────────────────
    def validate_subdomain(self, value: str) -> str:
        """
        Ensures the subdomain is:
          1. Lowercase (we force it, don't reject)
          2. Matches the allowed character regex
          3. Not in the reserved deny-list
          4. Not already taken by another tenant
        """
        slug = value.strip().lower()

        if not SUBDOMAIN_REGEX.match(slug):
            raise serializers.ValidationError(
                "Subdomain must contain only lowercase letters, digits, and hyphens. "
                "It cannot start or end with a hyphen."
            )

        if slug in RESERVED_SUBDOMAINS:
            raise serializers.ValidationError(
                f"'{slug}' is reserved and cannot be used as a workspace subdomain."
            )

        # Check for uniqueness across ALL tenant schemas.
        # schema_name is the PostgreSQL schema, which we derive from the slug
        # by replacing hyphens with underscores (PG schema names can't have hyphens).
        schema_name = slug.replace("-", "_")
        if Client.objects.filter(schema_name=schema_name).exists():
            raise serializers.ValidationError(
                "This workspace name is already taken. Please choose another."
            )

        # Also check if the domain already exists (belt + suspenders).
        if Domain.objects.filter(domain__istartswith=slug).exists():
            raise serializers.ValidationError(
                "This workspace name is already taken. Please choose another."
            )

        return slug

    # ── Password validation ──────────────────────────────────────────
    def validate_admin_password(self, value: str) -> str:
        """
        Runs Django's built-in password validators (length, common passwords,
        similarity to user attributes, etc.) — same validators configured in
        AUTH_PASSWORD_VALIDATORS in settings.py.
        """
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.messages) from e
        return value
