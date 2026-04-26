"""
Performance scoring models.

Two models:
  - PerformanceConfig: tenant-level weights for scoring formula (singleton per tenant).
  - PerformanceSnapshot: frozen score for one employee for one period (weekly/monthly).
"""

from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from accounts.models import Employee
from core.models import TimeStampedModel


class PerformanceWeightConfig(TimeStampedModel):
    """
    Tenant-level config that controls how much each metric contributes to
    the overall score.  Exactly ONE row per tenant — use get_or_create().

    The four weights MUST sum to 1.0.  The clean() method enforces this,
    and the serializer double-checks it on API writes.
    """

    weight_attendance = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.20,
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        help_text="How much attendance matters (0.00–1.00).",
    )
    weight_delivery = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.35,
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        help_text="How much on-time task delivery matters (0.00–1.00).",
    )
    weight_quality = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.25,
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        help_text="How much complexity-weighted quality matters (0.00–1.00).",
    )
    weight_reliability = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.20,
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        help_text="How much daily log outcome reliability matters (0.00–1.00).",
    )
    tenant = models.ForeignKey(
        "clients.Client", on_delete=models.CASCADE, related_name="performance_configs", null=True
    )

    class Meta:
        db_table = "performance_config"
        verbose_name = "Performance Config"

    def clean(self):
        """Reject saves where weights don't sum to 1.0 (±0.01 tolerance)."""
        total = (
            self.weight_attendance
            + self.weight_delivery
            + self.weight_quality
            + self.weight_reliability
        )
        if abs(total - 1.0) > 0.01:
            raise ValidationError(f"Weights must sum to 1.0, got {total}")

    def __str__(self):
        return "Performance Weights Config"


class PerformanceSnapshot(TimeStampedModel):
    """
    Frozen score for one employee for one period.

    Generated automatically every Sunday at 11 PM by the Celery Beat task
    `generate_weekly_snapshots`.  Never manually edited by users.

    Old snapshots are kept forever — they serve as the historical record
    for trend charts and comparison reports.
    """

    class PeriodType(models.TextChoices):
        WEEKLY = "weekly", "Weekly"
        MONTHLY = "monthly", "Monthly"

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="performance_snapshots",
    )
    tenant = models.ForeignKey(
        "clients.Client", on_delete=models.CASCADE, related_name="performance_snapshots", null=True
    )
    period_type = models.CharField(
        max_length=10,
        choices=PeriodType.choices,
        db_index=True,
    )
    period_start = models.DateField(db_index=True)
    period_end = models.DateField()

    # ── Component scores (each 0-100) ────────────────────────
    attendance_score = models.DecimalField(max_digits=5, decimal_places=2)
    delivery_score = models.DecimalField(max_digits=5, decimal_places=2)
    quality_score = models.DecimalField(max_digits=5, decimal_places=2)
    reliability_score = models.DecimalField(max_digits=5, decimal_places=2)

    # ── Overall (weighted composite of the four above) ───────
    overall_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        db_index=True,
    )

    # ── Rank within company for this period ──────────────────
    rank = models.PositiveIntegerField(null=True, blank=True)
    total_ranked = models.PositiveIntegerField(null=True, blank=True)

    # ── Frozen copy of the weight config at snapshot time ────
    # This survives even if an admin changes the weights later,
    # so historical scores always show what weights produced them.
    weights_used = models.JSONField(
        help_text="Snapshot of weight config at generation time",
    )

    class Meta:
        db_table = "performance_snapshots"
        ordering = ["-period_start"]
        constraints = [
            models.UniqueConstraint(
                fields=["employee", "period_type", "period_start"],
                name="unique_performance_snapshot",
            )
        ]
        indexes = [
            models.Index(
                fields=["period_type", "period_start", "overall_score"],
            ),
        ]

    def __str__(self):
        return (
            f"{self.employee.get_full_name()} — "
            f"{self.period_start} ({self.overall_score})"
        )
