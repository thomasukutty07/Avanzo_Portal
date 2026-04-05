from rest_framework import viewsets

from core.permissions import IsAdminOrHR

from .models import Department, Designation
from .serializers import DepartmentSerializer, DesignationSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Departments.
    Admin and HR can manage departments (HR needs this when onboarding staff).
    """

    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdminOrHR]


class DesignationViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Designations.
    Admin and HR can manage designations.
    """

    queryset = Designation.objects.all()
    serializer_class = DesignationSerializer
    permission_classes = [IsAdminOrHR]
