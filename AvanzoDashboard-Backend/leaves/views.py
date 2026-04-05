from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.permissions import IsAdminOrHR, IsTeamLead

from .models import LeaveRequest
from .serializers import LeaveApplySerializer, LeaveRequestSerializer
from .services import LeaveNotificationService


class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        """
        Dynamically switch serializers.
        Use the apply serializer for POST requests to enforce date validation.
        """
        if self.action == "create":
            return LeaveApplySerializer
        return super().get_serializer_class()

    def get_queryset(self):
        """
        Admins/HR see all.
        Team Leads see their reports.
        Employees see only their own.
        """
        user = self.request.user
        if user.is_admin or user.is_hr:
            return LeaveRequest.objects.all()
        if user.is_team_lead:
            return LeaveRequest.objects.filter(employee__team_lead=user)
        return LeaveRequest.objects.filter(employee=user)

    def perform_create(self, serializer):
        """Initial application: Sets status to PENDING and notifies Team Lead."""
        leave = serializer.save(employee=self.request.user)
        LeaveNotificationService.notify_tl_new_request(leave)

    @action(detail=True, methods=["patch"], permission_classes=[IsTeamLead])
    def tl_approve(self, request, pk=None):
        """Tier 1 Approval: Team Lead signs off."""
        leave = self.get_object()
        if leave.status != LeaveRequest.Status.PENDING:
            return Response({"detail": "Request is not in a pending state."}, status=400)

        leave.status = LeaveRequest.Status.TL_APPROVED
        leave.tl_reviewer = request.user
        leave.save()

        LeaveNotificationService.notify_hr_tl_approved(leave)
        return Response({"status": "Approved by Team Lead. Forwarded to HR."})

    @action(detail=True, methods=["patch"], permission_classes=[IsAdminOrHR])
    def hr_approve(self, request, pk=None):
        """Tier 2 Approval: HR gives final system approval."""
        leave = self.get_object()
        if leave.status != LeaveRequest.Status.TL_APPROVED:
            return Response({"detail": "Requires Team Lead approval first."}, status=400)

        leave.status = LeaveRequest.Status.APPROVED
        leave.hr_reviewer = request.user
        leave.save()

        LeaveNotificationService.notify_employee_status_update(leave)
        return Response({"status": "Fully Approved"})

    @action(detail=True, methods=["patch"], permission_classes=[IsTeamLead | IsAdminOrHR])
    def reject(self, request, pk=None):
        """Rejection: Can be done by either TL or HR at any stage."""
        leave = self.get_object()
        leave.status = LeaveRequest.Status.REJECTED
        # Track who rejected it
        if request.user.is_hr:
            leave.hr_reviewer = request.user
        else:
            leave.tl_reviewer = request.user

        leave.review_remarks = request.data.get("remarks", "No remarks provided.")
        leave.save()

        LeaveNotificationService.notify_employee_status_update(leave)
        return Response({"status": "Rejected"})
