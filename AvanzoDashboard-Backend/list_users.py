import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

print("EMAIL | FULL NAME | ACCESS ROLE | DEPARTMENT | DESIGNATION")
print("-" * 80)
for u in User.objects.all().select_related('access_role', 'department', 'designation'):
    role = u.access_role.name if u.access_role else "N/A"
    dept = u.department.name if u.department else "N/A"
    desig = u.designation.name if u.designation else "N/A"
    print(f"{u.email} | {u.first_name} {u.last_name} | {role} | {dept} | {desig}")
