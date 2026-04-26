import logging

from django.db import transaction
from django_tenants.utils import schema_context

from clients.models import Client, Domain

from .models import AccessRole, Employee

logger = logging.getLogger(__name__)


class TenantOrchestrator:
    """
    Handles atomic creation of a new tenant workspace.
    1. Create Client (triggers schema creation via django-tenants)
    2. Create Domain mapping
    3. Create Admin user inside the new schema (with Admin RBAC role)
    """

    @transaction.atomic
    def provision_new_workspace(self, company_name: str, subdomain: str, admin_data: dict):
        """
        Provision a new workspace in a single-tenant (Option B) architecture.
        1. Create Client (Organization record)
        2. Create Admin user linked to this Client
        """
        # 1. Create Organization record in public schema
        # We use subdomain as the unique schema_name identifier for the record
        tenant, created = Client.objects.get_or_create(
            schema_name=subdomain.lower().replace("-", "_"), 
            name=company_name
        )

        # 2. Get the Admin AccessRole
        admin_role = AccessRole.objects.filter(name="Admin").first()
        if not admin_role:
            admin_role = AccessRole.objects.create(name="Admin", description="Organization Administrator")

        # 3. Create Admin User linked to this tenant
        admin_user = Employee.objects.create_superuser(
            email=admin_data["email"],
            password=admin_data["password"],
            first_name=admin_data.get("first_name", ""),
            last_name=admin_data.get("last_name", ""),
            tenant=tenant,
            access_role=admin_role
        )

        logger.info(f"Provisioned organization: {company_name} with admin {admin_data['email']}")
        return tenant
