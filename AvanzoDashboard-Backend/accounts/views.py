from datetime import timedelta

from django.utils import timezone
from rest_framework.decorators import action
from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer
from rest_framework import serializers, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import BlacklistedToken, OutstandingToken, RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from core.permissions import IsAdminOrHR, IsAdminOrHRReadOnly

from .models import AccessRole, Employee, LoginAttempt, TalentTag
from .serializers import (
    AccessRoleSerializer,
    CustomTokenObtainPairSerializer,
    EmployeeSerializer,
    MeSerializer,
    TalentTagSerializer,
)


class LoginRateThrottle(AnonRateThrottle):
    rate = "60/minute"


class CustomTokenObtainPairView(TokenObtainPairView):
    """Login endpoint that returns JWT tokens with embedded role claims."""

    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]
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


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing employee instances.
    Restricted to Admin and HR via custom permissions.
    """

    queryset = Employee.objects.select_related(
        "department", "designation", "access_role", "team_lead"
    )
    serializer_class = EmployeeSerializer

    def get_permissions(self):
        # Team Leads can see the list and update skills
        if self.action in ["list", "retrieve", "update_skills", "evaluate"]:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdminOrHR()]

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

    @action(
        detail=True,
        methods=["post"],
        url_path="update-skills",
        permission_classes=[IsAuthenticated],
    )
    def update_skills(self, request, pk=None):
        """
        POST /api/auth/employees/{id}/update-skills/
        Allows Team Lead to update employee skills.
        """
        if not (request.user.is_team_lead or request.user.is_admin):
            return Response({"detail": "Only Team Leads can update skills."}, status=403)

        employee = self.get_object()
        talent_ids = request.data.get("talent_ids", [])

        if not isinstance(talent_ids, list):
            return Response({"detail": "talent_ids must be a list of IDs."}, status=400)

        employee.evaluated_talents.set(talent_ids)
        return Response(EmployeeSerializer(employee).data)

    @action(detail=True, methods=["post"], url_path="evaluate", permission_classes=[IsAuthenticated])
    def evaluate(self, request, pk=None):
        """
        Legacy endpoint — redirects to update_skills.
        """
        return self.update_skills(request, pk)


class TalentTagViewSet(viewsets.ModelViewSet):
    queryset = TalentTag.objects.all()
    serializer_class = TalentTagSerializer
    permission_classes = [IsAuthenticated]


class AccessRoleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing access roles (usually for populating UI dropdowns).
    """

    queryset = AccessRole.objects.all()
    serializer_class = AccessRoleSerializer
    permission_classes = [IsAuthenticated]
