from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ExternalClientViewSet, ProjectViewSet, ServiceViewSet, TaskViewSet

app_name = "projects"

router = DefaultRouter()
router.register(r"clients", ExternalClientViewSet, basename="client")
router.register(r"services", ServiceViewSet, basename="service")
router.register(r"projects", ProjectViewSet, basename="project")
router.register(r"tasks", TaskViewSet, basename="task")

urlpatterns = [
    path("", include(router.urls)),
]
