from django.db.models import Count, Q
from django.utils import timezone

from notifications.models import Notification
from notifications.services import NotificationService

from .models import EmployeeSkill, ProjectSkillRequirement, Skill

# XP threshold before system suggests proficiency upgrade
PROFICIENCY_UPGRADE_THRESHOLD = 25


class SkillMatchService:
    @staticmethod
    def find_best_match(project):
        """
        For each ProjectSkillRequirement, find employees who meet
        min_proficiency and rank by lowest current workload.
        """
        requirements = ProjectSkillRequirement.objects.filter(project=project).select_related(
            "skill"
        )

        results = []
        for req in requirements:
            candidates = (
                EmployeeSkill.objects.filter(
                    skill=req.skill,
                    proficiency__gte=req.min_proficiency,
                    employee__is_active=True,
                )
                .select_related("employee")
                .annotate(
                    active_task_count=Count(
                        "employee__assigned_tasks",
                        filter=Q(employee__assigned_tasks__status="in_progress"),
                    )
                )
                .order_by("active_task_count")
            )

            results.append(
                {
                    "skill": req.skill.name,
                    "min_proficiency": req.min_proficiency,
                    "headcount_needed": req.headcount_needed,
                    "candidates": [
                        {
                            "employee_id": c.employee.id,
                            "employee_name": c.employee.get_full_name(),
                            "proficiency": c.proficiency,
                            "active_tasks": c.active_task_count,
                        }
                        for c in candidates
                    ],
                }
            )

        return results


class SkillProgressService:
    @staticmethod
    def auto_update(task):
        """
        Called via signal when Task status → RESOLVED/COMPLETED.
        Increments tasks_completed_with_skill for assigned employee.
        Fires notification if threshold crossed.
        """
        employee = task.assignee
        if not employee:
            return

        # Match task's project service category to skill categories
        project = task.project
        if not project or not project.service:
            return

        service_name = project.service.name.lower()

        # Map service name keywords to skill categories
        category_map = {
            "cyber": Skill.Category.CYBERSECURITY,
            "security": Skill.Category.CYBERSECURITY,
            "audit": Skill.Category.COMPLIANCE,
            "compliance": Skill.Category.COMPLIANCE,
            "develop": Skill.Category.DEVELOPMENT,
            "web": Skill.Category.DEVELOPMENT,
            "app": Skill.Category.DEVELOPMENT,
            "design": Skill.Category.DESIGN,
            "ui": Skill.Category.DESIGN,
            "ux": Skill.Category.DESIGN,
            "manage": Skill.Category.MANAGEMENT,
        }

        matched_category = None
        for keyword, category in category_map.items():
            if keyword in service_name:
                matched_category = category
                break

        if not matched_category:
            return

        # Find employee skills in matched category and bump XP
        employee_skills = EmployeeSkill.objects.filter(
            employee=employee, skill__category=matched_category
        )

        today = timezone.localdate()
        for es in employee_skills:
            es.tasks_completed_with_skill += 1
            es.last_used = today
            es.save(update_fields=["tasks_completed_with_skill", "last_used"])

            # Check threshold → notify TL for upgrade review
            if es.tasks_completed_with_skill % PROFICIENCY_UPGRADE_THRESHOLD == 0:
                # Find TL (department team_lead or project manager)
                tl = project.manager
                if tl:
                    NotificationService.send(
                        recipient=tl,
                        title="Skill Proficiency Review",
                        message=(
                            f"{employee.get_full_name()} has completed "
                            f"{es.tasks_completed_with_skill} tasks using "
                            f"'{es.skill.name}'. Consider upgrading their "
                            f"proficiency from Lvl {es.proficiency}."
                        ),
                        n_type=Notification.NotificationType.IMPORTANT,
                    )
