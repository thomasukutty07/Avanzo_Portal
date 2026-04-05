from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from core.permissions import IsAdminOrHR

from .models import AccessRole, Employee
from .serializers import (
    AccessRoleSerializer,
    CustomTokenObtainPairSerializer,
    EmployeeSerializer,
    MeSerializer,
)


class LoginRateThrottle(AnonRateThrottle):
    rate = "5/minute"


class CustomTokenObtainPairView(TokenObtainPairView):
    """Login endpoint that returns JWT tokens with embedded role claims."""

    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [LoginRateThrottle]


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses=MeSerializer, summary="Get current authenticated user profile", tags=["Accounts"]
    )
    def get(self, request):
        serializer = MeSerializer(request.user)
        return Response(serializer.data)


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing employee instances.
    Restricted to Admin and HR via custom permissions.
    """

    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated, IsAdminOrHR]


class AccessRoleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing access roles (usually for populating UI dropdowns).
    """

    queryset = AccessRole.objects.all()
    serializer_class = AccessRoleSerializer
    permission_classes = [IsAuthenticated]
