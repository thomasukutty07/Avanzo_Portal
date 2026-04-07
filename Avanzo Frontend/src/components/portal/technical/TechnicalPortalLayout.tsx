import { Outlet, useLocation } from "react-router-dom"
import { useState } from "react"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { TechnicalPortalHeader } from "./TechnicalPortalHeader"
import { TechnicalPortalSidebar } from "./TechnicalPortalSidebar"
import { Menu, X } from "lucide-react"

/**
 * Technical department portal: fixed header + sidebar + main outlet.
 * Child routes render only page body (no raw HTML).
 */
export function TechnicalPortalLayout({ children }: { children?: React.ReactNode }) {
  useDesignPortalLightTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const location = useLocation()

  return (
    <div className="design-portal design-portal-light h-screen w-full bg-slate-50 overflow-hidden flex font-display transition-colors duration-500">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Full height anchor */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-slate-100 bg-white transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0 shadow-2xl md:relative md:translate-x-0' : '-translate-x-full md:-ml-72 md:translate-x-0'}`}>
        <div className="flex h-full flex-col overflow-hidden">
          <TechnicalPortalSidebar onNavClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
        </div>
        <button 
          onClick={() => setIsSidebarOpen(false)} 
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-100 z-30 flex items-center px-4 md:px-8 shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 mr-4 text-slate-500 hover:bg-slate-50 rounded-lg md:hidden shadow-sm border border-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <TechnicalPortalHeader onToggleSidebar={setIsSidebarOpen} />
        </header>

        <main key={location.pathname} className="min-h-0 flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}
