from django.db import models

from accounts.models import Employee
from core.models import TenantAwareModel, TimeStampedModel
from organization.models import Department


class Notification(TenantAwareModel):
    """
    Centralized model for all system-generated alerts.
    """

    class NotificationType(models.TextChoices):
        INFO = "info", "Information"
        WARNING = "warning", "Warning"
        URGENT = "urgent", "Urgent/Action Required"
        SUCCESS = "success", "Success"

    recipient = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="notifications")

    title = models.CharField(max_length=255)
    message = models.TextField()

    notification_type = models.CharField(
        max_length=20, choices=NotificationType.choices, default=NotificationType.INFO
    )

    action_url = models.CharField(max_length=500, blank=True, null=True)

    is_read = models.BooleanField(default=False, db_index=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.notification_type.upper()}] To {self.recipient.email}: {self.title}"


class Broadcast(TenantAwareModel):
    """
    Company-wide or department-wide announcement.
    Created by HR or Admin.
    """

    class Severity(models.TextChoices):
        INFO = "info", "Information"          # Blue banner, dismissible
        CRITICAL = "critical", "Critical"     # Red banner, pinned until acknowledged

    class TargetScope(models.TextChoices):
        ORG_WIDE = "org_wide", "Entire Organization"
        DEPARTMENT = "department", "Specific Department"

    created_by = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="created_broadcasts",
    )

    # Target targeting
    target_scope = models.CharField(
        max_length=20,
        choices=TargetScope.choices,
        default=TargetScope.ORG_WIDE,
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="broadcasts",
        help_text="Only required if target_scope is 'department'.",
    )

    severity = models.CharField(
        max_length=20,
        choices=Severity.choices,
        default=Severity.INFO,
    )

    title = models.CharField(max_length=255)
    message = models.TextField()

    # Expiry logic
    is_active = models.BooleanField(
        default=True,
        help_text="Uncheck to manually hide this broadcast.",
    )

    class Meta:
        db_table = "broadcasts"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.severity.upper()}] {self.title}"


class BroadcastAcknowledgment(models.Model):
    """
    Tracks which employees have read/acknowledged a broadcast.
    Used to clear the pinned red banner for CRITICAL broadcasts.
    """

    broadcast = models.ForeignKey(
        Broadcast,
        on_delete=models.CASCADE,
        related_name="acknowledgments",
    )
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="broadcast_acknowledgments",
    )
    acknowledged_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "broadcast_acknowledgments"
        unique_together = ("broadcast", "employee")

    def __str__(self):
        return f"{self.employee.email} acknowledged {self.broadcast.title}"
