import { useState, useEffect } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/axios"
import { CYBER_SECURITY_NAV_ITEMS } from "./cyberSecurityNavConfig"

const inactive =
  "flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-bold text-slate-500 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 font-headline"
const active =
  "flex items-center gap-3 rounded-xl bg-violet-600 px-4 py-3 text-[13px] font-bold text-white shadow-md shadow-violet-600/20 transition-all duration-200 font-headline"

export function CyberSecurityPortalSidebar({ onNavClick }: { onNavClick?: () => void }) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [announcementCount, setAnnouncementCount] = useState(0)
  const [activeTaskCount, setActiveTaskCount] = useState(0)
  const [activeIncidentCount, setActiveIncidentCount] = useState(0)

  useEffect(() => {
    if (!user) return

    const fetchStats = async () => {
      try {
        const [broadcastRes, tasksRes, ticketsRes] = await Promise.all([
          api.get("/api/notifications/broadcasts/").catch(() => ({ data: [] })),
          api.get("/api/projects/tasks/").catch(() => ({ data: [] })),
          api.get("/api/tickets/").catch(() => ({ data: [] }))
        ])

        const broadcasts = Array.isArray(broadcastRes.data) ? broadcastRes.data : (broadcastRes.data?.results || [])
        setAnnouncementCount(broadcasts.length)

        const tasksList = Array.isArray(tasksRes.data) ? tasksRes.data : (tasksRes.data?.results || [])
        const myTasks = tasksList.filter((t: any) => 
          (t.assignee === user.id || t.assignee_id === user.id) && 
          t.status !== 'completed' && 
          t.status !== 'resolved'
        )
        setActiveTaskCount(myTasks.length)

        const ticketsList = Array.isArray(ticketsRes.data) ? ticketsRes.data : (ticketsRes.data?.results || [])
        const activeIncidents = ticketsList.filter((t: any) => 
          t.status !== 'resolved' && 
          (t.ticket_type === 'tech' || t.ticket_type === 'compliance')
        )
        setActiveIncidentCount(activeIncidents.length)
      } catch (e) {
        console.error(e)
      }
    }
    fetchStats()
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [user])

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-slate-100 bg-white shadow-[1px_0_0_0_rgba(0,0,0,0.02)]">
      <div className="p-8 font-headline">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex size-10 items-center justify-center rounded-xl bg-violet-600 text-lg font-black text-white shadow-lg shadow-violet-600/20">
            A
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 leading-tight">Avanzo</h1>
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mt-1 text-violet-600">Personnel: Security Unit</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 px-4 mt-2">
        {CYBER_SECURITY_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavClick}
            className={({ isActive }) => (isActive ? active : inactive)}
          >
            <Icon className="size-4 shrink-0" />
            <span className="flex-1 tracking-tight">{label}</span>
            {label === "Announcements" && announcementCount > 0 && (
              <span className="bg-violet-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm animate-in zoom-in duration-300">
                {announcementCount}
              </span>
            )}
            {(label.toLowerCase() === "my task" || label.toLowerCase() === "my tasks") && activeTaskCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm animate-in zoom-in duration-300">
                {activeTaskCount}
              </span>
            )}
            {label.toLowerCase() === "incidents" && activeIncidentCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm animate-in zoom-in duration-300">
                {activeIncidentCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-4 border-t border-slate-50 bg-slate-50/20">
        {/* Logout */}
        <button
          type="button"
          onClick={() => { logout(); navigate("/login", { replace: true }) }}
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-bold text-slate-500 transition-all hover:text-red-600 hover:bg-red-50 font-headline"
        >
          <LogOut className="size-4 shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  )
}
