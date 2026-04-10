import uuid

from auditlog.registry import auditlog
from django.contrib.auth.models import AbstractUser
from django.db import models, transaction

from core.models import TimeStampedModel

from .managers import EmployeeManager


class TalentTag(models.Model):
    """Categories for employee skills/talents."""

    name = models.CharField(max_length=50, unique=True)
    category = models.CharField(
        max_length=50, blank=True, help_text="e.g. Technical, Creative, Management"
    )

    class Meta:
        db_table = "talent_tags"
        verbose_name = "Talent Tag"
        verbose_name_plural = "Talent Tags"

    def __str__(self):
        return self.name


class AccessRole(TimeStampedModel):
    """
    Role definitions for RBAC.
    Maps 1:1 to the frontend Role type in RequireRole.tsx.
    """

    class RoleChoices(models.TextChoices):
        EMPLOYEE = "Employee", "Employee"
        TEAM_LEAD = "Team Lead", "Team Lead"
        HR = "HR", "HR"
        ADMIN = "Admin", "Admin"
        SUPER_ADMIN = "Super Admin", "Super Admin"
        ORGANIZATION = "Organization", "Organization"

    name = models.CharField(max_length=50, unique=True, choices=RoleChoices.choices)
    description = models.TextField(blank=True)

    class Meta:
        db_table = "access_roles"
        verbose_name = "Access Role"
        verbose_name_plural = "Access Roles"

    def __str__(self):
        return self.name


class Employee(AbstractUser):
    """
    Custom User model — email is the login field.
    Every person in the system is an Employee.
    """

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        ON_LEAVE = "on_leave", "On Leave"
        OFFBOARDING = "offboarding", "Offboarding"

    class Gender(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"
        OTHER = "other", "Other"
        PREFER_NOT_TO_SAY = "prefer_not_to_say", "Prefer not to say"

    # Override PK to UUID
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Remove username, use email
    username = None
    email = models.EmailField("work email", unique=True, db_index=True)

    # Profile fields
    phone = models.CharField(max_length=20, blank=True)
    gender = models.CharField(
        max_length=20, choices=Gender.choices, blank=True, null=True
    )
    date_of_birth = models.DateField(null=True, blank=True)
    avatar = models.URLField(blank=True)
    employee_id = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        null=True,
        help_text="Internal employee ID, e.g., AVZ-001",
    )

    leave_balance = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        default=15.0,
        help_text="Total remaining leave days available.",
    )

    # RBAC
    access_role = models.ForeignKey(
        AccessRole,
        on_delete=models.PROTECT,
        related_name="employees",
        null=True,
        help_text="Determines UI permissions: Employee, Team Lead, HR, Admin",
    )

    # Organization
    department = models.ForeignKey(
        "organization.Department",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="employees",
    )
    designation = models.ForeignKey(
        "organization.Designation",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="employees",
    )

    # Reporting chain (self-referential)
    team_lead = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="direct_reports",
        help_text="The manager this employee reports to.",
    )

    # Status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        db_index=True,
    )
    date_of_joining = models.DateField(null=True, blank=True)

    # Talents & Skills
    self_declared_talents = models.ManyToManyField(
        TalentTag,
        blank=True,
        related_name="employees_declared",
        help_text="Skills self-declared by the employee.",
    )
    evaluated_talents = models.ManyToManyField(
        TalentTag,
        blank=True,
        related_name="employees_evaluated",
        help_text="Talents identified/evaluated by Team Leads.",
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = EmployeeManager()

    class Meta:
        db_table = "employees"
        verbose_name = "Employee"
        verbose_name_plural = "Employees"
        ordering = ["-date_of_joining"]

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    def save(self, *args, **kwargs):
        if self.employee_id == "":
            self.employee_id = None

        if not self.employee_id:
            with transaction.atomic():
                last_employee = (
                    Employee.objects.select_for_update()
                    .filter(employee_id__startswith="AVZ-")
                    .order_by("employee_id")
                    .last()
                )

                if last_employee and last_employee.employee_id:
                    try:
                        last_id_number = int(last_employee.employee_id.split("-")[1])
                        next_id_number = last_id_number + 1
                    except (IndexError, ValueError):
                        next_id_number = 1
                else:
                    next_id_number = 1

                self.employee_id = f"AVZ-{next_id_number:03d}"

        super().save(*args, **kwargs)

    @property
    def role_name(self) -> str:
        """Shortcut used by permission classes."""
        return self.access_role.name if self.access_role else "Employee"

    @property
    def is_admin(self) -> bool:
        return self.role_name == "Admin"

    @property
    def is_team_lead(self) -> bool:
        return self.role_name == "Team Lead"

    @property
    def is_hr(self) -> bool:
        return self.role_name == "HR"

    @property
    def is_super_admin(self) -> bool:
        return self.role_name == "Super Admin"


auditlog.register(Employee)
auditlog.register(AccessRole)


class LoginAttempt(models.Model):
    """
    Tracks login failures and successes to implement 15-minute brute-force lockout.
    """

    email = models.EmailField(db_index=True)
    attempted_at = models.DateTimeField(auto_now_add=True)
    was_successful = models.BooleanField(default=False)

    class Meta:
        db_table = "login_attempts"
        verbose_name = "Login Attempt"
        verbose_name_plural = "Login Attempts"
        ordering = ["-attempted_at"]

    def __str__(self):
        return f"{self.email} - Success: {self.was_successful}"
