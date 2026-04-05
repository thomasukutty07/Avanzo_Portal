import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { SuperAdminChrome } from "@/components/layout/SuperAdminChrome"
import { 
  Plus, 
  RefreshCcw, 
  BarChart3, 
  TrendingUp, 
  Building2, 
  CheckCircle, 
  AlertCircle, 
  Lock,
  Loader2,
  ShieldCheck
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
      <div className="space-y-6 pb-12 p-8 lg:p-12 font-display bg-[#fcfcfc] min-h-screen">
        {/* Hero Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 mb-1">
              SUPER ADMIN MANAGEMENT
            </p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight font-headline">
              Dashboard Overview
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              Centralized management of all organizations and system activity.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={handleRefresh}
               disabled={refreshing}
               className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
             >
                <RefreshCcw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Syncing...' : 'Refresh Data'}
             </button>
             <button 
               onClick={handleCompileReport}
               disabled={compiling}
               className="flex items-center gap-2 px-6 py-2 bg-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-violet-900/20 hover:bg-violet-700 transition-all active:scale-95 disabled:opacity-50"
             >
                {compiling ? <Loader2 className="h-3 w-3 animate-spin" /> : <BarChart3 className="h-3 w-3" />}
                {compiling ? 'Generating...' : 'Compile Report'}
             </button>
          </div>
        </div>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Organizations", value: "254", trend: "+12% growth", icon: Building2, color: "text-violet-600 bg-violet-50", link: "/super-admin/organizations" },
            { label: "Active Companies", value: "189", trend: "Normal Status", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50", link: "/super-admin/organizations" },
            { label: "Pending Approvals", value: "42", trend: "Action Required", icon: RefreshCcw, color: "text-amber-600 bg-amber-50", link: "/super-admin/pending" },
            { label: "Suspended Units", value: "23", trend: "-2% decrease", icon: Lock, color: "text-red-600 bg-red-50", action: () => toast.warning("Viewing suspension logs...") },
          ].map((kpi, i) => (
            <div 
               key={i} 
               className="group rounded-2xl border border-slate-50 bg-white p-7 shadow-sm transition-all hover:border-violet-100 hover:shadow-xl hover:shadow-violet-900/5 cursor-pointer" 
               onClick={() => kpi.link ? navigate(kpi.link) : kpi.action?.()}
            >
              <div className="mb-6 flex justify-between items-start">
                <div className={`rounded-xl ${kpi.color} p-4 shadow-inner group-hover:scale-110 transition-transform`}>
                  <kpi.icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{kpi.trend}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-2">{kpi.label}</p>
              <h3 className="font-headline text-3xl font-bold text-slate-900 leading-none tracking-tight">{kpi.value}</h3>
            </div>
          ))}
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-7 shadow-sm border border-slate-50 lg:col-span-2 space-y-10">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-violet-600" />
                  <h4 className="font-headline text-lg font-bold text-slate-900">Registration Growth</h4>
               </div>
               <span className="bg-slate-50 px-4 py-1.5 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">Annual Overview</span>
            </div>
            <div className="relative flex h-72 items-end justify-between gap-4 px-4">
              {[45, 58, 52, 68, 81, 63, 92].map((height, i) => (
                <div 
                  key={i} 
                  style={{ height: `${height}%` }}
                  className={`w-full rounded-2xl transition-all duration-500 cursor-help group/bar relative ${i === 6 ? 'bg-violet-600 shadow-xl shadow-violet-900/20' : 'bg-slate-100 hover:bg-violet-200'}`}
                  onClick={() => toast.info(`Monthly Growth Sector ${i + 1}: ${height}%`)}
                >
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none">
                      {height}%
                   </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col rounded-2xl bg-white p-7 shadow-sm border border-slate-50">
            <div className="flex items-center gap-3 mb-10">
               <CheckCircle className="h-5 w-5 text-emerald-500" />
               <h4 className="font-headline text-lg font-bold text-slate-900">Status Overview</h4>
            </div>
            <div className="relative flex flex-1 flex-col items-center justify-center">
              <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-[24px] border-violet-600 p-8 shadow-inner">
                <div className="absolute inset-0 rotate-45 rounded-full border-[24px] border-slate-50 border-r-transparent border-t-transparent shadow-sm"></div>
                <div className="text-center font-headline">
                  <span className="text-3xl font-bold text-slate-900">78%</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Operational</p>
                </div>
              </div>
              <div className="mt-12 w-full space-y-6">
                <div className="flex items-center justify-between group cursor-pointer" onClick={() => navigate("/super-admin/organizations")}>
                  <div className="flex items-center gap-4">
                    <div className="h-3 w-3 rounded-full bg-violet-600 shadow-lg shadow-violet-900/40 group-hover:scale-150 transition-transform"></div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900">Approved</span>
                  </div>
                  <span className="text-sm font-black text-slate-900 font-sans">142 companies</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-50 pt-4 group cursor-pointer" onClick={() => toast.warning("Viewing suspension logs...")}>
                  <div className="flex items-center gap-4">
                    <div className="h-3 w-3 rounded-full bg-slate-100 group-hover:bg-red-500 group-hover:scale-150 transition-all"></div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900">Suspended</span>
                  </div>
                  <span className="text-sm font-black text-slate-900 font-sans">40 companies</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Activity Feed */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl bg-white border border-slate-50 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-50 p-6 bg-slate-50/10">
              <h4 className="font-headline text-lg font-bold text-slate-900">Recent Activity</h4>
              <button
                onClick={() => navigate("/super-admin/organizations")}
                className="text-[10px] font-black text-violet-700 uppercase tracking-widest hover:text-violet-900 transition-colors"
              >
                View All
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {[
                { name: "TechNova Inc.", init: "TN", time: "2 hours ago", status: "Evaluation", tone: "amber", link: "/super-admin/pending" },
                { name: "GreenField Solutions", init: "GS", time: "5 hours ago", status: "Active", tone: "emerald", link: "/super-admin/organizations" },
                { name: "BlueSky Security", init: "BS", time: "Yesterday", status: "Active", tone: "emerald", link: "/super-admin/organizations" },
              ].map((reg, i) => (
                <div key={i} className="flex items-center justify-between p-8 transition-all hover:bg-slate-50 cursor-pointer group" onClick={() => navigate(reg.link)}>
                  <div className="flex items-center gap-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 font-bold text-slate-400 transition-all group-hover:bg-violet-600 group-hover:text-white shadow-sm font-headline text-lg">
                      {reg.init}
                    </div>
                    <div>
                      <p className="font-headline text-base font-bold text-slate-900 group-hover:text-violet-600 transition-colors">{reg.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 tracking-tight">Updated {reg.time}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border ${
                    reg.tone === "amber" ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                  }`}>
                    {reg.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white border border-slate-50 shadow-sm">
             <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/10">
                <h4 className="font-headline text-lg font-bold text-slate-900">System Alerts</h4>
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                   <div className="size-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" /> Live Feed
                </div>
             </div>
             <div className="p-10 space-y-10">
                {[
                  { label: "New Registration Request", sub: "TechNova Inc. has submitted a new application for review.", time: "10:42 AM", color: "bg-violet-600", link: "/super-admin/pending" },
                  { label: "System Maintenance Alert", sub: "Scheduled database synchronization in Sector 7G.", time: "09:15 AM", color: "bg-amber-500", link: "/super-admin/access" },
                  { label: "Organization Verified", sub: "Apex Systems account have been successfully activated.", time: "08:00 AM", color: "bg-emerald-500", link: "/super-admin/organizations" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group items-start cursor-pointer" onClick={() => navigate(item.link)}>
                     <div className={`shrink-0 size-12 rounded-2xl ${item.color} flex items-center justify-center text-white shadow-xl transition-all group-hover:scale-110 group-hover:rotate-12`}>
                        {i === 1 ? <AlertCircle className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
                     </div>
                     <div className="flex-1 border-b border-slate-50 pb-8 group-last:border-none group-last:pb-0">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{item.time}</p>
                        <h5 className="font-headline font-bold text-slate-900 text-base mt-2 group-hover:text-violet-600 transition-colors">{item.label}</h5>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed font-normal">{item.sub}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </section>
      </div>

      <button
        onClick={() => toast.success("Accessing registration terminal...")}
        className="fixed bottom-10 right-10 z-50 flex h-20 w-20 items-center justify-center rounded-[28px] bg-slate-900 text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all hover:scale-110 active:scale-95 group hover:bg-violet-700"
      >
        <Plus className="h-10 w-10 group-hover:rotate-90 transition-transform duration-500" />
      </button>
    </SuperAdminChrome>
  )
}
