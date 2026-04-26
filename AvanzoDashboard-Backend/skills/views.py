from drf_spectacular.utils import OpenApiParameter, extend_schema, inline_serializer
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.mixins import TenantFilterMixin
from core.permissions import IsAdmin
from projects.models import Project

from .models import EmployeeSkill, ProjectSkillRequirement, Skill
from .serializers import (
    EmployeeSkillSerializer,
    ProjectSkillRequirementSerializer,
    SkillMatchResultSerializer,
    SkillSerializer,
)
from .services import SkillMatchService


class SkillViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    """CRUD for master skill list. Admin/HR only for writes."""

    queryset = Skill.objects.filter(is_active=True)
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]


class EmployeeSkillViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    """Employee skill assignments."""

    serializer_class = EmployeeSkillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Apply tenant isolation first
        qs = super().get_queryset()
        
        # Guard for schema generation (no authenticated user)
        user = getattr(self.request, "user", None)
        if not user or not user.is_authenticated:
            return EmployeeSkill.objects.none()

        if getattr(user, "is_admin", False):
            return qs.select_related("skill", "employee", "verified_by")
        return qs.filter(employee=user).select_related(
            "skill", "employee", "verified_by"
        )

    @action(detail=False, methods=["get"], url_path="my-skills")
    def my_skills(self, request):
        qs = EmployeeSkill.objects.filter(tenant=request.user.tenant, employee=request.user).select_related("skill")
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class ProjectSkillRequirementViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    """Manage skill requirements per project."""

    serializer_class = ProjectSkillRequirementSerializer
    permission_classes = [IsAuthenticated]
    queryset = ProjectSkillRequirement.objects.all().select_related("skill")


class SkillMatchViewSet(viewsets.ViewSet):
    """Smart team recommendation engine."""

    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(name="project_id", type=str, required=True),
        ],
        responses=SkillMatchResultSerializer(many=True),
    )
    @action(detail=False, methods=["get"], url_path="match")
    def match(self, request):
        project_id = request.query_params.get("project_id")
        if not project_id:
            return Response({"error": "project_id required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)

        results = SkillMatchService.find_best_match(project)
        serializer = SkillMatchResultSerializer(results, many=True)
        return Response(serializer.data)

    @extend_schema(
        responses=inline_serializer(
            name="SkillGapResponse",
            fields={
                "skill_id": serializers.UUIDField(),
                "skill_name": serializers.CharField(),
                "category": serializers.CharField(),
                "total_employees": serializers.IntegerField(),
                "advanced_plus": serializers.IntegerField(),
                "status": serializers.CharField(),
            },
            many=True,
        )
    )
    @action(detail=False, methods=["get"], url_path="gaps")
    def gaps(self, request):
        """Company-wide skill gap: skills with 0 employees at advanced+ level."""
        all_skills = Skill.objects.filter(is_active=True)
        gaps = []
        for skill in all_skills:
            advanced_count = EmployeeSkill.objects.filter(skill=skill, proficiency__gte=3).count()
            total_count = EmployeeSkill.objects.filter(skill=skill).count()
            if advanced_count == 0:
                gaps.append(
                    {
                        "skill_id": skill.id,
                        "skill_name": skill.name,
                        "category": skill.category,
                        "total_employees": total_count,
                        "advanced_plus": advanced_count,
                        "status": "critical" if total_count == 0 else "gap",
                    }
                )
        return Response(gaps)
