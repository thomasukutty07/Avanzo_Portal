import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  AlertCircle,
  Megaphone,
  BarChart3,
} from "lucide-react"

export const ORGANIZATION_ADMIN_NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/users", label: "Users", icon: ClipboardList },
  { to: "/departments", label: "Departments", icon: CalendarDays },
  { to: "/admin-notifications", label: "Notifications", icon: AlertCircle },
  { to: "/admin-announcements", label: "Announcements", icon: Megaphone },
  { to: "/reports", label: "Reports", icon: BarChart3 },
]
