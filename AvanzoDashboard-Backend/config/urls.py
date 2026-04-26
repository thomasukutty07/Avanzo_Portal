"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
"""

from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from projects.admin_views import VelocityView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/organization/", include("organization.urls")),
    path("api/notifications/", include("notifications.urls")),
    path("api/attendance/", include("attendance.urls")),
    path("api/projects/", include("projects.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/leaves/", include("leaves.urls")),
    path("api/tickets/", include("tickets.urls")),
    path("api/activity/", include("activity.urls")),
    path("api/performance/", include("performance.urls")),
    path("api/analytics/", include("analytics.urls")),
    path("api/skills/", include("skills.urls")),
    path("api/reports/", include("reports.urls")),
    path("api/admin/velocity/", VelocityView.as_view(), name="admin-velocity"),
]
