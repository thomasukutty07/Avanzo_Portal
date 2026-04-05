"""
HR Attendance Report API.

Provides filterable, exportable attendance data for HR and Admin users.
Supports JSON and CSV output formats.
"""

import csv

from django.http import HttpResponse
from drf_spectacular.utils import OpenApiParameter, OpenApiTypes, extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsAdminOrHR

from .models import DailyLog


class AttendanceReportView(APIView):
    """
    GET /api/attendance/reports/

    Generates an attendance report for a date range.

    Query Parameters:
        from_date (required): Start date, e.g., 2026-01-01
        to_date (required): End date, e.g., 2026-03-30
        department_id (optional): Filter by department UUID
        employee_id (optional): Filter to a single employee
        format (optional): "csv" for downloadable CSV, default is JSON

    Access: HR and Admin only.

    Example:
        GET /api/attendance/reports/?from_date=2026-03-01&to_date=2026-03-30
        GET /api/attendance/reports/?from_date=2026-03-01&to_date=2026-03-30&department_id=uuid
        GET /api/attendance/reports/?from_date=2026-03-01&to_date=2026-03-30&format=csv
    """

    permission_classes = [IsAuthenticated, IsAdminOrHR]

    @extend_schema(
        summary="Generate Attendance Report",
        parameters=[
            OpenApiParameter(name="from_date", type=OpenApiTypes.DATE, required=True),
            OpenApiParameter(name="to_date", type=OpenApiTypes.DATE, required=True),
            OpenApiParameter(name="department_id", type=OpenApiTypes.UUID, required=False),
            OpenApiParameter(name="employee_id", type=OpenApiTypes.UUID, required=False),
            OpenApiParameter(
                name="format",
                type=OpenApiTypes.STR,
                enum=["json", "csv"],
                required=False,
                description="Output format",
            ),
        ],
        responses={200: OpenApiTypes.OBJECT},
    )
    def get(self, request):
        # ── Parse and validate query params ──
        from_date = request.query_params.get("from_date")
        to_date = request.query_params.get("to_date")

        if not from_date or not to_date:
            return Response(
                {"detail": "Both 'from_date' and 'to_date' are required. Format: YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from datetime import date

        try:
            from_date = date.fromisoformat(from_date)
            to_date = date.fromisoformat(to_date)
        except ValueError:
            return Response(
                {"detail": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if from_date > to_date:
            return Response(
                {"detail": "'from_date' cannot be after 'to_date'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (to_date - from_date).days > 365:
            return Response(
                {"detail": "Maximum report range is 365 days."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Build the queryset ──
        logs = (
            DailyLog.objects.filter(
                date__gte=from_date,
                date__lte=to_date,
            )
            .select_related("employee", "employee__department", "employee__designation")
            .prefetch_related("entries", "entries__project")
            .order_by("date", "employee__first_name")
        )

        # Optional filters
        department_id = request.query_params.get("department_id")
        if department_id:
            logs = logs.filter(employee__department_id=department_id)

        employee_id = request.query_params.get("employee_id")
        if employee_id:
            logs = logs.filter(employee_id=employee_id)

        # ── Build the report data ──
        report_rows = []
        for log in logs:
            emp = log.employee

            # Gather structured entries into a comma-separated summary
            entries = log.entries.all()
            intent_items = []
            output_items = []
            for entry in entries:
                label = entry.display_label
                intent_items.append(f"{label}: {entry.intent_text}")
                if entry.output_text:
                    outcome_label = entry.get_outcome_display() if entry.outcome else ""
                    output_items.append(f"{label} [{outcome_label}]: {entry.output_text}")

            row = {
                "date": str(log.date),
                "employee_id": str(emp.id),
                "employee_code": emp.employee_id or "",
                "employee_name": emp.get_full_name(),
                "department": emp.department.name if emp.department else "",
                "designation": emp.designation.name if emp.designation else "",
                "status": log.status,
                "clock_in_time": log.clock_in_time.isoformat() if log.clock_in_time else "",
                "clock_out_time": log.clock_out_time.isoformat() if log.clock_out_time else "",
                "is_late": log.is_late,
                "total_hours": str(log.total_hours) if log.total_hours else "",
                "morning_intent": " | ".join(intent_items)
                if intent_items
                else (log.morning_intent or ""),
                "evening_summary": " | ".join(output_items)
                if output_items
                else (log.evening_summary or ""),
                "work_item_count": len(entries),
                "general_notes": log.general_notes or "",
            }
            report_rows.append(row)

        # ── CSV Export ──
        output_format = request.query_params.get("format", "json")

        if output_format == "csv":
            response = HttpResponse(content_type="text/csv")
            filename = f"attendance_report_{from_date}_to_{to_date}.csv"
            response["Content-Disposition"] = f'attachment; filename="{filename}"'

            if report_rows:
                writer = csv.DictWriter(response, fieldnames=report_rows[0].keys())
                writer.writeheader()
                writer.writerows(report_rows)
            else:
                writer = csv.writer(response)
                writer.writerow(["No records found for the given date range."])

            return response

        # ── JSON Response ──
        # Summary stats
        total_days = (to_date - from_date).days + 1
        total_records = len(report_rows)
        late_count = sum(1 for r in report_rows if r["is_late"])
        missing_count = sum(1 for r in report_rows if r["status"] == "missing")

        return Response(
            {
                "report": {
                    "from_date": str(from_date),
                    "to_date": str(to_date),
                    "total_days": total_days,
                    "total_records": total_records,
                    "late_count": late_count,
                    "missing_count": missing_count,
                },
                "rows": report_rows,
            }
        )
