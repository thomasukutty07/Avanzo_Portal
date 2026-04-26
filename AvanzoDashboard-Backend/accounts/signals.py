"""
accounts/signals.py
═══════════════════
Listens to django-tenants' `post_schema_sync` signal.

Every time a new tenant schema is created and migrated, this signal
fires and seeds the 4 mandatory RBAC roles into the `access_roles`
table inside that tenant's schema.

Uses `get_or_create` so it is idempotent — safe to run on existing
tenants during re-migration without duplicating rows.
"""

import logging

from django.dispatch import receiver
from django_tenants.signals import post_schema_sync
from django_tenants.utils import schema_context

logger = logging.getLogger(__name__)

# ── Role definitions ────────────────────────────────────────────────────────
# Kept here (not in constants.py) because descriptions are seed-data specific.
# Role NAMES still match core.constants.RoleNames exactly.
DEFAULT_ROLES = [
    ("Employee", "Standard employee with basic dashboard access."),
    ("Team Lead", "Can manage team members, assign tasks, and approve attendance."),
    ("HR", "Can manage employees, leaves, and organization settings."),
    ("Admin", "Full system administrator with unrestricted access."),
]


@receiver(post_schema_sync)
def seed_rbac_roles(sender, tenant, **kwargs):
    """
    Auto-seed 4 RBAC roles after a tenant schema is synced.

    Fires for EVERY `migrate_schemas` call (new + existing tenants).
    `get_or_create` makes it idempotent — no duplicates on re-runs.
    Skips the public schema since roles are tenant-specific data.
    """
    # ── Guard: skip public schema ───────────────────────────────────────
    # The public schema only holds Client/Domain — no AccessRole table.
    if tenant.schema_name == "public":
        return

    with schema_context(tenant.schema_name):
        from accounts.models import AccessRole

        created_count = 0
        for name, description in DEFAULT_ROLES:
            _, created = AccessRole.objects.get_or_create(
                name=name,
                defaults={"description": description},
            )
            if created:
                created_count += 1

        if created_count:
            logger.info(
                "Seeded %d RBAC role(s) in tenant '%s'.",
                created_count,
                tenant.schema_name,
            )
