"""
Check for employees who haven't submitted their morning clock-in.

Usage:
    python manage.py check_morning_missing

    # Run daily via cron (e.g., at 9:45 AM):
    # 45 9 * * 1-5 cd /path/to/project && python manage.py check_morning_missing
"""

from datetime import date

from django.core.management.base import BaseCommand

from accounts.models import Employee
from attendance.models import DailyLog


class Command(BaseCommand):
    help = "Lists active employees who haven't clocked in today."

    def handle(self, *args, **options):
        today = date.today()

        # Find all active employees
        active_employees = Employee.objects.filter(is_active=True, status="active")
        total = active_employees.count()

        # Find employees who HAVE clocked in today
        clocked_in_ids = set(
            DailyLog.objects.filter(
                date=today,
                clock_in_time__isnull=False,
            ).values_list("employee_id", flat=True)
        )

        # The rest are missing
        missing = active_employees.exclude(id__in=clocked_in_ids)
        missing_count = missing.count()

        if missing_count == 0:
            self.stdout.write(
                self.style.SUCCESS(f"✅ All {total} active employees have clocked in today.")
            )
            return

        self.stdout.write(
            self.style.WARNING(
                f"\n⚠️  {missing_count} of {total} employees have NOT clocked in today ({today}):\n"
            )
        )

        for emp in missing.select_related("department").order_by("department__name", "first_name"):
            dept = emp.department.name if emp.department else "No Dept"
            self.stdout.write(f"  • [{dept}] {emp.get_full_name()} ({emp.email})")

        self.stdout.write("")  # blank line
