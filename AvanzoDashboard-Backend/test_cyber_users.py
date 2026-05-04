import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from accounts.models import Employee

with connection.cursor() as cursor:
    cursor.execute("SET search_path TO avanzo, public")

for e in Employee.objects.all():
    dept = getattr(e.department, 'name', '').lower()
    desig = getattr(e.designation, 'name', '').lower()
    if 'cyber' in dept or 'security' in dept or 'cyber' in desig or 'security' in desig:
        print(f"Email: {e.email}, Role: {e.role_name}, Dept: {e.department.name}, Desig: {e.designation.name if e.designation else None}")
