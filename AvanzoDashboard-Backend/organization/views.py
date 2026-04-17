from rest_framework import viewsets

from core.permissions import IsTeamLeadOrAbove

from .models import Department, Designation
from .serializers import DepartmentSerializer, DesignationSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Departments.
    Allows Team Leads and above to modify departments for project provisioning.
    """

    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsTeamLeadOrAbove]


class DesignationViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Designations.
    Allows Team Leads and above to modify designations.
    """

    queryset = Designation.objects.all()
    serializer_class = DesignationSerializer
    permission_classes = [IsTeamLeadOrAbove]
