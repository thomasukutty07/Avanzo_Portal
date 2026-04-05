import { toast } from "sonner"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { SuperAdminChrome } from "@/components/layout/SuperAdminChrome"
import { 
  Plus, 
  RefreshCcw, 
  Building2, 
  ShieldCheck,
  Search,
  Filter,
  MoreVertical,
  Zap,
  Ban,
  Users,
  Info,
  Activity
} from "lucide-react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
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

  return (
    <SuperAdminChrome>
      <div className="space-y-6 pb-12 font-display bg-[#fcfcfc] min-h-screen">
        {/* Hero Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
            <div className="font-headline">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 mb-1">
                GLOBAL ENTITY REGISTRY
              </p>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">
                 Organization Ecosystem
              </h1>
              <p className="text-slate-500 mt-2 text-sm font-medium">
                Real-time monitoring and lifecycle management of all registered companies.
              </p>
            </div>
          <div className="flex items-center gap-3 font-headline">
             <button 
               onClick={handleRefresh}
               disabled={refreshing}
               className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-100 rounded-xl text-[11px] font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50 uppercase tracking-widest"
             >
                <RefreshCcw className={`h-3 w-3 stroke-[2.5px] ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Syncing...' : 'Force Sync'}
             </button>
             <button className="flex items-center gap-2 px-8 py-2.5 bg-violet-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-violet-600/20 hover:bg-violet-700 transition-all active:scale-95">
                <Plus className="h-4 w-4 stroke-[3px]" />
                New Entity
             </button>
          </div>
        </div>

        <Sheet>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
             {/* Table Search Area */}
             <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50/10">
                <div className="flex items-center gap-4">
                   <div className="size-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                   <h3 className="font-headline text-lg font-black text-slate-900 uppercase tracking-tight">Active Registries</h3>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                   <div className="relative flex-1 sm:w-96">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input 
                         placeholder="Filter entities by name or token..."
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="w-full bg-white border-slate-200 rounded-xl pl-12 py-3 text-sm font-bold focus:ring-violet-600/10 focus:border-violet-600 transition-all placeholder:text-slate-300 uppercase tracking-tight"
                         type="text"
                      />
                   </div>
                   <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-500 hover:bg-slate-50 transition-all shadow-sm"><Filter className="h-5 w-5" /></button>
                </div>
             </div>

             <div className="overflow-x-auto flex-1">
               <table className="w-full text-left">
                 <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                    <tr>
                      <th className="px-10 py-6">ID Token</th>
                      <th className="px-10 py-6">Entity Identity</th>
                      <th className="px-10 py-6">Operational Metric</th>
                      <th className="px-10 py-6 text-right">System Matrix</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredOrgs.map((org) => (
                       <tr key={org.id} className="group hover:bg-slate-50 transition-colors pointer-cursor">
                          <SheetTrigger asChild>
                            <td className="px-10 py-7 font-black text-[12px] text-slate-300 tabular-nums uppercase tracking-widest cursor-pointer" onClick={() => setSelectedOrg(org)}>{org.id}</td>
                          </SheetTrigger>
                          <SheetTrigger asChild>
                            <td className="px-10 py-7 cursor-pointer" onClick={() => setSelectedOrg(org)}>
                               <div className="flex items-center gap-4">
                                  <div className="size-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-black group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm">
                                      {org.name[0]}
                                  </div>
                                  <div>
                                     <h4 className="font-headline text-[15px] font-black text-slate-900 group-hover:text-violet-700 transition-colors uppercase tracking-tight">{org.name}</h4>
                                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                       <Zap className="h-2.5 w-2.5 text-emerald-500" /> SYNC: {org.status}
                                     </p>
                                  </div>
                               </div>
                            </td>
                          </SheetTrigger>
                          <SheetTrigger asChild>
                            <td className="px-10 py-7 cursor-pointer" onClick={() => setSelectedOrg(org)}>
                               <div className="flex items-center gap-8">
                                  <div>
                                     <p className="text-xl font-black text-slate-900 tabular-nums leading-none tracking-tight">{org.units.toLocaleString()}</p>
                                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-1.5">Nodes Active</p>
                                  </div>
                                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest border shadow-sm ${
                                    org.risk === 'Low' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                    org.risk === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                    'bg-red-50 text-red-700 border-red-100'
                                  }`}>
                                     {org.risk} IMPACT
                                  </span>
                               </div>
                            </td>
                          </SheetTrigger>
                          <td className="px-10 py-7 text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                   <button className="p-3 text-slate-200 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all">
                                      <MoreVertical className="size-4" />
                                   </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-100 shadow-2xl bg-white z-[100]">
                                   <DropdownMenuLabel className="font-headline text-[10px] font-black p-2 uppercase tracking-widest text-slate-400">System Options</DropdownMenuLabel>
                                   <DropdownMenuSeparator />
                                   <SheetTrigger asChild>
                                      <DropdownMenuItem className="p-3 flex items-center gap-3 rounded-xl hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedOrg(org)}>
                                         <Building2 className="h-4 w-4 text-slate-400" />
                                         <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">View Intel</span>
                                      </DropdownMenuItem>
                                   </SheetTrigger>
                                   <DropdownMenuSeparator />
                                   <DropdownMenuItem className="p-3 flex items-center gap-3 rounded-xl hover:bg-red-50 cursor-pointer text-red-600" onClick={() => toast.error(`Terminating session: ${org.name}`)}>
                                      <Ban className="h-4 w-4" />
                                      <span className="text-[11px] font-black uppercase tracking-tight">Revoke Access</span>
                                   </DropdownMenuItem>
                                </DropdownMenuContent>
                             </DropdownMenu>
                          </td>
                       </tr>
                    ))}
                 </tbody>
               </table>
             </div>
          </div>

          <SheetContent className="w-full sm:max-w-md p-0 border-l-0 bg-slate-50 shadow-2xl overflow-hidden" showCloseButton={true}>
             {selectedOrg && (
                <div className="h-full flex flex-col">
                   <div className="bg-white p-12 border-b border-slate-50">
                      <div className="flex items-center gap-5 mb-10">
                         <div className="size-16 rounded-3xl bg-violet-600 flex items-center justify-center text-2xl font-black text-white shadow-2xl shadow-violet-600/30">
                            {selectedOrg.name[0]}
                         </div>
                         <div>
                            <h2 className="font-headline text-3xl font-black text-slate-900 tracking-tight leading-tight uppercase tabular-nums">{selectedOrg.name}</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">{selectedOrg.id} • Verified Entity</p>
                         </div>
                      </div>
                      <Button className="w-full py-6 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all shadow-xl shadow-slate-900/20">
                          Transfer Security Token
                      </Button>
                   </div>

                   <div className="p-10 space-y-10 flex-1 overflow-y-auto custom-scrollbar">
                      <section>
                         <div className="flex items-center gap-3 mb-6">
                            <Info className="h-4 w-4 text-violet-600" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300">Unit configurations</h3>
                         </div>
                         <div className="space-y-4">
                            {[
                               { label: "Operation Status", value: selectedOrg.status, icon: Zap, color: "text-emerald-500" },
                               { label: "Risk Coefficient", value: selectedOrg.risk, icon: ShieldCheck, color: "text-amber-500" },
                               { label: "Personnel Load", value: selectedOrg.units.toLocaleString(), icon: Users, color: "text-blue-500" },
                            ].map((item, i) => (
                               <div key={i} className="flex justify-between items-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-violet-100">
                                  <div className="flex items-center gap-4">
                                     <item.icon className={`h-5 w-5 ${item.color}`} />
                                     <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight">{item.label}</span>
                                  </div>
                                  <span className="text-[12px] font-black text-slate-900 uppercase tabular-nums">{item.value}</span>
                                </div>
                            ))}
                         </div>
                      </section>

                      <section>
                         <div className="flex items-center gap-3 mb-6">
                            <Activity className="h-4 w-4 text-violet-600" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300">Tactical Telemetry</h3>
                         </div>
                         <div className="bg-white rounded-[32px] border border-slate-100 p-8 space-y-6 shadow-sm">
                            <div className="flex justify-between items-end">
                               <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Load Saturation</p>
                               <span className="text-xl font-black text-slate-900 leading-none">82%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                               <div className="h-full bg-violet-600 rounded-full shadow-lg" style={{ width: '82%' }} />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] leading-relaxed">Signal strength is optimized across HQ-VPN units. Latency is within 4ms of expected benchmark.</p>
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
