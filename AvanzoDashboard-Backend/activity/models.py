from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models

from accounts.models import Employee
from core.models import TimeStampedModel
from organization.models import Department


class ActivityEvent(TimeStampedModel):
    """
    Immutable event log — the company heartbeat feed.
    Created automatically via Django signals when things happen across the system.
    Never manually created by users.
    """

    class EventType(models.TextChoices):
        CLOCK_IN = "clock_in", "Clocked In"
        CLOCK_OUT = "clock_out", "Clocked Out"
        TASK_CREATED = "task_created", "Task Created"
        TASK_COMPLETED = "task_completed", "Task Completed"
        TASK_PROGRESS = "task_progress", "Task Progress Updated"
        LEAVE_REQUESTED = "leave_requested", "Leave Requested"
        LEAVE_APPROVED = "leave_approved", "Leave Approved"
        LEAVE_REJECTED = "leave_rejected", "Leave Rejected"
        TICKET_CREATED = "ticket_created", "Ticket Created"
        TICKET_RESOLVED = "ticket_resolved", "Ticket Resolved"
        EMPLOYEE_JOINED = "employee_joined", "New Employee"
        PROJECT_CREATED = "project_created", "Project Created"
        PROJECT_COMPLETED = "project_completed", "Project Completed"
        BROADCAST_SENT = "broadcast_sent", "Broadcast Sent"

    event_type = models.CharField(
        max_length=30,
        choices=EventType.choices,
        db_index=True,
    )
    actor = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="activity_events",
        help_text="Employee who performed this action.",
    )
    tenant = models.ForeignKey(
        "clients.Client", on_delete=models.CASCADE, related_name="activity_events", null=True
    )
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    # Human-readable
    title = models.CharField(max_length=255)
    detail = models.TextField(blank=True, default="")

    # Scope — for role-based filtering (TL sees own department only)
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="activity_events",
    )

    # Generic FK to source object (DailyLog, Task, LeaveRequest, etc.)
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    object_id = models.UUIDField(null=True, blank=True)
    source_object = GenericForeignKey("content_type", "object_id")

    # Frontend rendering extras
    icon = models.CharField(max_length=10, blank=True, default="")
    metadata = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = "activity_events"
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["event_type", "timestamp"]),
            models.Index(fields=["department", "timestamp"]),
            models.Index(fields=["actor", "timestamp"]),
        ]

    def __str__(self):
        return f"[{self.event_type}] {self.title}"
