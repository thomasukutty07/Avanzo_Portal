"""
Mark employees with no attendance record as MISSING for today.

Usage:
    python manage.py mark_missing_attendance

    # Run daily via cron at 11:55 PM:
    # 55 23 * * 1-5 cd /path/to/project && python manage.py mark_missing_attendance
"""

from datetime import date

from django.core.management.base import BaseCommand

from accounts.models import Employee
from attendance.models import DailyLog


class Command(BaseCommand):
    help = "Creates MISSING attendance records for employees who never clocked in today."

    def handle(self, *args, **options):
        today = date.today()

        # All active employees
        active_employees = Employee.objects.filter(is_active=True, status="active")

        # Those who already have a record today (any status)
        has_record_ids = set(
            DailyLog.objects.filter(date=today).values_list("employee_id", flat=True)
        )

        # Create MISSING records for the rest
        missing_employees = active_employees.exclude(id__in=has_record_ids)
        created_count = 0

        for emp in missing_employees:
            DailyLog.objects.create(
                employee=emp,
                date=today,
                status=DailyLog.Status.MISSING,
            )
            created_count += 1

        if created_count == 0:
            self.stdout.write(
                self.style.SUCCESS(
                    "✅ All active employees already have attendance records for today."
                )
            )
        else:
            self.stdout.write(
                self.style.WARNING(
                    f"⚠️  Created {created_count} MISSING attendance records for {today}."
                )
            )
