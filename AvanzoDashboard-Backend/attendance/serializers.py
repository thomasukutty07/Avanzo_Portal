from rest_framework import serializers

from .models import DailyLog, DailyLogEntry

# ─────────────────────────────────────────────────────────────
# READ serializers (for listing/retrieving attendance records)
# ─────────────────────────────────────────────────────────────


class DailyLogEntryReadSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for a single project work entry.
    The frontend uses this to render structured intent/output cards.
    """

    project_name = serializers.CharField(source="project.title", read_only=True, default=None)
    display_label = serializers.CharField(read_only=True)
    has_output = serializers.BooleanField(read_only=True)
    outcome_display = serializers.CharField(
        source="get_outcome_display", read_only=True, default=""
    )

    class Meta:
        model = DailyLogEntry
        fields = [
            "id",
            "project",
            "project_name",
            "custom_label",
            "display_label",
            "intent_text",
            "output_text",
            "outcome",
            "outcome_display",
            "has_output",
            "priority_order",
        ]
        read_only_fields = fields


class DailyLogSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for the full daily attendance record.
    Nests the structured project entries so the frontend gets
    everything in a single API call.

    Example response:
    {
        "id": "uuid",
        "date": "2026-03-30",
        "status": "clocked_in",
        "clock_in_time": "2026-03-30T09:00:00Z",
        "is_late": false,
        "general_notes": "Team standup at 10am",
        "entries": [
            {
                "project": "uuid",
                "project_name": "Avanzo Dashboard",
                "intent_text": "Finish the auth middleware PR",
                "output_text": "",
                "outcome": "",
            },
            {
                "project": null,
                "custom_label": "Code Reviews",
                "intent_text": "Review 3 pending PRs from the team",
                "output_text": "",
                "outcome": "",
            }
        ]
    }
    """

    entries = DailyLogEntryReadSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    employee_name = serializers.CharField(source="employee.get_full_name", read_only=True)

    class Meta:
        model = DailyLog
        fields = [
            "id",
            "employee",
            "employee_name",
            "date",
            "status",
            "status_display",
            "clock_in_time",
            "clock_out_time",
            "is_late",
            "total_hours",
            "general_notes",
            "entries",
            "has_clocked_in",
            "has_clocked_out",
        ]
        read_only_fields = fields


# ─────────────────────────────────────────────────────────────
# WRITE serializers (for clock-in and clock-out actions)
# ─────────────────────────────────────────────────────────────


class ClockInEntrySerializer(serializers.Serializer):
    """
    One entry in the morning clock-in payload.

    The employee submits a list of these — one per project they plan
    to work on today.

    Usage (what the frontend sends):
    {
        "project": "uuid-of-project",       ← OR null for non-project work
        "custom_label": "Code Reviews",      ← only when project is null
        "intent_text": "Review 3 pending PRs from the team",
        "priority_order": 0
    }
    """

    project = serializers.UUIDField(required=False, allow_null=True, default=None)
    custom_label = serializers.CharField(required=False, allow_blank=True, default="")
    intent_text = serializers.CharField()
    priority_order = serializers.IntegerField(required=False, default=0)

    def validate_intent_text(self, value):
        words = value.strip().split()
        if len(words) < 3:
            raise serializers.ValidationError("Please describe your plan in at least 3 words.")
        return value

    def validate(self, data):
        # Must have either a project OR a custom_label
        if not data.get("project") and not data.get("custom_label", "").strip():
            raise serializers.ValidationError(
                "Either select a project or provide a custom label "
                "(e.g., 'Team Meetings', 'Training')."
            )
        return data


class ClockInSerializer(serializers.Serializer):
    """
    The full morning clock-in payload.

    What the frontend sends:
    {
        "entries": [
            { "project": "uuid", "intent_text": "Finish auth PR" },
            { "project": "uuid", "intent_text": "Start task modal" },
            { "custom_label": "Code Reviews", "intent_text": "Review 3 PRs" }
        ],
        "general_notes": "Team standup at 10am"   ← optional
    }
    """

    entries = ClockInEntrySerializer(many=True)
    general_notes = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_entries(self, value):
        if not value:
            raise serializers.ValidationError(
                "You must add at least one work item to clock in. "
                "What are you planning to work on today?"
            )
        if len(value) > 10:
            raise serializers.ValidationError("Maximum 10 work items per day. Focus is key!")
        return value


class ClockOutEntrySerializer(serializers.Serializer):
    """
    One entry in the evening clock-out payload.

    The employee updates each morning entry with what actually happened.

    Usage (what the frontend sends):
    {
        "entry_id": "uuid-of-the-morning-entry",
        "output_text": "Reviewed 2 of 3 PRs, third needs more context",
        "outcome": "partial"
    }
    """

    entry_id = serializers.UUIDField()
    output_text = serializers.CharField()
    outcome = serializers.ChoiceField(choices=DailyLogEntry.Outcome.choices)

    def validate_output_text(self, value):
        words = value.strip().split()
        if len(words) < 3:
            raise serializers.ValidationError(
                "Please describe what you accomplished in at least 3 words."
            )
        return value


class ClockOutSerializer(serializers.Serializer):
    """
    The full evening clock-out payload.

    What the frontend sends:
    {
        "entries": [
            {
                "entry_id": "uuid",
                "output_text": "Finished the auth middleware PR and got it merged",
                "outcome": "completed"
            },
            {
                "entry_id": "uuid",
                "output_text": "Reviewed 2 of 3 PRs",
                "outcome": "partial"
            }
        ],
        "general_notes": "Updated standup notes in Notion"   ← optional
    }
    """

    entries = ClockOutEntrySerializer(many=True)
    general_notes = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_entries(self, value):
        if not value:
            raise serializers.ValidationError(
                "Please provide an update for at least one work item."
            )
        return value
