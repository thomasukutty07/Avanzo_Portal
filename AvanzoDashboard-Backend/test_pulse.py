import os
import django
import sys

# Set up Django environment
sys.path.append(r"c:\Work\avanzo dashboard\AvanzoDashboard-Backend")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from attendance.models import DailyLog, DailyLogEntry
from accounts.models import Employee
from django.utils import timezone
from rest_framework.response import Response

def test_pulse():
    today = timezone.localdate()
    employees = Employee.objects.filter(is_active=True, status="active")
    
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
    
    result = {
        "date": str(today),
        "total_employees": total,
        "clocked_in": clocked_in,
        "missing": missing,
        "late": late,
        "on_time": clocked_in - late,
        "employees_count": len(pulse_data),
    }
    print(result)

if __name__ == "__main__":
    try:
        test_pulse()
        print("Pulse test passed!")
    except Exception as e:
        import traceback
        traceback.print_exc()
