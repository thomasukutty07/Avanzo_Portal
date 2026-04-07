import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

print("EMAIL | FULL NAME | ACCESS ROLE")
print("-" * 50)
for u in User.objects.all().select_related('access_role'):
    role = u.access_role.name if u.access_role else "N/A"
    print(f"{u.email} | {u.first_name} {u.last_name} | {role}")
