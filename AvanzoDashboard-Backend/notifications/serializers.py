from rest_framework import serializers

from .models import Broadcast, BroadcastAcknowledgment, Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "notification_type",
            "action_url",
            "is_read",
            "created_at",
        ]
        read_only_fields = fields


class BroadcastSerializer(serializers.ModelSerializer):
    """Used for displaying broadcasts to employees."""

    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)
    created_by_role = serializers.CharField(source="created_by.access_role.name", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True)
    is_acknowledged = serializers.SerializerMethodField()

    class Meta:
        model = Broadcast
        fields = [
            "id",
            "severity",
            "target_scope",
            "department",
            "department_name",
            "title",
            "message",
            "created_by",
            "created_by_name",
            "created_by_role",
            "is_active",
            "is_acknowledged",
            "created_at",
        ]
        read_only_fields = fields

    def get_is_acknowledged(self, obj) -> bool:
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return BroadcastAcknowledgment.objects.filter(
                broadcast=obj, employee=request.user
            ).exists()
        return False


class BroadcastCreateSerializer(serializers.ModelSerializer):
    """Used by Admin/HR to create a new broadcast."""

    class Meta:
        model = Broadcast
        fields = ["severity", "target_scope", "department", "title", "message"]

    def validate(self, data):
        scope = data.get("target_scope")
        department = data.get("department")

        if scope == Broadcast.TargetScope.DEPARTMENT and not department:
            raise serializers.ValidationError(
                {"department": "A department must be selected for department-scoped broadcasts."}
            )

        if scope == Broadcast.TargetScope.ORG_WIDE and department:
            # Clean up department if it was provided for org-wide
            data["department"] = None

        return data


class BroadcastAcknowledgmentSerializer(serializers.Serializer):
    """Dummy serializer to handle acknowledgment action."""

    broadcast_id = serializers.UUIDField()
