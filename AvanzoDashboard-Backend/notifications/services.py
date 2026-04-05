from accounts.models import Employee

from .models import Notification


class NotificationService:
    """
    Internal service for generating notifications.
    Other Django apps should import and use this class.
    """

    @staticmethod
    def send(
        recipient: Employee,
        title: str,
        message: str,
        n_type: str = Notification.NotificationType.INFO,
        action_url: str = None,
    ) -> Notification:

        return Notification.objects.create(
            recipient=recipient,
            title=title,
            message=message,
            notification_type=n_type,
            action_url=action_url,
        )
