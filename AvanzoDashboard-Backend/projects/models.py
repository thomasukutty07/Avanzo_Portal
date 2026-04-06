from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from accounts.models import Employee
from core.models import TimeStampedModel
from organization.models import Department


class ExternalClient(TimeStampedModel):
    """
    An external customer/organization that Avanzo provides services to.
    Renamed from 'Client' to avoid collision with clients.Client (tenant model).
    """

    name = models.CharField(max_length=255, unique=True)
    contact_email = models.EmailField(blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "projects_client"  # keep the same table name for backward compat
        verbose_name = "External Client"

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
        ExternalClient, on_delete=models.PROTECT, null=True, blank=True, related_name="projects"
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
    def weighted_progress(self) -> int:
        """
        Complexity-weighted progress formula.

        Formula:
            Progress = Σ(complexity × completion_pct) / Σ(complexity × 100) × 100

        Example:
            Task A: complexity=8, completion_pct=50  → contributes 400
            Task B: complexity=2, completion_pct=100 → contributes 200
            Total potential: (8×100) + (2×100) = 1000
            Progress = 600 / 1000 × 100 = 60%

        Falls back to simple count-based progress if no complexity data exists.
        """
        tasks = self.tasks.all()
        total_tasks = tasks.count()

        if total_tasks == 0:
            return 0

        total_weighted = 0
        total_potential = 0

        for task in tasks:
            complexity = task.complexity or 1  # default to 1 if not set
            total_weighted += complexity * task.completion_pct
            total_potential += complexity * 100

        if total_potential == 0:
            return 0

        return int((total_weighted / total_potential) * 100)

    # Keep backward compatibility
    @property
    def mathematical_progress(self) -> int:
        return self.weighted_progress

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
        IN_REVIEW = "review", "In Review"
        REWORK = "rework", "Rework"
        CLOSED = "closed", "Closed"

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

    # ── Complexity & Progress (A-11) ──────────────────────────
    complexity = models.SmallIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Difficulty rating 1–10. Set by TL at task creation.",
    )
    complexity_locked = models.BooleanField(
        default=False,
        help_text="Once True, complexity can never be changed.",
    )
    complexity_locked_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp of when complexity was locked.",
    )
    completion_pct = models.SmallIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Completion percentage 0–100. Updated by the assignee.",
    )

    start_date = models.DateField(db_index=True)
    due_date = models.DateField(db_index=True)

    def __str__(self):
        return f"{self.title} - {self.assignee.get_full_name()}"
