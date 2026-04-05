from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from core.constants import RoleNames

from .models import AccessRole, Employee


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Embeds user role and profile data into the JWT so the frontend
    can hydrate RoleContext immediately after login without a second API call."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Custom claims embedded in the JWT payload
        token["email"] = user.email
        token["full_name"] = user.get_full_name()
        token["role"] = user.role_name
        return token


class MeSerializer(serializers.ModelSerializer):
    """Serializer for the /api/auth/me/ endpoint — returns the authenticated
    user's full profile including role, department, and designation."""

    role = serializers.CharField(source="role_name", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True, default=None)
    designation_name = serializers.CharField(
        source="designation.name", read_only=True, default=None
    )
    team_lead_name = serializers.SerializerMethodField()

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
        ]

    def get_team_lead_name(self, obj) -> str | None:
        return obj.team_lead.get_full_name() if obj.team_lead else None


class AccessRoleSerializer(serializers.ModelSerializer):
    """Used for populating dropdowns and UI selection."""

    class Meta:
        model = AccessRole
        fields = ["id", "name", "description"]


class EmployeeSerializer(serializers.ModelSerializer):
    """Used by Admin and HR for managing users."""

    password = serializers.CharField(write_only=True, required=False)

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
            "department",
            "designation",
            "team_lead",
            "status",
            "date_of_joining",
        ]

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
