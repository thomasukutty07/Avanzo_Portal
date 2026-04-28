"""
Celery tasks for performance scoring.

generate_weekly_snapshots runs every Sunday at 11 PM IST via Celery Beat.
It computes scores for all active employees and saves frozen snapshots
with company-wide rankings, processed per tenant for multi-tenant isolation.
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
def generate_weekly_snapshots():
    """
    Generate one PerformanceSnapshot per active non-admin employee for last week.

    Runs per tenant so each organisation gets its own ranking.

    Period calculation:
      - period_end   = last Sunday
      - period_start = the Monday before that Sunday (6 days earlier)

    Idempotency:
      Uses update_or_create keyed on (employee, period_type, period_start)
      plus the UniqueConstraint on the model — safe to run twice.
    """
    from clients.models import Client  # avoid circular import at module level

    today = timezone.localdate()
    period_end = today - timedelta(days=today.weekday() + 1)   # last Sunday
    period_start = period_end - timedelta(days=6)              # last Monday

    total_generated = 0

    for tenant in Client.objects.all():
        with transaction.atomic():
            config, _ = PerformanceWeightConfig.objects.get_or_create(
                tenant=tenant,
                defaults={},
            )
            employees = (
                Employee.objects.filter(
                    tenant=tenant,
                    is_active=True,
                    status="active",
                )
                .select_related("department", "access_role")
                .exclude(access_role__name="Admin")
            )

            snapshots = []
            for emp in employees:
                scores = calculate_overall_score(emp, period_start, period_end, config)

                snapshot, created = PerformanceSnapshot.objects.update_or_create(
                    employee=emp,
                    period_type=PerformanceSnapshot.PeriodType.WEEKLY,
                    period_start=period_start,
                    defaults={
                        "tenant": tenant,
                        "period_end": period_end,
                        **scores,
                    },
                )
                snapshots.append(snapshot)
                action = "Created" if created else "Updated"
                logger.info("%s snapshot for %s", action, emp.get_full_name())

            # Assign tenant-scoped ranks (1 = highest score)
            sorted_snapshots = sorted(
                snapshots, key=lambda s: s.overall_score, reverse=True
            )
            n = len(sorted_snapshots)
            for rank, snap in enumerate(sorted_snapshots, 1):
                snap.rank = rank
                snap.total_ranked = n
                snap.save(update_fields=["rank", "total_ranked"])

            total_generated += n
            logger.info(
                "Generated %d weekly snapshots for tenant=%s (%s → %s)",
                n, tenant, period_start, period_end,
            )

    return f"Generated {total_generated} weekly snapshots for {period_start} — {period_end}"
