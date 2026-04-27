from datetime import timedelta

from django.utils import timezone
from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import BlacklistedToken, OutstandingToken, RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from core.permissions import IsAdminOrHR, IsTeamLeadOrAbove

from .models import AccessRole, Employee, LoginAttempt
from .serializers import (
    AccessRoleSerializer,
    CustomTokenObtainPairSerializer,
    EmployeeSerializer,
    MeSerializer,
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
        except Exception as e:
            import logging
            logging.error(f"Provisioning failed: {e}", exc_info=True)
            return Response(
                {"detail": f"Provisioning failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LoginRateThrottle(AnonRateThrottle):
    rate = "5/minute"


class CustomTokenObtainPairView(TokenObtainPairView):
    """Login endpoint that returns JWT tokens with embedded role claims."""

    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [LoginRateThrottle]

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        ip_address = self.get_client_ip(request)

        if email:
            # 1. Check for 15-minute brute-force lockout
            lockout_time = timezone.now() - timedelta(minutes=15)
            failed_attempts = LoginAttempt.objects.filter(
                email=email,
                ip_address=ip_address,
                attempted_at__gte=lockout_time,
                was_successful=False,
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
                LoginAttempt.objects.filter(email=email, ip_address=ip_address).delete()
            return response
        except Exception as e:
            # 3. Login failed -> log attempt
            if email:
                LoginAttempt.objects.create(
                    email=email, ip_address=ip_address, was_successful=False
                )
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


from core.mixins import TenantFilterMixin

class EmployeeViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing employee instances.
    Restricted to Admin and HR via custom permissions.
    Now with tenant-level isolation.
    """

    queryset = Employee.objects.select_related(
        "department", "designation", "access_role", "team_lead"
    )
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated, IsTeamLeadOrAbove]

    def get_permissions(self):
        if self.action == 'update_skills':
            return [IsAuthenticated()]
        return super().get_permissions()

    def get_queryset(self):
        qs = super().get_queryset()
        if getattr(self, "swagger_fake_view", False):
            return qs.none()

        user = self.request.user

        if user.is_admin or user.is_hr:
            return qs

        # Team Leads only see their own department's employees
        # and we exclude Admin/HR roles to prevent TLs from managing them.
        from core.constants import RoleNames
        return qs.filter(department=user.department).exclude(
            access_role__name__in=[RoleNames.ADMIN, RoleNames.HR]
        )

    @action(detail=True, methods=["post"], url_path="update-skills")
    def update_skills(self, request, pk=None):
        """
        POST /api/employees/{id}/update-skills/
        
        Updates the skills (talent tags) for a specific employee.
        Expected payload: { "talent_ids": [uuid, uuid, ...] }
        """
        employee = self.get_object()
        
        # Check if the user is updating their own skills OR is a manager
        if request.user != employee and not (request.user.is_admin or request.user.is_hr or request.user.is_team_lead):
             return Response({"detail": "Permission denied."}, status=403)
        talent_ids = request.data.get("talent_ids", [])
        
        # We handle this by updating the EmployeeSkill mapping
        # For simplicity in Option B, we'll just link them directly or via the skills app
        # Since the frontend uses this custom action, let's implement it here
        from skills.models import Skill, EmployeeSkill
        
        # Clear old skills and add new ones
        EmployeeSkill.objects.filter(employee=employee).delete()
        
        for skill_id in talent_ids:
            try:
                skill = Skill.objects.get(id=skill_id)
                EmployeeSkill.objects.create(
                    employee=employee,
                    skill=skill,
                    tenant=request.user.tenant
                )
            except (Skill.DoesNotExist, Exception):
                continue
                
        return Response({"status": "Skills updated successfully."})

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
