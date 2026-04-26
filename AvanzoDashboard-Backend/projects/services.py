from django.db.models import Avg, Sum

from .models import Task


class EstimationService:
    @staticmethod
    def calculate_actual_hours(task: Task):
        """
        Sum all distributed hours across daily log entries for this task
        and update the task's actual_hours field.
        """
        total = task.work_log_entries.aggregate(total_hours=Sum("distributed_hours"))["total_hours"]

        task.actual_hours = total or 0
        task.save(update_fields=["actual_hours"])

    @staticmethod
    def get_suggestion(service_id: str, complexity: int):
        """
        Historical lookup: given a project service type and task complexity,
        what is the historical average completion time?
        """
        historical_tasks = Task.objects.filter(
            project__service_id=service_id,
            complexity=complexity,
            status=Task.Status.RESOLVED,
            actual_hours__isnull=False,
        )

        stats = historical_tasks.aggregate(avg_hours=Avg("actual_hours"))

        sample_size = historical_tasks.count()
        avg_hours = float(stats["avg_hours"] or 0)

        # TL accuracy is global for a single team leader usually, but here
        # we can provide rough global accuracy for this task bucket.
        estimated_avg = (
            historical_tasks.aggregate(Avg("estimated_hours"))["estimated_hours__avg"] or 1
        )
        accuracy_ratio = avg_hours / float(estimated_avg) if estimated_avg else 1.0

        if accuracy_ratio > 1.2:
            msg = (
                f"Your past estimates for complexity-{complexity} tasks average "
                f"{(accuracy_ratio - 1) * 100:.0f}% under actual."
            )
        elif accuracy_ratio < 0.8:
            msg = (
                f"Your past estimates for complexity-{complexity} tasks average "
                f"{(1 - accuracy_ratio) * 100:.0f}% over actual."
            )
        else:
            msg = (
                f"Your past estimates for complexity-{complexity} tasks have been highly accurate."
            )

        return {
            "suggested_hours": avg_hours,
            "historical_avg_hours": avg_hours,
            "sample_size": sample_size,
            "tl_accuracy_ratio": accuracy_ratio,
            "message": msg,
        }
