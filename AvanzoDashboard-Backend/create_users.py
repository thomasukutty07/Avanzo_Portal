import os
import django

# --- ADD THESE TWO LINES ---
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
# ---------------------------

from django.contrib.auth import get_user_model
from accounts.models import AccessRole
from organization.models import Department, Designation
from projects.models import Service # Added Service model
from clients.models import Client

User = get_user_model()

# --- TENANT RESOLUTION ---
tenant = Client.objects.first()
if not tenant:
    print("WARNING: No Tenant/Organization found. Please register an organization via the UI first.")
else:
    print(f"Assigning users and services to Organization: {tenant.name}")

def create_role(name):
    role, _ = AccessRole.objects.get_or_create(name=name)
    return role

def create_dept(name):
    dept, _ = Department.objects.get_or_create(name=name, tenant=tenant)
    return dept

def create_desig(name):
    desig, _ = Designation.objects.get_or_create(name=name, tenant=tenant)
    return desig

def create_service(name, dept_name): # Added Create Service helper
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
        user.tenant = tenant # Ensure tenant is set
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
            designation=desig,
            tenant=tenant
        )
        print(f"Created {email} ({role_name})")

# Shared password
pwd = "Password@123"

if tenant:
    # 1. HR
    create_user("hr@avanzo.com", pwd, "HR", first_name="HR", last_name="Manager")

    # 2. Team Leads
    create_user("teamlead@avanzo.com", pwd, "Team Lead", dept_name="Engineering", first_name="Team", last_name="Lead")
    create_user("cyberlead@avanzo.com", pwd, "Team Lead", dept_name="Cybersecurity", first_name="Cyber", last_name="Lead")

    # 3. Employee - Cybersecurity
    create_user("cybersecurity@avanzo.com", pwd, "Employee", dept_name="Cybersecurity", desig_name="Security Analyst", first_name="Cyber", last_name="Sec")
    create_user("tech@avanzo.com", pwd, "Employee", dept_name="Engineering", desig_name="Technical Lead", first_name="Tech", last_name="Support")
    create_user("technical@avanzo.com", pwd, "Employee", dept_name="Engineering", desig_name="Technical Lead", first_name="Technical", last_name="Member")

    # 4. SERVICES (New)
    create_service("Web Application Audit", "Cybersecurity")
    create_service("Network VAPT", "Cybersecurity")
    create_service("Fullstack Dashboard Build", "Engineering")
    create_service("API Security Review", "Cybersecurity")
    
    # 5. Admin (Organization Level)
    create_user("admin@avanzo.com", pwd, "Admin", first_name="Avanzo", last_name="Admin")
    print("All test data (users + services) created successfully for organization: " + tenant.name)
else:
    print("Action aborted: No organization available to link users and data to.")
