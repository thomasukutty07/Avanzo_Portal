from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import DailyLog
from .serializers import ClockInSerializer, ClockOutSerializer, DailyLogSerializer


class AttendanceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Handles daily standup logging.
    Provides GET /api/attendance/ to see personal history.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = DailyLogSerializer

    def get_queryset(self):
        # Users can only see their own attendance logs by default
        if getattr(self, "swagger_fake_view", False):
            return DailyLog.objects.none()
        return DailyLog.objects.filter(employee=self.request.user)

    @action(detail=False, methods=["post"], url_path="clock-in")
    def clock_in(self, request):
        today = timezone.localdate()

        # 1. Validate the input
        serializer = ClockInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # 2. Get or create today's record
        log, created = DailyLog.objects.get_or_create(employee=request.user, date=today)

        # 3. Mistake-proofing: Prevent double clock-ins
        if log.has_clocked_in:
            return Response(
                {"detail": "You have already submitted your morning standup today."},
                status=status.HTTP_409_CONFLICT,
            )

        # 4. Save the intent and exact time
        log.morning_intent = serializer.validated_data["morning_intent"]
        log.clock_in_time = timezone.now()
        log.save()

        return Response(DailyLogSerializer(log).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["patch"], url_path="clock-out")
    def clock_out(self, request):
        today = timezone.localdate()

        # 1. Find today's record
        try:
            log = DailyLog.objects.get(employee=request.user, date=today)
        except DailyLog.DoesNotExist:
            return Response(
                {"detail": "You must submit a morning clock-in before you can clock out."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 2. Mistake-proofing: Prevent double clock-outs
        if log.has_clocked_out:
            return Response(
                {"detail": "You have already clocked out for the day."},
                status=status.HTTP_409_CONFLICT,
            )

        # 3. Validate input and save
        serializer = ClockOutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        log.evening_summary = serializer.validated_data["evening_summary"]
        log.clock_out_time = timezone.now()
        log.save()

        return Response(DailyLogSerializer(log).data, status=status.HTTP_200_OK)
