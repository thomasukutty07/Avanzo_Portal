from rest_framework.routers import DefaultRouter

from .views import DepartmentViewSet, DesignationViewSet

app_name = "organization"

router = DefaultRouter()
router.register(r"departments", DepartmentViewSet, basename="department")
router.register(r"designations", DesignationViewSet, basename="designation")

urlpatterns = router.urls
