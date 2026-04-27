# ruff: noqa: F403, F405
from .base import *

# 🟡 DEV (DX): Development-specific overrides
DEBUG = True

ALLOWED_HOSTS = ["*"]
CORS_ALLOW_ALL_ORIGINS = True

# Standard Development Email Backend (prints to console)
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# ── In-memory cache (no Redis required for local dev) ────────────────────────
# Fixes 500 on /api/auth/login/ caused by LoginRateThrottle trying to reach
# Redis for throttle state checks. LocMemCache is process-local and resets
# on server restart — perfectly fine for development.
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "avanzo-dev-cache",
    }
}

# ── In-memory channel layer (no Redis required for local dev) ─────────────────
# Silences the "Failed to broadcast ActivityEvent via WebSockets" errors.
# WebSocket broadcasts simply become no-ops; all HTTP APIs still work normally.
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    }
}

# Optional: Add Debug Toolbar if installed
# if "debug_toolbar" in INSTALLED_APPS:
#     MIDDLEWARE.append("debug_toolbar.middleware.DebugToolbarMiddleware")
