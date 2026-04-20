from django.db.models import ProtectedError
from rest_framework import status, viewsets
from rest_framework.response import Response

from core.permissions import IsTeamLeadOrAbove
from core.viewsets import TenantAwareViewSetMixin

from .models import Department, Designation
from .serializers import DepartmentSerializer, DesignationSerializer


class DepartmentViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
    """
    CRUD API for Departments.
    Allows Team Leads and above to modify departments for project provisioning.
    """

    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsTeamLeadOrAbove]

    def destroy(self, request, *args, **kwargs):
        """Handle ProtectedError to provide a clear message on deletion failure."""
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {
                    "detail": "Cannot decommission this department because it has active projects or dependencies linked to it. Please reassign or close all projects first."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class DesignationViewSet(TenantAwareViewSetMixin, viewsets.ModelViewSet):
    """
    CRUD API for Designations.
    Allows Team Leads and above to modify designations.
    """

    queryset = Designation.objects.all()
    serializer_class = DesignationSerializer
    permission_classes = [IsTeamLeadOrAbove]
