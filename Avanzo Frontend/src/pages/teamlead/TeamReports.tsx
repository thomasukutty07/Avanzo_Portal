import { TeamLeadChrome } from "@/components/portal/teamlead/TeamLeadChrome"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { toast } from "sonner"
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Clock, 
  PieChart, 
  Zap,
  TrendingDown,
  ArrowUpRight,
  MoreHorizontal
} from "lucide-react"

const VELOCITY_DATA = [
  { month: "Jan", val: 60, opacity: "bg-violet-600/20" },
  { month: "Feb", val: 45, opacity: "bg-violet-600/20" },
  { month: "Mar", val: 85, opacity: "bg-violet-600/20" },
  { month: "Apr", val: 70, opacity: "bg-violet-600/20" },
  { month: "May", val: 95, opacity: "bg-violet-600/20" },
  { month: "Jun", val: 100, opacity: "bg-violet-600" },
]

const CATEGORIES = [
  { name: "Frontend Engineering", val: 45 },
  { name: "Backend Development", val: 30 },
  { name: "QA & Testing", val: 15 },
  { name: "Product Design", val: 10 },
]

const ALLOCATION = [
  { name: "David Chen", role: "Frontend Eng", tasks: 8, load: 70, perf: "Excellent", status: "Available", img: "https://i.pravatar.cc/100?img=11" },
  { name: "Sarah Jenkins", role: "UX Designer", tasks: 12, load: 95, perf: "Stable", status: "At Capacity", img: "https://i.pravatar.cc/100?img=12" },
  { name: "Mark Thompson", role: "Backend Eng", tasks: 5, load: 40, perf: "Improving", status: "On Leave", img: "https://i.pravatar.cc/100?img=13" },
]

export default function TeamReportsPage() {
  useDesignPortalLightTheme()

  return (
    <TeamLeadChrome>
      <div className="p-8 space-y-8 font-body">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-end justify-between gap-6">
          <div>
            <h2 className="font-headline text-3xl font-black text-slate-900 tracking-tight">Team Performance Reports</h2>
            <p className="text-slate-500 mt-1 font-medium italic">Detailed analytics and progress tracking for the current sprint period.</p>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={() => toast.success("Drafting PDF synthesis...")}
              className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-900/20 text-sm active:scale-95"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-widest">
            Sprint 24 Active
          </span>
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-100 uppercase tracking-widest">
            Last Updated: 5m Ago
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-violet-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest font-body">Average Velocity</p>
              <Zap className="h-5 w-5 text-violet-600" />
            </div>
            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-bold text-slate-900 leading-none">42 pts</p>
              <p className="text-sm font-bold text-emerald-500 tracking-tight flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                +12.5%
              </p>
            </div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight mt-4 italic">v.s. last 3 sprints average</p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-violet-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest font-body">Cycle Time</p>
              <Clock className="h-5 w-5 text-violet-600" />
            </div>
            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-bold text-slate-900 leading-none">3.2 days</p>
              <p className="text-sm font-bold text-red-500 tracking-tight flex items-center gap-1">
                <TrendingDown className="h-4 w-4" />
                -4.2%
              </p>
            </div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight mt-4 italic">Average time to complete task</p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-violet-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest font-body">Resource Balance</p>
              <PieChart className="h-5 w-5 text-violet-600" />
            </div>
            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-bold text-slate-900 leading-none">88%</p>
              <p className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg tracking-widest uppercase">Optimal</p>
            </div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight mt-4 italic">Current capacity utilized</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-body">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[420px]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-headline font-bold text-slate-900">Velocity Trend</h3>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">Story points delivered per iteration</p>
              </div>
              <select className="bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-600 px-4 py-2 cursor-pointer shadow-inner">
                <option>Last 6 months</option>
                <option>Last 12 months</option>
              </select>
            </div>
            
            <div className="flex-1 relative flex items-end justify-between gap-5 px-4 pb-4">
              {VELOCITY_DATA.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-3 flex-1 group">
                   <div className="w-full relative bg-slate-50 rounded-xl transition-all duration-700 hover:bg-slate-100 overflow-hidden cursor-help" style={{ height: `${d.val}%` }} onClick={() => toast.info(`${d.month} value: ${d.val}pts`)}>
                      <div className={`absolute bottom-0 w-full transition-all duration-700 group-hover:brightness-110 ${d.opacity}`} style={{ height: `100%` }}></div>
                   </div>
                   <span className={`text-[10px] font-bold uppercase tracking-widest ${d.month === 'Jun' ? 'text-violet-700 underline underline-offset-4' : 'text-slate-400'}`}>{d.month}</span>
                </div>
              ))}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-12 px-4 opacity-10">
                 {[1, 2, 3].map(i => <div key={i} className="w-full border-t border-slate-900 border-dashed" />)}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[420px]">
            <div className="mb-10">
              <h3 className="font-headline font-bold text-slate-900">Task Proportions</h3>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">Distribution across strategic domains</p>
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-7">
              {CATEGORIES.map((cat, i) => (
                <div key={i} className="space-y-2 group cursor-pointer" onClick={() => toast.info(`${cat.name}: ${cat.val}% utilization`)}>
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                    <span className="text-slate-500 group-hover:text-violet-700 transition-colors">{cat.name}</span>
                    <span className="text-violet-700">{cat.val}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50 shadow-inner">
                    <div 
                      className={`h-full bg-violet-600 transition-all duration-[1500ms] ease-out rounded-full`} 
                      style={{ width: `${cat.val}%`, opacity: 1 - i * 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Allocation Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden font-body">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/10">
            <h3 className="font-headline font-bold text-slate-900">Resource Alignment Hub</h3>
            <button 
              onClick={() => toast.info("Opening team directory...")}
              className="text-[11px] font-bold text-violet-600 uppercase tracking-widest hover:underline flex items-center gap-2"
            >
              Roster
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                  <th className="px-8 py-5">Personnel</th>
                  <th className="px-8 py-5">Assigned Logic</th>
                  <th className="px-8 py-5">Load Balancing</th>
                  <th className="px-8 py-5">Velocity Indicator</th>
                  <th className="px-8 py-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ALLOCATION.map((m, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => toast.info(`Viewing ${m.name} analytics`)}>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                          <div className="size-10 bg-slate-100 rounded-full overflow-hidden shadow-inner ring-2 ring-white">
                             <img src={m.img} alt={m.name} className="size-full object-cover" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-900 group-hover:text-violet-700 transition-colors uppercase tracking-tight">{m.name}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{m.role}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-xs font-bold text-slate-700 tracking-tight">{m.tasks} Priority Units</span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <div className="w-24 h-1.5 bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100/50">
                             <div className={`h-full rounded-full ${m.load > 90 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${m.load}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">{m.load}%</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-1.5 text-emerald-600 font-bold uppercase text-[9px] tracking-widest">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {m.perf}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
                         m.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                         m.status === 'At Capacity' ? 'bg-red-50 text-red-700 border border-red-100' :
                         'bg-slate-100 text-slate-500'
                       }`}>
                         {m.status}
                       </span>
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
