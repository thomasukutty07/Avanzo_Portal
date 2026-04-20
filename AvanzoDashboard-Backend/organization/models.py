from django.db import models

from core.models import TenantAwareModel, TimeStampedModel


class Department(TenantAwareModel):
    """From admin-settings.tsx: Engineering, Cybersecurity, Design, Marketing."""

    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "departments"
        ordering = ["name"]
        unique_together = ("name", "tenant")

    def __str__(self):
        return self.name


class Designation(TenantAwareModel):
    """From admin-settings.tsx: Software Engineer, SecOps Lead, UX Researcher, etc."""

    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "designations"
        ordering = ["name"]
        unique_together = ("name", "tenant")

    def __str__(self):
        return self.name
