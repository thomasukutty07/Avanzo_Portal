from django.db.models.signals import pre_save
from django.dispatch import receiver

from projects.models import Task

from .services import SkillProgressService


@receiver(pre_save, sender=Task)
def handle_task_completion(sender, instance, **kwargs):
    """
    When Task status flips to RESOLVED, bump skill XP for assignee.
    Uses pre_save so we can detect the transition (old vs new status).
    """
    if not instance.pk:
        return  # New task, skip

    try:
        old = Task.objects.get(pk=instance.pk)
    except Task.DoesNotExist:
        return

    # Only fire when status changes TO resolved
    if old.status != Task.Status.RESOLVED and instance.status == Task.Status.RESOLVED:
        SkillProgressService.auto_update(instance)
