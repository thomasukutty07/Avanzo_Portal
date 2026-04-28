from django.db.models import Avg, Q
from django.utils import timezone

from accounts.models import Employee
from activity.models import ActivityEvent
from attendance.models import DailyLog
from leaves.models import LeaveRequest
from organization.models import Department
from performance.models import PerformanceSnapshot
from projects.models import Project, Task
from skills.models import EmployeeSkill
from tickets.models import Ticket


class AnalyticsService:
    @staticmethod
    def get_admin_dashboard_summary(tenant):
        """
        Aggregate high-level metrics across the specific organization (tenant).
        """
        today = timezone.localdate()

        # 1. Attendance Summary
        logs_today = DailyLog.objects.filter(tenant=tenant, date=today)
        total_logs = logs_today.count()
        clocked_in = logs_today.filter(
            status__in=[DailyLog.Status.CLOCKED_IN, DailyLog.Status.CLOCKED_OUT]
        ).count()
        late = logs_today.filter(is_late=True).count()

        attendance_summary = {
            "total_expected": total_logs,
            "clocked_in": clocked_in,
            "late": late,
            "absent": total_logs - clocked_in if total_logs else 0,
        }

        # 2. Projects Summary
        active_projects = Project.objects.filter(tenant=tenant, status=Project.Status.ACTIVE)
        active_projects_count = active_projects.count()

        total_progress = sum(p.weighted_progress for p in active_projects)
        overall_progress = (
            (total_progress / active_projects_count) if active_projects_count else 0.0
        )

        projects_summary = {
            "active_count": active_projects_count,
            "overall_progress_pct": round(overall_progress, 1),
        }

        # 3. Pending Leaves
        pending_leaves_count = LeaveRequest.objects.filter(
            tenant=tenant,
            status=LeaveRequest.Status.PENDING
        ).count()

        # 4. Open Tickets
        open_tickets_count = Ticket.objects.filter(tenant=tenant, status=Ticket.Status.OPEN).count()

        # 5. Activity Feed (last 10 events)
        recent_activities = ActivityEvent.objects.filter(tenant=tenant).select_related("actor").order_by("-timestamp")[
            :10
        ]

        # 6. Performance Leaderboard (Top 5 for current period)
        leaderboard = (
            PerformanceSnapshot.objects.filter(tenant=tenant, period_type=PerformanceSnapshot.PeriodType.WEEKLY)
            .select_related("employee")
            .order_by("-overall_score")[:5]
        )

        return {
            "attendance": attendance_summary,
            "projects": projects_summary,
            "pending_leaves": pending_leaves_count,
            "open_tickets": open_tickets_count,
            "activity_feed": recent_activities,
            "leaderboard": leaderboard,
        }

    @staticmethod
    def get_department_health(tenant):
        """
        Aggregate health metrics per department for a specific tenant.
        Uses live score calculation for the current week (same as live-leaderboard)
        so it always reflects real-time performance rather than stale snapshots.
        """
        from datetime import timedelta
        from performance.calculators import calculate_overall_score
        from performance.models import PerformanceWeightConfig
        from accounts.models import Employee as Emp

        today = timezone.localdate()
        # Current week: Monday → today
        period_start = today - timedelta(days=today.weekday())

        config, _ = PerformanceWeightConfig.objects.get_or_create(
            tenant=tenant,
            defaults={},
        )

        departments = Department.objects.filter(tenant=tenant)
        health_data = []

        for dept in departments:
            # ── Live avg performance score for this week ──────────
            dept_employees = (
                Emp.objects.filter(
                    tenant=tenant,
                    department=dept,
                    is_active=True,
                    status="active",
                )
                .select_related("access_role")
                .exclude(access_role__name="Admin")
            )

            scores = []
            for emp in dept_employees:
                result = calculate_overall_score(emp, period_start, today, config=config)
                scores.append(float(result["overall_score"]))

            avg_score_val = round(sum(scores) / len(scores), 1) if scores else 0.0

            # ── Real attendance % for today ────────────────────────
            total_in_dept = dept_employees.count()
            if total_in_dept > 0:
                clocked_today = DailyLog.objects.filter(
                    tenant=tenant,
                    employee__department=dept,
                    date=today,
                    status__in=[DailyLog.Status.CLOCKED_IN, DailyLog.Status.CLOCKED_OUT],
                ).count()
                attendance_pct = round((clocked_today / total_in_dept) * 100, 1)
            else:
                attendance_pct = 0.0

            # ── Active projects ────────────────────────────────────
            active_projects = Project.objects.filter(
                tenant=tenant,
                owning_department=dept,
                status=Project.Status.ACTIVE,
            ).count()

            # ── Open tickets ───────────────────────────────────────
            open_tickets = Ticket.objects.filter(
                tenant=tenant,
                assigned_to__department=dept,
                status=Ticket.Status.OPEN,
            ).count()

            # ── Health status ──────────────────────────────────────
            if (
                open_tickets > 10
                or attendance_pct < 80.0
                or (avg_score_val > 0 and avg_score_val < 50.0)
            ):
                color = "red"
            elif (
                open_tickets > 5
                or attendance_pct < 90.0
                or (avg_score_val > 0 and avg_score_val < 70.0)
            ):
                color = "yellow"
            else:
                color = "green"

            health_data.append(
                {
                    "department_id": dept.id,
                    "department_name": dept.name,
                    "attendance_pct": attendance_pct,
                    "avg_performance_score": avg_score_val,
                    "active_projects_count": active_projects,
                    "open_tickets_count": open_tickets,
                    "health_status": color,
                }
            )

        return health_data

    @staticmethod
    def get_employee_profile(employee_id, tenant):
        """
        Aggregated profile for admin's "click on employee" view within a tenant.
        """
        employee = Employee.objects.select_related(
            "department", "designation", "access_role", "team_lead"
        ).get(id=employee_id, tenant=tenant)

        # 1. Projects this employee is part of
        projects = Project.objects.filter(
            tenant=tenant,
            team=employee
        ).select_related("owning_department", "client")

        assigned_projects = [
            {
                "id": str(p.id),
                "title": p.title,
                "status": p.status,
                "progress": p.weighted_progress,
                "is_internal": p.is_internal,
                "client_name": p.client.name if p.client else None,
                "department": p.owning_department.name,
            }
            for p in projects
        ]

        # 2. Task stats
        all_tasks = Task.objects.filter(tenant=tenant, assignee=employee)
        task_stats = {
            "total": all_tasks.count(),
            "completed": all_tasks.filter(status=Task.Status.RESOLVED).count(),
            "in_progress": all_tasks.filter(status=Task.Status.IN_PROGRESS).count(),
            "open": all_tasks.filter(status=Task.Status.OPEN).count(),
        }

        # 3. Skills
        skills = EmployeeSkill.objects.filter(
            tenant=tenant,
            employee=employee
        ).select_related("skill")

        skill_list = [
            {
                "skill_name": es.skill.name,
                "category": es.skill.category,
                "proficiency": es.proficiency,
                "tasks_completed": es.tasks_completed_with_skill,
            }
            for es in skills
        ]

        # 4. Latest performance snapshot
        latest_snapshot = (
            PerformanceSnapshot.objects.filter(
                tenant=tenant,
                employee=employee,
                period_type=PerformanceSnapshot.PeriodType.WEEKLY,
            )
            .order_by("-period_start")
            .first()
        )

        performance = None
        if latest_snapshot:
            performance = {
                "period_start": str(latest_snapshot.period_start),
                "period_end": str(latest_snapshot.period_end),
                "overall_score": float(latest_snapshot.overall_score),
                "attendance_score": float(latest_snapshot.attendance_score),
                "delivery_score": float(latest_snapshot.delivery_score),
                "quality_score": float(latest_snapshot.quality_score),
                "reliability_score": float(latest_snapshot.reliability_score),
                "rank": latest_snapshot.rank,
                "total_ranked": latest_snapshot.total_ranked,
            }

        return {
            "employee": {
                "id": str(employee.id),
                "name": employee.get_full_name(),
                "email": employee.email,
                "employee_id": employee.employee_id,
                "department": employee.department.name if employee.department else None,
                "designation": employee.designation.name if employee.designation else None,
                "role": employee.role_name,
                "status": employee.status,
                "date_of_joining": str(employee.date_of_joining) if employee.date_of_joining else None,
            },
            "projects": assigned_projects,
            "task_stats": task_stats,
            "skills": skill_list,
            "performance": performance,
        }
