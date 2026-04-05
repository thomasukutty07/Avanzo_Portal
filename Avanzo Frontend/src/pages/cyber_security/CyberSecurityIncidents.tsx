import { 
  Plus,
  Filter,
  MoreVertical,
  Clock
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const STATS = [
  { label: "AVG. RESOLUTION TIME", value: "4.2h", sub: "-12% vs last mo", color: "text-emerald-500", barColor: "bg-violet-600", val: 65 },
  { label: "UNASSIGNED INCIDENTS", value: "07", sub: "Requiring triage", extra: "SLA deadline approaching for 2", hasWarning: true },
  { label: "CRITICAL INCIDENTS", value: "03", sub: "Active now", barColor: "bg-red-500", val: 35 },
  { label: "DETECTION EFFICIENCY", value: "92%", sub: "+5% improvement", color: "text-emerald-500", barColor: "bg-emerald-500", val: 92 },
]

const INCIDENTS = [
  { 
    id: "INC-2024-001", 
    time: "Reported 12m ago",
    desc: "Potential SQL Injection Detected", 
    target: "Target: Customer API Endpoint v2",
    sev: "HIGH", 
    status: "Investigating", 
    assignee: "M. Lopez",
    initial: "ML",
    sevColor: "text-orange-600 bg-orange-50 border-orange-100",
    statusColor: "text-blue-500"
  },
  { 
    id: "INC-2024-002", 
    time: "Reported 45m ago",
    desc: "DDoS Attack on Edge Cluster", 
    target: "Source: 192.168.1.184 (multiple IPs)",
    sev: "CRITICAL", 
    status: "New", 
    assignee: "Unassigned",
    initial: "??",
    sevColor: "text-red-600 bg-red-50 border-red-100",
    statusColor: "text-slate-400"
  },
  { 
    id: "INC-2024-003", 
    time: "Reported 2h ago",
    desc: "Unauthorized Admin Access Attempt", 
    target: "Target: LDAP Server 02",
    sev: "HIGH", 
    status: "Investigating", 
    assignee: "S. Chen",
    initial: "SC",
    sevColor: "text-orange-600 bg-orange-50 border-orange-100",
    statusColor: "text-blue-500"
  },
  { 
    id: "INC-2024-004", 
    time: "Reported 5h ago",
    desc: "Abnormal Data Egress Pattern", 
    target: "Internal Node → External SFTP",
    sev: "MEDIUM", 
    status: "Contained", 
    assignee: "T. Wilson",
    initial: "TW",
    sevColor: "text-amber-600 bg-amber-50 border-amber-100",
    statusColor: "text-emerald-500"
  },
]

export default function CyberSecurityIncidentsPage() {
  return (
    <div className="space-y-6 pt-4 min-h-screen font-display">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none italic font-headline">Incident Management</h1>
          <p className="text-slate-500 mt-2 font-medium italic">Real-time overview and lifecycle management of CyberSecurity incidents.</p>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-6 px-8 rounded-xl shadow-lg shadow-violet-600/20 active:scale-95 transition-all uppercase tracking-widest text-xs">
          <Plus className="size-4 mr-2" />
          Create New Incident
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((s, i) => (
          <Card key={i} className="border-none shadow-sm shadow-slate-100 rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-7 relative">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 leading-none">{s.label}</p>
              <div className="flex items-center gap-3">
                <h3 className="text-3xl font-bold text-slate-900 font-headline">{s.value}</h3>
                <span className={`text-[10px] font-bold ${s.color || 'text-slate-400'} uppercase tracking-tighter`}>{s.sub}</span>
              </div>
              
              {s.val ? (
                <div className="mt-8 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                  <div className={`h-full ${s.barColor} transition-all duration-1000`} style={{ width: `${s.val}%` }} />
                </div>
              ) : s.extra ? (
                <div className="mt-4 flex items-center gap-2 text-[9px] font-bold text-amber-600 uppercase italic tracking-tight">
                  <Clock className="size-3" />
                  {s.extra}
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/50 p-2 rounded-2xl border border-white/40 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" className="h-10 bg-white border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-600 hover:bg-slate-50">
            <Filter className="size-3.5 mr-2" />
            Filters
          </Button>
          <div className="h-6 w-px bg-slate-200 hidden sm:block mx-2" />
          <select className="h-10 bg-white border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-600 focus:ring-violet-600/10 cursor-pointer min-w-[140px]">
            <option>Severity: All</option>
            <option>Severity: Critical</option>
          </select>
          <select className="h-10 bg-white border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-600 focus:ring-violet-600/10 cursor-pointer min-w-[140px]">
            <option>Status: All Active</option>
            <option>Status: Investigating</option>
          </select>
          <select className="h-10 bg-white border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-600 focus:ring-violet-600/10 cursor-pointer min-w-[140px]">
            <option>Assignee: Any</option>
            <option>Assignee: Me</option>
          </select>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Showing 24 of 142 total incidents</span>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] border-b border-slate-50">
              <tr>
                <th className="px-8 py-5">Incident ID</th>
                <th className="px-8 py-5">Description</th>
                <th className="px-8 py-5">Severity</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Assignee</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {INCIDENTS.map((inc, i) => (
                <tr key={i} className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                  <td className="px-8 py-6">
                    <span className="font-bold text-[12px] text-violet-700 block">{inc.id}</span>
                    <span className="text-[9px] font-bold text-slate-400 block mt-1 tracking-tight">{inc.time}</span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-[13px] font-bold text-slate-900 group-hover:text-violet-700 transition-colors leading-none">{inc.desc}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 leading-none uppercase tracking-tighter">{inc.target}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-[0.1em] border ${inc.sevColor}`}>
                      {inc.sev}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className={`size-1.5 rounded-full bg-current ${inc.statusColor} ${inc.status === 'Investigating' ? 'animate-pulse' : ''}`} />
                      <span className={`text-[11px] font-bold ${inc.statusColor}`}>{inc.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm border border-slate-200/50">
                        {inc.initial}
                      </div>
                      <span className={`text-[11px] font-bold ${inc.assignee === 'Unassigned' ? 'text-slate-400 italic font-medium' : 'text-slate-700'}`}>
                        {inc.assignee}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                      <MoreVertical className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-8 py-5 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Page 1 of 6</p>
          <div className="flex gap-2">
            <Button disabled variant="outline" className="h-8 min-w-[80px] text-[10px] font-bold uppercase tracking-widest border-slate-200">Previous</Button>
            <Button variant="outline" className="h-8 min-w-[80px] text-[10px] font-bold uppercase tracking-widest border-violet-200 text-violet-700 hover:bg-violet-50">Next</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
