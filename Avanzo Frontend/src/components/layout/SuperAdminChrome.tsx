import { useState } from "react"
import { SuperAdminHeader } from "./SuperAdminHeader"
import { SuperAdminSidebar } from "./SuperAdminSidebar"
import { Menu, X } from "lucide-react"

export function SuperAdminChrome({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] font-display antialiased text-[#191c1d] overflow-x-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg border border-slate-200 text-slate-500 shadow-sm md:hidden hover:bg-slate-50 transition-all"
      >
        <Menu className="h-5 w-5" />
      </button>

      <SuperAdminHeader />
      
      {/* Modified Sidebar to respect state on mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SuperAdminSidebar onNavClick={() => setIsSidebarOpen(false)} />
        <button 
          onClick={() => setIsSidebarOpen(false)} 
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <main className="ml-0 md:ml-72 min-h-screen px-4 md:px-8 pb-12 pt-20">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
