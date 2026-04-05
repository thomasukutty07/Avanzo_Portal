from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .report_views import AttendanceReportView
from .views import AttendanceViewSet

app_name = "attendance"

router = DefaultRouter()
router.register(r"", AttendanceViewSet, basename="attendance")

urlpatterns = [
    path("reports/", AttendanceReportView.as_view(), name="attendance-report"),
    path("", include(router.urls)),
]
