from django.db import models
from rest_framework import viewsets

class TenantFilterMixin:
    """
    Mixin to automatically filter querysets by the logged-in user's tenant.
    This provides 'Option B' (Row-level multi-tenancy) without subdomains.
    """
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.is_authenticated and hasattr(user, 'tenant') and user.tenant:
            # Filter the queryset if the model has a 'tenant' field
            if hasattr(queryset.model, 'tenant'):
                return queryset.filter(tenant=user.tenant)
        
        return queryset

    def perform_create(self, serializer):
        """Automatically link new objects to the user's tenant."""
        if hasattr(self.request.user, 'tenant') and self.request.user.tenant:
            serializer.save(tenant=self.request.user.tenant)
        else:
            serializer.save()
