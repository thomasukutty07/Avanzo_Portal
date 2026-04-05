from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Allows users to view their notifications and mark them as read.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        # SECURITY: Strictly isolate to the logged-in user.
        # We only want to return unread notifications to keep the payload light,
        # but you can remove the filter if the frontend wants a "History" tab.
        if getattr(self, "swagger_fake_view", False):
            return Notification.objects.none()
        return Notification.objects.filter(recipient=self.request.user, is_read=False)

    @action(detail=True, methods=["patch"], url_path="read")
    def mark_as_read(self, request, pk=None):
        """Marks a single notification as read."""
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=["is_read", "updated_at"])
        return Response({"status": "Notification marked as read"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["patch"], url_path="read-all")
    def mark_all_as_read(self, request):
        """Bulk updates all unread notifications for the user."""
        unread_notifications = self.get_queryset()
        updated_count = unread_notifications.update(is_read=True)

        return Response(
            {"status": f"{updated_count} notifications marked as read"}, status=status.HTTP_200_OK
        )
