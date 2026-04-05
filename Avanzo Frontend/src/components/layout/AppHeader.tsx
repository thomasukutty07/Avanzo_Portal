// src/components/layout/AppHeader.tsx
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/components/theme-provider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun } from "lucide-react";

const routeTitles: Record<string, string> = {
  "/": "Dashboard Overview",
  "/users": "User Management",
  "/departments": "Org Chart",
  "/security": "Security",
  "/attendance": "Attendance",
  "/leaves": "Leave Requests",
  "/reports": "Reports",
  "/settings": "Settings",
  "/approvals": "Approvals",
  "/alerts": "Alerts",
  "/projects": "Projects",
  "/my-tasks": "My Tasks",
};

export function AppHeader() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const pageTitle = routeTitles[location.pathname] || "Avanzo Workspace";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-30 flex h-[60px] shrink-0 items-center justify-between border-b border-border bg-background px-4 md:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <div>
          <h1 className="text-base font-bold leading-tight tracking-tight text-foreground">
            {pageTitle}
          </h1>
          <p className="text-xs text-muted-foreground">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="hidden sm:inline-flex">
          {user?.department_name || user?.role || "Staff"}
        </Badge>
        <Button variant="outline" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
