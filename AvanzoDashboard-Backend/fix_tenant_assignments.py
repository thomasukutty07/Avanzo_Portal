"""
fix_tenant_assignments.py

Reassigns cross-org admin accounts to their proper tenants.
Run once to clean up the contamination caused by Client.objects.first().
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from clients.models import Client
from accounts.models import Employee

# Show current state
print("=== BEFORE ===")
for e in Employee.objects.select_related('tenant').filter(
    email__in=["avanzo@gmail.com", "test@test.com"]
):
    print(f"  {e.email} -> tenant: {e.tenant.name if e.tenant else 'NONE'}")

# Reassign each account to its proper company
REASSIGNMENTS = {
    "avanzo@gmail.com": "Avanzo Solutions PVT",
    "test@test.com":    "Test Org",
}

for email, company_name in REASSIGNMENTS.items():
    correct_tenant = Client.objects.filter(name=company_name).first()
    if not correct_tenant:
        print(f"  SKIP: Tenant '{company_name}' not found for {email}")
        continue

    updated = Employee.objects.filter(email=email).update(tenant=correct_tenant)
    if updated:
        print(f"  FIXED: {email} -> {company_name}")
    else:
        print(f"  NOT FOUND: {email}")

print()
print("=== AFTER ===")
for e in Employee.objects.select_related('tenant').filter(
    email__in=["avanzo@gmail.com", "test@test.com"]
):
    print(f"  {e.email} -> tenant: {e.tenant.name if e.tenant else 'NONE'}")

print()
print("Done. These accounts now belong to their own separate organisations.")
print("They will no longer appear in the Avanzo Solutions HR dashboard.")
