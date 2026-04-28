from rest_framework import serializers
from .models import WorkingReport


class WorkingReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkingReport
        fields = [
            "id",
            "report_id",
            "report_type",
            "date_from",
            "date_to",
            "generated_at",
            "data",
        ]
        read_only_fields = [
            "id",
            "report_id",
            "report_type",
            "date_from",
            "date_to",
            "generated_at",
            "data",
        ]
