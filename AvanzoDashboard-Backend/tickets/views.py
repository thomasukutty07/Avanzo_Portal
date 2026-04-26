from django.db import models
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.mixins import TenantFilterMixin
from core.permissions import IsTeamLeadOrAbove

from .models import Ticket
from .serializers import (
    TicketCreateSerializer,
    TicketResolveSerializer,
    TicketSerializer,
)
from .services import TicketNotificationService, TicketRoutingService


class TicketViewSet(TenantFilterMixin, viewsets.ModelViewSet):
    """
    Main ticket API.

    - Any authenticated user can CREATE a ticket
    - Users see tickets they created OR are assigned to
    - Only the assignee (or Admin) can resolve a ticket
    """

    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return TicketCreateSerializer
        if self.action == "resolve":
            return TicketResolveSerializer
        return TicketSerializer

    def get_queryset(self):
        """
        Row-level security with Tenant isolation:
        - Admin sees all tickets within tenant
        - HR sees COMPLIANCE tickets assigned to them + all tickets they created within tenant
        - TL sees tickets assigned to them + all tickets they created within tenant
        - Employee sees only tickets they created within tenant
        """
        if getattr(self, "swagger_fake_view", False):
            return Ticket.objects.none()

        user = self.request.user
        
        # ── Step 1: Tenant Isolation ──────────────────────────
        qs = super().get_queryset()

        # ── Step 2: Role-Based Filtering ──────────────────────
        if user.is_admin:
            return qs

        # Everyone else sees tickets they created OR are assigned to
        return qs.filter(
            models.Q(created_by=user) | models.Q(assigned_to=user)
        )

    def perform_create(self, serializer):
        """
        When a ticket is created:
        1. Set created_by to the current user
        2. Auto-assign to the right person based on ticket type
        3. If CAPACITY ticket, capture a snapshot of their current tasks
        4. Send notification to the assignee
        """
        ticket = serializer.save(
            created_by=self.request.user,
            tenant=self.request.user.tenant
        )

        # Auto-assign based on routing rules
        TicketRoutingService.assign_ticket(ticket)

        # Capture task snapshot for CAPACITY tickets
        TicketRoutingService.capture_task_snapshot(ticket)

        # Notify the person who needs to handle this
        TicketNotificationService.notify_assignee(ticket)

    # ── Custom Actions ─────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="mine")
    def my_tickets(self, request):
        """GET /api/tickets/mine/ — tickets I created."""
        tickets = Ticket.objects.filter(created_by=request.user)
        serializer = TicketSerializer(tickets, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="assigned")
    def assigned_to_me(self, request):
        """GET /api/tickets/assigned/ — tickets I need to handle."""
        tickets = Ticket.objects.filter(assigned_to=request.user)
        serializer = TicketSerializer(tickets, many=True)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["patch"],
        url_path="review",
        permission_classes=[IsTeamLeadOrAbove],
    )
    def mark_in_review(self, request, pk=None):
        """
        PATCH /api/tickets/{id}/review/
        Acknowledges that someone is looking at the ticket.
        """
        ticket = self.get_object()

        if ticket.status != Ticket.Status.OPEN:
            return Response(
                {"detail": "Only OPEN tickets can be moved to review."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ticket.status = Ticket.Status.IN_REVIEW
        ticket.save()

        TicketNotificationService.notify_creator_in_review(ticket)

        return Response(
            TicketSerializer(ticket).data, status=status.HTTP_200_OK
        )

    @action(
        detail=True,
        methods=["patch"],
        url_path="resolve",
        permission_classes=[IsTeamLeadOrAbove],
    )
    def resolve(self, request, pk=None):
        """
        PATCH /api/tickets/{id}/resolve/
        Closes the ticket. Requires a resolution_note explaining what was done.
        """
        ticket = self.get_object()

        if ticket.status == Ticket.Status.RESOLVED:
            return Response(
                {"detail": "This ticket is already resolved."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate the resolution note
        serializer = TicketResolveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ticket.status = Ticket.Status.RESOLVED
        ticket.resolution_note = serializer.validated_data["resolution_note"]
        ticket.resolved_by = request.user
        ticket.resolved_at = timezone.now()
        ticket.save()

        TicketNotificationService.notify_creator_resolved(ticket)

        return Response(
            TicketSerializer(ticket).data, status=status.HTTP_200_OK
        )
