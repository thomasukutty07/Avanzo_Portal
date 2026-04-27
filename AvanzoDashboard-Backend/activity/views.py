"""
Activity Feed API views.

Two endpoints:
- /api/activity/feed/   → paginated activity stream (role-filtered)
- /api/activity/summary/ → today's dashboard widget stats (Admin only)
"""

from django.utils import timezone
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.constants import RoleNames
from core.permissions import IsAdmin

from core.mixins import TenantFilterMixin
from .models import ActivityEvent
from .serializers import ActivityEventSerializer


class ActivityFeedView(TenantFilterMixin, ListAPIView):
    """
    GET /api/activity/feed/

    Paginated activity stream with role-based visibility:
      - Admin/HR: see all events across the org
      - Team Lead: see events in own department
      - Employee: see own events only

    Query params:
      - event_type: filter by specific event type (e.g., clock_in, task_completed)
      - department_id: filter by department UUID (Admin/HR only)
      - actor_id: filter by specific employee UUID
      - from_date: start date (YYYY-MM-DD)
      - to_date: end date (YYYY-MM-DD)
    """

    queryset = ActivityEvent.objects.select_related("actor", "department")
    serializer_class = ActivityEventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Paginated activity stream with role-based visibility + Tenant isolation.
        """
        # ── Step 1: Tenant Isolation ──────────────────────────
        qs = super().get_queryset()
        user = self.request.user

        # ── Step 2: Role-based filtering ──────────────────────
        if user.role_name in (RoleNames.ADMIN, RoleNames.HR):
            pass  # See everything within tenant
        elif user.role_name == RoleNames.TEAM_LEAD:
            # TL sees own department events within tenant
            qs = qs.filter(department=user.department)
        else:
            # Regular employee sees only own actions within tenant
            qs = qs.filter(actor=user)

        # ── Query param filters ───────────────────────────
        event_type = self.request.query_params.get("event_type")
        dept_id = self.request.query_params.get("department_id")
        actor_id = self.request.query_params.get("actor_id")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")

        if event_type:
            qs = qs.filter(event_type=event_type)
        if dept_id and user.role_name in (RoleNames.ADMIN, RoleNames.HR):
            qs = qs.filter(department_id=dept_id)
        if actor_id:
            qs = qs.filter(actor_id=actor_id)
        if from_date:
            qs = qs.filter(timestamp__date__gte=from_date)
        if to_date:
            qs = qs.filter(timestamp__date__lte=to_date)

        return qs


class ActivitySummaryView(APIView):
    """
    GET /api/activity/summary/

    Today's snapshot for the Admin dashboard widget.
    Returns quick counts of key events.
    """

    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(
        responses=inline_serializer(
            name="ActivitySummaryResponse",
            fields={
                "date": serializers.DateField(),
                "total_events": serializers.IntegerField(),
                "clock_ins": serializers.IntegerField(),
                "clock_outs": serializers.IntegerField(),
                "tasks_completed": serializers.IntegerField(),
                "leaves_requested": serializers.IntegerField(),
                "tickets_created": serializers.IntegerField(),
            },
        )
    )
    def get(self, request):
        today = timezone.localdate()
        # Tenant Isolation for Summary
        events_today = ActivityEvent.objects.filter(
            tenant=request.user.tenant,
            timestamp__date=today
        )

        return Response(
            {
                "date": str(today),
                "total_events": events_today.count(),
                "clock_ins": events_today.filter(
                    event_type=ActivityEvent.EventType.CLOCK_IN,
                ).count(),
                "clock_outs": events_today.filter(
                    event_type=ActivityEvent.EventType.CLOCK_OUT,
                ).count(),
                "tasks_completed": events_today.filter(
                    event_type=ActivityEvent.EventType.TASK_COMPLETED,
                ).count(),
                "leaves_requested": events_today.filter(
                    event_type=ActivityEvent.EventType.LEAVE_REQUESTED,
                ).count(),
                "tickets_created": events_today.filter(
                    event_type=ActivityEvent.EventType.TICKET_CREATED,
                ).count(),
            }
        )
