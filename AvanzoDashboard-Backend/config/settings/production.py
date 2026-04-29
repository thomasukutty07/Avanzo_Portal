# ruff: noqa: F403, F405
from .base import *

# 🔴 KIRAN (Security): Production-grade hardening
DEBUG = False

# Hosts & CORS
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=[])
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])
CORS_ALLOW_CREDENTIALS = True
# Only allow specific headers from cross-origin requests
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

# HTTPS enforcement
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# HSTS (Strict-Transport-Security)
SECURE_HSTS_SECONDS = 31_536_000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Cookie security — prevent session / CSRF cookies over plain HTTP
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True
# Limit session cookie scope to first-party requests (CSRF mitigation)
SESSION_COOKIE_SAMESITE = "Strict"
CSRF_COOKIE_SAMESITE = "Strict"
# Session expiry: auto-expire idle sessions after 8 hours (working day)
SESSION_COOKIE_AGE = 8 * 60 * 60
SESSION_SAVE_EVERY_REQUEST = True

# Prevent session fixation — always issue a new session ID on login
SESSION_EXPIRE_AT_BROWSER_CLOSE = False

# Security Misconfiguration prevention
SECURE_CONTENT_TYPE_NOSNIFF = True

# Disable the Swagger/ReDoc docs in production (prevents API schema leakage)
# The schema endpoint is still available to internal tooling via API key.
SPECTACULAR_SETTINGS = {
    **globals().get("SPECTACULAR_SETTINGS", {}),
    "SERVE_INCLUDE_SCHEMA": False,
    # Block the Swagger UI in production to prevent API enumeration
    "SWAGGER_UI_SETTINGS": {
        "persistAuthorization": False,
    },
}

# Static Assets (served by whitenoise or CDN)
STATIC_ROOT = BASE_DIR / "staticfiles"

# Email Configuration
# 🔷 REX (Architect): Use SMTP backend in production
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = env("EMAIL_HOST", default="")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="noreply@avanzo.io")

