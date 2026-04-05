import type { DesignNavRule } from "./DesignHtmlView"

export const quantumAdminNavRules: DesignNavRule[] = [
  { match: "User Management", to: "/users" },
  { match: "Department Management", to: "/departments" },
  { match: "Reports & Analytics", to: "/reports" },
  { match: "Notifications", to: "/admin-notifications" },
  { match: "Announcements", to: "/admin-announcements" },
  { match: "Settings", to: "/settings" },
  { match: "Dashboard", to: "/" },
]

export const hrAdminNavRules: DesignNavRule[] = [
  { match: "Employee Management", to: "/employees" },
  { match: "Employee Registration", to: "/employee-registration" },
  { match: "Attendance Management", to: "/attendance" },
  { match: "Leave Management", to: "/leave" },
  { match: "Reports", to: "/hrreports" },
  { match: "Announcements", to: "/hr-announcements" },
  { match: "Settings", to: "/settings" },
  { match: "Dashboard", to: "/" },
]

export const employeeNavRules: DesignNavRule[] = [
  { match: "My Tasks", to: "/my-tasks" },
  { match: "Work Schedule", to: "/work-schedule" },
  { match: "Leave Requests", to: "/employee-leave" },
  { match: "Notifications", to: "/employee-notifications" },
  { match: "Announcements", to: "/announcements" },
  { match: "Dashboard", to: "/" },
]

export const teamLeadNavRules: DesignNavRule[] = [
  { match: "Team Tasks", to: "/tasks" },
  { match: "Projects", to: "/projects" },
  { match: "Team Members", to: "/team" },
  { match: "Announcements", to: "/team-announcements" },
  { match: "Reports", to: "/team-reports" },
  { match: "Dashboard", to: "/" },
]

export const technicalNavRules: DesignNavRule[] = [
  { match: "Technical Tasks", to: "/technical/tasks" },
  { match: "Project Status", to: "/technical/projects" },
  { match: "Sprint Overview", to: "/technical/sprints" },
  { match: "Bug Tracking", to: "/technical/bugs" },
  { match: "Announcements", to: "/technical/announcements" },
  { match: "Reports", to: "/technical/reports" },
  { match: "Dashboard", to: "/technical" },
]

export const securityNavRules: DesignNavRule[] = [
  { match: "Monitoring", to: "/security/monitoring" },
  { match: "Incidents", to: "/security/incidents" },
  { match: "Vulnerabilities", to: "/security/vulnerabilities" },
  { match: "Announcements", to: "/security/announcements" },
  { match: "Reports", to: "/security/reports" },
  { match: "Dashboard", to: "/security" },
]

export const superAdminNavRules: DesignNavRule[] = [
  { match: "Organizations", to: "/super-admin/organizations" },
  { match: "Pending Approvals", to: "/super-admin/pending" },
  { match: "Reports", to: "/super-admin/reports" },
  { match: "Settings", to: "/super-admin/settings" },
  /* Same `to` as below: list Dashboard before Support/Documentation so `/super-admin` highlights Dashboard */
  { match: "Dashboard", to: "/super-admin" },
  { match: "Support", to: "/super-admin" },
  { match: "Documentation", to: "/super-admin" },
]
