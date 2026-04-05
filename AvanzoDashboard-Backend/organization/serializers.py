from rest_framework import serializers

from .models import Department, Designation


class DepartmentSerializer(serializers.ModelSerializer):
    employee_count = serializers.IntegerField(read_only=True)
    project_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Department
        fields = ["id", "name", "is_active", "employee_count", "project_count", "created_at", "updated_at"]
        read_only_fields = ["id", "employee_count", "project_count", "created_at", "updated_at"]


class DesignationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Designation
        fields = ["id", "name", "is_active", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
