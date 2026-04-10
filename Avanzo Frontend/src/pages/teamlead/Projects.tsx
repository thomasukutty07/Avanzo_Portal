import TeamLeadChrome from "@/components/portal/teamlead/TeamLeadChrome"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { projectsService } from "@/services/projects"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { 
  Plus, 
  Search, 
  Filter, 
  Zap, 
  Shield, 
  Activity,
  Award,
  Loader2,
  Calendar,
  Layout,
  Users,
  Trash2
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

  const handleDeleteProject = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation()
    if (!window.confirm(`Are you absolutely sure you want to delete mission project '${title}'? This action is irreversible.`)) return;
    
    try {
      setLoading(true)
      await projectsService.deleteProject(id)
      toast.success("Strategic objective permanently deleted.")
      fetchProjects()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete project.")
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(p => 
    (p.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
    (p.client_name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  )

  const activeProjects = projects.filter(p => p.status === 'active').length
  const completedProjects = projects.filter(p => p.status === 'completed').length
  const highPriority = projects.filter(p => p.priority === 'high' || p.priority === 'urgent').length

  const STATS = [
    { label: "Total Projects", value: projects.length.toString(), icon: Layout, color: "violet", sub: "Total" },
    { label: "Active", value: activeProjects.toString(), icon: Activity, color: "blue", sub: "In Progress" },
    { label: "Completed", value: completedProjects.toString(), icon: Shield, color: "emerald", sub: "Done" },
    { label: "Urgent", value: highPriority.toString(), icon: Zap, color: "orange", sub: "Priority" },
  ]

  return (
    <TeamLeadChrome>
      <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <header>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 font-headline leading-none">Project List</h2>
            <p className="text-xs font-bold text-slate-400 mt-2 font-headline leading-none opacity-60">Track and manage team projects</p>
          </header>
          <div className="flex gap-3.5">
             <button 
              onClick={() => toast.info("Opening project archive...")}
              className="px-6 py-2.5 bg-white border border-slate-100 text-slate-900 font-black rounded-xl hover:bg-slate-50 transition-all text-[10px] active:scale-95 shadow-sm"
            >
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
               <div className="flex items-center justify-between mb-5">
                 <div className={`p-2.5 rounded-xl ${
                   stat.color === 'violet' ? 'bg-violet-50 text-violet-600 border border-violet-100' :
                   stat.color === 'blue' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                   stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                   'bg-orange-50 text-orange-600 border border-orange-100'
                 } transition-all group-hover:scale-110`}>
                   <stat.icon className="h-5 w-5 stroke-[3px]" />
                 </div>
                 <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100/50">{stat.sub}</span>
               </div>
               <div className="space-y-1">
                 <h3 className="text-2xl font-black text-slate-900 font-headline tabular-nums tracking-tight leading-none">{stat.value}</h3>
                 <p className="text-[10px] font-bold text-slate-400 opacity-80">{stat.label}</p>
               </div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row items-center gap-5">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-4.5 text-slate-300 group-focus-within:text-violet-600 transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects and clients..." 
              className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-[13px] font-bold text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:border-violet-200 transition-all placeholder:text-slate-200 outline-none shadow-sm shadow-slate-200/10 tracking-tight"
            />
          </div>
          <button className="flex items-center gap-2.5 px-7 py-4 bg-white border border-slate-100 text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all text-xs shadow-sm shadow-slate-200/10 active:scale-95 group tracking-tight">
            <Filter className="size-4 text-violet-600 group-hover:rotate-180 transition-transform" />
            Settings
          </button>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-700">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/10">
             <h3 className="font-headline font-black text-lg text-slate-900 tracking-tight">Project Status</h3>
             <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
               <Users className="size-3.5 text-violet-600" />
               Capacity: 88%
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.15em]">
                <tr>
                  <th className="px-8 py-5">Project Name</th>
                  <th className="px-8 py-5">Progress</th>
                  <th className="px-8 py-5">Priority level</th>
                  <th className="px-8 py-5">Target Date</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                   <tr>
                     <td colSpan={5} className="px-8 py-24 text-center text-[11px] font-black uppercase tracking-widest text-slate-300">
                        <Loader2 className="size-10 animate-spin text-violet-600 mx-auto mb-6" />
                        Loading projects...
                     </td>
                   </tr>
                ) : filteredProjects.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="px-8 py-24 text-center opacity-30 text-[11px] font-black uppercase tracking-widest text-slate-300">
                        <Award className="size-12 mx-auto mb-6 text-slate-200" />
                        No projects found
                     </td>
                   </tr>
                ) : filteredProjects.map((p, i) => (
                  <tr key={i} className="group hover:bg-slate-50/30 transition-all cursor-pointer" onClick={() => toast.info(`Accessing project details: ${p.title}`)}>
                    <td className="px-8 py-7">
                       <div className="flex items-center gap-5">
                          <div className="size-12 rounded-[1.2rem] bg-white border border-slate-100 flex items-center justify-center p-2 shadow-sm group-hover:rounded-xl group-hover:border-violet-100 group-hover:shadow-lg transition-all">
                             <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p.title)}&background=f5f3ff&color=7c3aed&bold=true`} alt={p.title} className="size-full rounded-xl" />
                          </div>
                          <div className="min-w-0">
                             <p className="text-sm font-bold text-slate-900 group-hover:text-violet-600 transition-colors tracking-tight leading-none truncate capitalize">{p.title}</p>
                             <p className="text-[10px] text-slate-400 font-bold mt-2 leading-none opacity-80">{p.client_name || 'Global Strategic Init.'}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-7">
                       <div className="flex flex-col gap-2.5 min-w-[120px]">
                          <div className="w-full bg-slate-50 rounded-full h-1.5 overflow-hidden border border-slate-100 shadow-inner group-hover:border-violet-100 transition-colors">
                            <div className="bg-violet-600 h-full rounded-full transition-all duration-[2000ms] shadow-[0_0_8px_rgba(124,58,237,0.4)]" style={{ width: `${p.progress || 0}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 tabular-nums">{p.progress || 0}% completed</span>
                       </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all bg-white shadow-sm group-hover:shadow-lg">
                        <span className={`size-2 rounded-full ${
                          p.priority === 'high' || p.priority === 'urgent' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]' :
                          p.priority === 'medium' ? 'bg-blue-500' :
                          'bg-emerald-500'
                        }`} />
                        <span className="text-slate-900 capitalize">{p.priority || 'Standard'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                       <div className="flex items-center gap-2.5 text-[10px] font-bold text-slate-400 tabular-nums opacity-60">
                          <Calendar className="size-3.5" />
                          {p.target_end_date ? new Date(p.target_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No target date'}
                       </div>
                    </td>
                    <td className="px-8 py-7 text-right">
                       <div className="flex items-center justify-end gap-3">
                         <button 
                           onClick={(e) => handleDeleteProject(e, p.id, p.title)}
                           className="p-2.5 bg-white border border-slate-100 hover:border-red-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl shadow-sm transition-all"
                           title="Delete Project"
                         >
                           <Trash2 className="size-4" />
                         </button>
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
