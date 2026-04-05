import { toast } from "sonner"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { SuperAdminChrome } from "@/components/layout/SuperAdminChrome"
import { 
  Search, 
  Filter, 
  ShieldCheck, 
  AlertCircle,
  Activity,
  User,
  Clock,
  Download,
  Database,
  Loader2
} from "lucide-react"
import { useState } from "react"

const AUDIT_LOGS = [
  { id: "LOG-001", user: "Admin Alpha", action: "System Config Update", target: "Global Settings", status: "Success", time: "10:45 AM", date: "Oct 24, 2023" },
  { id: "LOG-002", user: "Security Bot", action: "Unauthorized Access Blocked", target: "Sector 7G Node", status: "Critical", time: "09:12 AM", date: "Oct 24, 2023" },
  { id: "LOG-003", user: "System Automator", action: "Organization Provisioned", target: "TechNova Inc.", status: "Success", time: "08:00 AM", date: "Oct 24, 2023" },
  { id: "LOG-004", user: "Admin Beta", action: "User Permission Revoked", target: "ID: EMP-402", status: "Warning", time: "Yesterday", date: "Oct 23, 2023" },
]

export default function SuperAdminAuditLogs() {
  useDesignPortalLightTheme()
  const [exporting, setExporting] = useState(false)

  const handleExport = () => {
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      toast.success("Audit trail exported for security review.")
    }, 1500)
  }

  return (
    <SuperAdminChrome>
      <div className="space-y-10 py-8 font-sans text-slate-600">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="font-display text-3xl font-black tracking-tight text-slate-900 leading-tight">
              Audit Logs
            </h1>
            <p className="text-slate-500 mt-1 font-medium italic">
               Comprehensive immutable ledger of all high-level system operations.
            </p>
          </div>
          <button 
            disabled={exporting}
            onClick={handleExport}
            className="flex items-center gap-3 px-8 py-3 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-violet-900/20 hover:bg-violet-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {exporting ? 'Exporting...' : 'Export Audit Trail'}
          </button>
        </header>

        {/* Global Activity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
              { label: "Total Operations", value: "1.4k", icon: Activity, color: "text-violet-600 bg-violet-50" },
              { label: "Security Events", value: "23", icon: AlertCircle, color: "text-red-600 bg-red-50" },
              { label: "Access Requests", value: "842", icon: User, color: "text-blue-600 bg-blue-50" },
              { label: "DB Changes", value: "156", icon: Database, color: "text-amber-600 bg-amber-50" },
           ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm flex items-center gap-5 transition-all hover:shadow-xl hover:shadow-violet-900/5 group cursor-help" onClick={() => toast.info(`Viewing ${stat.label} analytics`)}>
                 <div className={`p-4 rounded-2xl ${stat.color} shadow-inner group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-5 w-5" />
                 </div>
                 <div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900 leading-none tracking-tighter">{stat.value}</p>
                 </div>
              </div>
           ))}
        </div>

        <div className="bg-white rounded-[40px] border border-slate-50 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
           <div className="p-10 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50/10">
              <div className="flex items-center gap-4">
                 <div className="size-3 bg-violet-600 rounded-full shadow-lg shadow-violet-600/50 animate-pulse" />
                 <h3 className="font-display text-xl font-black text-slate-900 leading-none">Security Logs</h3>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                 <div className="relative flex-1 sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                       placeholder="Search logs by ID or User..."
                       className="w-full bg-white border-slate-100 rounded-2xl pl-12 py-3 text-sm font-medium focus:ring-violet-700/10 focus:border-violet-700 transition-all placeholder:text-slate-300"
                       type="text"
                    />
                 </div>
                 <button onClick={() => toast.info("Audit filters ready")} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all shadow-sm active:scale-95"><Filter className="h-5 w-5" /></button>
              </div>
           </div>

           <div className="overflow-x-auto flex-1">
             <table className="w-full text-left">
               <thead className="bg-slate-50/30 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                 <tr>
                   <th className="px-10 py-6">Operation ID</th>
                   <th className="px-10 py-6">Actor</th>
                   <th className="px-10 py-6">Action Details</th>
                   <th className="px-10 py-6">Status</th>
                   <th className="px-10 py-6 text-right">Timestamp</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {AUDIT_LOGS.map((log) => (
                   <tr key={log.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer" onClick={() => toast.info(`Viewing details for ${log.id}`)}>
                     <td className="px-10 py-8 font-black text-xs text-slate-300 tracking-widest">{log.id}</td>
                     <td className="px-10 py-8">
                        <div className="flex items-center gap-3">
                           <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-slate-400" />
                           </div>
                           <span className="font-display text-sm font-black text-slate-900 group-hover:text-violet-700 transition-colors">{log.user}</span>
                        </div>
                     </td>
                     <td className="px-10 py-8">
                        <div>
                           <p className="text-sm font-bold text-slate-900 leading-tight">{log.action}</p>
                           <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Target: {log.target}</p>
                        </div>
                     </td>
                     <td className="px-10 py-8">
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border ${
                          log.status === 'Success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          log.status === 'Warning' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-red-50 text-red-700 border-red-100'
                        }`}>
                           {log.status}
                        </span>
                     </td>
                     <td className="px-10 py-8 text-right">
                        <div className="flex flex-col items-end gap-1">
                           <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                              <Clock className="h-3 w-3 text-slate-400" />
                              {log.time}
                           </div>
                           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{log.date}</p>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           
           <div className="p-8 bg-slate-50/30 border-t border-slate-50 text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">Live monitoring stream active</p>
           </div>
        </div>
      </div>
    </SuperAdminChrome>
  )
}
