import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import authenticate, get_user_model
User = get_user_model()

email = 'admin@avanzo.com'
password = 'Password@123'

user = User.objects.filter(email=email).first()
if user:
    print(f"User {email} found.")
    print(f"Password match: {user.check_password(password)}")
    
    auth_user = authenticate(email=email, password=password)
    if auth_user:
        print("Authentication successful!")
    else:
        print("Authentication failed.")
else:
    print(f"User {email} NOT found.")
