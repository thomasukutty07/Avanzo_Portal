from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from accounts.models import Employee
from core.models import TimeStampedModel
from projects.models import Project


class Skill(TimeStampedModel):
    """
    Master list of competencies.
    """

    class Category(models.TextChoices):
        CYBERSECURITY = "cybersecurity", "Cybersecurity"
        DEVELOPMENT = "development", "Development"
        DESIGN = "design", "Design"
        MANAGEMENT = "management", "Management"
        COMPLIANCE = "compliance", "Compliance"

    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=50, choices=Category.choices, db_index=True)
    description = models.TextField(blank=True, default="")
    tenant = models.ForeignKey(
        "clients.Client", on_delete=models.CASCADE, related_name="skills", null=True
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "skills_skill"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class EmployeeSkill(TimeStampedModel):
    """
    Associative tracking of an employee's proficiency in a specific skill.
    """

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="skills")
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="employees")
    tenant = models.ForeignKey(
        "clients.Client", on_delete=models.CASCADE, related_name="employee_skills", null=True
    )

    # 1=Beginner, 2=Intermediate, 3=Advanced, 4=Expert
    proficiency = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(4)],
        default=1,
    )

    verified_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_skills",
    )

    tasks_completed_with_skill = models.PositiveIntegerField(default=0)
    last_used = models.DateField(null=True, blank=True)

    class Meta:
        db_table = "skills_employeeskill"
        constraints = [
            models.UniqueConstraint(fields=["employee", "skill"], name="unique_employee_skill")
        ]

    def __str__(self):
        return f"{self.employee.get_full_name()} - {self.skill.name} (Lvl {self.proficiency})"


class ProjectSkillRequirement(TimeStampedModel):
    """
    Identifies the specialized workforce needed to execute a project.
    """

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="skill_requirements"
    )
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="project_requirements")

    min_proficiency = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(4)],
        default=2,
    )
    headcount_needed = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = "skills_projectrequirement"
        constraints = [
            models.UniqueConstraint(
                fields=["project", "skill"], name="unique_project_skill_requirement"
            )
        ]

    def __str__(self):
        return (
            f"{self.project.title} requires {self.headcount_needed}x "
            f"{self.skill.name} (Min Lvl {self.min_proficiency})"
        )
