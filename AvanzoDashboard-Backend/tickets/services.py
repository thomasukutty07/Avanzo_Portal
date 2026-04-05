from accounts.models import Employee
from notifications.services import NotificationService
from projects.models import Task


class TicketRoutingService:
    """
    Decides WHO a ticket gets assigned to, based on its type.
    Also captures the task snapshot for CAPACITY tickets.
    """

    @staticmethod
    def assign_ticket(ticket):
        """
        Auto-routing rules:
        - CAPACITY → employee's own Team Lead
        - COMPLIANCE → first active HR user
        - GENERAL / TECH → first active Admin user
        """
        creator = ticket.created_by

        if ticket.ticket_type == "capacity":
            # Route to the employee's direct Team Lead
            if creator.team_lead:
                ticket.assigned_to = creator.team_lead
            else:
                # Fallback: assign to any Admin if no TL is set
                admin = Employee.objects.filter(
                    access_role__name="Admin", is_active=True
                ).first()
                ticket.assigned_to = admin

        elif ticket.ticket_type == "compliance":
            # Route to any HR user
            hr_user = Employee.objects.filter(
                access_role__name="HR", is_active=True
            ).first()
            ticket.assigned_to = hr_user

        else:
            # GENERAL and TECH → route to Admin
            admin = Employee.objects.filter(
                access_role__name="Admin", is_active=True
            ).first()
            ticket.assigned_to = admin

        ticket.save()

    @staticmethod
    def capture_task_snapshot(ticket):
        """
        For CAPACITY tickets only.
        Freezes the employee's current task list as JSON evidence.
        Even if tasks change later, this snapshot stays the same.
        """
        if ticket.ticket_type != "capacity":
            return

        tasks = Task.objects.filter(
            assignee=ticket.created_by
        ).exclude(
            status="resolved"
        ).values(
            "id", "title", "priority", "status", "start_date", "due_date"
        )

        # Convert UUIDs and dates to strings for JSON serialization
        snapshot = []
        for task in tasks:
            snapshot.append({
                "task_id": str(task["id"]),
                "title": task["title"],
                "priority": task["priority"],
                "status": task["status"],
                "start_date": str(task["start_date"]) if task["start_date"] else None,
                "due_date": str(task["due_date"]) if task["due_date"] else None,
            })

        ticket.task_snapshot = snapshot
        ticket.save()


class TicketNotificationService:
    """Handles all notifications related to tickets."""

    @staticmethod
    def notify_assignee(ticket):
        """Tell the assigned person they have a new ticket to handle."""
        if not ticket.assigned_to:
            return

        type_labels = {
            "capacity": "Capacity Overload",
            "compliance": "Compliance Report",
            "general": "General Issue",
            "tech": "Technical Issue",
        }

        NotificationService.send(
            recipient=ticket.assigned_to,
            title=f"New {type_labels.get(ticket.ticket_type, 'Ticket')} Assigned",
            message=(
                f"{ticket.created_by.get_full_name()} has raised a ticket: "
                f"\"{ticket.title}\". Please review."
            ),
            n_type="urgent" if ticket.ticket_type == "capacity" else "info",
            action_url=f"/dashboard/tickets/{ticket.id}",
        )

    @staticmethod
    def notify_creator_resolved(ticket):
        """Tell the person who filed the ticket that it's been resolved."""
        NotificationService.send(
            recipient=ticket.created_by,
            title="Your Ticket Has Been Resolved",
            message=(
                f"Your ticket \"{ticket.title}\" has been resolved by "
                f"{ticket.resolved_by.get_full_name()}."
            ),
            n_type="success",
            action_url=f"/dashboard/tickets/{ticket.id}",
        )

    @staticmethod
    def notify_creator_in_review(ticket):
        """Tell the creator someone is looking at their ticket."""
        NotificationService.send(
            recipient=ticket.created_by,
            title="Your Ticket Is Being Reviewed",
            message=f"Your ticket \"{ticket.title}\" is now being reviewed.",
            n_type="info",
            action_url=f"/dashboard/tickets/{ticket.id}",
        )
