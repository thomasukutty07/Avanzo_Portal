import os
import django

# --- ADD THESE TWO LINES ---
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
# ---------------------------

from django.contrib.auth import get_user_model
from accounts.models import AccessRole
from organization.models import Department, Designation

User = get_user_model()

def create_role(name):
    role, _ = AccessRole.objects.get_or_create(name=name)
    return role

def create_dept(name):
    dept, _ = Department.objects.get_or_create(name=name)
    return dept

def create_desig(name):
    desig, _ = Designation.objects.get_or_create(name=name)
    return desig

def create_user(email, password, role_name, dept_name=None, desig_name=None, first_name='', last_name=''):
    role = create_role(role_name)
    
    dept = None
    desig = None
    if dept_name:
        dept = create_dept(dept_name)
    if desig_name:
        desig = create_desig(desig_name)

    user = User.objects.filter(email=email).first()
    if user:
        user.set_password(password)
        user.first_name = first_name
        user.last_name = last_name
        user.access_role = role
        user.department = dept
        user.designation = desig
        user.save()
        print(f"Updated {email} ({role_name})")
    else:
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            access_role=role,
            department=dept,
            designation=desig
        )
        print(f"Created {email} ({role_name})")

# Shared password
pwd = "Password@123"

# 1. HR
create_user("hr@avanzo.com", pwd, "HR", first_name="HR", last_name="Manager")

# 2. Team Lead
create_user("teamlead@avanzo.com", pwd, "Team Lead", first_name="Team", last_name="Lead")

# 3. Employee - Cybersecurity
create_user("cybersecurity@avanzo.com", pwd, "Employee", dept_name="Cybersecurity", desig_name="Security Analyst", first_name="Cyber", last_name="Sec")

# 5. Admin (Organization Level)
create_user("admin@avanzo.com", pwd, "Admin", first_name="Avanzo", last_name="Admin")

# 6. Super Admin (System Level)
create_user("superadmin@avanzo.com", pwd, "Super Admin", first_name="System", last_name="Root")

print("All test users (including Admin hierarchy) created successfully.")
