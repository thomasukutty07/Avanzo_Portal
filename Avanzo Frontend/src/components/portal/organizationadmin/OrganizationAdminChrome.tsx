import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { LogOut, Search, Bell, Menu, X, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/axios"
import { ORGANIZATION_ADMIN_NAV } from "./organizationAdminNavConfig"

export function OrganizationAdminChrome({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const fullName = user?.first_name ? `${user.first_name} ${user.last_name || ''}` : "Admin User"
  const userRole = user?.role || "Organization Hub"
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [announcementCount, setAnnouncementCount] = useState(0)

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
    // Optional: Refresh periodically?
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  const currentNav = ORGANIZATION_ADMIN_NAV.find(item => 
    item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to)
  )
  const pageTitle = currentNav?.label || "Organization Hub"

  const navItemClasses = (isActive: boolean) => 
    `flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-bold transition-all duration-200 group hover:scale-[1.02] active:scale-[0.98] ${
      isActive 
        ? "bg-violet-600 text-white shadow-md shadow-violet-600/20" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    }`

  return (
    <div className="flex min-h-screen w-full bg-[#fcfcfc] text-slate-900 font-display">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-100 bg-white transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/20">
              <span className="text-xl font-black">A</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 font-headline">Avanzo</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 md:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 overflow-y-auto">
          {ORGANIZATION_ADMIN_NAV.map(({ to, label, icon: Icon }) => {
            const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to)
            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => setIsSidebarOpen(false)}
                className={navItemClasses(isActive)}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
                <span className="flex-1">{label}</span>
                {label === "Announcements" && announcementCount > 0 && (
                  <span className="bg-violet-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm animate-in zoom-in duration-300">
                    {announcementCount}
                  </span>
                )}
                {isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
              </NavLink>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <button
            type="button"
            onClick={() => {
              logout()
              navigate("/login", { replace: true })
            }}
            className="flex w-full items-center gap-3 rounded-xl px-5 py-3 text-sm font-bold text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-900"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-72">
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-50 bg-white/80 backdrop-blur-md px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-400 hover:text-slate-900 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
              <input
                className="w-full bg-[#F1F5F9] border-transparent rounded-xl pl-12 pr-4 py-3 text-[13px] font-bold text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:bg-white focus:border-violet-200 transition-all placeholder:text-slate-300 tracking-tight"
                placeholder="Search employees, reports, or tasks..."
                type="text"
              />
            </div>
            <div className="h-10 w-px bg-slate-100 hidden md:block mx-2" />
            <h2 className="text-[10px] font-black text-slate-400 tracking-[0.2em] hidden md:block whitespace-nowrap">{pageTitle}</h2>
          </div>

          <div className="flex items-center gap-6">
            <button className="p-3 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-2xl transition-all relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-3.5 right-3.5 size-2 bg-violet-600 rounded-full border-2 border-white" />
            </button>

            <div className="h-10 w-px bg-slate-100" />

            <div 
              onClick={() => navigate("/settings")}
              className="flex items-center gap-4 pl-2 cursor-pointer group"
            >
              <div className="text-right hidden sm:block font-display text-slate-900">
                <p className="text-sm font-black leading-tight uppercase tracking-tight group-hover:text-violet-600 transition-colors">{fullName}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{userRole}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-orange-100 p-0.5 border-2 border-white shadow-sm overflow-hidden group-hover:scale-105 group-hover:ring-2 group-hover:ring-violet-600/10 transition-all">
                <img 
                  src={`https://api.dicebear.com/7.x/notionists/svg?seed=${fullName}&backgroundColor=ffedd5`} 
                  alt={fullName}
                  className="h-full w-full object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </header>

        <main key={location.pathname} className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
          {children}
        </main>
      </div>
    </div>
  )
}
