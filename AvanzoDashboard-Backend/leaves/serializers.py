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
            "is_half_day",
            "total_days",
            "reason",
            "status",
            "status_display",
            "tl_reviewer",
            "tl_reviewer_name",
            "hr_reviewer",
            "hr_reviewer_name",
            "tl_comment",
            "hr_comment",
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
        fields = ["leave_type", "start_date", "end_date", "is_half_day", "reason"]

    def validate(self, data):
        """Calculate total days and validate against leave balance."""
        start_date = data.get("start_date")
        end_date = data.get("end_date")
        is_half_day = data.get("is_half_day", False)

        if start_date and end_date:
            if start_date > end_date:
                raise serializers.ValidationError(
                    {"end_date": "End date cannot be before start date."}
                )

            if is_half_day:
                if start_date != end_date:
                    raise serializers.ValidationError(
                        {"is_half_day": "Half-day leaves must have the same start and end date."}
                    )
                total_days = 0.5
            else:
                total_days = (end_date - start_date).days + 1

            # Validate balance
            request = self.context.get("request")
            if request and request.user:
                if float(total_days) > float(request.user.leave_balance):
                    raise serializers.ValidationError(
                        {
                            "non_field_errors": (
                                f"You requested {total_days} day(s) but only have "
                                f"{request.user.leave_balance} day(s) available."
                            )
                        }
                    )

            # Store total_days on the instance implicitly since we calculate it here
            data["total_days"] = total_days

        return data


class LeaveReviewSerializer(serializers.ModelSerializer):
    """
    Serializer used by HR/Admin to approve or reject with remarks.
    """

    class Meta:
        model = LeaveRequest
        fields = ["comment"]
        extra_kwargs = {"comment": {"required": True, "allow_blank": False}}
