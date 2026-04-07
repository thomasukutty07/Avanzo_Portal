import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  LayoutDashboard,
  ListTodo,
  Megaphone,
  Umbrella,
  User
} from "lucide-react"

export type TechnicalNavItem = {
  to: string
  label: string
  icon: LucideIcon
  /** Use for exact match on `/technical` only */
  end?: boolean
}

export const TECHNICAL_NAV_ITEMS: TechnicalNavItem[] = [
  { to: "/technical", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/technical/tasks", label: "Technical Tasks", icon: ListTodo },
  { to: "/technical/leave", label: "Leave Requests", icon: Umbrella },
  { to: "/technical/announcements", label: "Announcements", icon: Megaphone },
  { to: "/technical/reports", label: "Reports", icon: BarChart3 },
  { to: "/technical/profile", label: "My Profile", icon: User },
]
