from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import AccessRole, Employee


@admin.register(AccessRole)
class AccessRoleAdmin(admin.ModelAdmin):
    list_display = ("name", "description")
    search_fields = ("name",)


@admin.register(Employee)
class EmployeeAdmin(UserAdmin):
    model = Employee
    list_display = ("email", "first_name", "last_name", "access_role", "department", "status")
    list_filter = ("access_role", "status", "department", "is_active")
    search_fields = ("email", "first_name", "last_name", "employee_id")
    ordering = ("-date_of_joining",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Personal Info",
            {"fields": ("first_name", "last_name", "phone", "avatar", "employee_id")},
        ),
        (
            "Organization",
            {
                "fields": (
                    "access_role",
                    "department",
                    "designation",
                    "team_lead",
                    "date_of_joining",
                )
            },
        ),
        ("Status", {"fields": ("status",)}),
        (
            "Django Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Timestamps", {"fields": ("last_login",)}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "first_name",
                    "last_name",
                    "password1",
                    "password2",
                    "access_role",
                ),
            },
        ),
    )
