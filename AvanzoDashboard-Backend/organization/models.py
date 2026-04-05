from django.db import models

from core.models import TimeStampedModel


class Department(TimeStampedModel):
    """From admin-settings.tsx: Engineering, Cybersecurity, Design, Marketing."""

    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "departments"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Designation(TimeStampedModel):
    """From admin-settings.tsx: Software Engineer, SecOps Lead, UX Researcher, etc."""

    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "designations"
        ordering = ["name"]

    def __str__(self):
        return self.name
