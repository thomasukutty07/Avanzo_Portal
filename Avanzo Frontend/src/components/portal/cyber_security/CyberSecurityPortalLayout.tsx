import { Outlet, useLocation } from "react-router-dom"
import { useState } from "react"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { CyberSecurityPortalSidebar } from "./CyberSecurityPortalSidebar"
import { CyberSecurityPortalHeader } from "./CyberSecurityPortalHeader"
import { X } from "lucide-react"

/** Cybersecurity portal: sidebar + sticky header + main outlet. */
export function CyberSecurityPortalLayout({ children }: { children?: React.ReactNode }) {
  useDesignPortalLightTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const location = useLocation()

  return (
    <div className="design-portal design-portal-light flex min-h-screen w-full bg-slate-50 text-slate-800 overflow-x-hidden font-headline">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <CyberSecurityPortalSidebar onNavClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main column */}
      <div className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'md:pl-72' : ''}`}>
        {/* Shared sticky header */}
        <CyberSecurityPortalHeader onMenuClick={() => setIsSidebarOpen(true)} onToggleSidebar={setIsSidebarOpen} />

        <div key={location.pathname} className="min-h-0 flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  )
}
