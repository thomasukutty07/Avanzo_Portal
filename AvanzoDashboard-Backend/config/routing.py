from django.urls import path

from activity.consumers import ActivityFeedConsumer
from notifications.consumers import NotificationConsumer

websocket_urlpatterns = [
    path("ws/notifications/", NotificationConsumer.as_asgi()),
    path("ws/activity/", ActivityFeedConsumer.as_asgi()),
]
