from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from core.constants import RoleNames

from .models import AccessRole, Employee, TalentTag


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
    Embeds user identity into the JWT payload so the frontend can hydrate
    RoleContext immediately after login without a second API call.

    Claims added to the JWT payload:
      - email     : User's email address (for frontend display).
      - full_name : User's full name (for frontend display).
      - role      : User's RBAC role name (for frontend permission checks).
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["email"] = user.email
        token["full_name"] = user.get_full_name()
        token["role"] = user.role_name

        return token


class MeSerializer(serializers.ModelSerializer):
    """Serializer for the /api/auth/me/ endpoint — returns the authenticated
    user's full profile including role, department, and designation."""

    role = serializers.CharField(source="role_name", read_only=True)
    department_name = serializers.SerializerMethodField()
    designation_name = serializers.SerializerMethodField()
    team_lead_name = serializers.SerializerMethodField()
    assigned_projects = serializers.SerializerMethodField()

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
            "department",
            "department_name",
            "designation",
            "designation_name",
            "team_lead",
            "team_lead_name",
            "assigned_projects",
            "status",
            "date_of_joining",
        ]
        read_only_fields = [
            "id",
            "email",
            "avatar",
            "employee_id",
            "role",
            "department",
            "department_name",
            "designation",
            "designation_name",
            "team_lead",
            "team_lead_name",
            "assigned_projects",
            "status",
            "date_of_joining",
        ]

    def get_team_lead_name(self, obj) -> str | None:
        return obj.team_lead.get_full_name() if obj.team_lead else None

    def get_department_name(self, obj):
        return obj.department.name if obj.department else None

    def get_designation_name(self, obj):
        return obj.designation.name if obj.designation else None

    def get_assigned_projects(self, obj):
        return [p.title for p in obj.assigned_projects.all()]


class AccessRoleSerializer(serializers.ModelSerializer):
    """Used for populating dropdowns and UI selection."""

    class Meta:
        model = AccessRole
        fields = ["id", "name", "description"]


class TalentTagSerializer(serializers.ModelSerializer):
    """Serializer for talent/skill tags."""

    class Meta:
        model = TalentTag
        fields = ["id", "name", "category"]


class EmployeeSerializer(serializers.ModelSerializer):
    """Used by Admin and HR for managing users."""

    password = serializers.CharField(write_only=True, required=False)
    department_name = serializers.SerializerMethodField()
    designation_name = serializers.SerializerMethodField()
    access_role_name = serializers.SerializerMethodField()
    assigned_projects = serializers.SerializerMethodField()

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
            "gender",
            "date_of_birth",
            "team_lead",
            "assigned_projects",
            "status",
            "date_of_joining",
        ]

    def get_department_name(self, obj):
        return obj.department.name if obj.department else None

    def get_designation_name(self, obj):
        return obj.designation.name if obj.designation else None

    def get_access_role_name(self, obj):
        return obj.access_role.name if obj.access_role else None

    def get_assigned_projects(self, obj):
        return [p.title for p in obj.assigned_projects.all()]

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
