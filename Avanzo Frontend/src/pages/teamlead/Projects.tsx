import { TeamLeadChrome } from "@/components/portal/teamlead/TeamLeadChrome"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { useState } from "react"
import { toast } from "sonner"
import { CreateProjectModal } from "@/components/portal/teamlead/TeamLeadActionForms"
import { 
  Archive, 
  CheckCircle2, 
  AlertTriangle, 
  Filter, 
  Download,
  MoreHorizontal,
  Plus,
  Loader2
} from "lucide-react"

const STATS = [
  { label: "Total Projects", value: "12", sub: "+2 New", icon: Archive, color: "bg-violet-50 text-violet-700" },
  { label: "On Track", value: "9", sub: "75% Portfolio", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700" },
  { label: "At Risk", value: "3", sub: "-1% Health", icon: AlertTriangle, color: "bg-red-50 text-red-700" },
]

const PROJECTS = [
  { id: "PRJ-001", name: "Cloud Migration", team: "DevOps", progress: 85, health: "Healthy", color: "bg-emerald-500", date: "Oct 24, 2024" },
  { id: "PRJ-004", name: "Mobile App v2.0", team: "Mobile Engineering", progress: 40, health: "At Risk", color: "bg-red-500", date: "Nov 12, 2024" },
  { id: "PRJ-009", name: "Data Pipeline Engine", team: "Data Science", progress: 65, health: "Healthy", color: "bg-emerald-500", date: "Dec 05, 2024" },
  { id: "PRJ-012", name: "Quarterly Security Audit", team: "Infra Security", progress: 15, health: "On Hold", color: "bg-amber-500", date: "Jan 20, 2025" },
  { id: "PRJ-015", name: "API Documentation Revamp", team: "Product Team", progress: 95, health: "Healthy", color: "bg-emerald-500", date: "Oct 15, 2024" },
]

export default function ProjectProgress() {
  useDesignPortalLightTheme()
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    setIsExporting(true)
    const exportPromise = new Promise((resolve) => setTimeout(resolve, 2000))
    toast.promise(exportPromise, {
      loading: 'Drafting project portfolio synthesis...',
      success: 'Portfolio exported successfully to the departmental archive.',
      error: 'Export failed. Re-run tactical synchronization.',
    })
    exportPromise.finally(() => setIsExporting(false))
  }

  return (
    <TeamLeadChrome>
      <div className="p-8 space-y-8 font-body">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-headline text-3xl font-black text-slate-900 tracking-tight leading-none italic">Project Portfolio</h2>
            <p className="text-slate-500 mt-2 font-medium italic">Monitoring 12 active initiatives across your departments</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm shadow-sm disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export
            </button>
            <button 
              onClick={() => setIsCreateProjectOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-900/20 text-sm active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Create Project
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-body">
          {STATS.map((stat, i) => (
            <div key={i} className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-violet-100 group">
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
                <div className={`p-2.5 rounded-xl ${stat.color} transition-transform group-hover:scale-110`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-slate-900 leading-none">{stat.value}</span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                  stat.sub.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 
                  stat.sub.includes('Risk') || stat.sub.startsWith('-') ? 'text-red-600 bg-red-50' : 
                  'text-slate-400 bg-slate-50'
                }`}>
                  {stat.sub}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Portfolio Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden font-body">
          <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/5">
            <h3 className="font-headline font-bold text-slate-900">Active Strategic Units</h3>
            <button 
              onClick={() => toast.info("Configuring portfolio filters...")}
              className="p-2.5 hover:bg-slate-50 border border-slate-100 rounded-xl transition-colors text-slate-400 hover:text-violet-600 shadow-sm"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-50">
                  <th className="px-8 py-6">Project Nomenclature</th>
                  <th className="px-8 py-6">Division</th>
                  <th className="px-8 py-6">Utilization</th>
                  <th className="px-8 py-6">Sector Health</th>
                  <th className="px-8 py-6">Deadline</th>
                  <th className="px-8 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {PROJECTS.map((prj, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => toast.info(`Accessing ${prj.name} documentation...`)}>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 group-hover:text-violet-700 transition-colors">{prj.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tight">{prj.id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-violet-50 text-violet-700 text-[10px] font-bold uppercase tracking-tight">
                        {prj.team}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-100 shadow-inner">
                          <div className="bg-violet-600 h-full rounded-full transition-all duration-1000" style={{ width: `${prj.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-900">{prj.progress}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest ${
                        prj.health === 'Healthy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        prj.health === 'At Risk' ? 'bg-red-50 text-red-700 border border-red-100' :
                        'bg-amber-50 text-amber-700 border border-amber-b100'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          prj.health === 'Healthy' ? 'bg-emerald-600' :
                          prj.health === 'At Risk' ? 'bg-red-600' :
                          'bg-amber-600'
                        }`}></span>
                        {prj.health}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-tighter">{prj.date}</td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toast.info("Opening menu..."); }}
                        className="p-2 rounded-xl text-slate-300 hover:bg-white hover:text-violet-600 transition-all hover:shadow-sm"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-8 py-6 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Showing 5 of 12 Strategic Initiatives</p>
            <div className="flex gap-3">
              <button disabled className="px-5 py-2 text-xs font-bold bg-white border border-slate-100 rounded-xl text-slate-300 transition-colors shadow-sm uppercase tracking-widest">Previous</button>
              <button onClick={() => toast.info("Loading next set of projects...")} className="px-5 py-2 text-xs font-bold bg-white border border-slate-100 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-violet-700 transition-all shadow-sm uppercase tracking-widest">Next</button>
            </div>
          </div>
        </div>
      </div>
      <CreateProjectModal open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen} />
    </TeamLeadChrome>
  )
}
