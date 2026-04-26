import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django_tenants.utils import schema_context
from django.contrib.auth import get_user_model
from accounts.models import AccessRole
from organization.models import Department, Designation
from projects.models import Service
from clients.models import Client

User = get_user_model()

def seed_tenant(schema_name):
    print(f"Seeding schema: {schema_name}")
    with schema_context(schema_name):
        tenant = Client.objects.get(schema_name=schema_name)
        
        def get_or_create_role(name):
            role, _ = AccessRole.objects.get_or_create(name=name)
            return role

        def get_or_create_dept(name):
            dept, _ = Department.objects.get_or_create(name=name, tenant=tenant)
            return dept

        def get_or_create_desig(name):
            desig, _ = Designation.objects.get_or_create(name=name, tenant=tenant)
            return desig

        def create_user(email, password, role_name, dept_name=None, desig_name=None, first_name='', last_name=''):
            role = get_or_create_role(role_name)
            dept = get_or_create_dept(dept_name) if dept_name else None
            desig = get_or_create_desig(desig_name) if desig_name else None

            user = User.objects.filter(email=email).first()
            if user:
                user.set_password(password)
                user.first_name = first_name
                user.last_name = last_name
                user.access_role = role
                user.department = dept
                user.designation = desig
                user.tenant = tenant
                user.is_active = True
                user.save()
                print(f"  - Updated {email} ({role_name})")
            else:
                user = User.objects.create_user(
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    access_role=role,
                    department=dept,
                    designation=desig,
                    tenant=tenant,
                )
                print(f"  - Created {email} ({role_name})")

        pwd = "Password@123"
        
        # Seed Roles
        for r in ["Admin", "HR", "Team Lead", "Employee"]:
            get_or_create_role(r)

        # Seed Users
        create_user("admin@avanzo.com", pwd, "Admin", first_name="Avanzo", last_name="Admin")
        create_user("hr@avanzo.com", pwd, "HR", first_name="HR", last_name="Manager")
        create_user("tl@avanzo.com", pwd, "Team Lead", dept_name="Engineering", first_name="Team", last_name="Lead")
        create_user("emp@avanzo.com", pwd, "Employee", dept_name="Engineering", desig_name="Software Engineer", first_name="Demo", last_name="Employee")
        
        # Seed some projects and services
        dept = get_or_create_dept("Engineering")
        Service.objects.get_or_create(
            name="Core Platform Development",
            tenant=tenant,
            department=dept,
            defaults={'description': 'Primary development for the Avanzo platform.'}
        )
        print(f"Finished seeding {schema_name}")

if __name__ == "__main__":
    try:
        seed_tenant('demo')
    except Exception as e:
        print(f"Error seeding demo tenant: {e}")
