from rest_framework.permissions import BasePermission

from core.constants import RoleNames


def _has_role(user, *role_names: str) -> bool:
    """Shared helper to check if the authenticated user has one of the given roles."""
    return user.is_authenticated and user.role_name in role_names


class IsAdmin(BasePermission):
    """Admin-only access (Settings page, system config)."""

    def has_permission(self, request, view):
        return _has_role(request.user, RoleNames.ADMIN)


class IsAdminOrHR(BasePermission):
    """Admin or HR access (User management)."""

    def has_permission(self, request, view):
        return _has_role(request.user, *RoleNames.ADMIN_OR_HR_OR_ABOVE)


class IsAdminOrHRReadOnly(BasePermission):
    """Admin has full access, HR has read-only access (for metadata selection)."""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.user.role_name in (RoleNames.ADMIN, RoleNames.ORGANIZATION):
            return True

        # Allow all authenticated users to VIEW (GET/HEAD/OPTIONS)
        from rest_framework.permissions import SAFE_METHODS

        if request.method in SAFE_METHODS:
            return True

        return False


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
