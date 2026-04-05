"""
Check for employees who clocked in but haven't clocked out.

Usage:
    python manage.py check_evening_missing

    # Run daily via cron (e.g., at 5:45 PM):
    # 45 17 * * 1-5 cd /path/to/project && python manage.py check_evening_missing
"""

from datetime import date

from django.core.management.base import BaseCommand

from attendance.models import DailyLog


class Command(BaseCommand):
    help = "Lists employees who clocked in today but haven't clocked out."

    def handle(self, *args, **options):
        today = date.today()

        # Find logs where morning is done but evening is missing
        missing_evening = DailyLog.objects.filter(
            date=today,
            clock_in_time__isnull=False,
            clock_out_time__isnull=True,
        ).select_related("employee", "employee__department")

        count = missing_evening.count()

        if count == 0:
            self.stdout.write(
                self.style.SUCCESS("✅ All clocked-in employees have clocked out today.")
            )
            return

        self.stdout.write(
            self.style.WARNING(
                f"\n⚠️  {count} employees clocked in but haven't clocked out ({today}):\n"
            )
        )

        for log in missing_evening.order_by("employee__department__name", "employee__first_name"):
            emp = log.employee
            dept = emp.department.name if emp.department else "No Dept"
            clock_in = log.clock_in_time.strftime("%I:%M %p") if log.clock_in_time else "?"
            self.stdout.write(f"  • [{dept}] {emp.get_full_name()} (clocked in at {clock_in})")

        self.stdout.write("")
