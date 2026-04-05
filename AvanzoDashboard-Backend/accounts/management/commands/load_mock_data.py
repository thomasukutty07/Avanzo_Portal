import random
from datetime import datetime, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from accounts.models import Employee
from attendance.models import DailyLog
from leaves.models import LeaveRequest
from notifications.models import Notification
from organization.models import Department


class Command(BaseCommand):
    help = "Load mock data for Departments, Attendance, Leaves, and Notifications"

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting to load mock data for frontend testing...")

        with transaction.atomic():
            # 1. Departments
            departments = [
                "Cybersecurity",
                "Engineering",
                "HR",
                "Design",
                "Marketing",
                "Management",
            ]
            dept_objects = []
            for d in departments:
                dept, _ = Department.objects.get_or_create(name=d)
                dept_objects.append(dept)
            self.stdout.write(self.style.SUCCESS(f"Loaded {len(departments)} Departments."))

            employees = list(Employee.objects.all())
            if not employees:
                self.stdout.write(
                    self.style.ERROR(
                        "No employees found. Please run 'python manage.py "
                        "load_employee_data' first."
                    )
                )
                return

            # Assign departments randomly
            for emp in employees:
                if not emp.department:
                    dept = random.choice(dept_objects)
                    Employee.objects.filter(id=emp.id).update(department=dept)
                    emp.department = dept  # update in memory

            # Find a Team Lead or Admin to act as reviewer
            tl_reviewer = Employee.objects.filter(access_role__name="Team Lead").first()
            hr_reviewer = Employee.objects.filter(access_role__name="HR").first()

            # Generate Data for each employee
            logs_created = 0
            leaves_created = 0
            notifs_created = 0

            today = timezone.localdate()

            for emp in employees:
                # 2. Daily Logs (Attendance) - Past 5 days
                for i in range(5):
                    log_date = today - timedelta(days=i)
                    if log_date.weekday() >= 5:  # Skip weekends
                        continue

                    # Prevent duplicates
                    if not DailyLog.objects.filter(employee=emp, date=log_date).exists():
                        log = DailyLog(
                            employee=emp,
                            date=log_date,
                            morning_intent="Working on pending tasks and fixing bugs.",
                            clock_in_time=timezone.make_aware(
                                datetime.combine(log_date, datetime.min.time())
                            )
                            + timedelta(hours=9, minutes=random.randint(0, 30)),
                        )
                        # Maybe clocked out, maybe not
                        if log_date != today or random.choice([True, False]):
                            log.evening_summary = "Completed most tasks successfully."
                            log.clock_out_time = log.clock_in_time + timedelta(
                                hours=8, minutes=random.randint(0, 60)
                            )
                        log.save()
                        logs_created += 1

                # 3. Leaves - 1 pending or approved leave per employee (random chance)
                if random.random() > 0.5:
                    start_d = today + timedelta(days=random.randint(1, 15))
                    status = random.choice(
                        [
                            LeaveRequest.Status.PENDING,
                            LeaveRequest.Status.TL_APPROVED,
                            LeaveRequest.Status.APPROVED,
                            LeaveRequest.Status.REJECTED,
                        ]
                    )
                    req = LeaveRequest(
                        employee=emp,
                        leave_type=random.choice(
                            [LeaveRequest.LeaveType.FULL_DAY, LeaveRequest.LeaveType.HALF_DAY]
                        ),
                        start_date=start_d,
                        end_date=start_d + timedelta(days=random.randint(0, 2)),
                        reason="Family emergency or Vacation",
                        status=status,
                    )
                    if status in [LeaveRequest.Status.TL_APPROVED, LeaveRequest.Status.APPROVED]:
                        req.tl_reviewer = tl_reviewer
                    if status == LeaveRequest.Status.APPROVED:
                        req.hr_reviewer = hr_reviewer
                        req.review_remarks = "Approved, have a good time."
                    req.save()
                    leaves_created += 1

                # 4. Notifications - 2-3 per employee
                for _ in range(random.randint(1, 3)):
                    notif = Notification(
                        recipient=emp,
                        title=random.choice(
                            ["System Update", "Meeting Reminder", "Leave Status Updated"]
                        ),
                        message="Please check the dashboard for more details.",
                        notification_type=random.choice(Notification.NotificationType.choices)[0],
                        is_read=random.choice([True, False]),
                    )
                    notif.save()
                    notifs_created += 1

            self.stdout.write(self.style.SUCCESS(f"Loaded {logs_created} Daily Logs (Attendance)."))
            self.stdout.write(self.style.SUCCESS(f"Loaded {leaves_created} Leave Requests."))
            self.stdout.write(self.style.SUCCESS(f"Loaded {notifs_created} Notifications."))
            self.stdout.write(self.style.SUCCESS("Mock data fully populated!"))
