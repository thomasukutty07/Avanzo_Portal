from decimal import Decimal

from django.db import models
from django.utils import timezone

from accounts.models import Employee
from core.models import TimeStampedModel


class DailyLog(TimeStampedModel):
    """
    The daily attendance record for one employee on one date.

    This is the PARENT container that tracks clock-in/out times and status.
    The actual intent and output details live in DailyLogEntry (child rows),
    where each entry is tagged to a specific project.

    Flow:
      Morning → Employee clocks in → creates DailyLogEntries (one per project)
      Evening → Employee clocks out → updates each entry with output + outcome
    """

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"  # Day started, no clock-in yet
        CLOCKED_IN = "clocked_in", "Clocked In"  # Morning gate passed
        CLOCKED_OUT = "clocked_out", "Clocked Out"  # Evening gate passed
        MISSING = "missing", "Missing"  # End of day, never showed up

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="daily_logs")
    date = models.DateField(default=timezone.now, db_index=True)

    # Clock times
    clock_in_time = models.DateTimeField(null=True, blank=True)
    clock_out_time = models.DateTimeField(null=True, blank=True)

    # Computed fields
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    is_late = models.BooleanField(
        default=False,
        help_text="Auto-set to True if clock-in is after the org's threshold.",
    )
    total_hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Hours worked, computed at clock-out.",
    )

    # General notes — for anything not tied to a specific project
    # (e.g., "Team standup at 10am", "Training session after lunch")
    general_notes = models.TextField(
        blank=True,
        default="",
        help_text="Optional free-text for non-project activities like meetings, training, etc.",
    )

    # ── Legacy fields (kept for backward compatibility with existing data) ──
    morning_intent = models.TextField(
        help_text="[LEGACY] Plain-text intent. New data uses DailyLogEntry instead.",
        blank=True,
        null=True,
    )
    evening_summary = models.TextField(
        help_text="[LEGACY] Plain-text summary. New data uses DailyLogEntry instead.",
        blank=True,
        null=True,
    )

    class Meta:
        db_table = "attendance_daily_logs"
        ordering = ["-date", "-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["employee", "date"],
                name="unique_daily_log_per_employee",
            )
        ]
        indexes = [
            models.Index(fields=["date", "status"]),
        ]

    def __str__(self):
        return f"{self.employee.get_full_name()} - {self.date} ({self.status})"

    @property
    def has_clocked_in(self) -> bool:
        return self.status in (self.Status.CLOCKED_IN, self.Status.CLOCKED_OUT)

    @property
    def has_clocked_out(self) -> bool:
        return self.status == self.Status.CLOCKED_OUT

    def compute_total_hours(self):
        """Calculate hours worked from clock-in to clock-out."""
        if self.clock_in_time and self.clock_out_time:
            delta = self.clock_out_time - self.clock_in_time
            self.total_hours = Decimal(str(round(delta.total_seconds() / 3600, 2)))


class DailyLogEntry(TimeStampedModel):
    """
    One row per project the employee works on in a given day.

    Example: If Arjun is working on 3 projects today, there will be
    3 DailyLogEntry rows — each with its own intent and output.

    This gives the CEO/TL the ability to:
    - Filter all work done on "Project X" across the entire company today
    - See intent vs output DELTA per project (not just a text blob)
    - Aggregate effort by project, department, or employee

    The frontend renders these as cards or rows in a structured form,
    making it easy for employees to fill in and for management to read.
    """

    class Outcome(models.TextChoices):
        # Set by the employee during clock-out
        COMPLETED = "completed", "Completed as planned"
        PARTIAL = "partial", "Partially completed"
        BLOCKED = "blocked", "Blocked by dependency"
        CARRIED_OVER = "carried_over", "Carried over to tomorrow"
        NOT_STARTED = "not_started", "Not started"

    daily_log = models.ForeignKey(
        DailyLog,
        on_delete=models.CASCADE,
        related_name="entries",
    )

    # Which project is this about?
    # Nullable — allows entries for "general work" not tied to any project
    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="daily_log_entries",
        help_text="The project this work item is about. Leave blank for general/misc work.",
    )

    # Custom label when no project is selected (e.g., "Team Meetings", "Training")
    custom_label = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Used when no project is selected. E.g., 'Team Meetings', 'Code Review'.",
    )

    # ── Morning: What do you PLAN to do? ──
    intent_text = models.TextField(
        help_text="What the employee plans to accomplish on this project today.",
    )

    # ── Evening: What did you ACTUALLY do? ──
    output_text = models.TextField(
        blank=True,
        default="",
        help_text="What was actually accomplished. Filled during clock-out.",
    )

    outcome = models.CharField(
        max_length=20,
        choices=Outcome.choices,
        blank=True,
        default="",
        help_text="How did this work item end up? Set during clock-out.",
    )

    # Display ordering (so the employee can prioritize their list)
    priority_order = models.PositiveSmallIntegerField(
        default=0,
        help_text="Display order. Lower number = higher priority.",
    )

    class Meta:
        db_table = "attendance_daily_log_entries"
        ordering = ["priority_order", "created_at"]
        indexes = [
            models.Index(fields=["daily_log", "project"]),
        ]

    def __str__(self):
        label = self.project.title if self.project else (self.custom_label or "General")
        return f"{label}: {self.intent_text[:50]}"

    @property
    def display_label(self) -> str:
        """What the frontend should show as the 'tag' / heading for this entry."""
        if self.project:
            return self.project.title
        return self.custom_label or "General"

    @property
    def has_output(self) -> bool:
        return bool(self.output_text.strip()) and bool(self.outcome)
