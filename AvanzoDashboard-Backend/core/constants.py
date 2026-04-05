"""Role constants used across the project to avoid magic strings."""


class RoleNames:
    """
    Centralized role name constants.
    These must match the AccessRole rows seeded in the database.
    """

    EMPLOYEE = "Employee"
    TEAM_LEAD = "Team Lead"
    HR = "HR"
    ADMIN = "Admin"
    SUPER_ADMIN = "Super Admin"
    ORGANIZATION = "Organization"

    # Groups for permission checks
    TEAM_LEAD_OR_ADMIN = (TEAM_LEAD, ADMIN, SUPER_ADMIN, ORGANIZATION)
    TEAM_LEAD_OR_ABOVE = (TEAM_LEAD, HR, ADMIN, SUPER_ADMIN, ORGANIZATION)
    ADMIN_OR_HR_OR_ABOVE = (HR, ADMIN, SUPER_ADMIN, ORGANIZATION)
