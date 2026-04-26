from django.contrib import admin

from .models import ActivityEvent


@admin.register(ActivityEvent)
class ActivityEventAdmin(admin.ModelAdmin):
    list_display = ["event_type", "actor", "title", "timestamp", "department"]
    list_filter = ["event_type", "department", "timestamp"]
    search_fields = ["title", "detail", "actor__email", "actor__first_name"]
    readonly_fields = [
        "event_type",
        "actor",
        "title",
        "detail",
        "timestamp",
        "department",
        "content_type",
        "object_id",
        "icon",
        "metadata",
    ]
    date_hierarchy = "timestamp"
    ordering = ["-timestamp"]

    def has_add_permission(self, request):
        """ActivityEvents are created by signals only — never manually."""
        return False

    def has_change_permission(self, request, obj=None):
        """Immutable records."""
        return False
