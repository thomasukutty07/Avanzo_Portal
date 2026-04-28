from datetime import date, timedelta

from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from attendance.models import DailyLog, DailyLogEntry
from core.mixins import TenantFilterMixin
from core.permissions import IsAdminOrHR
from .models import WorkingReport
from .serializers import WorkingReportSerializer

# ── Shared helper ──────────────────────────────────────────────────────────────

def _build_employee_record_for_log(log):
    """
    Given a single DailyLog, return the structured dict used in both
    daily snapshots and per-day items inside range reports.
    """
    emp = log.employee
    entries = log.entries.all()

    completed_tasks = sum(1 for e in entries if e.outcome == DailyLogEntry.Outcome.COMPLETED)
    partial_tasks   = sum(1 for e in entries if e.outcome == DailyLogEntry.Outcome.PARTIAL)
    blocked_tasks   = sum(1 for e in entries if e.outcome == DailyLogEntry.Outcome.BLOCKED)
    pending_tasks   = sum(
        1 for e in entries
        if e.outcome in [DailyLogEntry.Outcome.CARRIED_OVER, DailyLogEntry.Outcome.NOT_STARTED, ""]
    )

    total_hours = sum((e.distributed_hours or 0) for e in entries)
    if not total_hours and log.total_hours:
        total_hours = float(log.total_hours)

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

    clock_in  = log.clock_in_time.strftime("%H:%M")  if log.clock_in_time  else None
    clock_out = log.clock_out_time.strftime("%H:%M") if log.clock_out_time else None

    entry_breakdown = []
    for e in sorted(entries, key=lambda x: x.priority_order):
        entry_breakdown.append({
            "project":        e.project.title if e.project else (e.custom_label or "General"),
            "task":           e.task.title if e.task else None,
            "intent":         e.intent_text,
            "output":         e.output_text or None,
            "outcome":        e.outcome or None,
            "outcome_reason": e.outcome_reason or None,
            "hours":          float(e.distributed_hours) if e.distributed_hours else None,
            "confidence":     e.morning_confidence,
        })

    return {
        "employee":         emp,
        "clock_in":         clock_in,
        "clock_out":        clock_out,
        "is_late":          log.is_late,
        "is_early_exit":    log.is_early_exit,
        "total_hours":      float(total_hours),
        "progress_status":  progress_status,
        "general_notes":    log.general_notes or None,
        "completed_tasks":  completed_tasks,
        "partial_tasks":    partial_tasks,
        "blocked_tasks":    blocked_tasks,
        "pending_tasks":    pending_tasks,
        "entries":          entry_breakdown,
    }


def _productivity_score(completed, partial, blocked, pending, days_present, days_in_range):
    """
    Simple 0-100 productivity score:
      - 40 pts: attendance rate (days present / total working days)
      - 40 pts: task completion rate (completed / total tasks)
      - 20 pts: no blocked tasks penalty
    """
    total_tasks = completed + partial + blocked + pending
    attendance_rate   = (days_present / days_in_range * 100) if days_in_range else 0
    completion_rate   = (completed / total_tasks * 100) if total_tasks else 0
    no_block_bonus    = max(0, 100 - (blocked / total_tasks * 100)) if total_tasks else 100

    score = (attendance_rate * 0.4) + (completion_rate * 0.4) + (no_block_bonus * 0.2)
    return round(score, 1)


# ── ViewSet ────────────────────────────────────────────────────────────────────

