from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AttendanceViewSet

app_name = "attendance"

router = DefaultRouter()
router.register(r"", AttendanceViewSet, basename="attendance")

urlpatterns = [
    path("", include(router.urls)),
]
