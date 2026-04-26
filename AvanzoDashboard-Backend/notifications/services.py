import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from accounts.models import Employee

from .models import Notification
from .serializers import NotificationSerializer

logger = logging.getLogger(__name__)


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

        notification = Notification.objects.create(
            recipient=recipient,
            title=title,
            message=message,
            notification_type=n_type,
            action_url=action_url,
        )

        try:
            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    f"user_{recipient.id}_notifications",
                    {
                        "type": "notification_push",
                        "data": NotificationSerializer(notification).data,
                    },
                )
        except Exception as e:
            logger.error(f"Failed to push WebSocket notification: {e}")

        return notification
