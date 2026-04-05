import { NavLink, useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { CYBER_SECURITY_NAV_ITEMS } from "./cyberSecurityNavConfig"


function initialsFromUser(
  first?: string | null,
  last?: string | null,
  email?: string | null
) {
  const a = (first?.trim()?.[0] ?? "").toUpperCase()
  const b = (last?.trim()?.[0] ?? "").toUpperCase()
  if (a && b) return a + b
  if (a) return a + (email?.[1]?.toUpperCase() ?? "D")
  const e = email?.trim() ?? ""
  return e.slice(0, 2).toUpperCase() || "?"
}

const inactive =
  "flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-bold text-slate-500 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 font-headline"
const active =
  "flex items-center gap-3 rounded-xl bg-violet-600 px-4 py-3 text-[13px] font-bold text-white shadow-md shadow-violet-600/20 transition-all duration-200 font-headline"

export function CyberSecurityPortalSidebar({ onNavClick }: { onNavClick?: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email
    : "User"
  const roleLine =
    user?.designation_name?.trim() ||
    user?.role?.replace(/_/g, " ") ||
    "Security"
  const initials = initialsFromUser(user?.first_name, user?.last_name, user?.email)

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-slate-100 bg-white shadow-[1px_0_0_0_rgba(0,0,0,0.02)]">
      <div className="p-8 font-headline">
        <div className="flex items-center gap-2 mb-1">
          <div className="size-6 bg-violet-600 rounded-lg shadow-lg shadow-violet-600/20" />
          <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">AVANZO</h1>
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
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
            <span className="tracking-tight">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-4 border-t border-slate-50 bg-slate-50/20">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-colors cursor-pointer group">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-700 text-xs font-black text-white shadow-lg shadow-violet-700/20 group-hover:scale-105 transition-transform font-headline">
            {initials}
          </div>
          <div className="min-w-0 flex-1 font-headline">
            <p className="truncate text-[13px] font-black text-slate-900 leading-tight tracking-tight">{displayName}</p>
            <p className="truncate text-[10px] font-black uppercase tracking-tighter text-slate-400 mt-1">
              {roleLine}
            </p>
          </div>
        </div>

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
