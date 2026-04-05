import { Outlet } from "react-router-dom"
import { useState } from "react"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { CyberSecurityPortalSidebar } from "./CyberSecurityPortalSidebar"
import { CyberSecurityPortalHeader } from "./CyberSecurityPortalHeader"
import { X } from "lucide-react"

/** Cybersecurity portal: sidebar + sticky header + main outlet. */
export function CyberSecurityPortalLayout() {
  useDesignPortalLightTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="design-portal design-portal-light flex min-h-screen w-full bg-slate-50 text-slate-800 overflow-x-hidden font-display">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <CyberSecurityPortalSidebar onNavClick={() => setIsSidebarOpen(false)} />
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main column */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:pl-64">
        {/* Shared sticky header */}
        <CyberSecurityPortalHeader onMenuClick={() => setIsSidebarOpen(true)} />

        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
