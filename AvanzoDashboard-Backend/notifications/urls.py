from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import BroadcastViewSet, NotificationViewSet

app_name = "notifications"

router = DefaultRouter()
router.register(r"notifications", NotificationViewSet, basename="notification")
router.register(r"broadcasts", BroadcastViewSet, basename="broadcast")

urlpatterns = [
    path("", include(router.urls)),
]
