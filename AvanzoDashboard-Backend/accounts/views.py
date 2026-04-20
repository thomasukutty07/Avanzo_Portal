from datetime import timedelta

from django.utils import timezone
from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import BlacklistedToken, OutstandingToken, RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from core.permissions import IsAdminOrHR
from core.viewsets import TenantAwareViewSetMixin

from .models import AccessRole, Employee, LoginAttempt, TalentTag
from .serializers import (
    AccessRoleSerializer,
    CustomTokenObtainPairSerializer,
    EmployeeSerializer,
    MeSerializer,
    TalentTagSerializer,
    TenantRegistrationSerializer,
)
from .services import TenantOrchestrator


class RegistrationRateThrottle(AnonRateThrottle):
    rate = "5/hour"


class TenantRegistrationView(APIView):
    """Public organization sign-up gateway."""

    permission_classes = [AllowAny]
    throttle_classes = [RegistrationRateThrottle]

    @extend_schema(
        summary="Register a new organization (tenant)",
        request=TenantRegistrationSerializer,
        responses={201: OpenApiResponse(description="Workspace provisioned.")},
        tags=["Registration"],
    )
    def post(self, request):
        serializer = TenantRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        orchestrator = TenantOrchestrator()

        try:
            orchestrator.provision_new_workspace(
                company_name=data["company_name"],
                subdomain=data["subdomain"],
                admin_data={
                    "email": data["admin_email"],
                    "password": data["admin_password"],
                    "first_name": data.get("admin_first_name", ""),
                    "last_name": data.get("admin_last_name", ""),
                },
            )
            return Response(
                {"message": "Workspace provisioned successfully. Redirect to login."},
                status=status.HTTP_201_CREATED,
            )
        except Exception:
            return Response(
                {"detail": "Provisioning failed. Contact support."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LoginRateThrottle(AnonRateThrottle):
    rate = "5/minute"


class CustomTokenObtainPairView(TokenObtainPairView):
    """Login endpoint that returns JWT tokens with embedded role claims."""

    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [LoginRateThrottle]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")

        if email:
            # 1. Check for 15-minute brute-force lockout
            lockout_time = timezone.now() - timedelta(minutes=15)
            failed_attempts = LoginAttempt.objects.filter(
                email=email, attempted_at__gte=lockout_time, was_successful=False
            ).count()

            if failed_attempts >= 5:
                return Response(
                    {
                        "detail": (
                            "Account temporarily locked due to too many failed attempts. "
                            "Try again in 15 minutes."
                        )
                    },
                    status=429,
                )

        try:
            response = super().post(request, *args, **kwargs)
            # 2. Login successful -> clear failure history
            if email:
                LoginAttempt.objects.filter(email=email).delete()
            return response
        except Exception as e:
            # 3. Login failed -> log attempt
            if email:
                LoginAttempt.objects.create(email=email, was_successful=False)
            raise e


class LogoutView(APIView):
    """Invalidates the provided refresh token to securely terminate a session."""

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Logout the current user",
        request=inline_serializer(
            name="LogoutRequest", fields={"refresh": serializers.CharField()}
        ),
        responses={200: OpenApiResponse(description="Successfully logged out.")},
    )
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Successfully logged out."})
        except Exception:
            return Response({"detail": "Invalid or missing token."}, status=400)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses=MeSerializer, summary="Get current authenticated user profile", tags=["Accounts"]
    )
    def get(self, request):
        serializer = MeSerializer(request.user)
        return Response(serializer.data)

    @extend_schema(
        request=MeSerializer,
        responses=MeSerializer,
        summary="Update current authenticated user profile",
        tags=["Accounts"],
    )
    def patch(self, request):
        serializer = MeSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class EmployeeViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing employee instances.
    Restricted to Admin and HR via custom permissions.
    """

    queryset = Employee.objects.select_related(
        "department", "designation", "access_role", "team_lead"
    )
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated, IsAdminOrHR]

    def get_queryset(self):
        user = self.request.user
        base_qs = super().get_queryset().select_related(
            "department", "designation", "access_role", "team_lead"
        )
        # Team Leads only see employees in their own department (within their tenant)
        if user.is_team_lead and user.department:
            return base_qs.filter(department=user.department)
        return base_qs

    def get_permissions(self):
        # Allow Team Lead to list/retrieve but not mutate
        if self.action in ("list", "retrieve"):
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminOrHR()]

    @action(detail=True, methods=["post"], url_path="update-skills")
    def update_skills(self, request, pk=None):
        """Team Lead endpoint to set evaluated talents on an employee."""
        employee = self.get_object()
        talent_ids = request.data.get("talent_ids", [])
        employee.evaluated_talents.set(talent_ids)
        return Response({"detail": "Skills updated."})

    def _revoke_tokens(self, user):
        """Forcefully expires all outstanding JWTs for a user."""
        tokens = OutstandingToken.objects.filter(user=user)
        for token in tokens:
            BlacklistedToken.objects.get_or_create(token=token)

    def perform_update(self, serializer):
        user = serializer.save()
        # If the HR changed status to offboarding/on_leave or manually unchecked is_active
        if not user.is_active or user.status != Employee.Status.ACTIVE:
            self._revoke_tokens(user)

    def perform_destroy(self, instance):
        self._revoke_tokens(instance)
        super().perform_destroy(instance)


class AccessRoleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing access roles (usually for populating UI dropdowns).
    """

    queryset = AccessRole.objects.all()
    serializer_class = AccessRoleSerializer
    permission_classes = [IsAuthenticated]


class TalentTagViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
    """
    CRUD for talent/skill tags. Readable by all authenticated users.
    Creation allowed for Team Leads and above.
    """

    queryset = TalentTag.objects.all().order_by("category", "name")
    serializer_class = TalentTagSerializer
    permission_classes = [IsAuthenticated]
