import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { 
  Bell, 
  Settings, 
  User, 
  ShieldCheck,
  LogOut
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/AuthContext"

export function SuperAdminHeader() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between bg-white px-8 border-b border-slate-100 font-body">
      <div className="flex items-center gap-4">
        <Link
          to="/super-admin"
          className="text-2xl font-black tracking-tight text-violet-800"
        >
          Avanzo
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full p-2 text-slate-500 transition-all hover:bg-slate-50 relative group">
              <Bell className="h-5 w-5 group-hover:text-violet-600" />
              <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2 rounded-2xl border-slate-100 shadow-2xl">
            <DropdownMenuLabel className="font-headline text-sm font-black p-2">System Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="py-2 space-y-1">
               {[
                 { title: "New Org Registration", time: "2m ago", desc: "Global Logistics Ltd applied for portal access." },
                 { title: "System Security Alert", time: "1h ago", desc: "Unusual login attempt from IP 192.168.1.1" }
               ].map((n, i) => (
                 <DropdownMenuItem key={i} className="flex flex-col items-start gap-1 p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
                    <div className="flex justify-between w-full">
                       <span className="text-xs font-bold text-slate-900">{n.title}</span>
                       <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{n.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-body">{n.desc}</p>
                 </DropdownMenuItem>
               ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-[10px] font-black uppercase tracking-widest text-violet-600 p-3 rounded-xl">View All Notifications</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          onClick={() => navigate("/super-admin/settings")}
          className="rounded-full p-2 text-slate-500 transition-all hover:bg-slate-50 group"
        >
          <Settings className="h-5 w-5 group-hover:text-violet-600 transition-transform group-hover:rotate-45" />
        </button>

        <div className="mx-2 h-6 w-[1px] bg-slate-100" />

        <DropdownMenu>
           <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 pl-2 cursor-pointer group">
                 <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none">Super Admin</p>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5 leading-none">System Oversight</p>
                 </div>
                 <div className="rounded-full border-2 border-slate-50 p-0.5 group-hover:border-violet-100 transition-all">
                    <img
                      alt="Profile Avatar"
                      className="h-8 w-8 rounded-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBG-59Qw01KkhKu_nZnFVTMlGaLHgNLWbHRyVSHTK_3UqTGzzwAmDud4DshFQWzoHBc5z5028reqF4YKkEd7K1XrW3N6YwddvmSdNfScvprPTqfgVWjC4PfdmGsCdh-CP5DfSAxdpA1r2mLSY6oPA5g9KGeFvGq9m_VSzf6fwjjq0fQs0Gth5CPily4ic4HCk8U6GKxAZcVO7EgyReKjlJR-6O9JRHyXgPiP0Dw3Py9tS7SEtEVviDeuk9XkJiVP-HXJdWAakg9H8U"
                    />
                 </div>
              </div>
           </DropdownMenuTrigger>
           <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-100 shadow-2xl">
              <DropdownMenuLabel className="font-headline text-sm font-black p-2">System Profile</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-3 flex items-center gap-3 rounded-xl hover:bg-slate-50 cursor-pointer">
                 <User className="h-4 w-4 text-slate-400" />
                 <span className="text-xs font-bold text-slate-700">Account Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3 flex items-center gap-3 rounded-xl hover:bg-slate-50 cursor-pointer" onClick={() => navigate("/super-admin/settings")}>
                 <ShieldCheck className="h-4 w-4 text-slate-400" />
                 <span className="text-xs font-bold text-slate-700">Security Suite</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-3 flex items-center gap-3 rounded-xl hover:bg-red-50 cursor-pointer text-red-500" onClick={() => logout()}>
                 <LogOut className="h-4 w-4" />
                 <span className="text-xs font-bold">Terminate Session</span>
              </DropdownMenuItem>
           </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
