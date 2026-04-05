# Load the Celery app when Django starts, so that @shared_task
# decorators in any app's tasks.py are registered automatically.
from .celery import app as celery_app

__all__ = ("celery_app",)
