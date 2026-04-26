from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import Employee
from core.permissions import IsAdmin

from .serializers import AdminDashboardSummarySerializer, DepartmentHealthSerializer
from .services import AnalyticsService


class AdminDashboardViewSet(viewsets.ViewSet):
    """
    Analytics Triad API.

    Admins:
      GET /api/analytics/admin/dashboard/          -> Org-wide dashboard summary
      GET /api/analytics/admin/department-health/  -> Department health metrics heatmap
      GET /api/analytics/admin/employee-profile/   -> Employee profile for admin view
    """

    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(responses=AdminDashboardSummarySerializer)
    @action(detail=False, methods=["get"], url_path="dashboard")
    def dashboard(self, request):
        """
        Returns a single highly optimized payload for the Admin dashboard.
        """
        tenant = getattr(request.user, "tenant", None)
        data = AnalyticsService.get_admin_dashboard_summary(tenant)
        serializer = AdminDashboardSummarySerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(responses=DepartmentHealthSerializer(many=True))
    @action(detail=False, methods=["get"], url_path="department-health")
    def department_health(self, request):
        """
        Returns an aggregate list of department health metrics.
        """
        tenant = getattr(request.user, "tenant", None)
        data = AnalyticsService.get_department_health(tenant)
        serializer = DepartmentHealthSerializer(data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="employee-profile")
    def employee_profile(self, request):
        """
        GET /api/analytics/admin/employee-profile/?employee_id=<uuid>

        Returns a single aggregated payload with everything an Admin
        needs when clicking on an employee name:
          - Basic info (name, department, designation, role)
          - Assigned projects with progress
          - Task stats (total, completed, in progress, open)
          - Skills with proficiency levels
          - Latest performance score + breakdown
        """
        employee_id = request.query_params.get("employee_id")

        if not employee_id:
            return Response(
                {"detail": "employee_id query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            tenant = getattr(request.user, "tenant", None)
            Employee.objects.get(id=employee_id, tenant=tenant)
        except Employee.DoesNotExist:
            return Response(
                {"detail": "Employee not found in your organization."},
                status=status.HTTP_404_NOT_FOUND,
            )

        data = AnalyticsService.get_employee_profile(employee_id, tenant)
        return Response(data, status=status.HTTP_200_OK)
