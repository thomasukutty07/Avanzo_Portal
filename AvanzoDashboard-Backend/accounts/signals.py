"""
accounts/signals.py
═══════════════════
Seeds the 4 mandatory RBAC roles after migrations run.
Using post_migrate signal (Django built-in, no django-tenants required).
"""

import logging

from django.db.models.signals import post_migrate
from django.dispatch import receiver

logger = logging.getLogger(__name__)

DEFAULT_ROLES = [
    ("Employee", "Standard employee with basic dashboard access."),
    ("Team Lead", "Can manage team members, assign tasks, and approve attendance."),
    ("HR", "Can manage employees, leaves, and organization settings."),
    ("Admin", "Full system administrator with unrestricted access."),
]


@receiver(post_migrate)
def seed_rbac_roles(sender, **kwargs):
    """
    Auto-seed 4 RBAC roles after every migrate run.
    Uses get_or_create so it is idempotent — safe to re-run.
    """
    if sender.name != "accounts":
        return

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
        logger.info("Seeded %d RBAC role(s).", created_count)
