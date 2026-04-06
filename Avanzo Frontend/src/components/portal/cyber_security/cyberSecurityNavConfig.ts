import type { LucideIcon } from "lucide-react"
import {
  AlertTriangle,
  BarChart3,
  LayoutDashboard,
  Megaphone,
  CalendarRange,
  CheckSquare
} from "lucide-react"

export type CyberSecurityNavItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export const CYBER_SECURITY_NAV_ITEMS: CyberSecurityNavItem[] = [
  { to: "/security", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/security/tasks", label: "My Task", icon: CheckSquare },
  { to: "/security/incidents", label: "Incidents", icon: AlertTriangle },
  { to: "/security/leave", label: "Leave Request", icon: CalendarRange },
  { to: "/security/announcements", label: "Announcements", icon: Megaphone },
  { to: "/security/reports", label: "Reports", icon: BarChart3 },
]
