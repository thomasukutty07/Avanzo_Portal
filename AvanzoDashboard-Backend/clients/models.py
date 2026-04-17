from django.db import models


class Client(models.Model):
    name = models.CharField(max_length=100)
    schema_name = models.CharField(max_length=100, unique=True, default="public")
    created_on = models.DateField(auto_now_add=True)

    class Meta:
        db_table = "clients"

    def __str__(self):
        return self.name


class Domain(models.Model):
    domain = models.CharField(max_length=253, unique=True)
    tenant = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="domains")
    is_primary = models.BooleanField(default=True)

    class Meta:
        db_table = "client_domains"

    def __str__(self):
        return self.domain
