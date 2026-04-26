"""
reset_db.py

Wipes all registered organisations and removes all employees
EXCEPT the 5 core accounts listed in KEEP_ACCOUNTS.

After running:
  1. Register a fresh organisation via the UI
  2. Run create_users.py to link these accounts to it
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from clients.models import Client
from accounts.models import Employee
from django.db import connection

# ── Accounts to preserve ─────────────────────────────────
KEEP_ACCOUNTS = [
    "admin@avanzo.com",
    "technical@avanzo.com",
    "teamlead@avanzo.com",
    "cyberlead@avanzo.com",
    "cybersecurity@avanzo.com",
]

print("=" * 60)
print("RESET DB — keeping core accounts only")
print("=" * 60)

# 1. Nullify tenant on accounts we're keeping first
#    (prevents them from being cascade-deleted with the org)
kept = Employee.objects.filter(email__in=KEEP_ACCOUNTS)
kept.update(tenant=None, department=None, designation=None)
print(f"\n✓ Preserved {kept.count()} core accounts (tenant unlinked):")
for e in kept:
    print(f"    {e.email}")

# 2. Delete all OTHER employees (those not in KEEP_ACCOUNTS)
others = Employee.objects.exclude(email__in=KEEP_ACCOUNTS)
count = others.count()
others.delete()
print(f"\n✓ Deleted {count} other employee account(s).")

# 3. Delete all organisations (cascades: departments, designations,
#    services, attendance logs, leaves, projects, reports, etc.)
orgs = list(Client.objects.all())
org_count = len(orgs)
print(f"\n✓ Deleting {org_count} organisation(s):")
for o in orgs:
    print(f"    [{o.id}] {o.name}")
Client.objects.all().delete()

print()
print("=" * 60)
print("Done. DB is clean.")
print()
print("Next steps:")
print("  1. Go to http://localhost:5173/register")
print("     and register your fresh organisation.")
print("  2. Run:  python create_users.py")
print("     to re-link the 5 core accounts to it.")
print("=" * 60)
