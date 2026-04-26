from django.db import connection

def check_table(schema, table):
    with connection.cursor() as cursor:
        cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}' AND table_schema = '{schema}'")
        columns = [row[0] for row in cursor.fetchall()]
        print(f"Columns in {schema}.{table}: {columns}")

check_table('public', 'login_attempts')
check_table('demo', 'login_attempts')
