"""
config/public_urls.py
═════════════════════
URL patterns for the PUBLIC schema (no tenant subdomain).

These routes are served when a request arrives at the base domain
(e.g. avanzo.com) or any host that doesn't match a tenant subdomain.

Controlled by: PUBLIC_SCHEMA_URLCONF in settings.py

Currently includes:
  • /admin/              → Django admin (for superadmin tenant management)
  • /api/register/       → New organization registration (public, no auth)
  • /api/schema/         → OpenAPI schema download
  • /api/docs/           → Swagger UI for API documentation
"""

from django.contrib import admin
from django.urls import path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from accounts.views import TenantRegistrationView

urlpatterns = [
    path("admin/", admin.site.urls),
    # ── Public registration endpoint ─────────────────────────────────
    # This is the ONLY tenant-creating endpoint. It lives here (not in
    # the tenant URL conf) because the tenant doesn't exist yet when
    # someone is signing up. AllowAny + strict throttling (5/hour).
    path("api/register/", TenantRegistrationView.as_view(), name="register"),
    # ── API documentation ────────────────────────────────────────────
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]
