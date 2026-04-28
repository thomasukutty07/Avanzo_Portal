from django.db import models
from core.models import TimeStampedModel


class WorkingReport(TimeStampedModel):
    """
    Model to store snapshots of the working report generated from DailyLog and DailyLogEntry.
    Supports two types:
      - "daily"  : a point-in-time snapshot of today's activity
      - "range"  : an aggregated report spanning date_from → date_to (max 90 days)
    """

    class ReportType(models.TextChoices):
        DAILY = "daily", "Daily Snapshot"
        RANGE = "range", "Date Range Report"

    tenant = models.ForeignKey(
        "clients.Client",
        on_delete=models.CASCADE,
        related_name="working_reports",
        null=True,
        blank=True,
        help_text="The organisation this report belongs to.",
    )
    report_id = models.CharField(
        max_length=80,
        unique=True,
        db_index=True,
        help_text="Unique identifier, e.g. WR20240424143000 or WRR20260428_20260421-20260428",
    )
    report_type = models.CharField(
        max_length=10,
        choices=ReportType.choices,
        default=ReportType.DAILY,
        help_text="Whether this is a single-day snapshot or a date-range report.",
    )
    date_from = models.DateField(
        null=True,
        blank=True,
        help_text="Start date of the range (only set for range reports).",
    )
    date_to = models.DateField(
        null=True,
        blank=True,
        help_text="End date of the range (only set for range reports).",
    )
    generated_at = models.DateTimeField(auto_now_add=True)
    data = models.JSONField(
        default=list,
        help_text="A JSON array containing the snapshot of working records for each employee.",
    )

    class Meta:
        db_table = "reports_working_reports"
        ordering = ["-generated_at"]

    def __str__(self):
        return f"Working Report {self.report_id}"
