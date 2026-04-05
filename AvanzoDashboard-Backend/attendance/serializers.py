from rest_framework import serializers

from .models import DailyLog


class DailyLogSerializer(serializers.ModelSerializer):
    """Read-only serializer for fetching attendance history."""

    class Meta:
        model = DailyLog
        fields = [
            "id",
            "date",
            "morning_intent",
            "clock_in_time",
            "evening_summary",
            "clock_out_time",
            "has_clocked_in",
            "has_clocked_out",
        ]
        read_only_fields = fields


class ClockInSerializer(serializers.ModelSerializer):
    """Validates the Morning Gate payload."""

    class Meta:
        model = DailyLog
        fields = ["morning_intent"]

    def validate_morning_intent(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Please provide a bit more detail about your daily plan (minimum 10 characters)."
            )
        return value


class ClockOutSerializer(serializers.ModelSerializer):
    """Validates the Evening Gate payload."""

    class Meta:
        model = DailyLog
        fields = ["evening_summary"]

    def validate_evening_summary(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Please provide a clear summary of what you "
                "completed today (minimum 10 characters)."
            )
        return value
