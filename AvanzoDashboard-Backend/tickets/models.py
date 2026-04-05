from django.db import models

from accounts.models import Employee
from core.models import TimeStampedModel


class Ticket(TimeStampedModel):
    """
    The 'Safety Valve' system. Gives employees a formal,
    structured way to escalate problems.
    """

    class TicketType(models.TextChoices):
        CAPACITY = "capacity", "Capacity Overload"
        COMPLIANCE = "compliance", "Compliance Report"
        GENERAL = "general", "General Issue"
        TECH = "tech", "Technical / Infrastructure"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        IN_REVIEW = "in_review", "In Review"
        RESOLVED = "resolved", "Resolved"

    ticket_type = models.CharField(
        max_length=20, choices=TicketType.choices, db_index=True
    )

    # Who filed it
    created_by = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="created_tickets",
        help_text="The employee who raised this ticket.",
    )

    # Who should handle it (auto-assigned based on ticket_type rules)
    assigned_to = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tickets",
        help_text="Auto-assigned based on ticket type routing rules.",
    )

    title = models.CharField(max_length=500)
    description = models.TextField()

    # Only for CAPACITY tickets — a frozen snapshot of the employee's
    # task list at the moment they filed the ticket. This is EVIDENCE.
    # Even if tasks change later, this snapshot stays the same.
    task_snapshot = models.JSONField(
        null=True,
        blank=True,
        help_text="Auto-captured snapshot of employee's current tasks. "
        "Only populated for CAPACITY tickets.",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN,
        db_index=True,
    )

    # Resolution fields — filled only when status becomes RESOLVED
    resolution_note = models.TextField(
        null=True,
        blank=True,
        help_text="How the issue was resolved. Required when resolving.",
    )
    resolved_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resolved_tickets",
    )
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "tickets"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["assigned_to", "status"]),
        ]

    def __str__(self):
        return f"[{self.ticket_type.upper()}] {self.title}"
