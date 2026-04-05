import { NavLink, useNavigate } from "react-router-dom"
import { LogOut, LayoutDashboard, CheckSquare, Folder, Users, Megaphone, BarChart3, Settings, Search, Bell, Plus, Menu, X, Clock } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { NewTaskModal, NewUpdateModal, CreateProjectModal, AddMemberModal, SearchModal } from "./TeamLeadActionForms"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/tasks", label: "Team Tasks", icon: CheckSquare },
  { to: "/projects", label: "Projects", icon: Folder },
  { to: "/team", label: "Team Members", icon: Users },
  { to: "/team-announcements", label: "Announcements", icon: Megaphone },
  { to: "/team-reports", label: "Reports", icon: BarChart3 },
]

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

  const inactive =
    "flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-bold text-slate-500 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 font-headline"
  const active =
    "flex items-center gap-3 rounded-xl bg-violet-600 px-4 py-3 text-[13px] font-bold text-white shadow-md shadow-violet-600/20 transition-all duration-200 font-headline"

  return (
    <div className="design-portal design-portal-light flex h-screen w-full bg-[#fcfcfc] text-slate-900 overflow-hidden font-display">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-slate-100 bg-white transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex h-24 items-center justify-between px-8">
          <div className="flex items-center gap-3">
             <div className="flex size-10 items-center justify-center rounded-xl bg-violet-600 text-lg font-black text-white shadow-lg shadow-violet-600/20">
               A
             </div>
             <div className="font-headline">
               <h1 className="text-xl font-black tracking-tight text-slate-900 leading-tight">Avanzo</h1>
               <p className="text-[10px] font-black uppercase tracking-widest leading-none mt-1">Team Management</p>
             </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 md:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-4 border-t border-slate-50">
          <div className="px-4 mb-4 mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Operations</div>
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

        <div className="mt-auto border-t border-slate-50 p-6 bg-white">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/50 border border-slate-100 mb-4 px-4 overflow-hidden relative group">
            <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-violet-100 uppercase font-black text-violet-700 text-xs shrink-0 ring-2 ring-white">
              {displayName.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900 group-hover:text-violet-600 transition-colors uppercase tracking-tight leading-none">{displayName}</p>
              <p className="truncate text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 leading-none">Team Lead</p>
            </div>
            <button 
              type="button"
              onClick={() => navigate("/settings")}
              className="text-slate-300 hover:text-violet-600 transition-colors p-1.5 rounded-lg shrink-0 group/btn"
              title="Profile Settings"
            >
              <Settings className="h-4 w-4 group-hover/btn:rotate-90 transition-transform duration-500" />
            </button>
          </div>
          
          <button
            type="button"
            onClick={() => {
              logout()
              navigate("/login", { replace: true })
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100/50 py-3 text-[13px] font-black text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all uppercase tracking-widest font-headline"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden md:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between bg-white/80 border-b border-slate-100 px-6 md:px-8 backdrop-blur-md">
          <div className="flex items-center gap-6 flex-1 max-w-2xl">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg md:hidden shadow-sm border border-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative flex-1 group font-headline hidden lg:block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
              <input
                className="w-full bg-[#F1F5F9] border-transparent rounded-xl pl-12 pr-4 py-2 text-[13px] font-bold text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:bg-white focus:border-violet-200 transition-all placeholder:text-slate-300 tracking-tight outline-none"
                placeholder="Search tactical units, projects, or team..."
                onKeyDown={(e) => e.key === "Enter" && toast.info(`Searching: ${e.currentTarget.value}`)}
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    type="button"
                    className="relative flex items-center justify-center size-10 rounded-full border border-slate-100 text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 font-display rounded-2xl p-2 shadow-2xl border-slate-200">
                  <DropdownMenuLabel className="p-4">
                    <h3 className="font-black text-lg text-slate-900 font-headline tracking-tight">Intelligence Feed</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">3 New Operational Alerts</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <ScrollArea className="h-[300px]">
                    {[
                      { title: "Critical Milestone", desc: "Project Alpha requires final sign-off", time: "2m ago", type: "urgent" },
                      { title: "Member Onboarded", desc: "James Chen successfully joined technical", time: "1h ago", type: "info" },
                      { title: "Safety Audit", desc: "Weekly baseline report completed", time: "5h ago", type: "success" },
                    ].map((n, i) => (
                      <DropdownMenuItem key={i} className="p-4 rounded-xl cursor-not-allowed hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none">
                        <div className="space-y-1.5 w-full">
                          <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                              n.type === 'urgent' ? 'text-red-700 bg-red-50' : 
                              n.type === 'success' ? 'text-emerald-700 bg-emerald-50' : 
                              'text-violet-700 bg-violet-50'
                            }`}>{n.type}</span>
                            <div className="flex items-center gap-1 text-[9px] text-slate-400 font-black uppercase tracking-tight">
                              <Clock className="h-3 w-3" />
                              {n.time}
                            </div>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{n.title}</h4>
                          <p className="text-xs text-slate-500 font-medium">{n.desc}</p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </ScrollArea>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <div className="p-2">
                    <Button variant="ghost" className="w-full text-xs font-black text-violet-600 uppercase tracking-widest hover:bg-violet-50 rounded-xl" onClick={() => toast.info("Full history locked.")}>View All Alerts</Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    type="button"
                    className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-[13px] font-black text-white transition-all hover:bg-violet-700 active:scale-95 shadow-md shadow-violet-600/20 uppercase tracking-widest"
                  >
                    <Plus className="h-4 w-4 stroke-[3px]" />
                    <span className="hidden sm:inline">Actions</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 font-display rounded-2xl p-2 shadow-2xl border-slate-200">
                   <DropdownMenuLabel className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Quick Operations</DropdownMenuLabel>
                   <DropdownMenuItem onClick={() => setIsNewTaskOpen(true)} className="rounded-xl p-3 cursor-pointer group">
                      <div className="size-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center mr-3 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                        <CheckSquare className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-sm text-slate-700">Assign New Task</span>
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setIsNewUpdateOpen(true)} className="rounded-xl p-3 cursor-pointer group">
                      <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Megaphone className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-sm text-slate-700">Broadcast Update</span>
                   </DropdownMenuItem>
                   <DropdownMenuSeparator className="bg-slate-50" />
                   <DropdownMenuItem onClick={() => setIsNewProjectOpen(true)} className="rounded-xl p-3 cursor-pointer group">
                      <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mr-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Folder className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-sm text-slate-700">Initialize Project</span>
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => setIsAddMemberOpen(true)} className="rounded-xl p-3 cursor-pointer group">
                      <div className="size-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mr-3 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                        <Users className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-sm text-slate-700">Onboard Member</span>
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
