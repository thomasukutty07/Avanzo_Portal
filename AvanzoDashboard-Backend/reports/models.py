from django.db import models
from core.models import TimeStampedModel


class WorkingReport(TimeStampedModel):
    """
    Model to store snapshots of the working report generated from DailyLog and DailyLogEntry.
    """
    report_id = models.CharField(
        max_length=50, 
        unique=True, 
        db_index=True,
        help_text="Unique identifier for the report, e.g., WR20240424143000"
    )
    generated_at = models.DateTimeField(auto_now_add=True)
    data = models.JSONField(
        default=list,
        help_text="A JSON array containing the snapshot of working records for each employee."
    )

    class Meta:
        db_table = "reports_working_reports"
        ordering = ["-generated_at"]

    def __str__(self):
        return f"Working Report {self.report_id}"
