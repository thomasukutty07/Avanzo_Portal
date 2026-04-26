from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.mixins import TenantFilterMixin
from core.permissions import IsAdminOrHR, IsHR, IsTeamLead

from .models import LeaveRequest
from .serializers import LeaveApplySerializer, LeaveRequestSerializer
from .services import LeaveNotificationService


class LeaveRequestViewSet(TenantFilterMixin, viewsets.ModelViewSet):
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
        Now with Tenant isolation.
        """
        user = self.request.user
        
        # ── Step 1: Tenant Isolation ──────────────────────────
        qs = super().get_queryset()
        
        qs = qs.select_related("employee", "tl_reviewer", "hr_reviewer")

        # ── Step 2: Role-Based Filtering ──────────────────────
        if user.is_hr:
            return qs  # HR sees everything within tenant
        if user.is_team_lead:
            return qs.filter(employee__team_lead=user)  # TL see their own reports
        return qs.filter(employee=user)  # Everyone else sees only their own

    @action(detail=False, methods=["get"], permission_classes=[IsAdminOrHR])
    def history(self, request):
        """HR/Admin endpoint to view the full history of all leave requests within the tenant."""
        requests = self.get_queryset() # uses tenant filtering
        page = self.paginate_queryset(requests)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(requests, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        """Initial application: Sets status to PENDING and notifies Team Lead."""
        leave = serializer.save(
            employee=self.request.user,
            tenant=self.request.user.tenant
        )
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

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        """
        GET /api/leaves/requests/stats/

        Returns leave counts broken down by status, scoped to what
        the current user can see (own only, team, or all for HR/Admin).
        """
        qs = self.get_queryset()
        statuses = [s[0] for s in LeaveRequest.Status.choices]
        counts = {s: qs.filter(status=s).count() for s in statuses}
        counts["total"] = qs.count()
        return Response(counts)

    @action(detail=False, methods=["get"], url_path="who_is_out")
    def who_is_out(self, request):
        """
        GET /api/leaves/requests/who_is_out/

        Returns employees currently on approved leave today.
        Scoped by tenant — visible to anyone authenticated.
        """
        today = timezone.localdate()
        on_leave = (
            self.get_queryset()
            .filter(
                status=LeaveRequest.Status.APPROVED,
                start_date__lte=today,
                end_date__gte=today,
            )
            .select_related("employee", "employee__department")
        )

        data = [
            {
                "employee_id": str(req.employee.id),
                "employee_name": req.employee.get_full_name(),
                "department": req.employee.department.name if req.employee.department else None,
                "start_date": str(req.start_date),
                "end_date": str(req.end_date),
                "leave_type": req.leave_type,
                "days": req.total_days,
            }
            for req in on_leave
        ]

        return Response({"date": str(today), "count": len(data), "employees": data})
