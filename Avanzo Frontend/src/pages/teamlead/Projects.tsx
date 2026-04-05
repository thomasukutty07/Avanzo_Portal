import { TeamLeadChrome } from "@/components/portal/teamlead/TeamLeadChrome"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { projectsService } from "@/services/projects"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Zap, 
  Shield, 
  Activity,
  Award,
  Loader2,
  Calendar,
  Layout,
  ExternalLink,
  Users
} from "lucide-react"

export default function LeadProjectsPage() {
  useDesignPortalLightTheme()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const data = await projectsService.getProjects()
      setProjects(Array.isArray(data) ? data : (data.results || []))
    } catch (error) {
      toast.error("Sector synchronization failed.")
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeProjects = projects.filter(p => p.status === 'active').length
  const completedProjects = projects.filter(p => p.status === 'completed').length
  const highPriority = projects.filter(p => p.priority === 'high' || p.priority === 'urgent').length

  const STATS = [
    { label: "Sector Load", value: projects.length.toString(), icon: Layout, color: "violet", sub: "Mission Total" },
    { label: "Active Nodes", value: activeProjects.toString(), icon: Activity, color: "blue", sub: "Operational" },
    { label: "Secured Goals", value: completedProjects.toString(), icon: Shield, color: "emerald", sub: "Finalized" },
    { label: "Critical Priority", value: highPriority.toString(), icon: Zap, color: "orange", sub: "Immediate Focus" },
  ]

  return (
    <TeamLeadChrome>
      <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <header>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 font-headline leading-none uppercase">Strategic Portfolio</h2>
            <p className="text-sm font-bold text-slate-400 mt-3 uppercase tracking-widest leading-none">Global mission unit synchronization active</p>
          </header>
          <div className="flex gap-4">
             <button 
              onClick={() => toast.info("Opening mission archive...")}
              className="px-7 py-3 bg-white border border-slate-100 text-slate-900 font-black rounded-xl hover:bg-slate-50 transition-all text-[11px] uppercase tracking-widest active:scale-95 shadow-sm"
            >
              Export Dossier
            </button>
            <button 
              onClick={() => toast.info("Initializing project creator...")}
              className="flex items-center gap-2.5 px-7 py-3 bg-violet-600 text-white font-black rounded-xl hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-600/20 transition-all text-[11px] uppercase tracking-widest active:scale-95 shadow-md shadow-violet-600/10"
            >
              <Plus className="size-4 stroke-[3px]" />
              New Objective
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div key={i} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
               <div className="flex items-center justify-between mb-6">
                 <div className={`p-3 rounded-2xl ${
                   stat.color === 'violet' ? 'bg-violet-50 text-violet-600 border border-violet-100' :
                   stat.color === 'blue' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                   stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                   'bg-orange-50 text-orange-600 border border-orange-100'
                 } transition-all group-hover:scale-110`}>
                   <stat.icon className="h-6 w-6 stroke-[3px]" />
                 </div>
                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100/50">{stat.sub}</span>
               </div>
               <div className="space-y-1">
                 <h3 className="text-3xl font-black text-slate-900 font-headline tabular-nums tracking-tight leading-none">{stat.value}</h3>
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
               </div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-300 group-focus-within:text-violet-600 transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search strategic objectives and tactical keys..." 
              className="w-full bg-white border border-slate-100 rounded-2xl pl-14 pr-6 py-4.5 text-[13px] font-bold text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:border-violet-200 transition-all placeholder:text-slate-200 outline-none shadow-sm shadow-slate-200/10"
            />
          </div>
          <button className="flex items-center gap-3 px-8 py-4.5 bg-white border border-slate-100 text-slate-900 font-black rounded-2xl hover:bg-slate-50 transition-all text-[11px] uppercase tracking-[0.2em] shadow-sm shadow-slate-200/10 active:scale-95 group">
            <Filter className="size-4 text-violet-600 group-hover:rotate-180 transition-transform" />
            Sector Logic
          </button>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-700">
          <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/10">
             <h3 className="font-headline font-black text-xl text-slate-900 tracking-tight uppercase">Strategic Mission Matrix</h3>
             <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
               <Users className="size-4 text-violet-600" />
               Sector Capacity: 88%
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-10 py-6">Mission Interface</th>
                  <th className="px-10 py-6">Sector Momentum</th>
                  <th className="px-10 py-6">Priority Level</th>
                  <th className="px-10 py-6">Intelligence sync</th>
                  <th className="px-10 py-6 text-right">Status Terminal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                   <tr>
                     <td colSpan={5} className="px-10 py-32 text-center">
                        <Loader2 className="size-10 animate-spin text-violet-600 mx-auto mb-6" />
                        <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">Synchronizing Portfolios...</p>
                     </td>
                   </tr>
                ) : filteredProjects.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="px-10 py-32 text-center opacity-30">
                        <Award className="size-16 mx-auto mb-6 text-slate-200" />
                        <p className="text-[11px] font-black uppercase tracking-[0.2em]">Strategic Registry Empty</p>
                     </td>
                   </tr>
                ) : filteredProjects.map((p, i) => (
                  <tr key={i} className="group hover:bg-slate-50/30 transition-all cursor-pointer" onClick={() => toast.info(`Accessing mission dossier: ${p.name}`)}>
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-6">
                          <div className="size-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center p-3 shadow-sm group-hover:rounded-xl group-hover:border-violet-100 group-hover:shadow-xl transition-all">
                             <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=f5f3ff&color=7c3aed&bold=true`} alt={p.name} className="size-full rounded-xl" />
                          </div>
                          <div className="min-w-0">
                             <p className="text-[15px] font-black text-slate-900 group-hover:text-violet-600 transition-colors uppercase tracking-tight leading-none truncate">{p.name}</p>
                             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2 leading-none opacity-80">{p.client_name || 'Global Strategic Init.'}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex flex-col gap-3 min-w-[140px]">
                          <div className="w-full bg-slate-50 rounded-full h-2 overflow-hidden border border-slate-100 shadow-inner group-hover:border-violet-100 transition-colors">
                            <div className="bg-violet-600 h-full rounded-full transition-all duration-[2000ms] shadow-[0_0_10px_rgba(124,58,237,0.4)]" style={{ width: `${85}%` }} />
                          </div>
                          <span className="text-[10px] font-black text-slate-800 tabular-nums uppercase tracking-widest opacity-80">85% Deployment</span>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="inline-flex items-center gap-2.5 px-4 py-2 text-[10px] font-black rounded-xl uppercase tracking-widest border transition-all bg-white shadow-sm group-hover:shadow-xl">
                        <span className={`size-2 rounded-full ${
                          p.priority === 'high' || p.priority === 'urgent' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]' :
                          p.priority === 'medium' ? 'bg-blue-500' :
                          'bg-emerald-500'
                        }`} />
                        <span className="text-slate-900">{p.priority || 'Standard'}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 tabular-nums uppercase tracking-widest opacity-60">
                          <Calendar className="size-4" />
                          Jan 24, 2026
                       </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <div className="inline-flex items-center gap-2 group/btn cursor-pointer py-2 pl-4 pr-3 bg-slate-50 border border-slate-100 rounded-xl transition-all hover:bg-white hover:shadow-xl hover:border-violet-100">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest transition-colors group-hover/btn:text-violet-600">Terminal Dossier</span>
                          <div className="size-6 bg-white rounded-lg flex items-center justify-center border border-slate-100 group-hover/btn:border-violet-100 transition-all">
                             <ArrowUpRight className="size-3 text-slate-400 group-hover/btn:text-violet-600 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-all" />
                          </div>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </TeamLeadChrome>
  )
}
