"""
Activity Feed signals — auto-log system events.

Hooks into existing models via post_save to create ActivityEvent records
whenever something significant happens (clock-in, task completion, etc.).

Edge cases handled:
- DailyLog fires on every save → check status to avoid duplicates
- LeaveRequest skips 'tl_approved' intermediate state (clutters feed)
- Task progress updates NOT logged (spam). Only creation + completion.
- Employee department can be NULL → FK is nullable.
"""

import logging

from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.models import Employee
from attendance.models import DailyLog
from leaves.models import LeaveRequest
from notifications.models import Broadcast
from projects.models import Project, Task
from tickets.models import Ticket

from .models import ActivityEvent

logger = logging.getLogger(__name__)


# ── Attendance ────────────────────────────────────────────────


@receiver(post_save, sender=DailyLog)
def log_attendance_activity(sender, instance, created, **kwargs):
    """
    Log clock-in and clock-out events.
    Only triggers when status transitions to CLOCKED_IN or CLOCKED_OUT.
    Avoids duplicate events by checking if event already exists for this log.
    """
    ct = ContentType.objects.get_for_model(DailyLog)

    if instance.status == DailyLog.Status.CLOCKED_IN and instance.clock_in_time:
        # Avoid duplicate: check if clock_in event already logged for this DailyLog
        if ActivityEvent.objects.filter(
            content_type=ct,
            object_id=instance.id,
            event_type=ActivityEvent.EventType.CLOCK_IN,
        ).exists():
            return

        late_text = " (late)" if instance.is_late else ""
        ActivityEvent.objects.create(
            event_type=ActivityEvent.EventType.CLOCK_IN,
            actor=instance.employee,
            title=f"{instance.employee.get_full_name()} clocked in{late_text}",
            department=instance.employee.department,
            content_type=ct,
            object_id=instance.id,
            icon="⏰",
            metadata={"is_late": instance.is_late},
        )

    elif instance.status == DailyLog.Status.CLOCKED_OUT and instance.clock_out_time:
        if ActivityEvent.objects.filter(
            content_type=ct,
            object_id=instance.id,
            event_type=ActivityEvent.EventType.CLOCK_OUT,
        ).exists():
            return

        hours = float(instance.total_hours) if instance.total_hours else 0
        ActivityEvent.objects.create(
            event_type=ActivityEvent.EventType.CLOCK_OUT,
            actor=instance.employee,
            title=f"{instance.employee.get_full_name()} clocked out ({hours}h)",
            department=instance.employee.department,
            content_type=ct,
            object_id=instance.id,
            icon="🏠",
            metadata={"total_hours": hours},
        )


# ── Tasks ─────────────────────────────────────────────────────


@receiver(post_save, sender=Task)
def log_task_activity(sender, instance, created, **kwargs):
    """
    Log task creation and completion.
    Skips progress updates to avoid spamming the feed.
    """
    ct = ContentType.objects.get_for_model(Task)

    if created:
        ActivityEvent.objects.create(
            event_type=ActivityEvent.EventType.TASK_CREATED,
            actor=instance.assignee,
            title=f"New task: {instance.title}",
            detail=f"Project: {instance.project.title} | Complexity: {instance.complexity}",
            department=instance.project.owning_department,
            content_type=ct,
            object_id=instance.id,
            icon="📋",
            metadata={
                "project_id": str(instance.project.id),
                "complexity": instance.complexity,
            },
        )
    elif instance.status == Task.Status.RESOLVED:
        # Avoid duplicate completion events
        if ActivityEvent.objects.filter(
            content_type=ct,
            object_id=instance.id,
            event_type=ActivityEvent.EventType.TASK_COMPLETED,
        ).exists():
            return

        ActivityEvent.objects.create(
            event_type=ActivityEvent.EventType.TASK_COMPLETED,
            actor=instance.assignee,
            title=f"{instance.assignee.get_full_name()} completed: {instance.title}",
            detail=f"Project: {instance.project.title} | Complexity: {instance.complexity}",
            department=instance.project.owning_department,
            content_type=ct,
            object_id=instance.id,
            icon="✅",
            metadata={
                "project_id": str(instance.project.id),
                "complexity": instance.complexity,
            },
        )


# ── Leave Requests ────────────────────────────────────────────


@receiver(post_save, sender=LeaveRequest)
def log_leave_activity(sender, instance, created, **kwargs):
    """
    Log leave request lifecycle.
    Skips 'tl_approved' (intermediate state — clutters feed).
    Only logs: pending (new request), approved (final), rejected.
    """
    ct = ContentType.objects.get_for_model(LeaveRequest)

    event_map = {
        LeaveRequest.Status.PENDING: (
            ActivityEvent.EventType.LEAVE_REQUESTED,
            f"{instance.employee.get_full_name()} requested {instance.total_days} day(s) leave",
            "📋",
        ),
        LeaveRequest.Status.APPROVED: (
            ActivityEvent.EventType.LEAVE_APPROVED,
            f"{instance.employee.get_full_name()}'s leave approved",
            "✅",
        ),
        LeaveRequest.Status.REJECTED: (
            ActivityEvent.EventType.LEAVE_REJECTED,
            f"{instance.employee.get_full_name()}'s leave rejected",
            "❌",
        ),
    }

    if instance.status not in event_map:
        return  # Skip tl_approved intermediate state

    event_type, title, icon = event_map[instance.status]

    # Avoid duplicate for same status transition
    if ActivityEvent.objects.filter(
        content_type=ct,
        object_id=instance.id,
        event_type=event_type,
    ).exists():
        return

    ActivityEvent.objects.create(
        event_type=event_type,
        actor=instance.employee,
        title=title,
        detail=(
            f"{instance.start_date} to {instance.end_date} ({instance.get_leave_type_display()})"
        ),
        department=instance.employee.department,
        content_type=ct,
        object_id=instance.id,
        icon=icon,
        metadata={
            "leave_type": instance.leave_type,
            "total_days": float(instance.total_days),
        },
    )


