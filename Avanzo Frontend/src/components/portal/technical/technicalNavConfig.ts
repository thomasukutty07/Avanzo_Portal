import type { LucideIcon } from "lucide-react"
import {
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
  { to: "/technical/tasks", label: "Technical tasks", icon: ListTodo },
  { to: "/technical/leave", label: "Leave requests", icon: Umbrella },
  { to: "/technical/announcements", label: "Announcements", icon: Megaphone },
  { to: "/technical/profile", label: "My profile", icon: User },
]
