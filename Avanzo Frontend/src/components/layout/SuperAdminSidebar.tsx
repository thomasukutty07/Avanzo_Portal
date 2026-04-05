import { Link, useLocation } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { 
  BarChart3, 
  Building2, 
  CheckSquare, 
  LayoutDashboard, 
  Settings,
  HelpCircle,
  FileText,
  LogOut,
  ShieldCheck
} from "lucide-react"

type SidebarItem = {
  label: string
  to: string
  icon: any
}

const ITEMS: SidebarItem[] = [
  { label: "Dashboard", to: "/super-admin", icon: LayoutDashboard },
  { label: "Organizations", to: "/super-admin/organizations", icon: Building2 },
  { label: "Pending Approvals", to: "/super-admin/pending", icon: CheckSquare },
  { label: "Reports", to: "/super-admin/reports", icon: BarChart3 },
  { label: "Settings", to: "/super-admin/settings", icon: Settings },
  { label: "Audit Logs", to: "/super-admin/access", icon: FileText },
]

export function SuperAdminSidebar({ onNavClick }: { onNavClick?: () => void }) {
  const location = useLocation()
  const { logout } = useAuth()

  return (
    <aside className="fixed inset-y-0 left-0 flex h-full w-72 flex-col border-r border-slate-100 bg-white pt-8 font-headline">
      <div className="mb-10 px-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/20">
          <span className="text-2xl font-black">A</span>
        </div>
        <h2 className="mt-6 text-xl font-black tracking-tight text-slate-900 leading-none">
          Avanzo
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">
          Global Registry
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {ITEMS.map((item) => {
          const isActive = location.pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavClick}
              className={`flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-300 group ${
                isActive
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-violet-600'}`} />
              <span className="text-[13px] font-bold tracking-tight">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-slate-50 p-6">
        <button
          onClick={() => {
            toast.info("Accessing help documentation...")
            onNavClick?.()
          }}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-[13px] font-bold text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-900 group"
        >
          <HelpCircle className="h-5 w-5 text-slate-300 group-hover:text-violet-600" />
          <span className="tracking-tight">Terminal Help</span>
        </button>
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-red-500 transition-all hover:bg-red-50 font-bold text-[13px] mt-2 tracking-tight"
        >
          <LogOut className="h-5 w-5" />
          Terminate Session
        </button>
      </div>
    </aside>
  )
}
