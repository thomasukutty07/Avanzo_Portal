from django.db import models

from accounts.models import Employee
from core.models import TimeStampedModel


class Notification(TimeStampedModel):
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
