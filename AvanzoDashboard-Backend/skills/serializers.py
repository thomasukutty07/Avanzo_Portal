from rest_framework import serializers

from .models import EmployeeSkill, ProjectSkillRequirement, Skill


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "category", "description", "is_active"]


class EmployeeSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source="skill.name", read_only=True)
    skill_category = serializers.CharField(source="skill.get_category_display", read_only=True)
    employee_name = serializers.CharField(source="employee.get_full_name", read_only=True)
    verified_by_name = serializers.CharField(
        source="verified_by.get_full_name", read_only=True, default=None
    )

    class Meta:
        model = EmployeeSkill
        fields = [
            "id",
            "employee",
            "employee_name",
            "skill",
            "skill_name",
            "skill_category",
            "proficiency",
            "verified_by",
            "verified_by_name",
            "tasks_completed_with_skill",
            "last_used",
        ]
        read_only_fields = ["tasks_completed_with_skill", "last_used"]


class ProjectSkillRequirementSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source="skill.name", read_only=True)

    class Meta:
        model = ProjectSkillRequirement
        fields = [
            "id",
            "project",
            "skill",
            "skill_name",
            "min_proficiency",
            "headcount_needed",
        ]


class SkillMatchCandidateSerializer(serializers.Serializer):
    employee_id = serializers.UUIDField()
    employee_name = serializers.CharField()
    proficiency = serializers.IntegerField()
    active_tasks = serializers.IntegerField()


class SkillMatchResultSerializer(serializers.Serializer):
    skill = serializers.CharField()
    min_proficiency = serializers.IntegerField()
    headcount_needed = serializers.IntegerField()
    candidates = SkillMatchCandidateSerializer(many=True)
