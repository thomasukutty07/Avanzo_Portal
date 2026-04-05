import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { SuperAdminChrome } from "@/components/layout/SuperAdminChrome"
import { 
  RefreshCcw, 
  BarChart3, 
  Building2, 
  CheckCircle, 
  Lock,
  Loader2,
  ChevronRight
} from "lucide-react"
import { useState } from "react"

export default function SuperAdminDashboardPage() {
  useDesignPortalLightTheme()
  const navigate = useNavigate()
  const [refreshing, setRefreshing] = useState(false)
  const [compiling, setCompiling] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      toast.success("System data successfully synchronized.")
    }, 1200)
  }

  const handleCompileReport = () => {
    setCompiling(true)
    setTimeout(() => {
      setCompiling(false)
      toast.success("System report generated successfully.")
    }, 2000)
  }

  return (
    <SuperAdminChrome>
      <div className="space-y-6 pb-12 font-display bg-[#fcfcfc] min-h-screen">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 mb-1">
                    SYSTEM INFRASTRUCTURE OVERVIEW
                </p>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none font-headline">
                    Super Admin Console
                </h1>
                <p className="text-slate-500 mt-2 text-sm font-medium">Global synchronization, organization health, and system-wide audit monitoring.</p>
            </div>
            <div className="flex items-center gap-3 self-start md:self-auto">
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-100 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                    <RefreshCcw className={`h-4 w-4 stroke-[2px] ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Syncing...' : 'Refresh Protocol'}
                </button>
                <button 
                  onClick={handleCompileReport}
                  disabled={compiling}
                  className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-violet-600/20 hover:bg-violet-700 transition-all active:scale-95 disabled:opacity-50"
                >
                    {compiling ? <Loader2 className="h-4 w-4 animate-spin stroke-[2px]" /> : <BarChart3 className="h-4 w-4 stroke-[2px]" />}
                    {compiling ? 'Compiling...' : 'Execute Audit'}
                </button>
            </div>
        </div>

        {/* KPI Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "TOTAL ORGANIZATIONS", value: "254", trend: "+12.4% growth", icon: Building2, color: "text-violet-600 bg-violet-50", link: "/super-admin/organizations" },
            { label: "ACTIVE COMPANIES", value: "189", trend: "Verified System", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50", link: "/super-admin/organizations" },
            { label: "PENDING APPROVALS", value: "42", trend: "Action Required", icon: RefreshCcw, color: "text-amber-600 bg-amber-50", link: "/super-admin/pending" },
            { label: "SUSPENDED UNITS", value: "23", trend: "-2% Deceased", icon: Lock, color: "text-red-600 bg-red-50", action: () => toast.warning("Accessing suspension logs...") },
          ].map((kpi, i) => (
            <div 
               key={i} 
               className="group rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition-all hover:shadow-md cursor-pointer relative overflow-hidden" 
               onClick={() => kpi.link ? navigate(kpi.link) : kpi.action?.()}
            >
              <div className="mb-6 flex justify-between items-start">
                <div className={`rounded-xl ${kpi.color} p-3.5 shadow-sm group-hover:scale-110 transition-transform`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 shadow-sm">{kpi.trend}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-2 font-headline">{kpi.label}</p>
              <h3 className="text-4xl font-black text-slate-900 leading-none tracking-tight font-headline">{kpi.value}</h3>
            </div>
          ))}
        </section>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-6">
             <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                <div className="flex items-center justify-between mb-8">
                   <div>
                      <h3 className="text-lg font-black text-slate-900 font-headline">Recent Organization Activity</h3>
                      <p className="text-xs text-slate-400 mt-1">Status of recently registered client entities.</p>
                   </div>
                   <button className="text-[11px] font-black uppercase tracking-widest text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-1 font-headline">
                      Manage All <ChevronRight className="h-3 w-3" />
                   </button>
                </div>
                
                <div className="space-y-4">
                   {[
                     { name: "Nebula Dynamics", type: "Enterprise", status: "Active", users: "1.2k" },
                     { name: "Solaris Systems", type: "Defense", status: "Pending", users: "4.8k" },
                     { name: "Quantum Labs", type: "Security", status: "Active", users: "850" }
                   ].map((org, i) => (
                     <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-violet-100 translation-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                           <div className="size-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 font-black text-xs">
                              {org.name[0]}
                           </div>
                           <div>
                              <p className="text-sm font-black text-slate-900 font-headline">{org.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{org.type} Module</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-8">
                           <div className="text-right">
                              <p className="text-xs font-black text-slate-900 leading-none">{org.users}</p>
                              <p className="text-[9px] text-slate-400 uppercase tracking-tighter mt-1">Users</p>
                           </div>
                           <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${org.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                              {org.status}
                           </span>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </SuperAdminChrome>
  )
}
