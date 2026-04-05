import os
import django
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
        user.delete()
    
    user = User.objects.create_user(
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        access_role=role,
        department=dept,
        designation=desig
    )
    print(f"Created {email} ({role_name} - {dept_name})")

# Shared password
pwd = "Password@123"

# 1. HR
create_user("hr@avanzo.com", pwd, "HR", first_name="HR", last_name="Manager")

# 2. Team Lead
create_user("teamlead@avanzo.com", pwd, "Team Lead", first_name="Team", last_name="Lead")

# 3. Employee - Cybersecurity
create_user("cybersecurity@avanzo.com", pwd, "Employee", dept_name="Cybersecurity", desig_name="Security Analyst", first_name="Cyber", last_name="Sec")

# 4. Employee - Technical Engineering
create_user("technical@avanzo.com", pwd, "Employee", dept_name="Technical Engineering", desig_name="Software Engineer", first_name="Tech", last_name="Eng")

print("All test users created successfully.")
