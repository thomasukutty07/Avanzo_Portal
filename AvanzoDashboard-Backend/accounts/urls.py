# accounts/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AccessRoleViewSet,
    CustomTokenObtainPairView,
    EmployeeViewSet,
    LogoutView,
    MeView,
    TenantRegistrationView,
)

app_name = "accounts"

router = DefaultRouter()
router.register(r"employees", EmployeeViewSet, basename="employee")
router.register(r"roles", AccessRoleViewSet, basename="role")

urlpatterns = [
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("register/", TenantRegistrationView.as_view(), name="register"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("", include(router.urls)),
]
