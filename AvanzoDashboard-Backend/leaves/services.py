from accounts.models import Employee
from notifications.services import NotificationService

from .models import LeaveRequest


class LeaveNotificationService:
    """
    Handles automated alerts for the two-tier Leave Management lifecycle.
    """

    @staticmethod
    def notify_tl_new_request(leave_request: LeaveRequest):
        """Step 1: Notify the specific Team Lead assigned to the employee."""
        if leave_request.employee.team_lead:
            name = leave_request.employee.get_full_name()
            message = f"{name} has requested leave. Please review."
            NotificationService.send(
                recipient=leave_request.employee.team_lead,
                title="New Team Leave Request",
                message=message,
                n_type="info",
                action_url=f"/dashboard/team-lead/leaves/{leave_request.id}",
            )

    @staticmethod
    def notify_hr_tl_approved(leave_request: LeaveRequest):
        """Step 2: Notify HR after Team Lead gives initial clearance."""
        hr_users = Employee.objects.filter(access_role__name="HR")
        for hr in hr_users:
            name = leave_request.employee.get_full_name()
            message = f"{name}'s leave was approved by TL. Final sign-off required."
            NotificationService.send(
                recipient=hr,
                title="Leave: Pending HR Final Sign-off",
                message=message,
                n_type="info",
                action_url=f"/dashboard/hr/leaves/{leave_request.id}",
            )

    @staticmethod
    def notify_employee_status_update(leave_request: LeaveRequest):
        """Step 3: Notify the employee of the final decision or rejection."""
        status_label = leave_request.get_status_display().upper()
        n_type = "success" if leave_request.status == LeaveRequest.Status.APPROVED else "urgent"

        message = (
            f"Your leave request for {leave_request.start_date} has been {leave_request.status}."
        )

        NotificationService.send(
            recipient=leave_request.employee,
            title=f"Leave Request {status_label}",
            message=message,
            n_type=n_type,
            action_url="/dashboard/employee/leaves",
        )
