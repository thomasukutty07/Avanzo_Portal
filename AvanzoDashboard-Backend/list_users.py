import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

print("--- Public Schema ---")
with connection.cursor() as cursor:
    cursor.execute("SET search_path TO public")
    cursor.execute("""
        SELECT e.email, e.access_role_id, r.name, d.name, des.name 
        FROM employees e
        LEFT JOIN access_roles r ON e.access_role_id = r.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN designations des ON e.designation_id = des.id
    """)
    users = cursor.fetchall()
    for u in users:
        print(f"User: {u[0]}, Role: {u[2]}, Dept: {u[3]}, Desig: {u[4]}")
