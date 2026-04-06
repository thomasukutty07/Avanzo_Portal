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
  const { logout } = useAuth()
  const navigate = useNavigate()
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
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-slate-100 bg-white shadow-[1px_0_0_0_rgba(0,0,0,0.02)]">
      <div className="p-8 font-headline">
        <div className="flex items-center gap-2 mb-1">
          <div className="size-6 bg-violet-600 rounded-lg shadow-lg shadow-violet-600/20" />
          <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">Avanzo</h1>
        </div>
        <p className="text-[9px] font-black tracking-[0.2em] text-slate-400">
          Cybersecurity Unit
        </p>
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