class WorkingReportViewSet(
    TenantFilterMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet to list, retrieve, and capture Working Reports.

    Reports are IMMUTABLE once created — PUT, PATCH and DELETE are
    explicitly blocked.  Only GET (list/retrieve) and POST (generate)
    are permitted.

    Endpoints:
      POST /api/reports/working/                → daily snapshot (today only)
      POST /api/reports/working/generate_range/ → date-range report (max 90 days)
      GET  /api/reports/working/                → list all reports (tenant-scoped)
      GET  /api/reports/working/{id}/           → detail for one report
    """
    # Block every HTTP verb except safe reads and POST (generate)
    http_method_names = ["get", "post", "head", "options"]

    queryset = WorkingReport.objects.all().order_by("-generated_at")
    serializer_class = WorkingReportSerializer
    permission_classes = [IsAuthenticated, IsAdminOrHR]

    # ── Daily snapshot ─────────────────────────────────────────────────────────────
    def create(self, request, *args, **kwargs):
        """
        Capture button: scans current DailyLog and DailyLogEntry tables
        for today (tenant-scoped) and saves a rich, detailed snapshot.
        """
        today = timezone.now().date()
        tenant = getattr(request.user, 'tenant', None)

        logs = DailyLog.objects.filter(
            date=today,
            tenant=tenant,
        ).select_related(
            "employee",
            "employee__department",
            "employee__designation",
            "employee__access_role",
        ).prefetch_related("entries__project", "entries__task")

        report_data = []
        for log in logs:
            r = _build_employee_record_for_log(log)
            emp = r.pop("employee")
            report_data.append({
                "employee_name":       emp.get_full_name(),
                "employee_id":         emp.employee_id,
                "email":               emp.email,
                "department":          emp.department.name if emp.department else "None",
                "designation":         emp.designation.name if emp.designation else None,
                "role":                emp.role_name,
                **r,
                "remaining_workload":  f"{r['pending_tasks']} tasks left",
            })

        timestamp_str = timezone.now().strftime("%Y%m%d%H%M%S")
        report_id = f"WR{timestamp_str}"

        report = WorkingReport.objects.create(
            report_id=report_id,
            report_type=WorkingReport.ReportType.DAILY,
            date_from=today,
            date_to=today,
            data=report_data,
            tenant=tenant,
        )

        serializer = self.get_serializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # ── Date-range report ──────────────────────────────────────────────────────
    @action(detail=False, methods=["post"], url_path="generate_range")
    def generate_range(self, request):
        """
        POST /api/reports/working/generate_range/
        Body: { "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD" }

        Generates a full aggregated report for every employee across all
        working days in the specified range (max 90 days, max end = today).

        Each employee record contains:
          - Identity: name, employee_id, email, department, designation, role
          - Aggregated totals: total_hours, completed/partial/blocked/pending tasks
          - Attendance: days_present, days_missing, late_count, early_exit_count
          - Productivity score (0–100)
          - Per-day breakdown: clock times, status, entries for each date
        """
        # ── Validate inputs ────────────────────────────────────────────────────
        start_str = request.data.get("start_date")
        end_str   = request.data.get("end_date")

        if not start_str or not end_str:
            return Response(
                {"error": "Both start_date and end_date are required (YYYY-MM-DD)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            start_date = date.fromisoformat(start_str)
            end_date   = date.fromisoformat(end_str)
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        today = timezone.now().date()

        if start_date > end_date:
            return Response(
                {"error": "start_date must be before or equal to end_date."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if end_date > today:
            return Response(
                {"error": "end_date cannot be in the future."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        days_in_range = (end_date - start_date).days + 1
        if days_in_range > 90:
            return Response(
                {"error": "Date range cannot exceed 90 days."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Fetch all logs in range (tenant-scoped) ────────────────────────────
        tenant = getattr(request.user, 'tenant', None)
        logs = DailyLog.objects.filter(
            date__range=(start_date, end_date),
            tenant=tenant,
        ).select_related(
            "employee",
            "employee__department",
            "employee__designation",
            "employee__access_role",
        ).prefetch_related("entries__project", "entries__task").order_by("date")

        # ── Group logs by employee ─────────────────────────────────────────────
        employee_map: dict = {}  # employee_id → { meta, days: [], aggregates }

        for log in logs:
            emp = log.employee
            emp_pk = emp.pk
            r = _build_employee_record_for_log(log)
            r.pop("employee")  # remove Employee ORM object before JSON serialisation

            if emp_pk not in employee_map:
                employee_map[emp_pk] = {
                    # Identity
                    "employee_name":  emp.get_full_name(),
                    "employee_id":    emp.employee_id,
                    "email":          emp.email,
                    "department":     emp.department.name if emp.department else "None",
                    "designation":    emp.designation.name if emp.designation else None,
                    "role":           emp.role_name,
                    # Totals (accumulated below)
                    "total_working_hours": 0.0,
                    "completed_tasks":     0,
                    "partial_tasks":       0,
                    "blocked_tasks":       0,
                    "pending_tasks":       0,
                    "days_present":        0,
                    "days_missing":        0,
                    "late_count":          0,
                    "early_exit_count":    0,
                    # Per-day list
                    "days": [],
                }

            rec = employee_map[emp_pk]

            # Accumulate totals
            rec["total_working_hours"] = round(rec["total_working_hours"] + r["total_hours"], 2)
            rec["completed_tasks"] += r["completed_tasks"]
            rec["partial_tasks"]   += r["partial_tasks"]
            rec["blocked_tasks"]   += r["blocked_tasks"]
            rec["pending_tasks"]   += r["pending_tasks"]

            if r["progress_status"] == "Missing":
                rec["days_missing"] += 1
            else:
                rec["days_present"] += 1

            if r["is_late"]:
                rec["late_count"] += 1
            if r["is_early_exit"]:
                rec["early_exit_count"] += 1

            # Per-day breakdown entry
            rec["days"].append({
                "date":                 log.date.isoformat(),
                "clock_in":             r["clock_in"],
                "clock_out":            r["clock_out"],
                "is_late":              r["is_late"],
                "is_early_exit":        r["is_early_exit"],
                "total_working_hours":  r["total_hours"],
                "progress_status":      r["progress_status"],
                "general_notes":        r["general_notes"],
                "completed_tasks":      r["completed_tasks"],
                "partial_tasks":        r["partial_tasks"],
                "blocked_tasks":        r["blocked_tasks"],
                "pending_tasks":        r["pending_tasks"],
                "entries":              r["entries"],
            })

        # ── Attach productivity score to each employee ──────────────────────────
        report_data = []
        for rec in employee_map.values():
            rec["productivity_score"] = _productivity_score(
                completed      = rec["completed_tasks"],
                partial        = rec["partial_tasks"],
                blocked        = rec["blocked_tasks"],
                pending        = rec["pending_tasks"],
                days_present   = rec["days_present"],
                days_in_range  = days_in_range,
            )
            rec["total_working_hours"] = str(rec["total_working_hours"])
            report_data.append(rec)

        # ── Persist ────────────────────────────────────────────────────────────
        timestamp_str = timezone.now().strftime("%Y%m%d%H%M%S")
        report_id = f"WRR{timestamp_str}_{start_date.strftime('%Y%m%d')}-{end_date.strftime('%Y%m%d')}"

        report = WorkingReport.objects.create(
            report_id=report_id,
            report_type=WorkingReport.ReportType.RANGE,
            date_from=start_date,
            date_to=end_date,
            data=report_data,
            tenant=tenant,
        )

        serializer = self.get_serializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
