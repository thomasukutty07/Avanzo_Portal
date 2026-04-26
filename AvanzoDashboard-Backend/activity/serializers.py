from rest_framework import serializers

from .models import ActivityEvent


class ActivityEventSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for activity feed items.
    Includes actor name and department name for frontend rendering
    without extra API calls.
    """

    actor_name = serializers.CharField(source="actor.get_full_name", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True, default=None)
    event_type_display = serializers.CharField(source="get_event_type_display", read_only=True)

    class Meta:
        model = ActivityEvent
        fields = [
            "id",
            "event_type",
            "event_type_display",
            "actor",
            "actor_name",
            "timestamp",
            "title",
            "detail",
            "department",
            "department_name",
            "icon",
            "metadata",
        ]
        read_only_fields = fields
