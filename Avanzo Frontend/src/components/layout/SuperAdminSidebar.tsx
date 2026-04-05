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
    <aside className="fixed inset-y-0 left-0 flex h-full w-64 flex-col border-r border-slate-100 bg-white pt-6 font-body">
      <div className="mb-10 px-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-700 text-white shadow-lg shadow-violet-900/20">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-black tracking-tight text-slate-900">
          Super Admin
        </h2>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Portal Console
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
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 group ${
                isActive
                  ? "bg-violet-700 text-white shadow-lg shadow-violet-900/20"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-violet-600'}`} />
              <span className="text-xs font-bold">{item.label}</span>
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
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-900 group"
        >
          <HelpCircle className="h-5 w-5 text-slate-300 group-hover:text-violet-600" />
          <span className="text-xs font-bold">Help Center</span>
        </button>
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-red-500 transition-all hover:bg-red-50 font-bold text-xs mt-2"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
