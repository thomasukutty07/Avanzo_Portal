import { TeamLeadChrome } from "@/components/portal/teamlead/TeamLeadChrome"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { projectsService } from "@/services/projects"
import { accountsService } from "@/services/accounts"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { 
  Download, 
  TrendingUp, 
  Clock, 
  PieChart, 
  Zap,
  TrendingDown,
  ArrowUpRight,
  Loader2,
  Activity,
  Layers
} from "lucide-react"

export default function TeamReportsPage() {
  useDesignPortalLightTheme()
  const [tasks, setTasks] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const [taskData, memberData] = await Promise.all([
        projectsService.getTasks(),
        accountsService.getEmployees()
      ])
      setTasks(Array.isArray(taskData) ? taskData : (taskData.results || []))
      setMembers(Array.isArray(memberData) ? memberData : (memberData.results || []))
    } catch (error) {
      toast.error("Telemetry synchronization failed.")
    } finally {
      setLoading(false)
    }
  }

  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const totalTasks = tasks.length
  const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  const activeMembers = members.filter(m => m.is_active !== false).length

  const VELOCITY_DATA = [
    { month: "Jan", val: 65, opacity: "bg-violet-600/20" },
    { month: "Feb", val: 55, opacity: "bg-violet-600/20" },
    { month: "Mar", val: 75, opacity: "bg-violet-600/20" },
    { month: "Apr", val: 80, opacity: "bg-violet-600/20" },
    { month: "May", val: 95, opacity: "bg-violet-600/20" },
    { month: "Jun", val: successRate > 0 ? successRate : 100, opacity: "bg-violet-600" },
  ]

  const STATS = [
    { label: "Sector Velocity", value: `${Math.round(successRate)}%`, icon: Zap, trend: "+12.5%", color: "text-emerald-500", sub: "Mission Completion Rate" },
    { label: "Cycle Latency", value: "3.2d", icon: Clock, trend: "-4.2%", color: "text-red-500", sub: "Avg Tactical Resolution" },
    { label: "Active Nodes", value: activeMembers.toString(), icon: PieChart, trend: "Optimal", color: "text-violet-500", sub: "Unit Capacity Authorized" },
  ]

  return (
    <TeamLeadChrome>
      <div className="p-4 md:p-8 space-y-12 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-10">
          <header>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 font-headline leading-none uppercase">Operational Intelligence</h2>
            <p className="text-sm font-bold text-slate-400 mt-3 uppercase tracking-widest leading-none">Global Mission Telemetry Synchronization Active</p>
          </header>
          <div className="flex gap-4">
             <button 
              onClick={() => toast.success("Drafting tactical PDF synthesis...")}
              className="flex items-center gap-3 px-8 py-3.5 bg-violet-600 text-white font-black rounded-xl hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-600/20 transition-all text-[11px] uppercase tracking-widest active:scale-95 shadow-md shadow-violet-600/10"
            >
              <Download className="size-4.5 stroke-[3px]" />
              Export Dossier
            </button>
          </div>
        </div>

        {loading ? (
             <div className="py-40 text-center">
                <Loader2 className="size-10 animate-spin text-violet-600 mx-auto mb-6" />
                <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">Synchronizing Telemetry Data...</p>
             </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {STATS.map((stat, i) => (
                <div key={i} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1 group">
                  <div className="flex items-center justify-between mb-8">
                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
                    <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 transition-all group-hover:scale-110 group-hover:bg-violet-50 group-hover:border-violet-100 text-violet-600 shadow-sm">
                      <stat.icon className="size-7 stroke-[3px]" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-5">
                    <p className="text-5xl font-black text-slate-900 font-headline tabular-nums leading-none tracking-tight">{stat.value}</p>
                    <p className={`text-[11px] font-black ${stat.color} tracking-[0.2em] flex items-center gap-1.5 uppercase`}>
                       {stat.trend.includes('%') && (stat.trend.startsWith('+') ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />)}
                       {stat.trend}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mt-10 opacity-60 flex items-center gap-3 italic">
                    <Activity className="size-3.5 text-violet-600" />
                    {stat.sub}
                  </p>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm flex flex-col h-[520px] hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-violet-600/10" />
                <div className="flex items-center justify-between mb-12">
                  <header>
                    <h3 className="font-headline font-black text-2xl text-slate-900 tracking-tight uppercase">Velocity Telemetry</h3>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-2.5">Operational delivery per mission cycle</p>
                  </header>
                  <select className="bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-600 px-6 py-3.5 cursor-pointer shadow-sm uppercase tracking-[0.2em] focus:ring-4 focus:ring-violet-600/5 outline-none">
                    <option>H1-2026 Active</option>
                    <option>Global Archive</option>
                  </select>
                </div>
                
                <div className="flex-1 relative flex items-end justify-between gap-8 px-6 pb-6">
                  {VELOCITY_DATA.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-6 flex-1 group">
                       <div className="w-full relative bg-slate-50 rounded-3xl transition-all duration-700 hover:bg-slate-100 overflow-hidden cursor-help border border-slate-50 shadow-inner group-hover:border-violet-100/50" style={{ height: `${d.val}%` }} onClick={() => toast.info(`${d.month} Efficiency: ${d.val}%`)}>
                          <div className={`absolute bottom-0 w-full transition-all duration-1000 group-hover:brightness-110 shadow-[0_0_20px_rgba(124,58,237,0.3)] ${d.opacity}`} style={{ height: `100%` }}></div>
                       </div>
                       <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${d.month === 'Jun' ? 'text-violet-600' : 'text-slate-300 group-hover:text-slate-500'}`}>{d.month}</span>
                    </div>
                  ))}
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-24 px-6 opacity-[0.05]">
                     {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-full border-t-[4px] border-slate-900 border-dotted" />)}
                  </div>
                </div>
              </div>

              <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm flex flex-col h-[520px] hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-violet-600/10" />
                <div className="mb-14">
                  <h3 className="font-headline font-black text-2xl text-slate-900 tracking-tight uppercase">Resource Alignment</h3>
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-2.5">Unit distribution across strategic domains</p>
                </div>
                <div className="flex-1 flex flex-col justify-center space-y-12">
                  {[
                    { name: 'Engineering Nodes', val: 45 },
                    { name: 'Tactical Design', val: 30 },
                    { name: 'Quality Assurance', val: 15 },
                    { name: 'Ops Coordination', val: 10 },
                  ].map((cat, i) => (
                    <div key={i} className="space-y-4 group cursor-pointer" onClick={() => toast.info(`Syncing ${cat.name} focus: ${cat.val}%`)}>
                      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.18em]">
                        <span className="text-slate-400 group-hover:text-violet-600 transition-colors">{cat.name}</span>
                        <span className="text-slate-900 tabular-nums">{cat.val}%</span>
                      </div>
                      <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner group-hover:border-violet-100 transition-colors">
                        <div 
                          className={`h-full bg-violet-600 transition-all duration-[2500ms] ease-out rounded-full shadow-[0_0_15px_rgba(124,58,237,0.4)]`} 
                          style={{ width: `${cat.val}%`, opacity: 1 - i * 0.15 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Allocation Table */}
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-700">
              <div className="px-12 py-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/10">
                <h3 className="font-headline font-black text-2xl text-slate-900 tracking-tight uppercase">Operational Units Terminal</h3>
                <button 
                  onClick={() => toast.info("Opening global personnel register...")}
                  className="text-[11px] font-black text-violet-600 uppercase tracking-[0.2em] hover:translate-x-3 transition-transform flex items-center gap-4 group bg-violet-50 px-7 py-3 rounded-2xl border border-violet-100"
                >
                  <Layers className="size-4" />
                  Access Full Roster
                  <ArrowUpRight className="size-4.5 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-slate-300 text-[11px] font-black uppercase tracking-[0.25em]">
                    <tr>
                      <th className="px-12 py-8">Designated Unit</th>
                      <th className="px-12 py-8">Active Loads</th>
                      <th className="px-12 py-8">Efficiency Index</th>
                      <th className="px-12 py-8 text-right">Status Terminal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {members.slice(0, 5).map((m, i) => (
                      <tr key={i} className="hover:bg-slate-50/30 transition-all group cursor-pointer" onClick={() => toast.info(`Syncing ${m.full_name} performance telemetry...`)}>
                        <td className="px-12 py-9">
                           <div className="flex items-center gap-7 min-w-[280px]">
                              <div className="size-16 bg-white rounded-[1.8rem] overflow-hidden shadow-sm border border-slate-100 p-2 transition-all duration-500 group-hover:rounded-2xl group-hover:rotate-6 group-hover:shadow-2xl group-hover:border-violet-100">
                                 <img src={m.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.full_name)}&background=f5f3ff&color=7c3aed&bold=true`} alt={m.full_name} className="size-full rounded-2xl object-cover" />
                              </div>
                              <div className="space-y-1.5">
                                 <p className="text-[17px] font-black text-slate-900 group-hover:text-violet-600 transition-colors uppercase tracking-tight leading-none">{m.full_name}</p>
                                 <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em] leading-none opacity-80">{m.role_display || 'Sector Operative'}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-12 py-9">
                           <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] tabular-nums bg-slate-50 px-4 py-2 rounded-xl border border-slate-100/50 shadow-sm">{Math.floor(Math.random() * 5) + 3} Operational Units</span>
                        </td>
                        <td className="px-12 py-9">
                           <div className={`flex items-center gap-3 font-black text-[11px] uppercase tracking-[0.2em] ${m.is_active !== false ? 'text-emerald-500' : 'text-amber-500 bg-amber-50 rounded-xl px-4 py-2 border border-amber-100'}`}>
                              <TrendingUp className="size-5" />
                              {m.is_active !== false ? 'EXCELLENT' : 'AWAITING SYNC'}
                           </div>
                        </td>
                        <td className="px-12 py-9 text-right">
                           <div className={`inline-flex items-center px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] border transition-all ${
                             m.is_active !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm shadow-emerald-500/5' :
                             'bg-slate-50 text-slate-400 border-slate-100'
                           }`}>
                             <span className={`size-2.5 rounded-full mr-3.5 ${
                                m.is_active !== false ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                'bg-slate-300'
                             }`} />
                             {m.is_active !== false ? 'AUTHORIZED' : 'ENROUTE'}
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </TeamLeadChrome>
  )
}
