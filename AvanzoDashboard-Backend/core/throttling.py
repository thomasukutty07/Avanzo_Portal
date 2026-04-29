"""
core/throttling.py
══════════════════
Custom DRF throttle classes for granular rate-limiting.

Why custom throttles instead of the defaults?
─────────────────────────────────────────────
Django REST Framework's built-in `AnonRateThrottle` and `UserRateThrottle`
use a single flat rate for ALL endpoints. This is insufficient for a
multi-tenant application with varying risk profiles per endpoint:

  • /api/auth/login/       → Must be strict (brute-force prevention)
  • /api/auth/register/   → Must be very strict (tenant provisioning abuse)
  • /api/auth/refresh/    → Moderate (normal session maintenance)
  • /api/auth/password/*  → Very strict (password enumeration)
  • /api/reports/export/  → Strict (server-load abuse prevention)
  • General API           → Lenient authenticated user rate

Each throttle class defined here uses its own cache key so that hitting
the login throttle does not consume the general user's API quota.
"""

from rest_framework.throttling import AnonRateThrottle, UserRateThrottle, SimpleRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """
    5 requests/minute per IP for the login endpoint.
    Combined with the DB-level LoginAttempt lockout in accounts/views.py,
    this provides two independent layers of brute-force protection.
    """
    scope = "login"


class RegistrationRateThrottle(AnonRateThrottle):
    """
    3 requests/hour per IP for tenant provisioning.
    Prevents abuse of the costly tenant-creation flow.
    """
    scope = "registration"


class PasswordResetRateThrottle(AnonRateThrottle):
    """
    3 requests/15-minutes per IP for password reset requests.
    Prevents user enumeration via timing analysis of reset emails.
    """
    scope = "password_reset"


class TokenRefreshRateThrottle(AnonRateThrottle):
    """
    30 requests/minute per IP for token refresh.
    More lenient than login since valid sessions need this for silent renewal.
    """
    scope = "token_refresh"


class ReportExportRateThrottle(UserRateThrottle):
    """
    10 requests/hour per authenticated user for heavy export endpoints.
    Prevents server overload from bulk-export abuse.
    """
    scope = "report_export"


class BurstRateThrottle(UserRateThrottle):
    """
    Short-window (burst) throttle for authenticated users: 60/minute.
    Complements the sustained `UserRateThrottle` (1000/hour).
    """
    scope = "burst"


class SustainedRateThrottle(UserRateThrottle):
    """
    Long-window (sustained) throttle: 1000/hour per authenticated user.
    Prevents sustained API hammering that would otherwise pass burst checks.
    """
    scope = "sustained"
