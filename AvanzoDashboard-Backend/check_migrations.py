from django.db import connection

with connection.cursor() as cursor:
    cursor.execute("SELECT name, applied FROM django_migrations WHERE app = 'accounts' ORDER BY name")
    print("Migrations for accounts in public:")
    for row in cursor.fetchall():
        print(row)
