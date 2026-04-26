from django.db import transaction

from .models import DailyLog


class AttendanceService:
    @staticmethod
    @transaction.atomic
    def distribute_hours_to_entries(daily_log: DailyLog):
        """
        Auto-distribute total_hours across entries based on complexity.
        If an employee forgot to clock out (e.g. system auto-clockout at midnight),
        total_hours might be 8 default hours.
        """
        entries = list(daily_log.entries.select_related("task").all())
        total_hours = daily_log.total_hours

        if not total_hours or not entries:
            return

        # Calculate total complexity
        total_complexity = 0
        for entry in entries:
            complexity = entry.task.complexity if entry.task else 1
            total_complexity += complexity

        if total_complexity == 0:
            return

        # Distribute
        updated_entries = []
        for entry in entries:
            complexity = entry.task.complexity if entry.task else 1
            entry.distributed_hours = float(total_hours) * (complexity / total_complexity)
            updated_entries.append(entry)

        from .models import DailyLogEntry

        DailyLogEntry.objects.bulk_update(updated_entries, ["distributed_hours"])

        # Auto-update actual_hours on the underlying tasks
        from projects.services import EstimationService

        # Get unique tasks
        tasks_to_update = {entry.task for entry in updated_entries if entry.task}
        for task in tasks_to_update:
            EstimationService.calculate_actual_hours(task)
