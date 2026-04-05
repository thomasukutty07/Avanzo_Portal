"""
Celery tasks for attendance automation.

These tasks are auto-discovered by Celery and scheduled via Celery Beat
(see config/celery.py for the schedule).

They can also be run manually as management commands:
    python manage.py check_morning_missing
    python manage.py check_evening_missing
    python manage.py mark_missing_attendance

Architecture note:
    Both Celery tasks and management commands call the same core logic
    in attendance.services to avoid code duplication.
"""

import logging
from datetime import date

from celery import shared_task

from accounts.models import Employee

from .models import DailyLog

logger = logging.getLogger(__name__)


@shared_task(name="attendance.tasks.check_morning_missing")
def check_morning_missing():
    """
    Runs at 9:30 AM and 9:45 AM (Mon–Fri).

    Finds active employees who haven't submitted their morning intent
    today. Logs their names for now — notification integration will
    be added when the notification channel supports push delivery.
    """
    today = date.today()

    active_employees = Employee.objects.filter(is_active=True, status="active")

    clocked_in_ids = set(
        DailyLog.objects.filter(
            date=today,
            clock_in_time__isnull=False,
        ).values_list("employee_id", flat=True)
    )

    missing = active_employees.exclude(id__in=clocked_in_ids)
    count = missing.count()

    if count == 0:
        logger.info("All employees have clocked in for %s.", today)
        return f"All clear for {today}"

    for emp in missing:
        logger.warning("Morning clock-in missing: %s (%s)", emp.get_full_name(), emp.email)

    return f"{count} employees have not clocked in for {today}"


@shared_task(name="attendance.tasks.check_evening_missing")
def check_evening_missing():
    """
    Runs at 5:35 PM and 5:50 PM (Mon–Fri).

    Finds employees who clocked in today but haven't clocked out.
    These are the people who might forget their evening summary.
    """
    today = date.today()

    missing_evening = DailyLog.objects.filter(
        date=today,
        clock_in_time__isnull=False,
        clock_out_time__isnull=True,
    ).select_related("employee")

    count = missing_evening.count()

    if count == 0:
        logger.info("All clocked-in employees have clocked out for %s.", today)
        return f"All clear for {today}"

    for log in missing_evening:
        logger.warning(
            "Evening clock-out missing: %s (%s)",
            log.employee.get_full_name(),
            log.employee.email,
        )

    return f"{count} employees haven't clocked out for {today}"


@shared_task(name="attendance.tasks.mark_missing_attendance")
def mark_missing_attendance():
    """
    Runs at 11:55 PM (Mon–Fri).

    Creates a MISSING attendance record for every active employee
    who has no DailyLog for today. This ensures there are zero gaps
    in attendance data — every employee has exactly one record per day.
    """
    today = date.today()

    active_employees = Employee.objects.filter(is_active=True, status="active")

    has_record_ids = set(DailyLog.objects.filter(date=today).values_list("employee_id", flat=True))

    missing_employees = active_employees.exclude(id__in=has_record_ids)
    created_count = 0

    for emp in missing_employees:
        DailyLog.objects.create(
            employee=emp,
            date=today,
            status=DailyLog.Status.MISSING,
        )
        created_count += 1

    logger.info("Created %d MISSING attendance records for %s.", created_count, today)
    return f"Created {created_count} MISSING records for {today}"
