from rest_framework.routers import DefaultRouter

from .views import AdminDashboardViewSet

router = DefaultRouter()
router.register(r"admin", AdminDashboardViewSet, basename="admin-dashboard")

urlpatterns = router.urls
