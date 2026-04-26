"""
Celery tasks for performance scoring.

generate_weekly_snapshots runs every Sunday at 11 PM IST via Celery Beat.
It computes scores for all active employees and saves frozen snapshots
with company-wide rankings.
"""

import logging
from datetime import timedelta

from celery import shared_task
from django.db import transaction
from django.utils import timezone

from accounts.models import Employee

from .calculators import calculate_overall_score
from .models import PerformanceSnapshot, PerformanceWeightConfig

logger = logging.getLogger(__name__)


@shared_task(name="performance.tasks.generate_weekly_snapshots")
@transaction.atomic
def generate_weekly_snapshots():
    """
    Generate one PerformanceSnapshot per active employee for last week.

    Period calculation:
      - period_end   = last Sunday (the most recent Sunday before today)
      - period_start = the Monday before that Sunday (6 days earlier)

    Ranking:
      After all snapshots are created, sort by overall_score descending
      and assign rank 1, 2, 3… to each.

    Idempotency:
      Uses update_or_create keyed on (employee, period_type, period_start)
      plus the UniqueConstraint on the model — safe to run twice.
    """
    today = timezone.localdate()

    # Last Monday → last Sunday
    period_end = today - timedelta(days=today.weekday() + 1)  # last Sunday
    period_start = period_end - timedelta(days=6)  # last Monday

    config, _ = PerformanceWeightConfig.objects.get_or_create()
    employees = Employee.objects.filter(
        is_active=True, status="active"
    ).select_related("department")

    snapshots = []
    for emp in employees:
        scores = calculate_overall_score(emp, period_start, period_end, config)

        snapshot, created = PerformanceSnapshot.objects.update_or_create(
            employee=emp,
            period_type=PerformanceSnapshot.PeriodType.WEEKLY,
            period_start=period_start,
            defaults={
                "period_end": period_end,
                **scores,
            },
        )
        snapshots.append(snapshot)
        action = "Created" if created else "Updated"
        logger.info("%s snapshot for %s", action, emp.get_full_name())

    # Assign company-wide ranks (1 = highest score)
    sorted_snapshots = sorted(
        snapshots, key=lambda s: s.overall_score, reverse=True
    )
    total = len(sorted_snapshots)
    for rank, snap in enumerate(sorted_snapshots, 1):
        snap.rank = rank
        snap.total_ranked = total
        snap.save(update_fields=["rank", "total_ranked"])

    logger.info(
        "Generated %d weekly snapshots for %s — %s",
        total, period_start, period_end,
    )
    return f"Generated {total} weekly snapshots for {period_start} — {period_end}"

