from datetime import timedelta
from pathlib import Path

import environ

# Build paths inside the project like this: BASE_DIR / 'subdir'.
# 🔷 REX (Architect): Note the extra .parent because we're in settings/base.py
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Environment variables
env = environ.Env()
# Read from the root directory (.env)
environ.Env.read_env(BASE_DIR / ".env")

# Security
SECRET_KEY = env("SECRET_KEY")

# Domain Configuration
BASE_DOMAIN = env("BASE_DOMAIN", default="192.168.220.85.nip.io")
USE_X_FORWARDED_HOST = True

# Application definition
SHARED_APPS = (
    "daphne",
    "clients",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "drf_spectacular",
    "channels",
    "django_extensions",
    "django.contrib.contenttypes",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.messages",
    "django.contrib.sessions",
    "core",
    "accounts",
    "organization",
    "attendance",
    "projects",
    "leaves",
    "notifications",
    "tickets",
    "activity",
    "skills",
    "performance",
    "analytics",
    "reports",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "auditlog",
)

TENANT_APPS = SHARED_APPS

INSTALLED_APPS = list(SHARED_APPS)
TENANT_MODEL = "clients.Client"
TENANT_DOMAIN_MODEL = "clients.Domain"

MIDDLEWARE = [
    # ── 1st: Block scanners & path traversal before touching Django internals ─
    "core.security_middleware.SuspiciousRequestBlockerMiddleware",
    # ── Django core ───────────────────────────────────────────────────────────
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    # ── Last: Inject security headers into every outbound response ────────────
    "core.security_middleware.SecurityHeadersMiddleware",
    # ── Audit trail for all write operations ─────────────────────────────────
    "auditlog.middleware.AuditlogMiddleware",
]

ROOT_URLCONF = "config.urls"
# PUBLIC_SCHEMA_URLCONF = "config.public_urls"
# SHOW_PUBLIC_IF_NO_TENANT_FOUND = True

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# Database
# 🟣 GINA (Schema): Using env-driven DATABASE_URL for all environments
DATABASES = {"default": env.db("DATABASE_URL", default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}")}
DATABASES["default"]["ENGINE"] = "django.db.backends.postgresql"
DATABASES["default"]["CONN_MAX_AGE"] = env.int("CONN_MAX_AGE", default=10)
DATABASES["default"]["CONN_HEALTH_CHECKS"] = True

# DATABASE_ROUTERS = ("django_tenants.routers.TenantSyncRouter",)

# Caching
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": env("REDIS_URL", default="redis://127.0.0.1:6379/1"),
    }
}

# Password Hashing Strategy
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
]

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 10},
    },
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ── Security hardening (base-level — supplements production.py) ───────────────
# Clickjacking protection: deny all framing (strongest setting).
X_FRAME_OPTIONS = "DENY"
# Prevent MIME sniffing on all environments.
SECURE_CONTENT_TYPE_NOSNIFF = True
# Disable the Django admin 'changelist' redirect to prevent open redirect abuse.
APPEND_SLASH = False

# Custom User Model
AUTH_USER_MODEL = "accounts.Employee"

# Django REST Framework
REST_FRAMEWORK = {
    "EXCEPTION_HANDLER": "core.exceptions.custom_exception_handler",
    # Default throttles apply to every view unless overridden at the view level.
    # Authenticated users get a burst + sustained window; anon gets a tighter limit.
    "DEFAULT_THROTTLE_CLASSES": [
        "core.throttling.BurstRateThrottle",
        "core.throttling.SustainedRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        # Generic defaults
        "anon": "60/minute",
        "user": "5000/hour",
        # Fine-grained per-endpoint scopes (used by core.throttling custom classes)
        "burst": "600/minute",
        "sustained": "10000/hour",
        "login": "20/minute",
        "registration": "10/hour",
        "password_reset": "10/900s",   # 10 per 15 minutes
        "token_refresh": "100/minute",
        "report_export": "20/hour",
    },
    "DEFAULT_AUTHENTICATION_CLASSES": ("core.authentication.TenantAwareJWTAuthentication",),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 50,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "UPDATE_LAST_LOGIN": True,
}

# drf-spectacular
SPECTACULAR_SETTINGS = {
    "TITLE": "Avanzo Dashboard API",
    "DESCRIPTION": "Internal company dashboard REST API",
    "VERSION": "0.1.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SECURITY": [{"jwtAuth": []}],
    "ENUM_NAME_OVERRIDES": {
        "ProjectStatusEnum": "projects.models.Project.Status",
        "TaskStatusEnum": "projects.models.Task.Status",
        "LeaveRequestStatusEnum": "leaves.models.LeaveRequest.Status",
        "EmployeeStatusEnum": "accounts.models.Employee.Status",
        "DailyLogStatusEnum": "attendance.models.DailyLog.Status",
    },
}

# Celery
CELERY_BROKER_URL = env("CELERY_BROKER_URL", default="redis://127.0.0.1:6379/0")
CELERY_RESULT_BACKEND = env("CELERY_RESULT_BACKEND", default="redis://127.0.0.1:6379/1")
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 300
CELERY_TASK_SOFT_TIME_LIMIT = 240

# Channels Redis Layer
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [env("REDIS_URL", default="redis://127.0.0.1:6379/2")],
        },
    },
}

# ── Structured Security Logging ───────────────────────────────────────────────
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
        "json_security": {
            "format": '{"level": "%(levelname)s", "time": "%(asctime)s", "logger": "%(name)s", "message": "%(message)s"}',
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
        "security_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": BASE_DIR / "logs" / "security.log",
            "maxBytes": 10 * 1024 * 1024,  # 10 MB per file
            "backupCount": 5,
            "formatter": "json_security",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": env("DJANGO_LOG_LEVEL", default="INFO"),
            "propagate": False,
        },
        "django.security": {
            "handlers": ["console", "security_file"],
            "level": "WARNING",
            "propagate": False,
        },
        "core.authentication": {
            "handlers": ["console", "security_file"],
            "level": "WARNING",
            "propagate": False,
        },
        "core.security_middleware": {
            "handlers": ["console", "security_file"],
            "level": "WARNING",
            "propagate": False,
        },
        "accounts.views": {
            "handlers": ["console", "security_file"],
            "level": "WARNING",
            "propagate": False,
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "WARNING",
    },
}
