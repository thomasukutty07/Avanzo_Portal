from rest_framework import serializers

from .models import Ticket


class TicketSerializer(serializers.ModelSerializer):
    """Read serializer — used when listing or retrieving tickets."""

    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True
    )
    assigned_to_name = serializers.SerializerMethodField()
    resolved_by_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(
        source="get_status_display", read_only=True
    )
    ticket_type_display = serializers.CharField(
        source="get_ticket_type_display", read_only=True
    )

    class Meta:
        model = Ticket
        fields = [
            "id",
            "ticket_type",
            "ticket_type_display",
            "created_by",
            "created_by_name",
            "assigned_to",
            "assigned_to_name",
            "title",
            "description",
            "task_snapshot",
            "status",
            "status_display",
            "resolution_note",
            "resolved_by",
            "resolved_by_name",
            "resolved_at",
            "created_at",
        ]
        read_only_fields = fields

    def get_assigned_to_name(self, obj) -> str | None:
        return obj.assigned_to.get_full_name() if obj.assigned_to else None

    def get_resolved_by_name(self, obj) -> str | None:
        return obj.resolved_by.get_full_name() if obj.resolved_by else None


class TicketCreateSerializer(serializers.ModelSerializer):
    """
    Write serializer — used when an employee files a new ticket.

    The employee only provides ticket_type, title, description.
    Everything else (created_by, assigned_to, task_snapshot) is
    set automatically by the view.
    """

    class Meta:
        model = Ticket
        fields = ["ticket_type", "title", "description"]

    def validate_title(self, value):
        if len(value.strip()) < 5:
            raise serializers.ValidationError(
                "Please provide a meaningful title (minimum 5 characters)."
            )
        return value

    def validate_description(self, value):
        if len(value.strip()) < 20:
            raise serializers.ValidationError(
                "Please describe the issue in detail (minimum 20 characters)."
            )
        return value


class TicketResolveSerializer(serializers.Serializer):
    """Used when someone resolves a ticket. resolution_note is mandatory."""

    resolution_note = serializers.CharField(
        min_length=10,
        help_text="Explain how the issue was resolved.",
    )
