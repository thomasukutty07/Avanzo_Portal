from django.utils import timezone
from rest_framework import mixins, viewsets, status
from rest_framework.response import Response

from attendance.models import DailyLog, DailyLogEntry
from .models import WorkingReport
from .serializers import WorkingReportSerializer


class WorkingReportViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet to list, retrieve, and capture Working Reports.
    """
    queryset = WorkingReport.objects.all().order_by("-generated_at")
    serializer_class = WorkingReportSerializer

    def create(self, request, *args, **kwargs):
        """
        Capture button: scans current DailyLog and DailyLogEntry tables
        for today and saves a rich, detailed snapshot into a new WorkingReport.

        Each employee record now includes:
          - Identity: name, employee_id, email, department, designation, role
          - Attendance: clock_in, clock_out, is_late, is_early_exit, total_hours
          - Task summary: completed, partial, blocked, pending counts
          - Full per-entry breakdown: project, task, intent, output, outcome, hours
        """
        today = timezone.now().date()

        logs = DailyLog.objects.filter(date=today).select_related(
            "employee",
            "employee__department",
            "employee__designation",
            "employee__access_role",
        ).prefetch_related(
            "entries__project",
            "entries__task",
        )

        report_data = []

        for log in logs:
            emp = log.employee
            entries = log.entries.all()

            # ── Summary counts ────────────────────────────────
            completed_tasks = sum(
                1 for e in entries if e.outcome == DailyLogEntry.Outcome.COMPLETED
            )
            partial_tasks = sum(
                1 for e in entries if e.outcome == DailyLogEntry.Outcome.PARTIAL
            )
            blocked_tasks = sum(
                1 for e in entries if e.outcome == DailyLogEntry.Outcome.BLOCKED
            )
            pending_tasks = sum(
                1 for e in entries
                if e.outcome in [
                    DailyLogEntry.Outcome.CARRIED_OVER,
                    DailyLogEntry.Outcome.NOT_STARTED,
                    "",
                ]
            )

            # ── Total working hours ───────────────────────────
            total_hours = sum((e.distributed_hours or 0) for e in entries)
            if not total_hours and log.total_hours:
                total_hours = float(log.total_hours)

            # ── Progress status ───────────────────────────────
            if log.status == DailyLog.Status.PENDING:
                progress_status = "Idle"
            elif log.status == DailyLog.Status.CLOCKED_OUT:
                progress_status = "Completed"
            elif log.status == DailyLog.Status.CLOCKED_IN:
                progress_status = "In Progress"
            elif log.status == DailyLog.Status.MISSING:
                progress_status = "Missing"
            else:
                progress_status = "Pending"

            # ── Clock times ───────────────────────────────────
            clock_in = (
                log.clock_in_time.strftime("%H:%M") if log.clock_in_time else None
            )
            clock_out = (
                log.clock_out_time.strftime("%H:%M") if log.clock_out_time else None
            )

            # ── Per-entry breakdown ───────────────────────────
            entry_breakdown = []
            for e in sorted(entries, key=lambda x: x.priority_order):
                entry_breakdown.append({
                    "project": e.project.title if e.project else (e.custom_label or "General"),
                    "task": e.task.title if e.task else None,
                    "intent": e.intent_text,
                    "output": e.output_text or None,
                    "outcome": e.outcome or None,
                    "outcome_reason": e.outcome_reason or None,
                    "hours": float(e.distributed_hours) if e.distributed_hours else None,
                    "confidence": e.morning_confidence,
                })

            report_data.append({
                # ── Employee identity ─────────────────────────
                "employee_name": emp.get_full_name(),
                "employee_id": emp.employee_id,
                "email": emp.email,
                "department": emp.department.name if emp.department else "None",
                "designation": emp.designation.name if emp.designation else None,
                "role": emp.role_name,
                # ── Attendance ────────────────────────────────
                "clock_in": clock_in,
                "clock_out": clock_out,
                "is_late": log.is_late,
                "is_early_exit": log.is_early_exit,
                "total_working_hours": str(total_hours),
                "progress_status": progress_status,
                "general_notes": log.general_notes or None,
                # ── Task summary ──────────────────────────────
                "completed_tasks": completed_tasks,
                "partial_tasks": partial_tasks,
                "blocked_tasks": blocked_tasks,
                "pending_tasks": pending_tasks,
                "remaining_workload": f"{pending_tasks} tasks left",
                # ── Full entry detail ─────────────────────────
                "entries": entry_breakdown,
            })

        timestamp_str = timezone.now().strftime("%Y%m%d%H%M%S")
        report_id = f"WR{timestamp_str}"

        report = WorkingReport.objects.create(
            report_id=report_id,
            data=report_data,
        )

        serializer = self.get_serializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
