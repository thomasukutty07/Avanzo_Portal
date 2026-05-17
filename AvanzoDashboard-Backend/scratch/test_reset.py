import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

from rest_framework.test import APIRequestFactory
from accounts.views import PasswordResetRequestView

factory = APIRequestFactory()
request = factory.post("/api/auth/password-reset/", {"email": "thomasukuttyreji7@gmail.com"}, format="json")
view = PasswordResetRequestView.as_view()

try:
    response = view(request)
    print("STATUS:", response.status_code)
    print("DATA:", response.data)
except Exception as e:
    import traceback
    traceback.print_exc()
