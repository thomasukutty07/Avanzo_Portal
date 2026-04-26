from django_tenants.utils import schema_context
from accounts.models import Employee
from django.db import connection

print(f"Current schema (pre): {connection.schema_name}")
try:
    with schema_context('demo'):
        print(f"Current schema (in): {connection.schema_name}")
        users = [u.email for u in Employee.objects.all()]
        print(f"Demo Users: {users}")
except Exception as e:
    print(f"Error: {e}")

with schema_context('public'):
    users = [u.email for u in Employee.objects.all()]
    print(f"Public Users: {users}")
