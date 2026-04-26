"""
DRF serializers for performance scoring.

Three serializers:
  - PerformanceSnapshotSerializer: read-only, for frozen historical snapshots.
  - PerformanceWeightConfigSerializer: read/write, validates weights sum to 1.0.
  - LiveScoreSerializer: read-only, for real-time score computation results.
"""

from rest_framework import serializers

from .models import PerformanceSnapshot, PerformanceWeightConfig


class PerformanceSnapshotSerializer(serializers.ModelSerializer):
    """Serializes a frozen snapshot — includes employee and department names."""

    employee_name = serializers.CharField(
        source="employee.get_full_name", read_only=True
    )
    department_name = serializers.CharField(
        source="employee.department.name", read_only=True, default=None
    )

    class Meta:
        model = PerformanceSnapshot
        fields = [
            "id",
            "employee",
            "employee_name",
            "department_name",
            "period_type",
            "period_start",
            "period_end",
            "attendance_score",
            "delivery_score",
            "quality_score",
            "reliability_score",
            "overall_score",
            "rank",
            "total_ranked",
            "weights_used",
        ]
        read_only_fields = fields


class PerformanceWeightConfigSerializer(serializers.ModelSerializer):
    """
    Serializer for the tenant-level weight config.

    Validates that weights sum to 1.0 on every write.  Supports partial
    updates — missing fields fall back to the current instance values.
    """

    class Meta:
        model = PerformanceWeightConfig
        fields = [
            "id",
            "weight_attendance",
            "weight_delivery",
            "weight_quality",
            "weight_reliability",
        ]

    def validate(self, data):
        """Reject if weights don't sum to 1.0 (±0.01 tolerance)."""
        total = sum(
            [
                data.get(
                    "weight_attendance",
                    self.instance.weight_attendance if self.instance else 0.20,
                ),
                data.get(
                    "weight_delivery",
                    self.instance.weight_delivery if self.instance else 0.35,
                ),
                data.get(
                    "weight_quality",
                    self.instance.weight_quality if self.instance else 0.25,
                ),
                data.get(
                    "weight_reliability",
                    self.instance.weight_reliability if self.instance else 0.20,
                ),
            ]
        )
        if abs(float(total) - 1.0) > 0.01:
            raise serializers.ValidationError(
                f"Weights must sum to 1.0, got {total}"
            )
        return data


class LiveScoreSerializer(serializers.Serializer):
    """
    For real-time score computation results (not from a saved snapshot).

    Used by the /my-score/ endpoint to show the employee their
    current-week performance without waiting for Sunday's snapshot.
    """

    attendance_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    delivery_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    quality_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    reliability_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    overall_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    weights_used = serializers.DictField()
