import TeamLeadChrome from "@/components/portal/teamlead/TeamLeadChrome"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { projectsService } from "@/services/projects"
import { accountsService } from "@/services/accounts"
import { useNavigate } from "react-router-dom"
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
  const navigate = useNavigate()
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
      <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <header>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 font-headline leading-none">Operational Intelligence</h2>
            <p className="text-xs font-bold text-slate-400 mt-2 font-headline leading-none opacity-60">Global mission telemetry synchronization active</p>
          </header>
          <div className="flex gap-4">
             <button 
              onClick={() => toast.success("Drafting tactical PDF synthesis...")}
              className="flex items-center gap-2.5 px-6 py-2.5 bg-violet-600 text-white font-black rounded-xl hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-600/20 transition-all text-[10px] active:scale-95 shadow-md shadow-violet-600/10 uppercase tracking-widest"
            >
              <Download className="size-4 stroke-[3px]" />
              Export Dossier
            </button>
          </div>
        </div>

        {loading ? (
             <div className="py-32 text-center text-[11px] font-black uppercase tracking-widest text-slate-300">
                <Loader2 className="size-10 animate-spin text-violet-600 mx-auto mb-6" />
                Synchronizing Telemetry Data...
             </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STATS.map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1 group">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-slate-400 text-[10px] font-black opacity-80 uppercase tracking-widest">{stat.label}</p>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 transition-all group-hover:scale-110 group-hover:bg-violet-50 group-hover:border-violet-100 text-violet-600 shadow-sm">
                      <stat.icon className="size-6 stroke-[3px]" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <p className="text-4xl font-black text-slate-900 font-headline tabular-nums leading-none tracking-tight">{stat.value}</p>
                    <p className={`text-[10px] font-black ${stat.color} tracking-[0.15em] flex items-center gap-1.5 uppercase`}>
                       {stat.trend.includes('%') && (stat.trend.startsWith('+') ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />)}
                       {stat.trend}
                    </p>
                  </div>
                  <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest mt-8 opacity-60 flex items-center gap-2 italic">
                    <Activity className="size-3 text-violet-600" />
                    {stat.sub}
                  </p>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col h-[480px] hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-violet-600/10" />
                <div className="flex items-center justify-between mb-10">
                  <header>
                    <h3 className="font-headline font-black text-xl text-slate-900 tracking-tight">Velocity Telemetry</h3>
                    <p className="text-[9px] lowercase font-black tracking-widest text-slate-400 mt-2">Operational delivery per mission cycle</p>
                  </header>
                  <select className="bg-slate-50 border border-slate-100 rounded-2xl text-[9px] font-black text-slate-600 px-5 py-3 cursor-pointer shadow-sm uppercase tracking-widest focus:ring-4 focus:ring-violet-600/5 outline-none">
                    <option>H1-2026 ACTIVE</option>
                    <option>GLOBAL ARCHIVE</option>
                  </select>
                </div>
                
                <div className="flex-1 relative flex items-end justify-between gap-6 px-4 pb-4">
                  {VELOCITY_DATA.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-4 flex-1 group">
                       <div className="w-full relative bg-slate-50 rounded-2xl transition-all duration-700 hover:bg-slate-100 overflow-hidden cursor-help border border-slate-50 shadow-inner group-hover:border-violet-100/50" style={{ height: `${d.val}%` }} onClick={() => toast.info(`${d.month} Efficiency: ${d.val}%`)}>
                          <div className={`absolute bottom-0 w-full transition-all duration-1000 group-hover:brightness-110 shadow-[0_0_15px_rgba(124,58,237,0.3)] ${d.opacity}`} style={{ height: `100%` }}></div>
                       </div>
                       <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${d.month === 'Jun' ? 'text-violet-600' : 'text-slate-300 group-hover:text-slate-500'}`}>{d.month}</span>
                    </div>
                  ))}
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-20 px-4 opacity-[0.05]">
                     {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-full border-t-[3px] border-slate-900 border-dotted" />)}
                  </div>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col h-[480px] hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-violet-600/10" />
                <div className="mb-10">
                  <h3 className="font-headline font-black text-xl text-slate-900 tracking-tight">Resource Alignment</h3>
                  <p className="text-[9px] lowercase font-black tracking-widest text-slate-400 mt-2">Unit distribution across strategic domains</p>
                </div>
                <div className="flex-1 flex flex-col justify-center space-y-10">
                  {[
                    { name: 'Engineering Nodes', val: 45 },
                    { name: 'Tactical Design', val: 30 },
                    { name: 'Quality Assurance', val: 15 },
                    { name: 'Ops Coordination', val: 10 },
                  ].map((cat, i) => (
                    <div key={i} className="space-y-3 group cursor-pointer" onClick={() => toast.info(`Syncing ${cat.name} focus: ${cat.val}%`)}>
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.12em]">
                        <span className="text-slate-400 group-hover:text-violet-600 transition-colors">{cat.name}</span>
                        <span className="text-slate-900 tabular-nums">{cat.val}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner group-hover:border-violet-100 transition-colors">
                        <div 
                          className={`h-full bg-violet-600 transition-all duration-[2500ms] ease-out rounded-full shadow-[0_0_10px_rgba(124,58,237,0.4)]`} 
                          style={{ width: `${cat.val}%`, opacity: 1 - i * 0.15 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Allocation Table */}
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-700">
              <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/10">
                <h3 className="font-headline font-black text-xl text-slate-900 tracking-tight uppercase">Operational Units Terminal</h3>
                <button 
                  onClick={() => navigate("/team")}
                  className="text-[9px] font-black text-violet-600 uppercase tracking-widest hover:translate-x-2 transition-transform flex items-center gap-3 group bg-violet-50 px-5 py-2.5 rounded-xl border border-violet-100"
                >
                  <Layers className="size-3.5" />
                  Access Full Roster
                  <ArrowUpRight className="size-4 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">
                    <tr>
                      <th className="px-10 py-6">Designated Unit</th>
                      <th className="px-10 py-6">Active Loads</th>
                      <th className="px-10 py-6">Efficiency Index</th>
                      <th className="px-10 py-6 text-right">Status Terminal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {members.slice(0, 5).map((m, i) => (
                      <tr key={i} className="hover:bg-slate-50/30 transition-all group cursor-pointer" onClick={() => toast.info(`Syncing ${m.full_name} performance telemetry...`)}>
                        <td className="px-10 py-7">
                           <div className="flex items-center gap-6 min-w-[240px]">
                              <div className="size-14 bg-white rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-100 p-1.5 transition-all duration-500 group-hover:rounded-2xl group-hover:rotate-6 group-hover:shadow-xl group-hover:border-violet-100">
                                 <img src={m.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.full_name)}&background=f5f3ff&color=7c3aed&bold=true`} alt={m.full_name} className="size-full rounded-2xl object-cover" />
                              </div>
                              <div className="space-y-1">
                                 <p className="text-sm font-black text-slate-900 group-hover:text-violet-600 transition-colors uppercase tracking-tight leading-none">{m.full_name}</p>
                                 <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest leading-none mt-1 opacity-80">{m.role_display || 'Sector Operative'}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-7">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest tabular-nums bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100/50 shadow-sm">{Math.floor(Math.random() * 5) + 3} OPERATIONAL UNITS</span>
                        </td>
                        <td className="px-10 py-7">
                           <div className={`flex items-center gap-2.5 font-black text-[10px] uppercase tracking-widest ${m.is_active !== false ? 'text-emerald-500' : 'text-amber-500 bg-amber-50 rounded-lg px-3 py-1.5 border border-amber-100'}`}>
                              <TrendingUp className="size-4.5" />
                              {m.is_active !== false ? 'EXCELLENT' : 'AWAITING SYNC'}
                           </div>
                        </td>
                        <td className="px-10 py-7 text-right">
                           <div className={`inline-flex items-center px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                             m.is_active !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm shadow-emerald-500/5' :
                             'bg-slate-50 text-slate-400 border-slate-100'
                           }`}>
                             <span className={`size-2 rounded-full mr-3 ${
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
