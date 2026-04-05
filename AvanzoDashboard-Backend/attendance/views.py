from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.permissions import IsAdmin, IsAdminOrHR, IsTeamLead

from .models import DailyLog, DailyLogEntry
from .serializers import (
    ClockInSerializer,
    ClockOutSerializer,
    DailyLogSerializer,
)

# Late threshold — hardcoded for now.
# TODO: Pull from tenant/org config when per-tenant settings are built.
LATE_THRESHOLD_HOUR = 9
LATE_THRESHOLD_MINUTE = 15


class AttendanceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Attendance Triad API.

    Employees:
      GET  /api/attendance/          → personal attendance history
      GET  /api/attendance/{id}/     → single day detail
      POST /api/attendance/clock-in/ → morning gate (structured entries)
      PATCH /api/attendance/clock-out/ → evening gate (update entries)
      GET  /api/attendance/today/    → today's record

    Team Leads:
      GET  /api/attendance/team-feed/ → today's intent feed for direct reports

    Admins:
      GET  /api/attendance/pulse/    → org-wide attendance status
    """

    permission_classes = [IsAuthenticated]
    serializer_class = DailyLogSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return DailyLog.objects.none()
        return DailyLog.objects.filter(employee=self.request.user).prefetch_related(
            "entries", "entries__project"
        )

    # ─────────────────────────────────────────────────────────
    # EMPLOYEE ACTIONS
    # ─────────────────────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="today")
    def today(self, request):
        """
        GET /api/attendance/today/

        Returns today's attendance record with all entries.
        If no record exists yet, returns a fresh empty one so the
        frontend can render the clock-in form.
        """
        today = timezone.localdate()
        log, _created = DailyLog.objects.get_or_create(employee=request.user, date=today)
        serializer = DailyLogSerializer(log, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="clock-in")
    def clock_in(self, request):
        """
        POST /api/attendance/clock-in/

        Morning Gate — the employee must submit structured work items
        before they can start their day.

        Payload:
        {
            "entries": [
                {"project": "uuid", "intent_text": "Finish auth PR"},
                {"project": "uuid", "intent_text": "Start task modal"},
                {"custom_label": "Code Reviews", "intent_text": "Review 3 PRs"}
            ],
            "general_notes": "Team standup at 10am"
        }
        """
        today = timezone.localdate()

        # 1. Validate the structured input
        serializer = ClockInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # 2. Get or create today's record
        log, _created = DailyLog.objects.get_or_create(employee=request.user, date=today)

        # 3. Prevent double clock-ins
        if log.has_clocked_in:
            return Response(
                {"detail": "You have already clocked in today."},
                status=status.HTTP_409_CONFLICT,
            )

        # 4. Set clock-in time and detect lateness
        now = timezone.now()
        log.clock_in_time = now
        log.status = DailyLog.Status.CLOCKED_IN
        log.general_notes = serializer.validated_data.get("general_notes", "")

        # Late detection
        local_time = timezone.localtime(now)
        threshold = local_time.replace(
            hour=LATE_THRESHOLD_HOUR,
            minute=LATE_THRESHOLD_MINUTE,
            second=0,
            microsecond=0,
        )
        if local_time > threshold:
            log.is_late = True

        # Build a legacy plain-text intent from the structured entries
        # (keeps backward compatibility for any code that reads morning_intent)
        entry_texts = []
        for entry_data in serializer.validated_data["entries"]:
            label = entry_data.get("custom_label") or "Project"
            entry_texts.append(f"• {label}: {entry_data['intent_text']}")
        log.morning_intent = "\n".join(entry_texts)

        log.save()

        # 5. Create structured DailyLogEntry rows
        for entry_data in serializer.validated_data["entries"]:
            project_id = entry_data.get("project")

            DailyLogEntry.objects.create(
                daily_log=log,
                project_id=project_id,
                custom_label=entry_data.get("custom_label", ""),
                intent_text=entry_data["intent_text"],
                priority_order=entry_data.get("priority_order", 0),
            )

        return Response(
            DailyLogSerializer(log, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["patch"], url_path="clock-out")
    def clock_out(self, request):
        """
        PATCH /api/attendance/clock-out/

        Evening Gate — the employee updates each morning entry with what
        actually happened and a completion outcome.

        Payload:
        {
            "entries": [
                {
                    "entry_id": "uuid",
                    "output_text": "Finished the auth middleware PR",
                    "outcome": "completed"
                },
                {
                    "entry_id": "uuid",
                    "output_text": "Reviewed 2 of 3 PRs",
                    "outcome": "partial"
                }
            ],
            "general_notes": "Updated sprint board"
        }
        """
        today = timezone.localdate()

        # 1. Find today's record
        try:
            log = DailyLog.objects.get(employee=request.user, date=today)
        except DailyLog.DoesNotExist:
            return Response(
                {"detail": "You must clock in before you can clock out."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 2. Prevent double clock-outs
        if log.has_clocked_out:
            return Response(
                {"detail": "You have already clocked out today."},
                status=status.HTTP_409_CONFLICT,
            )

        # 3. Must have clocked in first
        if not log.has_clocked_in:
            return Response(
                {"detail": "You must clock in before you can clock out."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 4. Validate input
        serializer = ClockOutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # 5. Update each entry with output + outcome
        entry_map = {entry.id: entry for entry in log.entries.all()}

        updated_entries = []
        for entry_data in serializer.validated_data["entries"]:
            entry_id = entry_data["entry_id"]
            entry = entry_map.get(entry_id)

            if not entry:
                return Response(
                    {"detail": f"Entry {entry_id} not found in today's log."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            entry.output_text = entry_data["output_text"]
            entry.outcome = entry_data["outcome"]
            updated_entries.append(entry)

        # Bulk update for efficiency
        DailyLogEntry.objects.bulk_update(updated_entries, ["output_text", "outcome"])

        # 6. Update the daily log
        now = timezone.now()
        log.clock_out_time = now
        log.status = DailyLog.Status.CLOCKED_OUT
        log.compute_total_hours()

        # Update general notes if provided
        general_notes = serializer.validated_data.get("general_notes", "")
        if general_notes:
            # Append to existing notes (morning notes + evening notes)
            if log.general_notes:
                log.general_notes += f"\n\n--- Evening ---\n{general_notes}"
            else:
                log.general_notes = general_notes

        # Build legacy plain-text summary
        summary_texts = []
        for entry in updated_entries:
            label = entry.display_label
            outcome = entry.get_outcome_display()
            summary_texts.append(f"• {label} [{outcome}]: {entry.output_text}")
        log.evening_summary = "\n".join(summary_texts)

        log.save()

        return Response(
            DailyLogSerializer(log, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    # ─────────────────────────────────────────────────────────
    # TEAM LEAD ACTIONS
    # ─────────────────────────────────────────────────────────

    @action(
        detail=False,
        methods=["get"],
        url_path="team-feed",
        permission_classes=[IsAuthenticated, IsTeamLead],
    )
    def team_feed(self, request):
        """
        GET /api/attendance/team-feed/

        The TL's morning view — shows today's attendance and intent
        for every direct report. The TL can see at 9:30 AM who is
        working on what, who is late, and who hasn't shown up.
        """
        today = timezone.localdate()

        # Find all direct reports
        direct_reports = request.user.direct_reports.filter(is_active=True, status="active")

        feed = []
        for employee in direct_reports:
            log = (
                DailyLog.objects.filter(employee=employee, date=today)
                .prefetch_related("entries", "entries__project")
                .first()
            )

            employee_data = {
                "employee_id": str(employee.id),
                "employee_name": employee.get_full_name(),
                "employee_code": employee.employee_id,
                "department": employee.department.name if employee.department else None,
            }

            if log:
                employee_data.update(
                    {
                        "status": log.status,
                        "status_display": log.get_status_display(),
                        "clock_in_time": log.clock_in_time,
                        "is_late": log.is_late,
                        "general_notes": log.general_notes,
                        "entries": DailyLogSerializer(log, context={"request": request}).data.get(
                            "entries", []
                        ),
                    }
                )
            else:
                employee_data.update(
                    {
                        "status": "missing",
                        "status_display": "Not clocked in",
                        "clock_in_time": None,
                        "is_late": False,
                        "general_notes": "",
                        "entries": [],
                    }
                )

            feed.append(employee_data)

        # Sort: missing first, then late, then on-time
        status_order = {"missing": 0, "pending": 1, "clocked_in": 2, "clocked_out": 3}
        feed.sort(key=lambda x: (status_order.get(x["status"], 99), x["employee_name"]))

        return Response(
            {
                "date": str(today),
                "team_count": len(feed),
                "clocked_in": sum(1 for f in feed if f["status"] in ("clocked_in", "clocked_out")),
                "missing": sum(1 for f in feed if f["status"] in ("missing", "pending")),
                "late": sum(1 for f in feed if f["is_late"]),
                "feed": feed,
            }
        )

    # ─────────────────────────────────────────────────────────
    # ADMIN / CEO ACTIONS
    # ─────────────────────────────────────────────────────────

    @action(
        detail=False,
        methods=["get"],
        url_path="pulse",
        permission_classes=[IsAuthenticated, IsAdminOrHR],
    )
    def pulse(self, request):
        """
        GET /api/attendance/pulse/?department_id=uuid

        The CEO's morning view — org-wide attendance status at a glance.
        Color-coded: green (on-time), yellow (late), red (missing).
        """
        today = timezone.localdate()

        from accounts.models import Employee

        employees = Employee.objects.filter(is_active=True, status="active")

        # Optional department filter
        department_id = request.query_params.get("department_id")
        if department_id:
            employees = employees.filter(department_id=department_id)

        # Pre-fetch today's logs
        logs_map = {
            log.employee_id: log
            for log in DailyLog.objects.filter(
                date=today,
                employee__in=employees,
            ).prefetch_related("entries", "entries__project")
        }

        pulse_data = []
        for emp in employees.select_related("department", "designation"):
            log = logs_map.get(emp.id)

            row = {
                "employee_id": str(emp.id),
                "employee_name": emp.get_full_name(),
                "employee_code": emp.employee_id,
                "department": emp.department.name if emp.department else None,
                "designation": emp.designation.name if emp.designation else None,
            }

            if log:
                row.update(
                    {
                        "status": log.status,
                        "status_display": log.get_status_display(),
                        "clock_in_time": log.clock_in_time,
                        "clock_out_time": log.clock_out_time,
                        "is_late": log.is_late,
                        "total_hours": log.total_hours,
                        "entry_count": log.entries.count(),
                        "intent_summary": ", ".join(e.display_label for e in log.entries.all()[:5]),
                    }
                )
            else:
                row.update(
                    {
                        "status": "missing",
                        "status_display": "Not clocked in",
                        "clock_in_time": None,
                        "clock_out_time": None,
                        "is_late": False,
                        "total_hours": None,
                        "entry_count": 0,
                        "intent_summary": "",
                    }
                )

            pulse_data.append(row)

        # Sort: missing → late → on-time → clocked-out
        status_order = {"missing": 0, "pending": 0, "clocked_in": 2, "clocked_out": 3}
        pulse_data.sort(
            key=lambda x: (
                status_order.get(x["status"], 99),
                not x["is_late"],  # late people first within clocked_in
                x["employee_name"],
            )
        )

        # Summary counts
        total = len(pulse_data)
        clocked_in = sum(1 for p in pulse_data if p["status"] in ("clocked_in", "clocked_out"))
        missing = total - clocked_in
        late = sum(1 for p in pulse_data if p["is_late"])

        return Response(
            {
                "date": str(today),
                "total_employees": total,
                "clocked_in": clocked_in,
                "missing": missing,
                "late": late,
                "on_time": clocked_in - late,
                "employees": pulse_data,
            }
        )
