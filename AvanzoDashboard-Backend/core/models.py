import uuid

from django.db import models


class TimeStampedModel(models.Model):
    """Audit timestamps on every table."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class TenantAwareModel(TimeStampedModel):
    """Base for any model that belongs to a specific organization/tenant."""

    tenant = models.ForeignKey(
        "clients.Client", on_delete=models.CASCADE, related_name="%(class)ss",
        null=True, blank=True
    )

    class Meta:
        abstract = True
