# ruff: noqa: F403, F405
from .base import *

# 🟡 DEV (DX): Development-specific overrides
DEBUG = True

ALLOWED_HOSTS = ["*"]
CORS_ALLOW_ALL_ORIGINS = True

# Standard Development Email Backend (prints to console)
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Optional: Add Debug Toolbar if installed
# if "debug_toolbar" in INSTALLED_APPS:
#     MIDDLEWARE.append("debug_toolbar.middleware.DebugToolbarMiddleware")
