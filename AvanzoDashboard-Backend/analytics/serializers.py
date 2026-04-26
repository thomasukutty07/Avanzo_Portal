from rest_framework import serializers

from activity.models import ActivityEvent
from performance.models import PerformanceSnapshot


class AttendanceSummarySerializer(serializers.Serializer):
    total_expected = serializers.IntegerField()
    clocked_in = serializers.IntegerField()
    late = serializers.IntegerField()
    absent = serializers.IntegerField()


class ProjectsSummarySerializer(serializers.Serializer):
    active_count = serializers.IntegerField()
    overall_progress_pct = serializers.FloatField()


class DashboardActivityEventSerializer(serializers.ModelSerializer):
    """Separate from activity.serializers.ActivityEventSerializer to avoid schema name collision."""

    actor_name = serializers.CharField(source="actor.get_full_name", read_only=True)

    class Meta:
        model = ActivityEvent
        fields = [
            "id",
            "event_type",
            "actor_name",
            "timestamp",
            "title",
            "detail",
            "icon",
            "metadata",
        ]


class LeaderboardSnapshotSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.get_full_name", read_only=True)
    department_name = serializers.CharField(source="employee.department.name", read_only=True)

    class Meta:
        model = PerformanceSnapshot
        fields = [
            "id",
            "employee_id",
            "employee_name",
            "department_name",
            "overall_score",
            "rank",
        ]


class AdminDashboardSummarySerializer(serializers.Serializer):
    attendance = AttendanceSummarySerializer()
    projects = ProjectsSummarySerializer()
    pending_leaves = serializers.IntegerField()
    open_tickets = serializers.IntegerField()
    activity_feed = DashboardActivityEventSerializer(many=True)
    leaderboard = LeaderboardSnapshotSerializer(many=True)


class DepartmentHealthSerializer(serializers.Serializer):
    department_id = serializers.UUIDField()
    department_name = serializers.CharField()
    attendance_pct = serializers.FloatField()
    avg_performance_score = serializers.FloatField()
    active_projects_count = serializers.IntegerField()
    open_tickets_count = serializers.IntegerField()
    health_status = serializers.ChoiceField(choices=["green", "yellow", "red"])
