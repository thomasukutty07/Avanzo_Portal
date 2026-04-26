from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import WorkingReportViewSet

router = DefaultRouter()
router.register(r"working", WorkingReportViewSet, basename="working-report")

urlpatterns = [
    path("", include(router.urls)),
]
