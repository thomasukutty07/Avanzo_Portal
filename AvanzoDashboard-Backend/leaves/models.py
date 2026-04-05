from django.db import models

from accounts.models import Employee
from core.models import TimeStampedModel


class LeaveRequest(TimeStampedModel):
    class LeaveType(models.TextChoices):
        FULL_DAY = "full_day", "Full Day"
        HALF_DAY = "half_day", "Half Day"

    class Status(models.TextChoices):
        # The new 4-stage workflow
        PENDING = "pending", "Pending Team Lead Approval"
        TL_APPROVED = "tl_approved", "Approved by Team Lead"
        APPROVED = "approved", "Fully Approved (HR)"
        REJECTED = "rejected", "Rejected"

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="leave_requests")
    leave_type = models.CharField(
        max_length=20, choices=LeaveType.choices, default=LeaveType.FULL_DAY
    )

    start_date = models.DateField()
    end_date = models.DateField()  # For half-day, start and end date will be the same
    reason = models.TextField()

    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True
    )

    # --- TWO-TIER REVIEW FIELDS ---

    # 1. Team Lead Review
    tl_reviewer = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tl_reviewed_leaves",
        help_text="The Team Lead who first cleared the leave.",
    )

    # 2. HR Final Review
    hr_reviewer = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="hr_reviewed_leaves",
        help_text="The HR manager who gave final system approval.",
    )

    review_remarks = models.TextField(
        blank=True, null=True, help_text="Final comments from reviewers."
    )

    class Meta:
        db_table = "leave_requests"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.employee.get_full_name()} - {self.start_date} ({self.status})"
