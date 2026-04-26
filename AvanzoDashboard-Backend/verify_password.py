from django_tenants.utils import schema_context
from accounts.models import Employee

with schema_context('demo'):
    u = Employee.objects.filter(email='admin@avanzo.com').first()
    if u:
        print(f"User in demo: {u.email}")
        print(f"Password correct in demo: {u.check_password('Password@123')}")
    else:
        print("User not found in demo")

with schema_context('public'):
    u = Employee.objects.filter(email='admin@avanzo.com').first()
    if u:
        print(f"User in public: {u.email}")
        print(f"Password correct in public: {u.check_password('Password@123')}")
    else:
        print("User not found in public")
