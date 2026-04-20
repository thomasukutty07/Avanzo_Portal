from rest_framework import viewsets

class TenantAwareViewSetMixin:
    """
    Mixin to automatically filter querysets by the request user's tenant
    and assign the tenant during creation.
    """

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if user.is_authenticated:
            if user.tenant:
                # If the model has a tenant field, filter by it
                if hasattr(queryset.model, "tenant"):
                    return queryset.filter(tenant=user.tenant)
                # If it's the Employee model, we can also filter by tenant directly
                # (although queryset.model.tenant check already covers this if it inherits properly)
                return queryset
            
            # FAIL-SAFE: Authenticated user with no tenant sees NOTHING
            return queryset.none()
        
        # Public access (if allowed by permissions) returns original queryset
        return queryset

    def perform_create(self, serializer):
        from rest_framework.exceptions import ValidationError
        
        if self.request.user.is_authenticated:
            if self.request.user.tenant:
                serializer.save(tenant=self.request.user.tenant)
            else:
                raise ValidationError({
                    "detail": "Data isolation error: Your account is not associated with any Organization. Please contact support or run the initialization script."
                })
        else:
            # For public registration views, we allow null tenant if the serializer handles it
            serializer.save()
