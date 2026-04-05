from django.db import models
from django.utils import timezone

from accounts.models import Employee
from core.models import TimeStampedModel


class DailyLog(TimeStampedModel):
    """
    Tracks the daily morning intent and evening summary for each employee.
    """

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="daily_logs")

    # We explicitly track the local calendar date, defaulting to today
    date = models.DateField(default=timezone.now, db_index=True)

    # Morning Gate
    morning_intent = models.TextField(
        help_text="What the employee plans to accomplish today.", blank=True, null=True
    )
    clock_in_time = models.DateTimeField(null=True, blank=True)

    # Evening Gate
    evening_summary = models.TextField(
        help_text="What was actually completed.", blank=True, null=True
    )
    clock_out_time = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "attendance_daily_logs"
        ordering = ["-date", "-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["employee", "date"], name="unique_daily_log_per_employee"
            )
        ]

    def __str__(self):
        return f"{self.employee.get_full_name()} - {self.date}"

    @property
    def has_clocked_in(self) -> bool:
        return bool(self.morning_intent and self.clock_in_time)

    @property
    def has_clocked_out(self) -> bool:
        return bool(self.evening_summary and self.clock_out_time)
