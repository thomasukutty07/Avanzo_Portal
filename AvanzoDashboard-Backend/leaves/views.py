from django.db.models import Count
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.permissions import IsAdminOrHR, IsHR, IsTeamLead

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
        Admins/HR see TL_APPROVED by default (their actionable queue).
        Team Leads see their reports.
        Employees see only their own.
        """
        user = self.request.user
        qs = LeaveRequest.objects.select_related("employee", "tl_reviewer", "hr_reviewer")

        if user.is_hr:
            return qs  # HR sees everything (The Overseer)
        if user.is_team_lead:
            return qs.filter(employee__team_lead=user)  # TL see their own reports (The Gatekeeper)
        return qs.filter(employee=user)  # Everyone else (including Admin) sees only their own

    @action(detail=False, methods=["get"], permission_classes=[IsAdminOrHR])
    def history(self, request):
        """HR/Admin endpoint to view the full history of all leave requests."""
        requests = LeaveRequest.objects.select_related(
            "employee", "tl_reviewer", "hr_reviewer"
        ).all()
        page = self.paginate_queryset(requests)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(requests, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        """Initial application: Sets status to PENDING and notifies Team Lead."""
        leave = serializer.save(employee=self.request.user)
        LeaveNotificationService.notify_tl_new_request(leave)

    @action(detail=True, methods=["patch"], permission_classes=[IsTeamLead | IsHR])
    def tl_approve(self, request, pk=None):
        """Tier 1 Approval: Team Lead signs off."""
        leave = self.get_object()
        if leave.status != LeaveRequest.Status.PENDING:
            return Response({"detail": "Request is not in a pending state."}, status=400)

        comment = request.data.get("comment")
        if not comment:
            return Response(
                {"detail": "A comment is required when reviewing a leave request."}, status=400
            )

        leave.status = LeaveRequest.Status.TL_APPROVED
        leave.tl_reviewer = request.user
        leave.tl_comment = comment
        leave.save()

        LeaveNotificationService.notify_hr_tl_approved(leave)
        return Response({"status": "Approved by Team Lead. Forwarded to HR."})

    @action(detail=True, methods=["patch"], permission_classes=[IsAdminOrHR])
    def hr_approve(self, request, pk=None):
        """Tier 2 Approval: HR gives final system approval."""
        leave = self.get_object()
        if leave.status != LeaveRequest.Status.TL_APPROVED:
            return Response({"detail": "Requires Team Lead approval first."}, status=400)

        comment = request.data.get("comment")
        if not comment:
            return Response(
                {"detail": "A comment is required when reviewing a leave request."}, status=400
            )

        leave.status = LeaveRequest.Status.APPROVED
        leave.hr_reviewer = request.user
        leave.hr_comment = comment
        leave.save()

        LeaveNotificationService.notify_employee_status_update(leave)
        return Response({"status": "Fully Approved"})

    @action(detail=True, methods=["patch"], permission_classes=[IsTeamLead | IsAdminOrHR])
    def reject(self, request, pk=None):
        """Rejection: Can be done by either TL or HR at any stage."""
        leave = self.get_object()

        comment = request.data.get("comment")
        if not comment:
            return Response(
                {"detail": "A comment is required when rejecting a leave request."}, status=400
            )

        leave.status = LeaveRequest.Status.REJECTED

        # Track who rejected it and preserve their comment
        if request.user.is_hr:
            leave.hr_reviewer = request.user
            leave.hr_comment = comment
        else:
            leave.tl_reviewer = request.user
            leave.tl_comment = comment

        leave.save()

        LeaveNotificationService.notify_employee_status_update(leave)
        return Response({"status": "Rejected"})

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def stats(self, request):
        qs = self.get_queryset()
        today = timezone.localdate()
        
        tl_approved_count = qs.filter(status=LeaveRequest.Status.TL_APPROVED).count()
        total_pending_count = qs.filter(status=LeaveRequest.Status.PENDING).count()
        
        out_today_count = qs.filter(
            status=LeaveRequest.Status.APPROVED,
            start_date__lte=today,
            end_date__gte=today
        ).count()

        type_dist = qs.values('leave_type').annotate(count=Count('id')).order_by('-count')

        return Response({
            "tl_approved": tl_approved_count,
            "total_pending": total_pending_count,
            "out_today": out_today_count,
            "type_distribution": type_dist
        })

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def who_is_out(self, request):
        qs = self.get_queryset()
        today = timezone.localdate()
        
        out_today = qs.filter(
            status=LeaveRequest.Status.APPROVED,
            start_date__lte=today,
            end_date__gte=today
        ).select_related('employee')
        
        results = [
            {
                "employee_name": p.employee.get_full_name(),
                "leave_type": p.get_leave_type_display() if hasattr(p, 'get_leave_type_display') else p.leave_type,
                "end_date": str(p.end_date)
            }
            for p in out_today
        ]
        
        return Response(results)
