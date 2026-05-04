from django.db import connection

with connection.cursor() as cursor:
    cursor.execute("SET search_path TO public")
    cursor.execute("SELECT schema_name FROM clients")
    schemas = [row[0] for row in cursor.fetchall()]

for s in schemas:
    if s == 'public':
        continue
    print(f"--- Schema: {s} ---")
    with connection.cursor() as cursor:
        cursor.execute(f"SET search_path TO {s}, public")
        cursor.execute("""
            SELECT e.email, r.name, d.name, des.name 
            FROM employees e
            LEFT JOIN access_roles r ON e.access_role_id = r.id
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN designations des ON e.designation_id = des.id
        """)
        for u in cursor.fetchall():
            print(f"  {u[0]} - Role: {u[1]} - Dept: {u[2]} - Desig: {u[3]}")
