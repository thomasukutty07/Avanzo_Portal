"""
Performance scoring API views.

6 endpoints:
  /api/performance/my-score/        — employee sees own live score
  /api/performance/team-scores/     — TL sees direct reports' snapshots
  /api/performance/leaderboard/     — Admin/HR sees company ranking (snapshots)
  /api/performance/live-leaderboard/ — Admin/HR live scores for all employees
  /api/performance/history/         — historical trend for one employee
  /api/performance/config/          — Admin views/updates scoring weights
"""

from datetime import timedelta

from django.utils import timezone
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.mixins import TenantFilterMixin
from core.permissions import IsAdmin, IsAdminOrHR, IsTeamLeadOrAdmin

from .calculators import calculate_overall_score
from .models import PerformanceSnapshot, PerformanceWeightConfig
from .serializers import (
    LiveScoreSerializer,
    PerformanceSnapshotSerializer,
    PerformanceWeightConfigSerializer,
)


class MyScoreView(APIView):
    """
    GET /api/performance/my-score/

    Any authenticated employee sees their own live score for the
    current week (Monday through today).  This is computed in
    real-time — not from a saved snapshot.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses=inline_serializer(
            name="MyScoreResponse",
            fields={
                "period_start": serializers.DateField(),
                "period_end": serializers.DateField(),
                "period_type": serializers.CharField(),
                "attendance_score": serializers.DecimalField(max_digits=5, decimal_places=2),
                "delivery_score": serializers.DecimalField(max_digits=5, decimal_places=2),
                "quality_score": serializers.DecimalField(max_digits=5, decimal_places=2),
                "reliability_score": serializers.DecimalField(max_digits=5, decimal_places=2),
                "overall_score": serializers.DecimalField(max_digits=5, decimal_places=2),
                "weights_used": serializers.DictField(),
            },
        )
    )
    def get(self, request):
        today = timezone.localdate()
        # Current week starts on Monday
        period_start = today - timedelta(days=today.weekday())

        # The calculator uses standard querysets which are now filtered by TenantFilterMixin 
        # but since calculation happens here, we must ensure it's tenant-aware
        scores = calculate_overall_score(request.user, period_start, today)
        serializer = LiveScoreSerializer(scores)
        return Response(
            {
                "period_start": str(period_start),
                "period_end": str(today),
                "period_type": "current_week",
                **serializer.data,
            }
        )


class TeamScoresView(TenantFilterMixin, ListAPIView):
    """
    GET /api/performance/team-scores/?period_type=weekly

    Team Lead sees their direct reports' latest snapshots.
    Admin sees all employees' snapshots within their tenant.
    """

    queryset = PerformanceSnapshot.objects.all()
    serializer_class = PerformanceSnapshotSerializer
    permission_classes = [IsAuthenticated, IsTeamLeadOrAdmin]

    def get_queryset(self):
        # 1. Start with tenant-isolated queryset
        qs = super().get_queryset()
        user = self.request.user

        if user.role_name == "Admin":
            pass # Already filtered by tenant via super()
        else:
            # Team Lead sees direct reports only
            direct_report_ids = user.direct_reports.values_list("id", flat=True)
            qs = qs.filter(employee_id__in=direct_report_ids)

        period_type = self.request.query_params.get("period_type", "weekly")
        qs = qs.filter(period_type=period_type)

        return qs.select_related("employee", "employee__department").order_by(
            "-period_start", "-overall_score"
        )[:50]


class LeaderboardView(TenantFilterMixin, ListAPIView):
    """
    GET /api/performance/leaderboard/

    Company-wide ranking for the latest weekly period within the tenant.
    Only Admin and HR can access this — it shows everyone's scores.
    """

    queryset = PerformanceSnapshot.objects.all()
    serializer_class = PerformanceSnapshotSerializer
    permission_classes = [IsAuthenticated, IsAdminOrHR]

    def get_queryset(self):
        # 1. Start with tenant-isolated queryset
        qs = super().get_queryset()
        
        # Find the most recent snapshot period for THIS tenant
        latest_start = (
            qs.filter(period_type="weekly")
            .order_by("-period_start")
            .values_list("period_start", flat=True)
            .first()
        )

        if not latest_start:
            return qs.none()

        return (
            qs.filter(
                period_type="weekly",
                period_start=latest_start,
            )
            .select_related("employee", "employee__department")
            .order_by("rank")
        )


class LiveLeaderboardView(APIView):
    """
    GET /api/performance/live-leaderboard/

    Compute real-time performance scores for every employee in the tenant
    for the current week (Monday → today).  Returns results sorted by
    overall_score descending.

    This endpoint works even when no PerformanceSnapshot rows exist yet
    (i.e. before the first weekly celery task runs).
    Admin and HR only.
    """

    permission_classes = [IsAuthenticated, IsAdminOrHR]

    def get(self, request):
        from django.contrib.auth import get_user_model

        User = get_user_model()
        today = timezone.localdate()
        period_start = today - timedelta(days=today.weekday())  # Monday

        # Get the tenant-level weight config
        config, _ = PerformanceWeightConfig.objects.get_or_create(
            tenant=request.user.tenant
        )

        employees = (
            User.objects.filter(
                tenant=request.user.tenant,
                is_active=True,
            )
            .select_related("department", "access_role")
            .exclude(access_role__name="Admin")   # role_name is a @property — use FK path
        )

        results = []
        for emp in employees:
            scores = calculate_overall_score(emp, period_start, today, config=config)
            results.append({
                "employee_id": str(emp.id),
                "employee_name": emp.get_full_name() or emp.email,
                "department": emp.department.name if emp.department else "",
                "role": getattr(emp, "role_name", ""),
                "attendance_score": float(scores["attendance_score"]),
                "delivery_score": float(scores["delivery_score"]),
                "quality_score": float(scores["quality_score"]),
                "reliability_score": float(scores["reliability_score"]),
                "overall_score": float(scores["overall_score"]),
                "period_start": str(period_start),
                "period_end": str(today),
            })

        # Sort by overall_score descending and add rank
        results.sort(key=lambda x: x["overall_score"], reverse=True)
        for i, row in enumerate(results, start=1):
            row["rank"] = i

        return Response(results)


class HistoryView(TenantFilterMixin, ListAPIView):
    """
    GET /api/performance/history/?employee_id=<uuid>&period_type=weekly

    Historical trend data for one employee. Access rules:
      - Employee: can only see own history
      - Team Lead: can see own + direct reports' history
      - Admin/HR: can see anyone's history (within tenant)
    """

    queryset = PerformanceSnapshot.objects.all()
    serializer_class = PerformanceSnapshotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # 1. Start with tenant-isolated queryset
        qs = super().get_queryset()
        
        employee_id = self.request.query_params.get("employee_id", self.request.user.id)
        period_type = self.request.query_params.get("period_type", "weekly")
        user = self.request.user

        # Regular employees can only see their own history
        if user.role_name == "Employee" and str(employee_id) != str(user.id):
            return qs.none()

        # Team Leads can see their direct reports + themselves
        if user.role_name == "Team Lead":
            allowed_ids = list(user.direct_reports.values_list("id", flat=True)) + [user.id]
            if str(employee_id) not in [str(a) for a in allowed_ids]:
                return qs.none()

        # Admin and HR can see anyone in their tenant

        return (
            qs.filter(
                employee_id=employee_id,
                period_type=period_type,
            )
            .select_related("employee", "employee__department")
            .order_by("-period_start")[:52]  # max 1 year of weekly data
        )


class PerformanceConfigView(APIView):
    """
    GET /api/performance/config/  — view current scoring weights
    PUT /api/performance/config/  — update weights (partial update OK)

    Admin only.  Changing weights affects future snapshots;
    old snapshots keep their original weights in the weights_used field.
    """

    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(responses=PerformanceWeightConfigSerializer)
    def get(self, request):
        config, _ = PerformanceWeightConfig.objects.get_or_create(tenant=request.user.tenant)
        return Response(PerformanceWeightConfigSerializer(config).data)

    @extend_schema(
        request=PerformanceWeightConfigSerializer,
        responses=PerformanceWeightConfigSerializer,
    )
    def put(self, request):
        config, _ = PerformanceWeightConfig.objects.get_or_create(tenant=request.user.tenant)
        serializer = PerformanceWeightConfigSerializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
