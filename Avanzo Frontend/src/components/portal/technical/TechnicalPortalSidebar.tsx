import { NavLink, useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { TECHNICAL_NAV_ITEMS } from "./technicalNavConfig"

const linkBase =
  "flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-bold transition-all duration-200"
const inactive = `${linkBase} text-slate-500 hover:bg-slate-50 hover:text-slate-900`
const active = `${linkBase} bg-violet-600 text-white shadow-md shadow-violet-600/20`

export function TechnicalPortalSidebar({ onNavClick }: { onNavClick?: () => void }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <aside className="flex h-full w-full shrink-0 flex-col bg-white border-r border-slate-100 font-display overflow-hidden">
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-8">
        {TECHNICAL_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavClick}
            className={({ isActive }) => (isActive ? active : inactive)}
          >
            <Icon className="size-5 shrink-0" />
            {label}
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
          <LogOut className="size-4" />
          Log out
        </button>
      </div>
    </aside>
  )
}

