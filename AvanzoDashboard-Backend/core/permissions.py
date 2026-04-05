from rest_framework.permissions import BasePermission

from core.constants import RoleNames


def _has_role(user, *role_names: str) -> bool:
    """Shared helper to check if the authenticated user has one of the given roles."""
    return (
        user.is_authenticated
        and user.access_role is not None
        and user.access_role.name in role_names
    )


class IsAdmin(BasePermission):
    """Admin-only access (Settings page, system config)."""

    def has_permission(self, request, view):
        return _has_role(request.user, RoleNames.ADMIN)


class IsAdminOrHR(BasePermission):
    """Admin or HR access (User management)."""

    def has_permission(self, request, view):
        return _has_role(request.user, RoleNames.ADMIN, RoleNames.HR)


class IsHR(BasePermission):
    """HR access (Directory management, Tier-2 leave approvals)."""

    def has_permission(self, request, view):
        return _has_role(request.user, RoleNames.HR)


class IsTeamLead(BasePermission):
    """Team Lead access (team management, Tier-1 leave approvals)."""

    def has_permission(self, request, view):
        return _has_role(request.user, RoleNames.TEAM_LEAD)


class IsTeamLeadOrAdmin(BasePermission):
    """CRM modification, project/client CRUD."""

    def has_permission(self, request, view):
        return _has_role(request.user, *RoleNames.TEAM_LEAD_OR_ADMIN)


class IsTeamLeadOrAbove(BasePermission):
    """Ticket resolution — Team Lead, HR, or Admin."""

    def has_permission(self, request, view):
        return _has_role(request.user, *RoleNames.TEAM_LEAD_OR_ABOVE)
