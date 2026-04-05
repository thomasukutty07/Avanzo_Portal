from rest_framework import viewsets

from core.permissions import IsAdminOrHRReadOnly

from .models import Department, Designation
from .serializers import DepartmentSerializer, DesignationSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Departments.
    Only users with the 'Admin' role can modify or create departments.
    """

    def get_queryset(self):
        from django.db.models import Count
        return Department.objects.annotate(
            employee_count=Count('employees', distinct=True),
            project_count=Count('projects', distinct=True) # Assuming projects relate to department
        ).all()
    
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdminOrHRReadOnly]


class DesignationViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Designations.
    Only users with the 'Admin' role can modify or create designations.
    """

    queryset = Designation.objects.all()
    serializer_class = DesignationSerializer
    permission_classes = [IsAdminOrHRReadOnly]
