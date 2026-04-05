from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Broadcast, BroadcastAcknowledgment, Notification
from .serializers import (
    BroadcastCreateSerializer,
    BroadcastSerializer,
    NotificationSerializer,
)
from core.permissions import IsAdminOrHR


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


class BroadcastViewSet(viewsets.ModelViewSet):
    """
    Handles company-wide announcements.
    - HR/Admins create broadcasts.
    - Employees view and acknowledge them.
    """

    queryset = Broadcast.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return BroadcastCreateSerializer
        return BroadcastSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Broadcast.objects.none()

        user = self.request.user
        qs = Broadcast.objects.filter(is_active=True)

        if user.is_admin or user.is_hr:
            # HR/Admin can see all active broadcasts to manage them
            return qs

        # Employees only see org-wide or their department's broadcasts
        from django.db.models import Q

        employee_filter = Q(target_scope=Broadcast.TargetScope.ORG_WIDE) | Q(
            target_scope=Broadcast.TargetScope.DEPARTMENT, department=user.department
        )
        return qs.filter(employee_filter)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"], url_path="acknowledge")
    def acknowledge(self, request, pk=None):
        """Allows an employee to mark a critical broadcast as read."""
        broadcast = self.get_object()

        # No logical reason to prevent multiple acknowledges, but let's be clean
        BroadcastAcknowledgment.objects.get_or_create(
            broadcast=broadcast,
            employee=request.user,
        )

        return Response({"status": "Broadcast acknowledged"}, status=status.HTTP_200_OK)

    @action(
        detail=True,
        methods=["get"],
        url_path="stats",
        permission_classes=[IsAuthenticated, IsAdminOrHR],
    )
    def stats(self, request, pk=None):
        """Allows Admin/HR to see who has acknowledged a broadcast."""
        broadcast = self.get_object()
        acknowledgments = broadcast.acknowledgments.all().select_related("employee")

        from accounts.models import Employee

        # If it was targeted to a department, only show that department's employees
        if broadcast.target_scope == Broadcast.TargetScope.DEPARTMENT:
            total_employees = Employee.objects.filter(department=broadcast.department).count()
        else:
            total_employees = Employee.objects.filter(is_active=True).count()

        ack_count = acknowledgments.count()

        return Response(
            {
                "broadcast_title": broadcast.title,
                "total_targeted": total_employees,
                "acknowledged_count": ack_count,
                "pending_count": total_employees - ack_count,
                "acknowledgments": [
                    {
                        "employee_name": ack.employee.get_full_name(),
                        "employee_email": ack.employee.email,
                        "acknowledged_at": ack.acknowledged_at,
                    }
                    for ack in acknowledgments
                ],
            }
        )
