from rest_framework import serializers
from .models import WorkingReport


class WorkingReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkingReport
        fields = ["id", "report_id", "generated_at", "data"]
        read_only_fields = ["id", "report_id", "generated_at", "data"]
