from django.db import models

from accounts.models import Employee
from core.models import TimeStampedModel


class LeaveRequest(TimeStampedModel):
    class LeaveType(models.TextChoices):
        SICK = "sick", "Sick Leave"
        CASUAL = "casual", "Casual Leave"
        EARNED = "earned", "Earned Leave"
        UNPAID = "unpaid", "Unpaid Leave"

    class Status(models.TextChoices):
        # The new 4-stage workflow
        PENDING = "pending", "Pending Team Lead Approval"
        TL_APPROVED = "tl_approved", "Approved by Team Lead"
        APPROVED = "approved", "Fully Approved (HR)"
        REJECTED = "rejected", "Rejected"

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="leave_requests")
    tenant = models.ForeignKey(
        "clients.Client", on_delete=models.CASCADE, related_name="leave_requests", null=True
    )
    leave_type = models.CharField(
        max_length=20, choices=LeaveType.choices, default=LeaveType.CASUAL
    )

    start_date = models.DateField()
    end_date = models.DateField()
    is_half_day = models.BooleanField(default=False)
    total_days = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        default=0.0,
        help_text="Calculated duration. 0.5 for half days.",
    )
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

    tl_comment = models.TextField(blank=True, null=True, help_text="Comments from the Team Lead.")
    hr_comment = models.TextField(blank=True, null=True, help_text="Comments from HR.")

    class Meta:
        db_table = "leave_requests"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.employee.get_full_name()} - {self.start_date} ({self.status})"
