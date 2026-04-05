// src/components/layout/AppSidebar.tsx
import { useLocation, Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Settings,
  CalendarCheck,
  ClipboardList,
  FileText,
  CheckSquare,
  LogOut,
} from "lucide-react"
import type { UserRole } from "@/types"
import logo from "@/assets/avanzo-logo-black.png"

const navConfig: Record<
  UserRole,
  {
    key: string
    label: string
    icon: React.ComponentType<{ className?: string }>
  }[]
> = {
  Admin: [
    { key: "/",             label: "Dashboard",    icon: LayoutDashboard },
    { key: "/users",        label: "Users",        icon: Users },
    { key: "/departments",  label: "Departments",  icon: Building2 },
    { key: "/reports",      label: "Reports",      icon: BarChart3 },
    { key: "/settings",     label: "Settings",     icon: Settings },
  ],
  HR: [
    { key: "/",             label: "Overview",       icon: LayoutDashboard },
    { key: "/employees",    label: "Employees",      icon: Users },
    { key: "/attendance",   label: "Attendance",     icon: CalendarCheck },
    { key: "/leave",        label: "Leave Requests", icon: ClipboardList },
    { key: "/hrreports",    label: "HR Reports",     icon: FileText },
  ],
  "Team Lead": [
    { key: "/",             label: "Overview",          icon: LayoutDashboard },
    { key: "/tasks",        label: "Task Management",   icon: CheckSquare },
    { key: "/projects",     label: "Project Progress",  icon: BarChart3 },
    { key: "/team",         label: "My Team",           icon: Users },
  ],
  Employee: [],
  "Super Admin": [
    { key: "/super-admin", label: "Dashboard", icon: LayoutDashboard },
    { key: "/super-admin/organizations", label: "Organizations", icon: Building2 },
    { key: "/super-admin/pending", label: "Pending", icon: ClipboardList },
    { key: "/super-admin/reports", label: "Reports", icon: BarChart3 },
    { key: "/super-admin/settings", label: "Settings", icon: Settings },
  ],
  Organization: [
    { key: "/", label: "Dashboard", icon: LayoutDashboard },
    { key: "/users", label: "Users", icon: Users },
    { key: "/departments", label: "Departments", icon: Building2 },
    { key: "/reports", label: "Reports", icon: BarChart3 },
    { key: "/settings", label: "Settings", icon: Settings },
  ],
}

/** Longest-prefix match so nested routes (e.g. /super-admin/…) highlight the correct item, not a shorter parent path. */
function getActiveNavKey(
  pathname: string,
  items: { key: string }[]
): string | null {
  const p = pathname.replace(/\/+$/, "") || "/"
  const sorted = [...items].sort((a, b) => b.key.length - a.key.length)
  for (const item of sorted) {
    const key = item.key.replace(/\/+$/, "") || "/"
    if (key === "/") {
      if (p === "/") return item.key
      continue
    }
    if (p === key || p.startsWith(`${key}/`)) return item.key
  }
  return null
}

export function AppSidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const userRole = (user?.role || "Employee") as UserRole
  const navItems = navConfig[userRole] || navConfig.Employee
  const activeNavKey = getActiveNavKey(location.pathname, navItems)

  return (
    <Sidebar>
      {/* Brand */}
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-sidebar-border bg-card p-1">
            <img
              src={logo}
              alt="Avanzo"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-[15px] font-bold tracking-wide text-sidebar-foreground">
            Avanzo
          </span>
        </div>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent>
        {/* Department badge for Team Lead */}
        {userRole === "Team Lead" && user?.department_name && (
          <div className="mx-3 mt-2 flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {user.department_name} Team
          </div>
        )}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = activeNavKey === item.key
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.key} aria-current={isActive ? "page" : undefined}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - User */}
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 px-1">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-sm font-bold text-primary-foreground">
              {user?.first_name?.charAt(0)}
              {user?.last_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-semibold text-sidebar-foreground">
              {user?.first_name} {user?.last_name}
            </span>
            <span className="truncate text-xs text-sidebar-foreground/70">
              {userRole}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full justify-center gap-2"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
