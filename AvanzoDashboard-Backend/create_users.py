import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import AccessRole
from organization.models import Department, Designation
from projects.models import Service
from clients.models import Client

User = get_user_model()

# --- TENANT RESOLUTION ---
# IMPORTANT: Resolve by NAME, not Client.objects.first().
#
# Using .first() is dangerous in a multi-tenant DB — it blindly picks
# whichever tenant was created first and dumps ALL users into that company,
# even if multiple organisations (Test Org, Avanzo Solutions PVT, etc.)
# are registered. That's exactly what caused the cross-org data leak.
#
# Change COMPANY_NAME below to match the organisation you want to seed.
COMPANY_NAME = "Avanzo Solutions"

tenant = Client.objects.filter(name=COMPANY_NAME).first()
if not tenant:
    print(f"WARNING: No Tenant found with name '{COMPANY_NAME}'.")
    print("Available tenants:")
    for c in Client.objects.all():
        print(f"  [{c.id}] {c.name}")
    print("Update COMPANY_NAME above to match your organisation and re-run.")
else:
    print(f"Seeding users for: {tenant.name} (id={tenant.id})")


def create_role(name):
    role, _ = AccessRole.objects.get_or_create(name=name)
    return role


def create_dept(name):
    dept, _ = Department.objects.get_or_create(name=name, tenant=tenant)
    return dept


def create_desig(name):
    desig, _ = Designation.objects.get_or_create(name=name, tenant=tenant)
    return desig


def create_service(name, dept_name):
    dept = create_dept(dept_name)
    service, _ = Service.objects.get_or_create(
        name=name,
        tenant=tenant,
        department=dept,
        defaults={'description': f'Standard {name} engagement module.'}
    )
    return service


def create_user(email, password, role_name, dept_name=None, desig_name=None, first_name='', last_name=''):
    role = create_role(role_name)
    dept = create_dept(dept_name) if dept_name else None
    desig = create_desig(desig_name) if desig_name else None

    user = User.objects.filter(email=email).first()
    if user:
        user.set_password(password)
        user.first_name = first_name
        user.last_name = last_name
        user.access_role = role
        user.department = dept
        user.designation = desig
        user.tenant = tenant
        user.save()
        print(f"  Updated  {email}  ({role_name})")
    else:
        User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            access_role=role,
            department=dept,
            designation=desig,
            tenant=tenant,
        )
        print(f"  Created  {email}  ({role_name})")


# ─── Seed data ────────────────────────────────────────────
pwd = "Password@123"

if tenant:
    print()

    # Admin — ONE admin for this company
    create_user("admin@avanzo.com", pwd, "Admin",
                first_name="Avanzo", last_name="Admin")

    # HR
    create_user("hr@avanzo.com", pwd, "HR",
                first_name="HR", last_name="Manager")

    # Team Leads
    create_user("teamlead@avanzo.com",  pwd, "Team Lead", dept_name="Engineering",
                first_name="Team", last_name="Lead")
    create_user("cyberlead@avanzo.com", pwd, "Team Lead", dept_name="Cybersecurity",
                first_name="Cyber", last_name="Lead")

    # Employees
    create_user("cybersecurity@avanzo.com", pwd, "Employee",
                dept_name="Cybersecurity", desig_name="Security Analyst",
                first_name="Cyber", last_name="Sec")
    create_user("tech@avanzo.com",      pwd, "Employee",
                dept_name="Engineering", desig_name="Technical Lead",
                first_name="Tech", last_name="Support")
    create_user("technical@avanzo.com", pwd, "Employee",
                dept_name="Engineering", desig_name="Technical Lead",
                first_name="Technical", last_name="Member")

    # Services
    create_service("Web Application Audit",     "Cybersecurity")
    create_service("Network VAPT",              "Cybersecurity")
    create_service("Fullstack Dashboard Build", "Engineering")
    create_service("API Security Review",       "Cybersecurity")

    print()
    print(f"Done. All seed data created for: {tenant.name}")
    print()
    print("NOTE: avanzo@gmail.com and test@test.com are intentionally NOT")
    print("      seeded here — they belong to their own separate organisations.")
    print("      Each company's admin should be created via the /register flow.")
else:
    print("Aborted: target organisation not found.")
