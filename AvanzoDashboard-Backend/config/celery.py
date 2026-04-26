"""
Celery app configuration for the Avanzo Dashboard.

This file is loaded by Django at startup via config/__init__.py.
It auto-discovers tasks from all installed Django apps (any file named tasks.py).

Architecture:
    Redis → Celery Broker → Worker(s) → execute tasks
    Redis → Celery Result Backend → store task results

Workers are started with:
    celery -A config worker --loglevel=info

Periodic tasks (Celery Beat) are started with:
    celery -A config beat --loglevel=info \\
        --scheduler django_celery_beat.schedulers:DatabaseScheduler
"""

import os

from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("avanzo")

# Load Celery settings from Django settings, using the CELERY_ namespace.
# e.g., CELERY_BROKER_URL in settings.py → broker_url in Celery
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover tasks.py in every installed Django app
app.autodiscover_tasks()


# ── Periodic Task Schedule (Celery Beat) ──────────────────────
# These run automatically on a schedule. No cron jobs needed.
app.conf.beat_schedule = {
    # 9:30 AM — Check for employees who haven't clocked in
    "check-morning-missing-930": {
        "task": "attendance.tasks.check_morning_missing",
        "schedule": crontab(hour=9, minute=30, day_of_week="1-5"),
    },
    # 9:45 AM — Second nudge for stragglers
    "check-morning-missing-945": {
        "task": "attendance.tasks.check_morning_missing",
        "schedule": crontab(hour=9, minute=45, day_of_week="1-5"),
    },
    # 5:35 PM — Check for employees who haven't clocked out
    "check-evening-missing-1735": {
        "task": "attendance.tasks.check_evening_missing",
        "schedule": crontab(hour=17, minute=35, day_of_week="1-5"),
    },
    # 5:50 PM — Second nudge
    "check-evening-missing-1750": {
        "task": "attendance.tasks.check_evening_missing",
        "schedule": crontab(hour=17, minute=50, day_of_week="1-5"),
    },
    # 11:55 PM — Mark all remaining employees as MISSING for the day
    "mark-missing-attendance-eod": {
        "task": "attendance.tasks.mark_missing_attendance",
        "schedule": crontab(hour=23, minute=55, day_of_week="1-5"),
    },
    # Sunday 11 PM — Generate weekly performance snapshots for all employees
    "generate-weekly-performance-snapshots": {
        "task": "performance.tasks.generate_weekly_snapshots",
        "schedule": crontab(hour=23, minute=0, day_of_week=0),
    },
}
app.conf.timezone = "Asia/Kolkata"
