from django.db import models

from accounts.models import Employee
from core.models import TimeStampedModel
from organization.models import Department


class Client(TimeStampedModel):
    name = models.CharField(max_length=255, unique=True)
    contact_email = models.EmailField(blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Service(TimeStampedModel):
    """e.g., 'VPT Audit', 'Incident Response', 'Web App Development'"""

    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Project(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        ACTIVE = "active", "Active"
        ON_HOLD = "on_hold", "On Hold"
        COMPLETED = "completed", "Completed"

    title = models.CharField(max_length=255)

    # Routing Logic
    is_internal = models.BooleanField(
        default=False, help_text="Is this an internal Avanzo project?"
    )
    client = models.ForeignKey(
        Client, on_delete=models.PROTECT, null=True, blank=True, related_name="projects"
    )
    service = models.ForeignKey(
        Service, on_delete=models.SET_NULL, null=True, blank=True, related_name="projects"
    )

    # Ownership & Access
    owning_department = models.ForeignKey(
        Department, on_delete=models.PROTECT, related_name="projects"
    )
    manager = models.ForeignKey(Employee, on_delete=models.PROTECT, related_name="managed_projects")
    team = models.ManyToManyField(Employee, blank=True, related_name="assigned_projects")

    # Details
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT, db_index=True
    )
    start_date = models.DateField(null=True, blank=True)
    target_end_date = models.DateField(null=True, blank=True)

    @property
    def mathematical_progress(self) -> int:
        """Dynamically calculates exact percentage of resolved tasks."""
        total_tasks = self.tasks.count()
        if total_tasks == 0:
            return 0
        resolved_tasks = self.tasks.filter(status=Task.Status.RESOLVED).count()
        return int((resolved_tasks / total_tasks) * 100)

    def __str__(self):
        return self.title


class Task(TimeStampedModel):
    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        CRITICAL = "critical", "Critical"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        IN_PROGRESS = "progress", "In Progress"
        RESOLVED = "resolved", "Resolved"

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")
    assignee = models.ForeignKey(Employee, on_delete=models.PROTECT, related_name="assigned_tasks")

    priority = models.CharField(
        max_length=20, choices=Priority.choices, default=Priority.MEDIUM, db_index=True
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.OPEN, db_index=True
    )

    start_date = models.DateField(db_index=True)
    due_date = models.DateField(db_index=True)

    def __str__(self):
        return f"{self.title} - {self.assignee.get_full_name()}"
