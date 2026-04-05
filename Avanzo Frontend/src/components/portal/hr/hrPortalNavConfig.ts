import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  Megaphone,
  Settings,
  UserPlus,
  Users,
} from "lucide-react"

export type HRNavItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export const HR_PORTAL_NAV: HRNavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/employees", label: "Employee Management", icon: Users },
  { to: "/employee-registration", label: "Employee Registration", icon: UserPlus },
  { to: "/attendance", label: "Attendance Management", icon: CalendarDays },
  { to: "/leave", label: "Leave Management", icon: CalendarDays },
  { to: "/hrreports", label: "Reports", icon: BarChart3 },
  { to: "/hr-announcements", label: "Announcements", icon: Megaphone },
  { to: "/settings", label: "Settings", icon: Settings },
]
