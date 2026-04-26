from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import (
    connection,  # gives us connection.tenant (set by django-tenants middleware)
)
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from core.constants import RoleNames

from .models import AccessRole, Employee


class TenantRegistrationSerializer(serializers.Serializer):
    """Input validation for public organization sign-up."""

    company_name = serializers.CharField(max_length=100)
    subdomain = serializers.CharField(max_length=63)
    admin_email = serializers.EmailField()
    admin_password = serializers.CharField(write_only=True)
    admin_first_name = serializers.CharField(max_length=50, required=False, allow_blank=True)
    admin_last_name = serializers.CharField(max_length=50, required=False, allow_blank=True)

    def validate_subdomain(self, value):
        """Ensure subdomain is URL-safe and unique."""
        from clients.models import Domain

        if not value.isalnum() and "-" not in value:
            raise serializers.ValidationError("Subdomain must be alphanumeric or hyphens.")
        if Domain.objects.filter(domain=value.lower()).exists():
            raise serializers.ValidationError("This subdomain is already taken.")
        return value.lower()

    def validate_admin_password(self, value):
        """Pass password through Django's standard validators."""
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages)) from e
        return value


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Embeds user identity and tenant context into the JWT payload so:
      1. The frontend can hydrate RoleContext immediately after login (no second API call).
      2. TenantAwareJWTAuthentication can verify this token is only used against
         the tenant schema it was issued for — preventing cross-tenant token reuse.

    Claims added to the JWT payload:
      - tenant_schema : PostgreSQL schema name (e.g. "company_avanzo")
                        ← This is what TenantAwareJWTAuthentication validates.
      - email         : User's email address (for frontend display).
      - full_name     : User's full name (for frontend display).
      - role          : User's RBAC role name (for frontend permission checks).
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # ── Tenant Boundary Claim (Single-Tenant Default) ───────────────────────
        token["tenant_schema"] = "public"
        token["domain"] = "localhost"

        # ── User Identity Claims (Frontend Convenience) ───────────────────────
        token["email"] = user.email
        token["full_name"] = user.get_full_name()
        token["role"] = user.role_name

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Include domain in the response body (Default for Single-Tenant)
        data["domain"] = "localhost"
        return data


class MeSerializer(serializers.ModelSerializer):
    """Serializer for the /api/auth/me/ endpoint — returns the authenticated
    user's full profile including role, department, and designation."""

    role = serializers.CharField(source="role_name", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True, default=None)
    designation_name = serializers.CharField(
        source="designation.name", read_only=True, default=None
    )
    team_lead_name = serializers.SerializerMethodField()
    evaluated_talents = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone",
            "avatar",
            "employee_id",
            "role",
            "department_name",
            "designation_name",
            "team_lead_name",
            "status",
            "date_of_joining",
            "evaluated_talents",
        ]
        read_only_fields = [
            "id",
            "email",
            "avatar",
            "employee_id",
            "role",
            "department_name",
            "designation_name",
            "team_lead_name",
            "status",
            "date_of_joining",
            "evaluated_talents",
        ]

    def get_team_lead_name(self, obj) -> str | None:
        return obj.team_lead.get_full_name() if obj.team_lead else None

    def get_evaluated_talents(self, obj):
        return list(obj.skills.values_list("skill_id", flat=True))


class AccessRoleSerializer(serializers.ModelSerializer):
    """Used for populating dropdowns and UI selection."""

    class Meta:
        model = AccessRole
        fields = ["id", "name", "description"]


class EmployeeSerializer(serializers.ModelSerializer):
    """Used by Admin and HR for managing users."""

    password = serializers.CharField(write_only=True, required=False)
    access_role_name = serializers.CharField(source="access_role.name", read_only=True, default=None)
    department_name = serializers.CharField(source="department.name", read_only=True, default=None)
    designation_name = serializers.CharField(source="designation.name", read_only=True, default=None)

    class Meta:
        model = Employee
        fields = [
            "id",
            "email",
            "password",
            "first_name",
            "last_name",
            "phone",
            "employee_id",
            "access_role",
            "access_role_name",
            "department",
            "department_name",
            "designation",
            "designation_name",
            "team_lead",
            "status",
            "date_of_joining",
            "evaluated_talents",
        ]

    evaluated_talents = serializers.SerializerMethodField()

    def get_evaluated_talents(self, obj):
        return list(obj.skills.values_list("skill_id", flat=True))

    def validate_access_role(self, value):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return value

        role_name = value.name if value else None

        # Admins can assign any role
        if request.user.is_admin:
            return value

        # HR cannot assign Admin or HR roles to someone else
        if request.user.is_hr:
            if role_name in [RoleNames.ADMIN, RoleNames.HR]:
                raise serializers.ValidationError("HR cannot assign Admin or HR roles.")
            return value

        raise serializers.ValidationError("You do not have permission to assign roles.")

    def create(self, validated_data):
        password = validated_data.pop("password", None)

        # Use our custom manager
        employee = Employee.objects.create_user(
            email=validated_data.pop("email"), password=password, **validated_data
        )
        return employee

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)

    def validate_password(self, value):
        from django.contrib.auth.password_validation import validate_password

        validate_password(value)
        return value
