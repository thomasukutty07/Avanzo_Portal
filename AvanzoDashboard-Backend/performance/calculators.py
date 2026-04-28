"""
Pure scoring functions — no side effects, no database writes.

Each function takes (employee, start_date, end_date) and returns a Decimal
score between 0 and 100.  They read from existing models in attendance/,
projects/, and leaves/.

The top-level calculate_overall_score() calls all four and returns a dict
ready to be unpacked into a PerformanceSnapshot row.
"""

from datetime import timedelta
from decimal import Decimal

from django.db.models import F, Sum

from attendance.models import DailyLog, DailyLogEntry
from leaves.models import LeaveRequest
from projects.models import Task


def calculate_attendance_score(employee, start_date, end_date) -> Decimal:
    """
    Score = (on_time_days + late_days × 0.5) / total_work_days × 100

    - Late clock-ins count as half credit.
    - Missing days count as zero.
    - Weekends (Sat/Sun) are excluded from the denominator.
    - Approved leave days are excluded from the denominator.

    Returns 100.00 if total_work_days ≤ 0 (e.g. full-week leave).
    """
    logs = DailyLog.objects.filter(
        employee=employee,
        date__gte=start_date,
        date__lte=end_date,
    )

    # Sum actual leave days (not just count of requests) for accuracy.
    # A 3-day leave request should subtract 3, not 1.
    approved_leave_days = (
        LeaveRequest.objects.filter(
            employee=employee,
            status=LeaveRequest.Status.APPROVED,
            start_date__lte=end_date,
            end_date__gte=start_date,
        ).aggregate(total=Sum("total_days"))["total"]
        or 0
    )

    # Count business days (Mon–Fri) in the date range
    business_days = 0
    current = start_date
    while current <= end_date:
        if current.weekday() < 5:  # Mon=0 … Fri=4
            business_days += 1
        current += timedelta(days=1)

    total_work_days = business_days - int(approved_leave_days)
    if total_work_days <= 0:
        return Decimal("100.00")

    # On-time = clocked in/out AND not late
    on_time = logs.filter(
        status__in=[DailyLog.Status.CLOCKED_IN, DailyLog.Status.CLOCKED_OUT],
        is_late=False,
    ).count()

    late = logs.filter(is_late=True).count()

    score = ((on_time + (late * Decimal("0.5"))) / total_work_days) * 100
    return min(Decimal("100.00"), round(score, 2))


def calculate_delivery_score(employee, start_date, end_date) -> Decimal:
    """
    Score = tasks resolved on/before due date / total resolved tasks × 100

    Only counts tasks resolved (status=RESOLVED) within the period,
    using updated_at as the proxy for completion timestamp.

    Returns 100.00 if no tasks were resolved (no penalty for idle periods).
    """
    resolved_tasks = Task.objects.filter(
        assignee=employee,
        status=Task.Status.RESOLVED,
        updated_at__date__gte=start_date,
        updated_at__date__lte=end_date,
    )

    total = resolved_tasks.count()
    if total == 0:
        return Decimal("0.00")

    # F("due_date") compares each task's completion date against its own due date
    on_time = resolved_tasks.filter(updated_at__date__lte=F("due_date")).count()

    return round(Decimal(on_time) / Decimal(total) * 100, 2)


def calculate_quality_score(employee, start_date, end_date) -> Decimal:
    """
    Complexity-weighted speed factor per resolved task.

    Speed factors (how quickly the task was done vs. its due date):
      - ≥ 2 days early  → 1.2  (bonus)
      - on time          → 1.0
      - up to 5 days late → 0.8
      - > 5 days late    → 0.6

    Score = Σ(complexity × speed_factor) / Σ(complexity × 1.2) × 100

    The denominator uses 1.2 (max factor) so a perfect score requires
    finishing ALL tasks ≥ 2 days early.

    Returns 100.00 if no tasks were resolved.
    """
    resolved_tasks = Task.objects.filter(
        assignee=employee,
        status=Task.Status.RESOLVED,
        updated_at__date__gte=start_date,
        updated_at__date__lte=end_date,
    )

    if not resolved_tasks.exists():
        return Decimal("0.00")

    total_earned = Decimal("0")
    max_possible = Decimal("0")

    for task in resolved_tasks:
        completed_date = task.updated_at.date()
        days_diff = (task.due_date - completed_date).days

        if days_diff >= 2:
            speed_factor = Decimal("1.2")
        elif days_diff >= 0:
            speed_factor = Decimal("1.0")
        elif days_diff >= -5:
            speed_factor = Decimal("0.8")
        else:
            speed_factor = Decimal("0.6")

        total_earned += task.complexity * speed_factor
        max_possible += task.complexity * Decimal("1.2")

    if max_possible == 0:
        return Decimal("0.00")

    return round((total_earned / max_possible) * 100, 2)


