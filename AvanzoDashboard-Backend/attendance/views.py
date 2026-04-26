from django.db import transaction
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.mixins import TenantFilterMixin
from core.permissions import IsAdmin, IsAdminOrHR, IsTeamLead

from .models import DailyLog, DailyLogEntry
from .serializers import (
    ClockInSerializer,
    ClockOutSerializer,
    DailyLogSerializer,
    PulseResponseSerializer,
    TeamFeedResponseSerializer,
)
from .services import AttendanceService

# Late threshold — hardcoded for now.
# TODO: Pull from tenant/org config when per-tenant settings are built.
TIME_ZONE = "Asia/Kolkata"
LATE_THRESHOLD_HOUR = 9
LATE_THRESHOLD_MINUTE = 30

EXIT_THRESHOLD_HOUR = 17
EXIT_THRESHOLD_MINUTE = 30


class AttendanceViewSet(TenantFilterMixin, viewsets.ReadOnlyModelViewSet):
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
            
        # First apply tenant isolation from super()
        qs = super().get_queryset()
        
        return qs.filter(employee=self.request.user).prefetch_related(
            "entries", "entries__project"
        )

    # ─────────────────────────────────────────────────────────
    # EMPLOYEE ACTIONS
    # ─────────────────────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="today")
    def today(self, request):
        """
        GET /api/attendance/today/

        Returns today's attendance record. 
        If no record exists, returns a virtual 'pending' response.
        We do NOT use get_or_create here to avoid cluttering the DB with empty rows.
        """
        today = timezone.localdate()
        log = DailyLog.objects.filter(employee=request.user, date=today).first()
        
        if log:
            serializer = DailyLogSerializer(log, context={"request": request})
            return Response(serializer.data)
            
        # Return a virtual pending state
        return Response({
            "id": None,
            "date": str(today),
            "status": DailyLog.Status.PENDING,
            "status_display": "Pending",
            "has_clocked_in": False,
            "has_clocked_out": False,
            "entries": [],
            "general_notes": ""
        })

    @action(detail=False, methods=["post"], url_path="clock-in")
    @transaction.atomic
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

        # 2. Cleanup: If they forgot to clock out YESTERDAY, mark it as MISSING
        DailyLog.objects.filter(
            employee=request.user, 
            date__lt=today, 
            status=DailyLog.Status.CLOCKED_IN
        ).update(status=DailyLog.Status.MISSING)

        # 3. Get or create today's record
        log, _created = DailyLog.objects.get_or_create(
            employee=request.user, 
            date=today,
            defaults={"tenant": request.user.tenant}
        )

        # 4. Prevent double clock-ins
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

        # Explicitly assign tenant before saving if it was somehow missing
        if not log.tenant:
            log.tenant = request.user.tenant
        log.save()

        # 5. Create structured DailyLogEntry rows
        for entry_data in serializer.validated_data["entries"]:
            project_id = entry_data.get("project")
            task_id = entry_data.get("task")

            DailyLogEntry.objects.create(
                daily_log=log,
                tenant=request.user.tenant,
                project_id=project_id,
                task_id=task_id,
                custom_label=entry_data.get("custom_label", ""),
                intent_text=entry_data["intent_text"],
                morning_confidence=entry_data.get("morning_confidence"),
                priority_order=entry_data.get("priority_order", 0),
            )

        return Response(
            DailyLogSerializer(log, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["patch"], url_path="clock-out")
    @transaction.atomic
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
            entry.outcome_reason = entry_data.get("outcome_reason", "")
            updated_entries.append(entry)

        # Bulk update for efficiency
        DailyLogEntry.objects.bulk_update(
            updated_entries, ["output_text", "outcome", "outcome_reason"]
        )

        # 6. Update the daily log
        now = timezone.now()
        local_time = timezone.localtime(now)
        
        # Office Hour Restriction: Cannot clock out before 5:30 PM
        exit_threshold = local_time.replace(
            hour=EXIT_THRESHOLD_HOUR,
            minute=EXIT_THRESHOLD_MINUTE,
            second=0,
            microsecond=0,
        )
        
        if local_time < exit_threshold:
            return Response(
                {"detail": "You cannot clock out before office hours end (5:30 PM). Please stay productive!"},
                status=status.HTTP_403_FORBIDDEN,
            )

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

        # Distribute the logged hours across entries based on complexity
        AttendanceService.distribute_hours_to_entries(log)

        return Response(
            DailyLogSerializer(log, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    # ─────────────────────────────────────────────────────────
    # TEAM LEAD ACTIONS
    # ─────────────────────────────────────────────────────────

    @extend_schema(responses=TeamFeedResponseSerializer)
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

    @extend_schema(responses=PulseResponseSerializer)
    @action(
        detail=False,
        methods=["get"],
        url_path="pulse",
        permission_classes=[IsAuthenticated, IsAdminOrHR],
    )
    def pulse(self, request):
        """
        GET /api/attendance/pulse/?department_id=uuid

        The CEO's / HR's morning view — org-wide attendance status at a glance.
        Strictly tenant-isolated: ONLY employees belonging to the same
        organisation as the requesting user are returned.
        """
        # ── Guard: requesting user must have a tenant ─────────
        if not request.user.tenant:
            return Response(
                {
                    "total": 0,
                    "clocked_in": 0,
                    "missing": 0,
                    "late": 0,
                    "employees": [],
                },
                status=status.HTTP_200_OK,
            )

        today = timezone.localdate()
        tenant = request.user.tenant  # resolved once, used everywhere

        from accounts.models import Employee

        # ── Strict tenant isolation ───────────────────────────
        # tenant__isnull=False ensures we NEVER include employees whose
        # tenant field is NULL (system accounts / cross-org test users).
        # Exclude Admin-role users — they manage the org, they don't clock in.
        employees = Employee.objects.filter(
            tenant=tenant,
            tenant__isnull=False,
            is_active=True,
            status="active",
        ).exclude(access_role__name="Admin")

        # Optional department filter
        department_id = request.query_params.get("department_id")
        if department_id:
            employees = employees.filter(department_id=department_id)

        # Pre-fetch today's logs — also scoped to THIS tenant
        logs_map = {
            log.employee_id: log
            for log in DailyLog.objects.filter(
                tenant=tenant,
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
                not x["is_late"],
                x["employee_name"],
            )
        )

        total = len(pulse_data)
        clocked_in = sum(1 for p in pulse_data if p["status"] in ("clocked_in", "clocked_out"))
        missing = total - clocked_in
        late = sum(1 for p in pulse_data if p["is_late"])

        return Response(
            {
                "total": total,
                "clocked_in": clocked_in,
                "missing": missing,
                "late": late,
                "employees": pulse_data,
            }
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="admin-clock-out",
        permission_classes=[IsAuthenticated, IsAdmin],
    )
    @transaction.atomic
    def admin_clock_out(self, request, pk=None):
        """
        POST /api/attendance/{id}/admin-clock-out/
        
        Allows an Admin to manually clock out an employee who forgot.
        Automatically sets the clock-out time to 5:30 PM (End of day).
        """
        log = self.get_object()
        
        if log.status != DailyLog.Status.CLOCKED_IN:
            return Response(
                {"detail": "This record is not in a 'Clocked In' state."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Set to official end of day (5:30 PM)
        exit_time = timezone.localtime(log.clock_in_time).replace(
            hour=EXIT_THRESHOLD_HOUR,
            minute=EXIT_THRESHOLD_MINUTE,
            second=0,
            microsecond=0,
        )
        
        log.clock_out_time = exit_time
        log.status = DailyLog.Status.CLOCKED_OUT
        log.compute_total_hours()
        log.general_notes += f"\n\n--- Admin Action ---\nManually clocked out by {request.user.get_full_name()}."
        log.save()
        
        return Response({"status": f"Successfully clocked out {log.employee.get_full_name()}."})
