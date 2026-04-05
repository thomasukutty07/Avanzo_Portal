import { NavLink, useNavigate } from "react-router-dom"
import { LogOut, Search, Bell, HelpCircle, Menu, X, Settings as SettingsIcon, Plus, Download } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { purplePortalPalette } from "@/components/design/portalPalettes"
import { HR_PORTAL_NAV } from "./hrPortalNavConfig"
import { Button } from "@/components/ui/button"

const inactive =
  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
const active =
  "flex items-center gap-3 rounded-lg bg-violet-50 px-4 py-3 text-sm font-bold text-violet-700 shadow-sm shadow-violet-100"

export function HRPortalChrome({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const style = purplePortalPalette as React.CSSProperties

  // Split navigation: Main items vs Settings
  const mainNav = HR_PORTAL_NAV.filter(item => item.label !== "Settings")
  const settingsNav = HR_PORTAL_NAV.find(item => item.label === "Settings")

  return (
    <div
      className="design-portal design-portal-light flex min-h-screen w-full bg-[#F8FAFC] text-slate-900 overflow-x-hidden font-body"
      style={style}
    >
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex h-24 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-200">
              <svg viewBox="0 0 24 24" fill="none" className="size-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" /><line x1="9" x2="15" y1="22" y2="22" /><line x1="12" x2="12" y1="18" y2="22" /><path d="M8 6h2" /><path d="M8 10h2" /><path d="M8 14h2" /><path d="M14 6h2" /><path d="M14 10h2" /><path d="M14 14h2" /></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">Avanzo HR</h1>
              <p className="text-[11px] font-semibold text-slate-400">Enterprise Admin</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 md:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-2">
          {mainNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => (isActive ? active : inactive)}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-slate-100 p-4 space-y-4">
          <div className="px-2 pb-2">
            <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-12 font-black shadow-lg shadow-violet-100 flex gap-2 items-center justify-center transition-all hover:-translate-y-0.5 active:translate-y-0 group">
              <Download className="size-4 group-hover:scale-110 transition-transform" />
              Export Data
            </Button>
          </div>

          {settingsNav && (
            <NavLink
              to={settingsNav.to}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => (isActive ? active : inactive)}
            >
              <SettingsIcon className="h-5 w-5 shrink-0" />
              {settingsNav.label}
            </NavLink>
          )}

          {/* User Profile Block */}
          <div className="flex items-center gap-3 p-2 border border-violet-50 rounded-xl bg-violet-50/30">
            <div className="size-10 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-orange-600 font-bold overflow-hidden shadow-sm">
                <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">Alex Rivera</p>
              <p className="text-[10px] font-medium text-slate-500 truncate">alex@avanzo.com</p>
            </div>
            <button 
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col md:pl-72">
        <header className="flex h-20 shrink-0 items-center justify-between bg-white/80 backdrop-blur-md px-6 md:px-10 sticky top-0 z-20 border-b border-slate-100/50">
          <div className="flex items-center gap-6 flex-1 max-w-2xl">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg md:hidden shadow-sm border border-slate-200 bg-white"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
              <input
                className="w-full bg-[#F1F5F9] border-transparent rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-violet-600/20 focus:bg-white focus:border-violet-200 transition-all placeholder:text-slate-400"
                placeholder="Search employees, reports, or tasks..."
                onKeyDown={(e) => e.key === "Enter" && toast.info(`Searching: ${e.currentTarget.value}`)}
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => toast.info("No unread HR notifications")}
              className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl relative border border-slate-100 bg-white shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <Bell className="h-5 w-5" />
              <div className="absolute top-2 right-2 size-2.5 bg-violet-600 rounded-full border-2 border-white" />
            </button>
            <button
              onClick={() => toast.info("Help Center portal opening...")}
              className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            
            <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-6 h-11 font-bold shadow-lg shadow-violet-200 transition-all hover:-translate-y-0.5 active:translate-y-0 flex gap-2 items-center">
              <Plus className="size-4 stroke-[3px]" />
              Quick Action
            </Button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