# ── Tickets ───────────────────────────────────────────────────


@receiver(post_save, sender=Ticket)
def log_ticket_activity(sender, instance, created, **kwargs):
    """Log ticket creation and resolution."""
    ct = ContentType.objects.get_for_model(Ticket)

    if created:
        ActivityEvent.objects.create(
            event_type=ActivityEvent.EventType.TICKET_CREATED,
            actor=instance.created_by,
            title=(
                f"{instance.created_by.get_full_name()} filed "
                f"{instance.get_ticket_type_display()} ticket"
            ),
            detail=instance.title,
            department=instance.created_by.department,
            content_type=ct,
            object_id=instance.id,
            icon="🎫",
            metadata={"ticket_type": instance.ticket_type},
        )
    elif instance.status == Ticket.Status.RESOLVED and instance.resolved_by:
        if ActivityEvent.objects.filter(
            content_type=ct,
            object_id=instance.id,
            event_type=ActivityEvent.EventType.TICKET_RESOLVED,
        ).exists():
            return

        ActivityEvent.objects.create(
            event_type=ActivityEvent.EventType.TICKET_RESOLVED,
            actor=instance.resolved_by,
            title=f"Ticket resolved: {instance.title}",
            department=instance.created_by.department,
            content_type=ct,
            object_id=instance.id,
            icon="✅",
        )


# ── Projects ─────────────────────────────────────────────────


@receiver(post_save, sender=Project)
def log_project_activity(sender, instance, created, **kwargs):
    """Log project creation and completion."""
    ct = ContentType.objects.get_for_model(Project)

    if created:
        ActivityEvent.objects.create(
            event_type=ActivityEvent.EventType.PROJECT_CREATED,
            actor=instance.manager,
            title=f"New project: {instance.title}",
            department=instance.owning_department,
            content_type=ct,
            object_id=instance.id,
            icon="🚀",
        )
    elif instance.status == Project.Status.COMPLETED:
        if ActivityEvent.objects.filter(
            content_type=ct,
            object_id=instance.id,
            event_type=ActivityEvent.EventType.PROJECT_COMPLETED,
        ).exists():
            return

        ActivityEvent.objects.create(
            event_type=ActivityEvent.EventType.PROJECT_COMPLETED,
            actor=instance.manager,
            title=f"Project completed: {instance.title}",
            department=instance.owning_department,
            content_type=ct,
            object_id=instance.id,
            icon="🏆",
        )


# ── Employees ─────────────────────────────────────────────────


@receiver(post_save, sender=Employee)
def log_employee_joined(sender, instance, created, **kwargs):
    """Log when a new employee is created in the system."""
    if not created:
        return

    ActivityEvent.objects.create(
        event_type=ActivityEvent.EventType.EMPLOYEE_JOINED,
        actor=instance,
        title=f"Welcome {instance.get_full_name()}!",
        detail=f"Department: {instance.department.name if instance.department else 'Unassigned'}",
        department=instance.department,
        content_type=ContentType.objects.get_for_model(Employee),
        object_id=instance.id,
        icon="👋",
    )


# ── Broadcasts ────────────────────────────────────────────────


@receiver(post_save, sender=Broadcast)
def log_broadcast_activity(sender, instance, created, **kwargs):
    """Log when a broadcast announcement is sent."""
    if not created:
        return

    ActivityEvent.objects.create(
        event_type=ActivityEvent.EventType.BROADCAST_SENT,
        actor=instance.created_by,
        title=f"Broadcast: {instance.title}",
        detail=f"Scope: {instance.get_target_scope_display()}",
        department=instance.department,
        content_type=ContentType.objects.get_for_model(Broadcast),
        object_id=instance.id,
        icon="📢",
        metadata={"severity": instance.severity},
    )


# ── WebSockets ────────────────────────────────────────────────


@receiver(post_save, sender=ActivityEvent)
def broadcast_activity_event(sender, instance, created, **kwargs):
    """Broadcast new activity events to connected WebSocket clients."""
    if not created:
        return

    try:
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer

        from .serializers import ActivityEventSerializer

        channel_layer = get_channel_layer()
        if not channel_layer:
            return

        data = ActivityEventSerializer(instance).data
        payload = {"type": "activity_push", "data": data}

        # 1. Org-wide broadcast (Admins/HR)
        async_to_sync(channel_layer.group_send)("org_activity", payload)

        # 2. Department broadcast (Team Leads)
        if instance.department_id:
            async_to_sync(channel_layer.group_send)(
                f"dept_{instance.department_id}_activity", payload
            )

        # 3. Personal broadcast (Actor themselves)
        if instance.actor_id:
            async_to_sync(channel_layer.group_send)(f"user_{instance.actor_id}_activity", payload)

    except Exception as e:
        logger.error(f"Failed to broadcast ActivityEvent via WebSockets: {e}")
