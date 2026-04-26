from django.db import models
from django_tenants.models import DomainMixin, TenantMixin


class Client(TenantMixin):
    name = models.CharField(max_length=100)
    created_on = models.DateField(auto_now_add=True)

    # Automatically synchronizes schema when saved
    auto_create_schema = True

    class Meta:
        db_table = "clients"


class Domain(DomainMixin):
    class Meta:
        db_table = "client_domains"
