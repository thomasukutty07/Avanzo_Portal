import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MoreVertical,
  Plus,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"

const STATS = [
  { label: "Active assignments", value: "12", sub: "Priority Alpha", color: "text-violet-600", icon: Clock },
  { label: "Completed ops", value: "148", sub: "Last 30 days", color: "text-emerald-500", icon: CheckCircle2 },
  { label: "Pending audit", value: "05", sub: "Compliance check", color: "text-amber-500", icon: AlertCircle },
]

const TASKS = [
  { 
    id: "TSK-001", 
    title: "Quarterly vulnerability assessment", 
    due: "Today", 
    priority: "High", 
    status: "In progress",
    assignee: "John Doe",
    initial: "JD",
    color: "text-orange-600 bg-orange-50 border-orange-100"
  },
  { 
    id: "TSK-002", 
    title: "Firewall rule cleanup", 
    due: "Tomorrow", 
    priority: "Medium", 
    status: "Pending",
    assignee: "M. Lopez",
    initial: "ML",
    color: "text-amber-600 bg-amber-50 border-amber-100"
  },
  { 
    id: "TSK-003", 
    title: "Phishing simulation campaign", 
    due: "Oct 12", 
    priority: "High", 
    status: "In progress",
    assignee: "S. Chen",
    initial: "SC",
    color: "text-orange-600 bg-orange-50 border-orange-100"
  },
  { 
    id: "TSK-004", 
    title: "SSL certificate renewal - Node 04", 
    due: "Oct 15", 
    priority: "Critical", 
    status: "New",
    assignee: "Unassigned",
    initial: "??",
    color: "text-red-600 bg-red-50 border-red-100"
  },
]

export default function CyberSecurityTasksPage() {
  return (
    <div className="space-y-6 pb-12 font-headline bg-[#fcfcfc] min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
              <p className="text-[9px] font-black tracking-[0.2em] text-violet-600 mb-1">
                  Tactical operations
              </p>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Task matrix
              </h1>
              <p className="text-slate-500 mt-2 text-xs font-medium">Coordinate and track cyber defense assignments and audit schedules.</p>
          </div>
          <div className="flex items-center gap-3">
              <Button variant="outline" className="h-10 rounded-xl border-slate-200 text-[11px] font-bold text-slate-600 px-5 bg-white hover:bg-slate-50">
                  Filters
              </Button>
          </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATS.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all group">
             <div className="flex items-center justify-between mb-4">
                <p className="text-[9px] font-black tracking-[0.18em] text-slate-400">{s.label}</p>
                <div className={`size-7 rounded-lg ${s.color.replace('text-', 'bg-').replace('-600', '-50').replace('text-red-500', 'bg-red-50 text-red-600').replace('text-violet-600', 'bg-violet-50 text-violet-600').replace('text-emerald-500', 'bg-emerald-50 text-emerald-600').replace('text-amber-500', 'bg-amber-50 text-amber-600')} flex items-center justify-center`}>
                   <s.icon className="size-3.5" />
                </div>
             </div>
             <p className={`text-3xl font-black tracking-tight ${s.color.includes('violet') ? 'text-slate-900' : s.color}`}>{s.value}</p>
             <div className="mt-3 flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 tracking-tighter">{s.sub}</span>
                <div className="size-1 bg-slate-100 rounded-full" />
             </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input 
                  placeholder="Search tactics..." 
                  className="w-full h-10 bg-slate-50 border-slate-100 rounded-xl pl-10 pr-4 text-xs font-bold text-slate-600 outline-none focus:bg-white focus:ring-4 focus:ring-violet-600/5 transition-all"
              />
          </div>
          <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-300 tracking-widest mr-2">Sort by:</span>
              <button className="px-3 py-1.5 rounded-lg bg-violet-50 text-violet-600 text-[10px] font-black tracking-tight">Recent</button>
              <button className="px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-400 text-[10px] font-black tracking-tight transition-colors">Priority</button>
          </div>
      </div>

      {/* Task Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-12">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <h4 className="font-black text-slate-900 tracking-tight text-sm">Active mission registry</h4>
          <span className="text-[9px] font-black text-slate-400 tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg italic">Operational feed</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[8px] font-black text-slate-400 tracking-[0.2em] border-b border-slate-50">
              <tr>
                <th className="px-6 py-5">Intel-ID</th>
                <th className="px-6 py-5">Tactical assignment</th>
                <th className="px-6 py-5">Triage</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Assigned to</th>
                <th className="px-6 py-5 text-right">Matrix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {TASKS.map((task, i) => (
                <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-6 py-6 font-black text-[11px] text-violet-700 tracking-tight">{task.id}</td>
                  <td className="px-6 py-6">
                    <p className="text-[12px] font-black text-slate-900 group-hover:text-violet-700 transition-colors leading-none tracking-tight">{task.title}</p>
                    <p className="text-[9px] text-slate-400 font-black mt-2 leading-none tracking-widest tabular-nums">Due {task.due}</p>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`px-2 py-1 rounded-lg text-[8px] font-black tracking-widest border shadow-sm ${task.color}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-1.5">
                      <span className={`size-1.5 rounded-full ${task.status === 'In progress' ? 'bg-violet-500 animate-pulse' : task.status === 'Pending' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <span className="text-[11px] font-black text-slate-700 tracking-tight">{task.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100 group-hover:bg-violet-600 group-hover:text-white transition-all">{task.initial}</div>
                      <span className="text-[11px] font-black tracking-tight text-slate-700">{task.assignee}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <button className="p-2.5 text-slate-200 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all">
                      <MoreVertical className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
