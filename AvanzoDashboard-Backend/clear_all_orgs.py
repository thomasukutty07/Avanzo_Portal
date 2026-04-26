"""
clear_all_orgs.py

Deletes ALL registered organisations (Client records) and every piece
of data linked to them via CASCADE (employees, departments, attendance,
projects, leaves, reports, etc.).

⚠️  THIS IS IRREVERSIBLE. Run only in development.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from clients.models import Client
from accounts.models import Employee

orgs = list(Client.objects.all())
employees = list(Employee.objects.all())

if not orgs:
    print("No organisations found. DB is already clean.")
else:
    print(f"Found {len(orgs)} organisation(s) and {len(employees)} employee(s).")
    print()
    for o in orgs:
        print(f"  Deleting: [{o.id}] {o.name}")

    # Delete all employees first (they reference tenants)
    Employee.objects.all().delete()
    print(f"\nDeleted {len(employees)} employee(s).")

    # Delete all orgs (cascades to departments, designations, etc.)
    Client.objects.all().delete()
    print(f"Deleted {len(orgs)} organisation(s).")

    print()
    print("Done. DB is clean. Register a fresh organisation via the UI.")
