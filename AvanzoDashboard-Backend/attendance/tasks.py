import logging
from datetime import date

from celery import shared_task

from accounts.models import Employee

from .models import DailyLog

logger = logging.getLogger(__name__)


@shared_task
def ping_missing_morning_standups():
    """
    Runs every 5 mins between 9:30 AM - 9:45 AM local time.
    Finds active employees who haven't submitted their morning intent today.
    """
    today = date.today()

    # Find active employees
    active_employees = Employee.objects.filter(is_active=True, status="active")

    # Find employees who ALREADY logged in today
    logged_in_ids = DailyLog.objects.filter(date=today, clock_in_time__isnull=False).values_list(
        "employee_id", flat=True
    )

    # Exclude the ones who logged in, leaving the ones who forgot
    slackers = active_employees.exclude(id__in=logged_in_ids)

    for employee in slackers:
        logger.info(f"Triggering morning nudge notification for {employee.email}")

    @shared_task
    def ping_missing_evening_summaries():
        """
        Runs every 5 mins between 5:35 PM - 5:50 PM local time.
        Finds active employees who clocked in, but haven't clocked out.
        """
        today = date.today()

        # Find logs from today where morning is done, but evening is missing

        missing_evening_logs = DailyLog.objects.filter(
            date=today, clock_in_time__isnull=False, clock_out_time__isnull=True
        ).select_related("employee")

        for log in missing_evening_logs:
            logger.info(f"Triggering evening nudge notification for {log.employee.email}")
