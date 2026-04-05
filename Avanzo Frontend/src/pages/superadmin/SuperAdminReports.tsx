import { toast } from "sonner"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { SuperAdminChrome } from "@/components/layout/SuperAdminChrome"
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Download, 
  BarChart3, 
  ShieldCheck, 
  Mail,
  Loader2,
  FileSearch,
  Zap
} from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

const REPORTS = [
  { id: "REP-01", name: "Quarterly Financial Audit", type: "Financial", date: "Oct 12, 2023", size: "2.4 MB" },
  { id: "REP-02", name: "Monthly Security Analysis", type: "Security", date: "Oct 05, 2023", size: "1.8 MB" },
  { id: "REP-03", name: "System Uptime Aggregate", type: "Infrastructure", date: "Sep 30, 2023", size: "4.2 MB" },
]

export default function SuperAdminReports() {
  useDesignPortalLightTheme()
  const [compiling, setCompiling] = useState(false)

  const handleCompile = () => {
    setCompiling(true)
    setTimeout(() => {
      setCompiling(false)
      toast.success("Latest system intelligence report compiled and indexed.")
    }, 2500)
  }

  const handleDownloadReport = (report: typeof REPORTS[0]) => {
    try {
      const csvContent = [
        ["Report ID", "Name", "Type", "Generation Date", "Payload Size"],
        [report.id, report.name, report.type, report.date, report.size]
      ].map(row => row.join(",")).join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `${report.name.toLowerCase().replace(/ /g, '_')}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success(`Intelligence packet ${report.id} downloaded successfully.`)
    } catch (err) {
      toast.error("Failed to extract report data.")
      console.error(err)
    }
  }

  return (
    <SuperAdminChrome>
      <div className="space-y-10 py-8 font-sans text-slate-600">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <FileSearch className="h-5 w-5 text-violet-600" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-600">Reporting Center</span>
            </div>
            <h1 className="font-display text-3xl font-black tracking-tight text-slate-900 leading-tight">
              System Analytics
            </h1>
            <p className="text-slate-500 mt-1 font-medium italic">
               Aggregate and analyze system-wide performance and security reports.
            </p>
          </div>
          <button 
            disabled={compiling}
            onClick={handleCompile}
            className="flex items-center gap-3 px-8 py-3 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-violet-900/20 hover:bg-violet-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {compiling ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
            {compiling ? 'Compiling Intel...' : 'Compile Report'}
          </button>
        </header>

        {/* Dashboard Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
              { label: "Uptime Status", value: "99.9%", icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50", trend: "Stability Index" },
              { label: "Sync Velocity", value: "84 GB/s", icon: Zap, color: "text-blue-600 bg-blue-50", trend: "Real-time Feed" },
              { label: "Pending Tasks", value: "12 units", icon: Mail, color: "text-violet-600 bg-violet-50", trend: "Action Required" },
           ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-50 shadow-sm flex flex-col gap-6 group transition-all hover:shadow-xl hover:shadow-violet-900/5">
                 <div className="flex justify-between items-start">
                    <div className={`p-4 rounded-2xl ${stat.color} shadow-inner`}>
                       <stat.icon className="h-6 w-6" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{stat.trend}</span>
                 </div>
                 <div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                    <p className="text-3xl font-black text-slate-900 leading-none tracking-tighter">{stat.value}</p>
                 </div>
              </div>
           ))}
        </div>

        <div className="bg-white rounded-[40px] border border-slate-50 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
           <div className="p-10 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50/10">
              <div className="flex items-center gap-4">
                 <div className="size-3 bg-violet-600 rounded-full shadow-lg shadow-violet-600/50" />
                 <h3 className="font-display text-xl font-black text-slate-900 leading-none">Available Reports</h3>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                 <div className="relative flex-1 sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                       placeholder="Filter reports by codex name..."
                       className="w-full bg-white border-slate-100 rounded-2xl pl-12 py-3 text-sm font-medium focus:ring-violet-700/10 focus:border-violet-700 transition-all placeholder:text-slate-300"
                       type="text"
                    />
                 </div>
                 <button onClick={() => toast.info("Codex filtering operational")} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all shadow-sm active:scale-95"><Filter className="h-5 w-5" /></button>
              </div>
           </div>

           <div className="overflow-x-auto flex-1">
             <table className="w-full text-left">
               <thead className="bg-slate-50/30 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                 <tr>
                   <th className="px-10 py-6">Report ID</th>
                   <th className="px-10 py-6">Report Title</th>
                   <th className="px-10 py-6">Generated Date</th>
                   <th className="px-10 py-6 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {REPORTS.map((rep) => (
                   <tr key={rep.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                     <td className="px-10 py-8 font-black text-xs text-slate-300 tracking-widest">{rep.id}</td>
                     <td className="px-10 py-8">
                        <div>
                           <h4 className="font-display text-base font-black text-slate-900 group-hover:text-violet-700 transition-colors">{rep.name}</h4>
                           <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5">{rep.type} Sector • {rep.size}</p>
                        </div>
                     </td>
                     <td className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">{rep.date}</td>
                     <td className="px-10 py-8">
                        <div className="flex justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                           <button 
                             onClick={() => handleDownloadReport(rep)}
                             className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-violet-600 hover:border-violet-100 transition-all shadow-sm active:scale-95"
                             title="Download Packet"
                           >
                              <Download className="h-5 w-5" />
                           </button>
                           
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                 <button 
                                   className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 transition-all shadow-sm active:scale-95"
                                 >
                                    <MoreVertical className="h-5 w-5" />
                                 </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-100 shadow-2xl bg-white z-[100]">
                                 <DropdownMenuLabel className="font-display text-xs font-black p-2 uppercase tracking-widest text-slate-400">Report Options</DropdownMenuLabel>
                                 <DropdownMenuSeparator />
                                 <DropdownMenuItem className="p-3 flex items-center gap-3 rounded-xl hover:bg-slate-50 cursor-pointer" onClick={() => toast.info(`Relaying report to secure endpoint...`)}>
                                    <Mail className="h-4 w-4 text-slate-400" />
                                    <span className="text-xs font-bold text-slate-700">Share via Email</span>
                                 </DropdownMenuItem>
                                 <DropdownMenuItem className="p-3 flex items-center gap-3 rounded-xl hover:bg-slate-50 cursor-pointer" onClick={() => toast.info(`Accessing report history...`)}>
                                    <BarChart3 className="h-4 w-4 text-slate-400" />
                                    <span className="text-xs font-bold text-slate-700">View History</span>
                                 </DropdownMenuItem>
                                 <DropdownMenuSeparator />
                                 <DropdownMenuItem className="p-3 flex items-center gap-3 rounded-xl hover:bg-red-50 cursor-pointer text-red-600" onClick={() => toast.error(`Purging report entry: ${rep.id}`)}>
                                    <ShieldCheck className="h-4 w-4" />
                                    <span className="text-xs font-bold">Archive Report</span>
                                 </DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </SuperAdminChrome>
  )
}
