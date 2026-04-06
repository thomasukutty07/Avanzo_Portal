import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  AlertCircle,
  Megaphone,
  BarChart3,
  UserPlus
} from "lucide-react"

export const ORGANIZATION_ADMIN_NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/users", label: "Employee Management", icon: ClipboardList },
  { to: "/admin/register-employee", label: "Employee Registration", icon: UserPlus },
  { to: "/departments", label: "Departments", icon: CalendarDays },
  { to: "/admin-notifications", label: "Notifications", icon: AlertCircle },
  { to: "/admin-announcements", label: "Announcements", icon: Megaphone },
  { to: "/reports", label: "Reports", icon: BarChart3 },
]
