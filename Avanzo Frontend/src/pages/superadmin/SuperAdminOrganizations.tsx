import { toast } from "sonner"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { SuperAdminChrome } from "@/components/layout/SuperAdminChrome"
import { 
  Search, 
  Filter, 
  MoreVertical, 
  RefreshCcw, 
  Download,
  Building2,
  Users,
  ShieldCheck,
  Loader2,
  Archive,
  Ban,
  Lock,
  Zap,
  Info,
  Activity
} from "lucide-react"
import { useState, useMemo } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

const ORGS = [
  { id: "ORG-101", name: "Apex Systems Core", units: 1420, risk: "Low", status: "Active" },
  { id: "ORG-102", name: "Global Logistics Ltd.", units: 850, risk: "Medium", status: "On-Hold" },
  { id: "ORG-103", name: "BlueSky Security", units: 120, risk: "High", status: "Active" },
  { id: "ORG-104", name: "GreenField Solutions", units: 340, risk: "Low", status: "Active" },
  { id: "ORG-105", name: "TechNova Inc.", units: 2100, risk: "Low", status: "Active" },
  { id: "ORG-106", name: "Stark Industries", units: 5000, risk: "Low", status: "Active" },
]

export default function SuperAdminOrganizations() {
  useDesignPortalLightTheme()
  const [refreshing, setRefreshing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrg, setSelectedOrg] = useState<typeof ORGS[0] | null>(null)

  const filteredOrgs = useMemo(() => {
    return ORGS.filter(org => 
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      toast.success("Organization registry synchronized with global sectors.")
    }, 1200)
  }

  const handleExport = () => {
    setExporting(true)
    setTimeout(() => {
      try {
        const headers = ["ID Token", "Entity Identity", "Active Personnel", "Risk Level", "Status"]
        const rows = filteredOrgs.map(org => [
          org.id,
          org.name,
          org.units,
          org.risk,
          org.status
        ])

        const csvContent = [
          headers.join(","),
          ...rows.map(row => row.join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `avanzo_organizations_registry_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast.success("Organization manifest successfully exported as CSV.")
      } catch (err) {
        toast.error("Failed to generate entity export.")
        console.error(err)
      } finally {
        setExporting(false)
      }
    }, 1200)
  }

  return (
    <SuperAdminChrome>
      <div className="space-y-10 py-8 font-sans">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          {/* Header content unchanged */}
          <div>
            <div className="flex items-center gap-3 mb-2">
               <Building2 className="h-5 w-5 text-violet-600" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-600">Administrative Console</span>
            </div>
            <h1 className="font-display text-3xl font-black tracking-tight text-slate-900 leading-tight">
              Organization Management
            </h1>
            <p className="text-slate-500 mt-1 font-medium italic">
               Overview and lifecycle control for all registered companies.
            </p>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={handleExport}
               disabled={exporting}
               className="flex items-center gap-3 px-8 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
             >
                {exporting ? <Loader2 className="h-4 w-4 animate-spin text-violet-600" /> : <Download className="h-4 w-4 text-violet-600" />}
                {exporting ? 'Exporting...' : 'Export CSV'}
             </button>
             <button 
               onClick={handleRefresh}
               disabled={refreshing}
               className="flex items-center gap-3 px-10 py-3 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-violet-900/20 hover:bg-violet-700 transition-all active:scale-95 disabled:opacity-50"
             >
                <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Syncing...' : 'Refresh Grid'}
             </button>
          </div>
        </header>

        <Sheet>
          <div className="bg-white rounded-[40px] border border-slate-50 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
             {/* Table Search Area */}
             <div className="p-10 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50/10">
                <div className="flex items-center gap-4">
                   <div className="size-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50" />
                   <h3 className="font-display text-xl font-black text-slate-900 leading-none">Registered Organizations</h3>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                   <div className="relative flex-1 sm:w-80">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input 
                         placeholder="Filter by name or ID token..."
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="w-full bg-white border-slate-100 rounded-2xl pl-12 py-3 text-sm font-medium focus:ring-violet-700/10 focus:border-violet-700 transition-all placeholder:text-slate-300"
                         type="text"
                      />
                   </div>
                   <button onClick={() => toast.info("Advanced filter parameters deployed")} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all shadow-sm active:scale-95"><Filter className="h-5 w-5" /></button>
                </div>
             </div>

             <div className="overflow-x-auto flex-1">
               <table className="w-full text-left">
                 <thead className="bg-slate-50/30 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                   <tr>
                     <th className="px-10 py-6">Organization ID</th>
                     <th className="px-10 py-6">Company Identity</th>
                     <th className="px-10 py-6">Deployment Metrics</th>
                     <th className="px-10 py-6 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {filteredOrgs.length > 0 ? (
                     filteredOrgs.map((org) => (
                       <tr key={org.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                         <SheetTrigger asChild>
                            <td className="px-10 py-8 font-black text-xs text-slate-300 tracking-widest cursor-pointer" onClick={() => setSelectedOrg(org)}>{org.id}</td>
                         </SheetTrigger>
                         <SheetTrigger asChild>
                            <td className="px-10 py-8 cursor-pointer" onClick={() => setSelectedOrg(org)}>
                               <div className="flex items-center gap-4">
                                  <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-300 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm">
                                     {org.name[0]}
                                  </div>
                                  <div>
                                     <h4 className="font-display text-base font-black text-slate-900 group-hover:text-violet-700 transition-colors">{org.name}</h4>
                                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                       <Zap className="h-3 w-3 text-emerald-500" /> Status: {org.status}
                                     </p>
                                  </div>
                               </div>
                            </td>
                         </SheetTrigger>
                         <SheetTrigger asChild>
                            <td className="px-10 py-8 cursor-pointer" onClick={() => setSelectedOrg(org)}>
                               <div className="flex items-center gap-8">
                                  <div className="space-y-1.5">
                                     <p className="text-xl font-black text-slate-900 leading-none tracking-tighter">{org.units}</p>
                                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Personnel</p>
                                  </div>
                                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border ${
                                    org.risk === 'Low' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                    org.risk === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                    'bg-red-50 text-red-700 border-red-100'
                                  }`}>
                                     {org.risk} Risk Signal
                                  </span>
                               </div>
                            </td>
                         </SheetTrigger>
                         <td className="px-10 py-8" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-3">
                               <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                     <button 
                                       className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 transition-all shadow-sm active:scale-95"
                                     >
                                        <MoreVertical className="h-5 w-5" />
                                     </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-100 shadow-2xl bg-white z-[100]">
                                     <DropdownMenuLabel className="font-display text-xs font-black p-2 uppercase tracking-widest text-slate-400">System Actions</DropdownMenuLabel>
                                     <DropdownMenuSeparator />
                                     <SheetTrigger asChild>
                                        <DropdownMenuItem className="p-3 flex items-center gap-3 rounded-xl hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedOrg(org)}>
                                           <Building2 className="h-4 w-4 text-slate-400" />
                                           <span className="text-xs font-bold text-slate-700">View Properties</span>
                                        </DropdownMenuItem>
                                     </SheetTrigger>
                                     <DropdownMenuSeparator />
                                     <DropdownMenuItem className="p-3 flex items-center gap-3 rounded-xl hover:bg-amber-50 cursor-pointer text-amber-600" onClick={() => toast.warning(`Suspending system access for ${org.name}`)}>
                                        <Lock className="h-4 w-4" />
                                        <span className="text-xs font-bold">Restrict Access</span>
                                     </DropdownMenuItem>
                                     <DropdownMenuItem className="p-3 flex items-center gap-3 rounded-xl hover:bg-red-50 cursor-pointer text-red-600" onClick={() => toast.error(`Terminating organization session: ${org.name}`)}>
                                        <Ban className="h-4 w-4" />
                                        <span className="text-xs font-bold">Suspend Organization</span>
                                     </DropdownMenuItem>
                                  </DropdownMenuContent>
                               </DropdownMenu>
                            </div>
                         </td>
                       </tr>
                     ))
                   ) : (
                     <tr>
                        {/* No matching entities area unchanged */}
                        <td colSpan={4} className="px-10 py-20 text-center">
                          <div className="flex flex-col items-center gap-4 opacity-30">
                             <Archive className="h-12 w-12 text-slate-300" />
                             <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">No matching entities found in global registry</p>
                          </div>
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
             
             {/* Footer area unchanged */}
             <div className="p-10 bg-slate-50/30 border-t border-slate-50">
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                 <p className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    Synchronized {filteredOrgs.length} active global entities
                 </p>
                 <button 
                   onClick={() => toast.info("Accessing encrypted archives...")}
                   className="text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-2 group"
                 >
                    View Archived Units
                    <Archive className="h-3 w-3 group-hover:scale-125 transition-transform" />
                 </button>
              </div>
           </div>
          </div>

          <SheetContent className="w-full sm:max-w-md p-0 border-l-0 bg-slate-50 shadow-2xl overflow-hidden" showCloseButton={true}>
             {selectedOrg && (
                <div className="h-full flex flex-col">
                   <div className="bg-white p-8 sm:p-12 border-b border-slate-100">
                      <div className="flex items-center gap-4 mb-8">
                         <div className="size-14 sm:size-16 rounded-2xl sm:rounded-3xl bg-violet-600 flex items-center justify-center text-xl sm:text-2xl font-black text-white shadow-2xl shadow-violet-600/30">
                            {selectedOrg.name[0]}
                         </div>
                         <div>
                            <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">{selectedOrg.name}</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{selectedOrg.id} • Registered Node</p>
                         </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:gap-4">
                         <button 
                            onClick={() => toast.success("Entity metadata packet compiled for transmission.")}
                            className="flex items-center justify-center gap-3 py-3 sm:py-4 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all shadow-xl shadow-violet-900/10 active:scale-95"
                         >
                            <Download className="h-4 w-4 text-white" />
                            Compile Meta Packet
                         </button>
                      </div>
                   </div>

                   <div className="p-8 sm:p-12 space-y-10 flex-1 overflow-y-auto custom-scrollbar">
                      <section>
                         <div className="flex items-center gap-3 mb-6">
                            <Info className="h-4 w-4 text-violet-600" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node Configuration</h3>
                         </div>
                         <div className="grid grid-cols-1 gap-3">
                            {[
                               { label: "Operational Status", value: selectedOrg.status, icon: Zap, color: "text-emerald-500" },
                               { label: "Risk Coefficient", value: selectedOrg.risk, icon: ShieldCheck, color: "text-amber-500" },
                               { label: "Active Personnel", value: selectedOrg.units, icon: Users, color: "text-blue-500" },
                            ].map((item, i) => (
                               <div key={i} className="flex justify-between items-center p-5 sm:p-6 bg-white rounded-[24px] border border-slate-100 shadow-sm hover:border-violet-100 transition-colors">
                                  <div className="flex items-center gap-4">
                                     <item.icon className={`h-5 w-5 ${item.color}`} />
                                     <span className="text-xs sm:text-sm font-bold text-slate-600">{item.label}</span>
                                  </div>
                                  <span className="text-xs sm:text-sm font-black text-slate-900">{item.value}</span>
                               </div>
                            ))}
                         </div>
                      </section>

                      <section>
                         <div className="flex items-center gap-3 mb-6">
                            <Activity className="h-4 w-4 text-violet-600" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Real-time Telemetry</h3>
                         </div>
                         <div className="bg-white rounded-[32px] border border-slate-100 p-8 space-y-6 shadow-sm">
                            <div className="flex justify-between items-end">
                               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Network Saturation</p>
                               <p className="text-base sm:text-lg font-black text-slate-900 tracking-tighter">82%</p>
                            </div>
                            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                               <div className="h-full bg-violet-600" style={{ width: '82%' }} />
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Signal strength optimal across all primary sectors. Latency within compliance parameters.</p>
                         </div>
                      </section>
                   </div>
                </div>
             )}
          </SheetContent>
        </Sheet>
      </div>
    </SuperAdminChrome>
  )
}
