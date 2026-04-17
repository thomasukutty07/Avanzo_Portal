import logging

from django.db import transaction

from clients.models import Client, Domain

from .models import AccessRole, Employee

logger = logging.getLogger(__name__)


class TenantOrchestrator:
    """
    Handles creation of a new organization workspace.
    Creates a Client record, Domain record, and Admin user.
    """

    @transaction.atomic
    def provision_new_workspace(self, company_name: str, subdomain: str, admin_data: dict):
        # ── Step 1: Create Client ────────────────────────────────────
        schema_name = subdomain.replace("-", "_")
        tenant = Client.objects.create(schema_name=schema_name, name=company_name)

        # ── Step 2: Create Domain ────────────────────────────────────
        Domain.objects.create(domain=subdomain, tenant=tenant, is_primary=True)

        # ── Step 3: Create Admin User ────────────────────────────────
        admin_user = Employee.objects.create_superuser(
            email=admin_data["email"],
            password=admin_data["password"],
            first_name=admin_data.get("first_name", ""),
            last_name=admin_data.get("last_name", ""),
        )

        # Assign the "Admin" AccessRole so RBAC permissions work.
        admin_role = AccessRole.objects.filter(name="Admin").first()
        if admin_role:
            admin_user.access_role = admin_role
            admin_user.save(update_fields=["access_role"])

        logger.info(f"Provisioned workspace: {subdomain} for {company_name}")
        return tenant
