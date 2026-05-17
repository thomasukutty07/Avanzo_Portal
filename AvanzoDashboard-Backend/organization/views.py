from rest_framework import viewsets
from core.mixins import TenantFilterMixin
from core.permissions import IsAdminOrHRReadOnly
from .models import Department, Designation, Firm
from .serializers import DepartmentSerializer, DesignationSerializer, FirmSerializer

class DepartmentViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    """
    CRUD API for Departments.
    Only users with the 'Admin' role can modify or create departments.
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdminOrHRReadOnly]

class DesignationViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    """
    CRUD API for Designations.
    Only users with the 'Admin' role can modify or create designations.
    """
    queryset = Designation.objects.all()
    serializer_class = DesignationSerializer
    permission_classes = [IsAdminOrHRReadOnly]

class FirmViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Firms.
    """
    queryset = Firm.objects.all()
    serializer_class = FirmSerializer
    permission_classes = [IsAdminOrHRReadOnly]
