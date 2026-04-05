from rest_framework import serializers

from .models import LeaveRequest


class LeaveRequestSerializer(serializers.ModelSerializer):
    """
    Main serializer for viewing leave requests.
    Includes nested employee details for HR/Admin views.
    """

    employee_name = serializers.CharField(source="employee.get_full_name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    leave_type_display = serializers.CharField(source="get_leave_type_display", read_only=True)

    # Give the frontend the actual names of the reviewers
    tl_reviewer_name = serializers.CharField(
        source="tl_reviewer.get_full_name", read_only=True, default=None
    )
    hr_reviewer_name = serializers.CharField(
        source="hr_reviewer.get_full_name", read_only=True, default=None
    )

    class Meta:
        model = LeaveRequest
        fields = [
            "id",
            "employee",
            "employee_name",
            "leave_type",
            "leave_type_display",
            "start_date",
            "end_date",
            "reason",
            "status",
            "status_display",
            "tl_reviewer",  # Updated field
            "tl_reviewer_name",  # New frontend helper
            "hr_reviewer",  # Updated field
            "hr_reviewer_name",  # New frontend helper
            "review_remarks",
            "created_at",
        ]
        # Ensure the reviewers cannot be manually modified via an API payload
        read_only_fields = ["id", "employee", "status", "tl_reviewer", "hr_reviewer", "created_at"]


class LeaveApplySerializer(serializers.ModelSerializer):
    """
    Serializer used by Employees to submit a new request.
    """

    class Meta:
        model = LeaveRequest
        fields = ["leave_type", "start_date", "end_date", "reason"]

    def validate(self, data):
        """Ensure end_date is not before start_date."""
        if data["start_date"] > data["end_date"]:
            raise serializers.ValidationError({"end_date": "End date cannot be before start date."})
        return data


class LeaveReviewSerializer(serializers.ModelSerializer):
    """
    Serializer used by HR/Admin to approve or reject with remarks.
    """

    class Meta:
        model = LeaveRequest
        fields = ["review_remarks"]
        extra_kwargs = {"review_remarks": {"required": True, "allow_blank": False}}
