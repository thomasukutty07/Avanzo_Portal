import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from clients.models import Client
from accounts.models import Employee

clients = list(Client.objects.all())
print(f"\n=== TENANTS ({len(clients)}) ===")
for c in clients:
    print(f"  [{c.id}] {c.name}")

emps = list(Employee.objects.select_related('tenant', 'access_role').all())
print(f"\n=== EMPLOYEES ({len(emps)}) ===")
for e in emps:
    tenant_name = e.tenant.name if e.tenant else "*** NO TENANT ***"
    tenant_id   = str(e.tenant.id) if e.tenant else "NULL"
    print(f"  {e.email:<35} role={e.role_name:<12} tenant_id={tenant_id[:8]}...  ({tenant_name})")
