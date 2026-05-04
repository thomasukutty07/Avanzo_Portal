import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from accounts.models import Employee

with connection.cursor() as cursor:
    cursor.execute("SET search_path TO avanzo, public")

user = Employee.objects.get(email="rahul@gmail.com")
user.set_password("Password@123")
user.save()
print("Successfully set rahul's password to Password@123 in avanzo schema")

with connection.cursor() as cursor:
    cursor.execute("SET search_path TO testorg, public")

user = Employee.objects.get(email="rahul@gmail.com")
user.set_password("Password@123")
user.save()
print("Successfully set rahul's password to Password@123 in testorg schema")
