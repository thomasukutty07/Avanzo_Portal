from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from notifications.services import NotificationService

from .models import Client, Project, Service, Task
from .serializers import ClientSerializer, ProjectSerializer, ServiceSerializer, TaskSerializer


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.filter(is_active=True)
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Row-Level Security for Projects"""
        user = self.request.user
        if user.is_admin or user.is_hr:
            return Project.objects.all()
        if user.is_team_lead:
            return Project.objects.filter(owning_department=user.department)
        return Project.objects.filter(team=user)

    def perform_create(self, serializer):
        project = serializer.save(
            owning_department=self.request.user.department, manager=self.request.user
        )
        project.team.add(self.request.user)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Row-Level Security for Tasks"""
        user = self.request.user
        if user.is_admin:
            return Task.objects.all()
        if user.is_team_lead:
            return Task.objects.filter(project__owning_department=user.department)
        return Task.objects.filter(assignee=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_409_CONFLICT)

        task = serializer.save()

        # Audit Trail & Notifications
        if not serializer.validated_data.get("force_assign"):
            NotificationService.send(
                recipient=task.assignee,
                title="New Task Assigned",
                message=f"You have been assigned to: {task.title}",
                n_type="info",
            )
        else:
            NotificationService.send(
                recipient=task.assignee,
                title="URGENT: Task Assigned During Leave",
                message=(
                    f"You have been forcefully assigned '{task.title}' during your scheduled leave."
                ),
                n_type="urgent",
            )

        return Response(serializer.data, status=status.HTTP_201_CREATED)
