import { Outlet } from "react-router-dom"
import { useState } from "react"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { TechnicalPortalHeader } from "./TechnicalPortalHeader"
import { TechnicalPortalSidebar } from "./TechnicalPortalSidebar"
import { Menu, X } from "lucide-react"

/**
 * Technical department portal: fixed header + sidebar + main outlet.
 * Child routes render only page body (no raw HTML).
 */
export function TechnicalPortalLayout() {
  useDesignPortalLightTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="design-portal design-portal-light h-[100dvh] w-full bg-slate-50 overflow-hidden flex flex-col">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center px-4 md:px-8">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 mr-4 text-slate-500 hover:bg-slate-50 rounded-lg md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <TechnicalPortalHeader />
      </header>

      <div className="flex flex-1 pt-16 h-0">
        <aside className={`fixed inset-y-0 left-0 z-40 w-72 pt-16 bg-white transition-transform duration-300 md:translate-x-0 md:relative md:pt-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
          <div className="flex h-full flex-col">
            <TechnicalPortalSidebar onNavClick={() => setIsSidebarOpen(false)} />
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </aside>
        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