def calculate_reliability_score(employee, start_date, end_date) -> Decimal:
    """
    Based on DailyLogEntry outcomes — how often does planned work get done?

    Score map:
      completed    → 1.0  (did what they said they'd do)
      blocked      → 0.7  (external blocker, not their fault)
      partial      → 0.5  (started but didn't finish)
      carried_over → 0.3  (pushed to next day)
      not_started  → 0.0  (planned but never touched)

    Entries with blank outcome (employee hasn't clocked out yet) are excluded.

    Returns 100.00 if no scored entries exist.
    """
    entries = DailyLogEntry.objects.filter(
        daily_log__employee=employee,
        daily_log__date__gte=start_date,
        daily_log__date__lte=end_date,
        outcome__in=[
            DailyLogEntry.Outcome.COMPLETED,
            DailyLogEntry.Outcome.PARTIAL,
            DailyLogEntry.Outcome.BLOCKED,
            DailyLogEntry.Outcome.CARRIED_OVER,
            DailyLogEntry.Outcome.NOT_STARTED,
        ],
    )

    score_map = {
        DailyLogEntry.Outcome.COMPLETED: Decimal("1.0"),
        DailyLogEntry.Outcome.PARTIAL: Decimal("0.5"),
        DailyLogEntry.Outcome.BLOCKED: Decimal("0.7"),
        DailyLogEntry.Outcome.CARRIED_OVER: Decimal("0.3"),
        DailyLogEntry.Outcome.NOT_STARTED: Decimal("0.0"),
    }

    total = entries.count()
    if total == 0:
        return Decimal("0.00")

    score_sum = sum(score_map.get(e.outcome, Decimal("0")) for e in entries)
    return round((score_sum / total) * 100, 2)


def calculate_overall_score(employee, start_date, end_date, config=None):
    """
    Compute all four component scores and the weighted composite.

    Returns a dict ready to unpack into a PerformanceSnapshot:
    {
        "attendance_score": Decimal,
        "delivery_score": Decimal,
        "quality_score": Decimal,
        "reliability_score": Decimal,
        "overall_score": Decimal,
        "weights_used": {"attendance": float, "delivery": float, ...},
    }
    """
    # Lazy import to avoid circular dependency (models imports core,
    # calculators is imported by tasks which imports models)
    from .models import PerformanceWeightConfig

    if config is None:
        # This path is only hit in tests / management commands.
        # Production code always passes config= from the view.
        # Fall back to a default config (no tenant) only for safety.
        config, _ = PerformanceWeightConfig.objects.get_or_create(
            tenant=None,
            defaults={},
        )

    attendance = calculate_attendance_score(employee, start_date, end_date)
    delivery = calculate_delivery_score(employee, start_date, end_date)
    quality = calculate_quality_score(employee, start_date, end_date)
    reliability = calculate_reliability_score(employee, start_date, end_date)

    overall = (
        attendance * Decimal(str(config.weight_attendance))
        + delivery * Decimal(str(config.weight_delivery))
        + quality * Decimal(str(config.weight_quality))
        + reliability * Decimal(str(config.weight_reliability))
    )

    return {
        "attendance_score": attendance,
        "delivery_score": delivery,
        "quality_score": quality,
        "reliability_score": reliability,
        "overall_score": round(overall, 2),
        "weights_used": {
            "attendance": float(config.weight_attendance),
            "delivery": float(config.weight_delivery),
            "quality": float(config.weight_quality),
            "reliability": float(config.weight_reliability),
        },
    }
