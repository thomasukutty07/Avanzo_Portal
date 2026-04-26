import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from clients.models import Client
from accounts.models import Employee

print("=== TENANTS ===")
for c in Client.objects.all():
    print(f"[{c.id}] {c.name}")

print("\n=== USERS ===")
for e in Employee.objects.select_related('tenant').all():
    tenant_name = e.tenant.name if e.tenant else "NONE"
    print(f"{e.email} -> {tenant_name}")
