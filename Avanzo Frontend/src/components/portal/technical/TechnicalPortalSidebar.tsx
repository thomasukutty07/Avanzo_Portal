import { useState, useEffect } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/axios"
import { TECHNICAL_NAV_ITEMS } from "./technicalNavConfig"

const linkBase =
  "flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-bold transition-all duration-200"
const inactive = `${linkBase} text-slate-500 hover:bg-slate-50 hover:text-slate-900`
const active = `${linkBase} bg-violet-600 text-white shadow-md shadow-violet-600/20`

export function TechnicalPortalSidebar({ 
  onNavClick, 
  isCollapsed 
}: { 
  onNavClick?: () => void,
  isCollapsed?: boolean
}) {
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
    <aside className="flex h-full w-full shrink-0 flex-col bg-white border-r border-slate-100 font-display overflow-hidden">
      <div className={`px-8 py-6 ${isCollapsed ? 'opacity-0 h-0 p-0' : 'opacity-100'} transition-all duration-300 overflow-hidden`}>
        <div className="flex flex-col gap-2.5">
          <img 
            src="/src/assets/Avanzo Logo corrected and final-png.png" 
            alt="Avanzo" 
            className="w-32 h-auto object-contain"
          />
          <p className="text-[9px] font-black uppercase tracking-[0.2em] leading-none text-violet-600/90 whitespace-nowrap italic">
            Technical: Engineering Hub
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-2 border-t border-slate-50">
        {TECHNICAL_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavClick}
            className={({ isActive }) => (isActive ? active : inactive)}
          >
            <Icon className="size-5 shrink-0" />
            {!isCollapsed && <span className="flex-1 transition-all">{label}</span>}
            {!isCollapsed && label === "Announcements" && announcementCount > 0 && (
              <span className="bg-violet-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm animate-in zoom-in duration-300">
                {announcementCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="shrink-0 border-t border-slate-100 p-6 bg-white">
        <button
          type="button"
          onClick={() => {
            logout()
            onNavClick?.()
            navigate("/login", { replace: true })
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-[13px] font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <LogOut className={`size-4 ${isCollapsed ? 'mx-auto' : ''}`} />
          {!isCollapsed && "Log out"}
        </button>
      </div>
    </aside>
  )
}

