import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { LogOut, LayoutDashboard, CheckSquare, Folder, Users, Megaphone, Search, Bell, Menu, X, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { NewTaskModal, NewUpdateModal, SearchModal } from "./TeamLeadActionForms"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { extractResults } from "@/lib/apiResults"
import { api } from "@/lib/axios"
import { AttendanceClockWidget } from "@/components/shared/AttendanceClockWidget"

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/tasks", label: "Team Tasks", icon: CheckSquare },
  { to: "/projects", label: "Projects", icon: Folder },
  { to: "/team", label: "Team Members", icon: Users, end: true },
  { to: "/team-announcements", label: "Announcements", icon: Megaphone },
]

export default function TeamLeadChrome({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [isNewUpdateOpen, setIsNewUpdateOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [announcementCount, setAnnouncementCount] = useState(0)

  useEffect(() => {
    async function fetchNotifs() {
      try {
        const res = await api.get("/api/notifications/")
        setNotifications(extractResults(res.data))
      } catch (e) {
        console.error(e)
      }
    }
    async function fetchAnnouncements() {
      try {
        const res = await api.get("/api/notifications/broadcasts/")
        const data = res.data
        const items = Array.isArray(data) ? data : (data.results || [])
        setAnnouncementCount(items.length)
      } catch (e) {
        console.error(e)
      }
    }
    fetchNotifs()
    fetchAnnouncements()
    const interval = setInterval(fetchAnnouncements, 300000) // 5 minutes polling to avoid 429 errors
    return () => clearInterval(interval)
  }, [])

  const displayName = user 
    ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email
    : "Authenticated Lead"

  const inactive =
    "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 font-headline"
  const active =
    "flex items-center gap-3 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-600/20 transition-all duration-200 font-headline"

  return (
    <div className="design-portal design-portal-light flex h-screen w-full bg-[#fcfcfc] text-slate-900 overflow-hidden font-display">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Full height anchor */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-slate-100 bg-white transition-transform duration-300 ease-in-out md:translate-x-0 md:relative ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between px-6">
          <div className="flex flex-col gap-2">
             <img 
               src="/src/assets/Avanzo Logo corrected and final-png.png" 
               alt="Avanzo" 
               className="w-32 h-auto object-contain"
             />
             <p className="text-xs font-black uppercase tracking-[0.2em] leading-none text-violet-600 italic">Team Lead Dashboard</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 md:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4 border-t border-slate-50">
          <div className="px-4 mb-3 mt-2 text-xs font-black uppercase tracking-[0.15em] text-slate-300">Operations</div>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
              className={({ isActive }) => (isActive ? active : inactive)}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.label === "Announcements" && announcementCount > 0 && (
                <span className="bg-violet-600 text-white text-xs font-black px-1.5 py-0.5 rounded-lg shadow-sm animate-in zoom-in duration-300">
                  {announcementCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-slate-50 p-5 bg-white shrink-0">
          <button
            type="button"
            onClick={() => {
              logout()
              navigate("/login", { replace: true })
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-black text-red-500 hover:bg-red-50 transition-all uppercase tracking-widest font-headline group"
          >
            <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between bg-white/80 border-b border-slate-100 px-6 md:px-8 backdrop-blur-md">
          <div className="flex items-center gap-5 flex-1 max-w-2xl">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 text-slate-500 hover:bg-slate-50 rounded-lg md:hidden shadow-sm border border-slate-100"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
            <div className="relative flex-1 group font-headline hidden lg:block">
              <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
              <input
                className="w-full bg-slate-50 border-transparent rounded-lg pl-10 pr-4 py-1.5 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:bg-white focus:border-violet-200 transition-all placeholder:text-slate-300 tracking-tight outline-none"
                placeholder="Search projects, members, or tasks..."
                onKeyDown={(e) => e.key === "Enter" && toast.info(`Searching: ${e.currentTarget.value}`)}
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-2">
              <AttendanceClockWidget onToggleSidebar={setIsSidebarOpen} />
              
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    type="button"
                    className="relative flex items-center justify-center size-9 rounded-full border border-slate-100 text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    <Bell className="h-4.5 w-4.5" />
                    <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 font-display rounded-2xl p-2 shadow-2xl border-slate-200">
                   <DropdownMenuLabel className="p-4">
                    <h3 className="font-black text-base text-slate-900 font-headline tracking-tight">Notifications</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{notifications.length} Active Alerts</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <ScrollArea className="h-[280px]">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((n, i) => (
                        <DropdownMenuItem key={i} className="p-3.5 rounded-xl cursor-default hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none">
                          <div className="space-y-1 w-full">
                            <div className="flex items-center justify-between">
                              <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded text-violet-700 bg-violet-50`}>
                                {n.notification_type || "SYSTEM"}
                              </span>
                              <div className="flex items-center gap-1 text-[8px] text-slate-400 font-black uppercase tracking-tight">
                                <Clock className="h-2.5 w-2.5" />
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 tracking-tight line-clamp-1 uppercase">{n.title}</h4>
                            <p className="text-[11px] text-slate-500 font-medium line-clamp-2">{n.message}</p>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-10 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        No active alerts
                      </div>
                    )}
                   </ScrollArea>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <div className="p-1.5">
                    <Button variant="ghost" className="w-full text-[10px] font-black text-violet-600 uppercase tracking-widest hover:bg-violet-50 rounded-xl" onClick={() => toast.info("History view access restricted.")}>View All Notifications</Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>


              {/* Profile Access */}
              <button 
                onClick={() => navigate("/settings")}
                className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group ml-1"
                title="My Profile & Settings"
              >
                <div className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-violet-100 uppercase font-black text-violet-700 text-[10px] shrink-0 ring-2 ring-white shadow-sm group-hover:ring-violet-50 transition-all">
                  {displayName.slice(0, 2)}
                </div>
                <div className="hidden sm:block text-left mr-2">
                   <p className="text-xs font-black text-slate-900 leading-none uppercase tracking-tight">{displayName}</p>
                   <p className="text-[10px] font-bold text-slate-400 mt-1 leading-none uppercase">Team Lead</p>
                </div>
              </button>
            </div>
          </div>
        </header>

        <main key={location.pathname} className="min-h-0 flex-1 overflow-y-auto relative">
          <div className="p-6 md:p-8 lg:p-10">
            {children}
          </div>
        </main>
      </div>

      {/* Action Modals */}
      <NewTaskModal open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen} />
      <NewUpdateModal open={isNewUpdateOpen} onOpenChange={setIsNewUpdateOpen} />
      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </div>
  )
}
