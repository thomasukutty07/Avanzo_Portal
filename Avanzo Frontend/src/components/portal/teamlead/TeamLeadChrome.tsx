import { NavLink, useNavigate } from "react-router-dom"
import { LogOut, LayoutDashboard, CheckSquare, Folder, Users, Megaphone, BarChart3, Settings, Search, Bell, Plus, Menu, X } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { NewTaskModal, NewUpdateModal, CreateProjectModal, AddMemberModal, SearchModal } from "./TeamLeadActionForms"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock } from "lucide-react"

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/tasks", label: "Team Tasks", icon: CheckSquare },
  { to: "/projects", label: "Projects", icon: Folder },
  { to: "/team", label: "Team Members", icon: Users },
  { to: "/team-announcements", label: "Announcements", icon: Megaphone },
  { to: "/team-reports", label: "Reports", icon: BarChart3 },
]

const inactive =
  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-violet-50 hover:text-violet-700 dark:text-slate-400 dark:hover:bg-slate-800 font-display"
const active =
  "flex items-center gap-3 rounded-lg bg-violet-600/10 px-3 py-2.5 text-sm font-bold text-violet-700 font-display"

export function TeamLeadChrome({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [isNewUpdateOpen, setIsNewUpdateOpen] = useState(false)
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email
    : "Alex Rivera"

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f6f8] font-sans antialiased text-slate-900">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600 text-white">
              <span className="material-symbols-outlined">rocket_launch</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Avanzo</h1>
              <p className="text-xs font-medium text-slate-500">Command</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 md:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex-1 space-y-1 overflow-y-auto px-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => (isActive ? active : inactive)}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 p-2">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-violet-100 uppercase font-bold text-violet-700">
              {displayName.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <p className="truncate text-xs text-slate-500">Team Lead</p>
            </div>
            <button 
              type="button"
              onClick={() => navigate("/settings")}
              className="text-slate-400 hover:text-violet-600 transition-colors bg-slate-50 p-1.5 rounded-lg group"
              title="System Settings"
            >
              <Settings className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              logout()
              navigate("/login", { replace: true })
            }}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden md:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 md:px-8 py-4 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Team Overview</h2>
              <p className="text-xs md:text-sm text-slate-500">Tactical status report active.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block group cursor-pointer" onClick={() => setIsSearchOpen(true)}>
              <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-hover:text-violet-600 transition-colors">
                <Search className="h-full w-full" />
              </div>
              <div className="w-64 rounded-lg border-none bg-slate-100 py-2 pl-10 pr-4 text-sm text-slate-400 font-body transition-all group-hover:bg-slate-200/80">
                Search tactical unit...
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-white rounded border border-slate-200 text-[9px] font-bold text-slate-300">⌘K</div>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    type="button"
                    className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-violet-600 ring-2 ring-white animate-pulse"></span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 font-body rounded-2xl p-2 shadow-2xl border-slate-200">
                  <DropdownMenuLabel className="p-4">
                    <h3 className="font-headline font-black text-lg">Tactical Notifications</h3>
                    <p className="text-xs text-slate-500 font-medium">Recent operational alerts (3)</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <ScrollArea className="h-[300px]">
                    {[
                      { title: "Critical Sprint Milestone", desc: "Project Alpha requires final sign-off", time: "2m ago", type: "urgent" },
                      { title: "New Resource Recruitment", desc: "James Chen successfully boarded", time: "1h ago", type: "info" },
                      { title: "System Audit Pending", desc: "Weekly security baseline ready", time: "5h ago", type: "warning" },
                    ].map((n, i) => (
                      <DropdownMenuItem key={i} className="p-4 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none">
                        <div className="space-y-1 w-full">
                          <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                              n.type === 'urgent' ? 'text-red-700 bg-red-50' : 
                              n.type === 'warning' ? 'text-amber-700 bg-amber-50' : 
                              'text-violet-700 bg-violet-50'
                            }`}>{n.type}</span>
                            <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                              <Clock className="h-3 w-3" />
                              {n.time}
                            </div>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                          <p className="text-xs text-slate-500 line-clamp-1">{n.desc}</p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </ScrollArea>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <div className="p-4">
                    <Button variant="ghost" className="w-full text-xs font-bold text-violet-600 uppercase tracking-widest hover:bg-violet-50" onClick={() => toast.info("Full history locked for audit.")}>View All Alerts</Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    type="button"
                    className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 active:scale-95 shadow-lg shadow-violet-900/20"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Quick Action</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 font-body rounded-2xl p-2 shadow-2xl border-slate-200">
                   <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Tactical Operations</DropdownMenuLabel>
                   <DropdownMenuItem onClick={() => setIsNewTaskOpen(true)} className="rounded-xl p-3 cursor-pointer">
                      <CheckSquare className="h-4 w-4 mr-3 text-violet-600" />
                      <span className="font-bold">New Task</span>
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setIsNewUpdateOpen(true)} className="rounded-xl p-3 cursor-pointer">
                      <Megaphone className="h-4 w-4 mr-3 text-blue-600" />
                      <span className="font-bold">New Update</span>
                   </DropdownMenuItem>
                   <DropdownMenuSeparator className="bg-slate-100" />
                   <DropdownMenuItem onClick={() => setIsNewProjectOpen(true)} className="rounded-xl p-3 cursor-pointer">
                      <Folder className="h-4 w-4 mr-3 text-emerald-600" />
                      <span className="font-bold">Create Project</span>
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setIsAddMemberOpen(true)} className="rounded-xl p-3 cursor-pointer">
                      <Users className="h-4 w-4 mr-3 text-orange-600" />
                      <span className="font-bold">Add Member</span>
                   </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Action Modals */}
      <NewTaskModal open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen} />
      <NewUpdateModal open={isNewUpdateOpen} onOpenChange={setIsNewUpdateOpen} />
      <CreateProjectModal open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen} />
      <AddMemberModal open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen} />
      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </div>
  )
}
