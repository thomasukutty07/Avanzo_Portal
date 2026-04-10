import { useState, useEffect } from "react"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { LogOut, Search, Bell, Menu, X, Settings as SettingsIcon } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import { purplePortalPalette } from "@/components/design/portalPalettes"
import { HR_PORTAL_NAV } from "./hrPortalNavConfig"
import { AttendanceClockWidget } from "@/components/shared/AttendanceClockWidget"

export function HRPortalChrome({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [announcementCount, setAnnouncementCount] = useState(0)
  const style = purplePortalPalette as React.CSSProperties

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/api/notifications/broadcasts/")
        const data = res.data
        const items = Array.isArray(data) ? data : (data.results || [])
        setAnnouncementCount(items.length)
      } catch (e) {
        console.error(e)
      }
    }
    fetchStats()
    const interval = setInterval(fetchStats, 300000) // 5 minutes polling to avoid 429 errors
    return () => clearInterval(interval)
  }, [])

  const location = useLocation()

  const inactive =
    "flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-bold text-slate-500 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 font-headline"
  const active =
    "flex items-center gap-3 rounded-xl bg-violet-600 px-4 py-3 text-[13px] font-bold text-white shadow-md shadow-violet-600/20 transition-all duration-200 font-headline"

  // Split navigation: Main items vs Settings
  const mainNav = HR_PORTAL_NAV.filter(item => item.label !== "Settings")
  const settingsNav = HR_PORTAL_NAV.find(item => item.label === "Settings")

  return (
    <div
      className="design-portal design-portal-light flex min-h-screen w-full bg-[#fcfcfc] text-slate-900 overflow-x-hidden font-display transition-colors duration-500"
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
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-slate-100 bg-white transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0 shadow-2xl md:translate-x-0' : '-translate-x-full md:translate-x-0 md:-ml-72'}`}>
        <div className="flex h-24 items-center justify-between px-6">
          <div className="flex flex-col gap-2.5">
            <img 
              src="/src/assets/Avanzo Logo corrected and final-png.png" 
              alt="Avanzo" 
              className="w-32 h-auto object-contain"
            />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] leading-none text-violet-600 italic">Personnel: HR Admin Hub</p>
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
              onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
              className={({ isActive }) => (isActive ? active : inactive)}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{label}</span>
              {label === "Announcements" && announcementCount > 0 && (
                <span className="bg-violet-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm animate-in zoom-in duration-300">
                  {announcementCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-slate-50 p-6 bg-white">
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

          <button
            type="button"
            onClick={() => {
              logout()
              setIsSidebarOpen(false)
              navigate("/login", { replace: true })
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-[13px] font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors font-headline"
          >
            <LogOut className="size-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <div className={`flex min-h-0 min-w-0 flex-1 flex-col transition-all duration-300 ${isSidebarOpen ? 'md:pl-72' : ''}`}>
        <header className="flex h-16 shrink-0 items-center justify-between bg-white border-b border-slate-100 px-6 md:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-6 flex-1 max-w-2xl">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg md:hidden shadow-sm border border-slate-200 bg-white"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative flex-1 group font-headline">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
              <input
                className="w-full bg-[#F1F5F9] border-transparent rounded-xl pl-12 pr-4 py-2.5 text-[13px] font-bold text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:bg-white focus:border-violet-200 transition-all placeholder:text-slate-300 tracking-tight outline-none"
                placeholder="Search employees, reports, or tasks..."
                onKeyDown={(e) => e.key === "Enter" && toast.info(`Searching: ${e.currentTarget.value}`)}
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 font-headline text-right">
            <AttendanceClockWidget onToggleSidebar={setIsSidebarOpen} />
            
            <button
              onClick={() => toast.info("No unread HR notifications")}
              className="relative flex items-center justify-center size-10 rounded-full border border-slate-100 text-slate-500 hover:bg-slate-50 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-white bg-red-500" />
            </button>
            
            <div className="h-8 w-px bg-slate-100 hidden sm:block" />

            <div className="flex items-center gap-3 h-full">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold leading-none text-slate-900 uppercase">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-[10px] font-black text-slate-400 mt-1.5 uppercase tracking-widest leading-none">
                  {user?.designation_name || user?.role || "HR Admin"}
                </p>
              </div>
              <div className="size-10 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-slate-400 font-black overflow-hidden shadow-sm uppercase shrink-0 ring-1 ring-slate-100">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
            </div>
          </div>
        </header>

        <main key={location.pathname} className="min-h-0 flex-1 overflow-y-auto relative">
          <div className="p-6 md:p-10 lg:p-12 animate-in fade-in duration-700 ease-out">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
