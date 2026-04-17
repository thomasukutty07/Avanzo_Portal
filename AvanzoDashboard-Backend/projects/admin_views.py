"""
Admin analytics endpoints — CEO/Admin dashboard data.

Provides high-level insights for executive decision-making.
"""

from datetime import timedelta

from django.db.models import Sum
from django.utils import timezone
from drf_spectacular.utils import OpenApiParameter, OpenApiTypes, extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from attendance.models import DailyLog
from core.permissions import IsAdmin
from organization.models import Department
from projects.models import Task


class VelocityView(APIView):
    """
    GET /api/admin/velocity/

    Returns "Tasks Completed per Hours Logged" over the last 12 weeks,
    broken down by department. Powers the CEO's productivity sparkline chart.

    Optional query params:
        department_id: Filter to a specific department

    Response format:
    {
        "weeks": 12,
        "data": [
            {
                "week_start": "2026-01-06",
                "week_end": "2026-01-12",
                "department": "Engineering",
                "department_id": "uuid",
                "tasks_completed": 14,
                "hours_logged": 320.5,
                "velocity": 0.044   (tasks per hour)
            },
            ...
        ]
    }
    """

    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(
        summary="Get Velocity Metrics",
        description=(
            'Returns "Tasks Completed per Hours Logged" over the last 12 weeks, '
            "broken down by department."
        ),
        parameters=[
            OpenApiParameter(
                name="department_id",
                type=OpenApiTypes.UUID,
                required=False,
                description="Filter by department UUID",
            ),
        ],
        responses={200: OpenApiTypes.OBJECT},
    )
    def get(self, request):
        now = timezone.localdate()
        weeks_back = 12

        # Calculate the start of the 12-week window (Monday of that week)
        start_date = now - timedelta(weeks=weeks_back)
        # Align to Monday
        start_date = start_date - timedelta(days=start_date.weekday())

        # Get departments (optionally filtered)
        departments = Department.objects.filter(is_active=True)
        department_id = request.query_params.get("department_id")
        if department_id:
            departments = departments.filter(id=department_id)

        data = []

        for week_num in range(weeks_back):
            week_start = start_date + timedelta(weeks=week_num)
            week_end = week_start + timedelta(days=6)

            for dept in departments:
                # Tasks completed (resolved) this week by this department
                tasks_completed = Task.objects.filter(
                    project__owning_department=dept,
                    status=Task.Status.RESOLVED,
                    updated_at__date__gte=week_start,
                    updated_at__date__lte=week_end,
                ).count()

                # Hours logged this week by employees in this department
                hours_result = DailyLog.objects.filter(
                    employee__department=dept,
                    date__gte=week_start,
                    date__lte=week_end,
                    total_hours__isnull=False,
                ).aggregate(total=Sum("total_hours"))

                hours_logged = float(hours_result["total"] or 0)

                # Velocity = tasks per hour (avoid division by zero)
                velocity = round(tasks_completed / hours_logged, 4) if hours_logged > 0 else 0

                data.append(
                    {
                        "week_start": str(week_start),
                        "week_end": str(week_end),
                        "department": dept.name,
                        "department_id": str(dept.id),
                        "tasks_completed": tasks_completed,
                        "hours_logged": hours_logged,
                        "velocity": velocity,
                    }
                )

        return Response(
            {
                "weeks": weeks_back,
                "from_date": str(start_date),
                "to_date": str(now),
                "data": data,
            }
        )
