# ruff: noqa: F403
import os

from .base import *

# 🟡 DEV (DX): Environment selection
# Defaults to development if DJANGO_ENV is not set
env_type = os.getenv("DJANGO_ENV", "development")

if env_type == "production":
    from .production import *
elif env_type == "test":
    # Optional: You can create a test.py if needed
    try:
        from .test import *
    except ImportError:
        pass
else:
    from .development import *
