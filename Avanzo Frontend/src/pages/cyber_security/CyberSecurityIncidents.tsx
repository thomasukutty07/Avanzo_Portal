import { 
  Plus,
  Filter,
  MoreVertical,
  Clock,
  Activity,
  AlertTriangle,
  ExternalLink,
  ShieldAlert
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const STATS = [
  { label: "AVG. RESOLUTION", value: "4.2h", sub: "-12% Efficiency", trend: "Optimized", color: "text-emerald-500", icon: Clock },
  { label: "UNASSIGNED UNIT", value: "07", sub: "Requires Triage", trend: "High Priority", color: "text-amber-500", icon: Filter },
  { label: "CRITICAL BREACH", value: "03", sub: "Active Response", trend: "Immediate", color: "text-red-500", icon: ShieldAlert },
  { label: "DEFENSE SCORE", value: "92%", sub: "Global Resilience", trend: "+5.1%", color: "text-violet-600", icon: Activity },
]

const INCIDENTS = [
  { 
    id: "INC-2024-001", 
    time: "12m ago",
    desc: "Potential SQL Injection Detected", 
    target: "Edge API Endpoint v2",
    sev: "HIGH", 
    status: "Scanning", 
    assignee: "M. Lopez",
    initial: "ML",
    color: "text-orange-600 bg-orange-50 border-orange-100"
  },
  { 
    id: "INC-2024-002", 
    time: "45m ago",
    desc: "DDoS Attack on Edge Cluster", 
    target: "Central Routing Node",
    sev: "CRITICAL", 
    status: "New Pulse", 
    assignee: "Unassigned",
    initial: "??",
    color: "text-red-600 bg-red-50 border-red-100"
  },
  { 
    id: "INC-2024-003", 
    time: "2h ago",
    desc: "Unauthorized Admin Access", 
    target: "LDAP Auth Server 02",
    sev: "HIGH", 
    status: "Investigating", 
    assignee: "S. Chen",
    initial: "SC",
    color: "text-orange-600 bg-orange-50 border-orange-100"
  },
]

export default function CyberSecurityIncidentsPage() {
  return (
    <div className="space-y-6 pb-12 font-display bg-[#fcfcfc] min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 mb-1">
                  TACTICAL RESPONSE
              </p>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight font-headline">
                  Incident Matrix
              </h1>
              <p className="text-slate-500 mt-2 text-sm font-medium">Real-time overview and lifecycle management of active cyber threats.</p>
          </div>
          <div className="flex items-center gap-3">
              <Button variant="outline" className="h-11 rounded-xl border-slate-200 text-xs font-bold text-slate-600 px-6 font-headline bg-white hover:bg-slate-50">
                  Global Filters
              </Button>
              <Button className="h-11 rounded-xl bg-violet-600 text-white text-xs font-bold px-6 shadow-lg shadow-violet-600/20 font-headline hover:bg-violet-700">
                  <Plus className="mr-2 size-4" /> Log Security Incident
              </Button>
          </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all group">
             <div className="flex items-center justify-between mb-4">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 font-headline">{s.label}</p>
                <div className={`size-8 rounded-lg ${s.color.replace('text-', 'bg-').replace('-600', '-50').replace('text-red-500', 'bg-red-50 text-red-600').replace('text-emerald-500', 'bg-emerald-50 text-emerald-600').replace('text-amber-500', 'bg-amber-50 text-amber-600')} flex items-center justify-center`}>
                   <s.icon className="size-4" />
                </div>
             </div>
             <p className={`text-4xl font-black tracking-tight font-headline ${s.color.includes('violet') ? 'text-slate-900' : s.color}`}>{s.value}</p>
             <div className="mt-4 flex items-center justify-between font-headline">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{s.sub}</span>
                <div className="size-1 bg-slate-100 rounded-full" />
             </div>
          </div>
        ))}
      </div>

      {/* Incident Management Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-12">
        <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
          <h4 className="font-black text-slate-900 font-headline uppercase tracking-tight">Active Operation Registry</h4>
          <button className="text-[10px] font-black uppercase tracking-widest text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-2 font-headline">
            Archive Telemetry <ExternalLink className="size-3" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 font-headline">
              <tr>
                <th className="px-8 py-6 font-headline">Unit Signature</th>
                <th className="px-8 py-6 font-headline">Incident Intelligence</th>
                <th className="px-8 py-6 font-headline">Severity Matrix</th>
                <th className="px-8 py-6 font-headline">Tactical Status</th>
                <th className="px-8 py-6 font-headline">Response Lead</th>
                <th className="px-8 py-6 text-right font-headline">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {INCIDENTS.map((inc, i) => (
                <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-8 py-7">
                    <span className="font-black text-[13px] text-violet-700 font-headline uppercase tracking-tight block">{inc.id}</span>
                    <span className="text-[10px] font-black text-slate-400 block mt-1 tracking-widest tabular-nums uppercase font-headline">{inc.time} REPORTED</span>
                  </td>
                  <td className="px-8 py-7">
                    <p className="text-[14px] font-black text-slate-900 group-hover:text-violet-700 transition-colors leading-none uppercase tracking-tight font-headline">{inc.desc}</p>
                    <p className="text-[10px] text-slate-400 font-black mt-2 leading-none uppercase tracking-widest font-headline">{inc.target}</p>
                  </td>
                  <td className="px-8 py-7">
                    <span className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black tracking-widest border shadow-sm ${inc.color} font-headline`}>
                      {inc.sev} IMPACT
                    </span>
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-1.5">
                      <span className={`size-2 rounded-full ${inc.status === 'Scanning' ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' : inc.status === 'Investigating' ? 'bg-blue-500' : 'bg-amber-500'} `} />
                      <span className="text-[12px] font-black text-slate-700 uppercase tracking-tight font-headline">{inc.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-3 font-headline">
                      <div className="size-9 rounded-xl bg-slate-100 flex items-center justify-center text-[11px] font-black text-slate-400 border border-slate-100 group-hover:bg-violet-600 group-hover:text-white transition-all">{inc.initial}</div>
                      <span className={`text-[12px] font-black uppercase tracking-tight ${inc.assignee === 'Unassigned' ? 'text-slate-300 italic' : 'text-slate-700'}`}>{inc.assignee}</span>
                    </div>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <button className="p-3 text-slate-200 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all">
                      <MoreVertical className="size-4" />
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
