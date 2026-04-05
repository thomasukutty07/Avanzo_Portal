"""
Production-grade admin bootstrap command.
Creates the first Admin user with both Django superuser flags
AND the application-level Admin AccessRole.

Usage:
    # Interactive (prompts for password securely):
    python manage.py create_admin --email admin@avanzo.com \
        --first-name Admin --last-name User

    # Non-interactive (for CI/CD, reads password from env):
    DJANGO_ADMIN_PASSWORD=<secret> python manage.py create_admin \
        --email admin@avanzo.com --first-name Admin --last-name User \
        --no-input
"""

import logging
import os

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from accounts.models import AccessRole, Employee

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Create the first Admin user with the Admin AccessRole."

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True, help="Admin email address")
        parser.add_argument("--first-name", required=True, help="First name")
        parser.add_argument("--last-name", required=True, help="Last name")
        parser.add_argument("--employee-id", default="AVZ-001", help="Employee ID")
        parser.add_argument(
            "--no-input",
            action="store_true",
            help="Read password from DJANGO_ADMIN_PASSWORD env var",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        email = options["email"]

        # ── 1. Guard: Prevent duplicate admins ──────────────────────
        if Employee.objects.filter(email=email).exists():
            raise CommandError(f"Employee with email '{email}' already exists.")

        # ── 2. Ensure AccessRole "Admin" exists ─────────────────────
        admin_role, created = AccessRole.objects.get_or_create(
            name="Admin",
            defaults={"description": "Full system administrator"},
        )
        if created:
            self.stdout.write(self.style.WARNING("Created AccessRole 'Admin' (was missing)."))

        # ── 3. Get password securely ────────────────────────────────
        if options["no_input"]:
            password = os.environ.get("DJANGO_ADMIN_PASSWORD")
            if not password:
                raise CommandError("DJANGO_ADMIN_PASSWORD env var is required with --no-input.")
        else:
            import getpass

            password = getpass.getpass("Enter admin password: ")
            password_confirm = getpass.getpass("Confirm admin password: ")
            if password != password_confirm:
                raise CommandError("Passwords do not match.")

        # ── 4. Validate password against Django validators ──────────
        try:
            validate_password(password)
        except ValidationError as e:
            raise CommandError(f"Password validation failed: {'; '.join(e.messages)}") from e

        # ── 5. Create the admin atomically ──────────────────────────
        admin = Employee.objects.create_superuser(
            email=email,
            password=password,
            first_name=options["first_name"],
            last_name=options["last_name"],
            employee_id=options["employee_id"],
            access_role=admin_role,
        )

        logger.info(
            "Admin user created: %s (id=%s)",
            admin.email,
            admin.id,
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Admin '{admin.email}' created successfully with Admin AccessRole."
            )
        )
