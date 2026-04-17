from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.permissions import IsTeamLeadOrAbove
from notifications.services import NotificationService

from .models import ExternalClient, Project, Service, Task
from .serializers import (
    ExternalClientSerializer,
    ProjectProgressSerializer,
    ProjectSerializer,
    ServiceSerializer,
    TaskProgressSerializer,
    TaskSerializer,
)


class ExternalClientViewSet(viewsets.ModelViewSet):
    queryset = ExternalClient.objects.filter(is_active=True)
    serializer_class = ExternalClientSerializer
    permission_classes = [IsAuthenticated]


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Service.objects.filter(is_active=True)
        if user.is_admin or user.is_hr:
            return qs
        if user.is_team_lead and user.department:
            return qs.filter(department=user.department)
        return qs


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        """Block normal Employees from editing Projects."""
        if self.action in ["create", "update", "partial_update", "destroy"]:
            from core.permissions import IsTeamLeadOrAdmin

            return [IsAuthenticated(), IsTeamLeadOrAdmin()]
        return super().get_permissions()

    def get_queryset(self):
        """Row-Level Security for Projects"""
        user = self.request.user
        qs = Project.objects.select_related(
            "owning_department", "manager", "client", "service"
        ).prefetch_related("team")
        if user.is_admin or user.is_hr:
            return qs
        if user.is_team_lead:
            return qs.filter(owning_department=user.department)
        return qs.filter(team=user)

    def perform_create(self, serializer):
        project = serializer.save(manager=self.request.user)
        project.team.add(self.request.user)

    # ── A-14: Project Progress Summary ────────────────────────
    @action(
        detail=True,
        methods=["get"],
        url_path="progress",
        permission_classes=[IsAuthenticated, IsTeamLeadOrAbove],
    )
    def progress_summary(self, request, pk=None):
        """
        GET /api/projects/projects/{id}/progress/

        Returns the weighted progress breakdown for a project.
        Powers the TL's "Am I on track?" dashboard widget.
        """
        project = self.get_object()
        tasks = project.tasks.all()

        total_tasks = tasks.count()
        completed_tasks = tasks.filter(status=Task.Status.RESOLVED).count()

        # Calculate weighted progress components
        earned_points = 0
        total_potential = 0

        for task in tasks:
            complexity = task.complexity or 1
            earned_points += complexity * task.completion_pct
            total_potential += complexity * 100

        data = {
            "project_id": project.id,
            "project_name": project.title,
            "weighted_progress": project.weighted_progress,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "total_complexity_points": total_potential,
            "earned_points": earned_points,
            "formula": "Σ(complexity × completion_pct) / Σ(complexity × 100) × 100",
        }

        serializer = ProjectProgressSerializer(data)
        return Response(serializer.data)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Row-Level Security for Tasks"""
        user = self.request.user
        qs = Task.objects.select_related("project", "assignee")
        if user.is_admin:
            return qs
        if user.is_team_lead:
            return qs.filter(project__owning_department=user.department)
        return qs.filter(assignee=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_409_CONFLICT)

        task = serializer.save()

        # AUTO-ONBOARD: Add assignee to project team if not already there
        if not task.project.team.filter(id=task.assignee.id).exists():
            task.project.team.add(task.assignee)

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

    # ── A-13: Task Progress Update ────────────────────────────
    @action(detail=True, methods=["patch"], url_path="progress")
    def update_progress(self, request, pk=None):
        """
        PATCH /api/projects/tasks/{id}/progress/

        Allows the assigned employee to update their completion percentage.

        On the FIRST progress update (0 → anything > 0):
        - complexity_locked is set to True
        - complexity_locked_at is set to the current timestamp
        - After this, complexity can never be changed

        Payload:
            { "completion_pct": 75 }
        """
        task = self.get_object()

        # Only the assignee can update their own progress
        if task.assignee != request.user and not request.user.is_admin:
            return Response(
                {"detail": "Only the assigned employee can update task progress."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = TaskProgressSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_pct = serializer.validated_data["completion_pct"]

        # Lock complexity on first progress update
        if not task.complexity_locked and task.completion_pct == 0 and new_pct > 0:
            task.complexity_locked = True
            task.complexity_locked_at = timezone.now()

        task.completion_pct = new_pct

        # Auto-update status based on completion
        if new_pct == 100:
            task.status = Task.Status.RESOLVED
        elif new_pct > 0:
            task.status = Task.Status.IN_PROGRESS

        task.save()

        return Response(
            TaskSerializer(task).data,
            status=status.HTTP_200_OK,
        )
