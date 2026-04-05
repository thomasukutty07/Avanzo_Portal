from django.contrib import admin

from .models import DailyLog, DailyLogEntry


class DailyLogEntryInline(admin.TabularInline):
    """Show entries inline within the DailyLog admin page."""

    model = DailyLogEntry
    extra = 0
    readonly_fields = ("id", "created_at")
    fields = (
        "project",
        "custom_label",
        "intent_text",
        "output_text",
        "outcome",
        "priority_order",
    )


@admin.register(DailyLog)
class DailyLogAdmin(admin.ModelAdmin):
    list_display = (
        "employee",
        "date",
        "status",
        "clock_in_time",
        "clock_out_time",
        "is_late",
        "total_hours",
        "entry_count",
    )
    list_filter = ("status", "is_late", "date")
    search_fields = ("employee__email", "employee__first_name", "employee__last_name")
    date_hierarchy = "date"
    readonly_fields = ("total_hours",)
    inlines = [DailyLogEntryInline]

    def entry_count(self, obj):
        return obj.entries.count()

    entry_count.short_description = "Work Items"


@admin.register(DailyLogEntry)
class DailyLogEntryAdmin(admin.ModelAdmin):
    list_display = (
        "daily_log",
        "display_label",
        "outcome",
        "priority_order",
        "created_at",
    )
    list_filter = ("outcome",)
    search_fields = ("intent_text", "output_text", "custom_label")
