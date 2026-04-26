from django_tenants.utils import schema_context
from accounts.models import Employee

with schema_context('demo'):
    u = Employee.objects.get(email='admin@avanzo.com')
    print(f"User: {u.email}")
    print(f"Role: {u.role_name}")
    print(f"Is active: {u.is_active}")
