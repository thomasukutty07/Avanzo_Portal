import { 
  BarChart, 
  Bar, 
  XAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts'
import { 
  AlertTriangle, 
  MoreVertical,
  Plus,
  Minus,
  Activity as RiskIcon
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const STATS = [
  { 
    label: "ACTIVE THREATS", 
    value: "42", 
    sub: "+12% vs last 24h", 
    icon: AlertTriangle, 
    color: "text-red-500",
    bgIcon: <AlertTriangle className="absolute -right-4 -bottom-4 size-24 text-red-500/5 rotate-12" />
  },
  { 
    label: "OPEN INCIDENTS", 
    value: "18", 
    sub: "8 Unassigned", 
    icon: Plus, 
    color: "text-violet-600",
    bgIcon: <Plus className="absolute -right-4 -bottom-4 size-24 text-violet-600/5" />
  },
  { 
    label: "CRITICAL VULNS", 
    value: "124", 
    sub: "CVE-2024-Active", 
    icon: Minus, 
    color: "text-amber-500",
    bgIcon: <AlertTriangle className="absolute -right-4 -bottom-4 size-24 text-amber-500/5 -rotate-12" />
  },
  { 
    label: "RISK SCORE", 
    value: "68", 
    sub: "MODERATE", 
    icon: RiskIcon, 
    color: "text-violet-700",
    bgIcon: <div className="absolute right-0 bottom-6 w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 w-[68%]" />
           </div>
  },
]

const ALERTS = [
  { severity: "CRITICAL", title: "DDoS Attack Detected on Edge Cluster", source: "192.168.1.184", time: "14:22:61", color: "bg-red-50 text-red-600 border-red-100" },
  { severity: "HIGH", title: "Unauthorized Admin Access Attempt", source: "LDAP Server 02", time: "14:18:45", color: "bg-orange-50 text-orange-600 border-orange-100" },
  { severity: "INFO", title: "CyberSecurity Policy Update Deployed", source: "Admin_Tech_04", time: "14:05:12", color: "bg-blue-50 text-blue-600 border-blue-100" },
  { severity: "MEDIUM", title: "Anomaly in XA-99 Data Transfer", source: "Sector 7G", time: "13:55:22", color: "bg-amber-50 text-amber-600 border-amber-100" },
]

const CHART_DATA = [
  { name: 'MON', value: 300 },
  { name: 'TUE', value: 450 },
  { name: 'WED', value: 280 },
  { name: 'THU', value: 550 },
  { name: 'FRI', value: 800 },
  { name: 'SAT', value: 650 },
  { name: 'SUN', value: 720 },
]

export default function CyberSecurityDashboardPage() {

  return (
    <div className="space-y-6 pt-4 min-h-screen font-display">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((s, i) => (
          <Card key={i} className="border-none shadow-sm shadow-slate-100 rounded-xl overflow-hidden group hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 relative">
              {s.bgIcon}
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-4">{s.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-slate-900 group-hover:text-violet-700 transition-colors font-headline">{s.value}</h3>
              </div>
              <p className={`text-[10px] font-bold mt-2 ${s.color} uppercase tracking-tight`}>{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Alerts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Alerts Feed */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="size-2 bg-red-500 rounded-full animate-pulse" />
              <h4 className="font-bold text-slate-900 tracking-tight font-headline">Live Alert Feed</h4>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SYNC: REAL-TIME</span>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2 no-scrollbar">
            {ALERTS.map((alert, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-50 border-white hover:border-slate-100 hover:bg-slate-50/50 transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${alert.color}`}>
                    {alert.severity}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 tabular-nums">{alert.time}</span>
                </div>
                <h5 className="text-[13px] font-bold text-slate-900 group-hover:text-violet-700 transition-colors leading-snug font-headline">
                  {alert.title}
                </h5>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                  Source: {alert.source}
                </p>
              </div>
            ))}
          </div>

          <button className="mt-6 w-full py-3 text-[10px] font-bold text-violet-600 hover:bg-violet-50 transition-colors uppercase tracking-widest border-t border-slate-50">
            View All Historical Logs
          </button>
        </div>

        {/* Analytics Section */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-10">
            <h4 className="font-bold text-lg text-slate-900 tracking-tight font-headline">CyberSecurity Analytics</h4>
            <select className="text-[10px] font-bold bg-slate-50 border-none rounded-lg focus:ring-0 cursor-pointer">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-3">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-6 leading-none">Threat Trend (Daily)</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CHART_DATA}>
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {CHART_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'FRI' ? '#7c3aed' : '#f1efff'} />
                      ))}
                    </Bar>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-6 leading-none">Vulnerability Distribution</p>
              <div className="space-y-5">
                {[
                  { label: "CRITICAL", val: 12, color: "bg-red-500" },
                  { label: "HIGH", val: 28, color: "bg-orange-500" },
                  { label: "MEDIUM", val: 45, color: "bg-amber-500" },
                  { label: "LOW", val: 15, color: "bg-emerald-500" },
                ].map((v, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-400 tracking-widest">{v.label}</span>
                      <span className="text-slate-900">{v.val}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div className={`h-full ${v.color} transition-all duration-1000`} style={{ width: `${v.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Management Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-10">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 tracking-tight font-headline">Active Incident Management</h4>
          <Button className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-[10px] px-6 rounded-lg uppercase tracking-widest shadow-md">
            + Create New Incident
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">
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
              {[
                { id: "INC-2024-001", desc: "Potential SQL Injection Detected", sev: "HIGH", status: "Investigating", assignee: "M. Lopez", initial: "ML", color: "text-orange-600 bg-orange-50" },
                { id: "SOC-2024-882", desc: "Suspicious API Activity Pattern", sev: "MEDIUM", status: "Mitigated", assignee: "K. Wright", initial: "KW", color: "text-amber-600 bg-amber-50" },
                { id: "VUL-2024-119", desc: "Edge Gateway Version Mismatch", sev: "LOW", status: "Resolved", assignee: "S. Chen", initial: "SC", color: "text-emerald-600 bg-emerald-50" },
              ].map((inc, i) => (
                <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-8 py-6 font-bold text-[12px] text-violet-700">{inc.id}</td>
                  <td className="px-8 py-6">
                    <p className="text-[12px] font-bold text-slate-900 leading-none">{inc.desc}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 leading-none uppercase tracking-tighter">Customer API Endpoint v2</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-[0.1em] border ${inc.color === 'text-orange-600 bg-orange-50' ? 'border-orange-100 text-orange-600 bg-orange-50' : inc.color === 'text-amber-600 bg-amber-50' ? 'border-amber-100 text-amber-600 bg-amber-50' : 'border-emerald-100 text-emerald-600 bg-emerald-50'}`}>
                      {inc.sev}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1.5">
                      <span className={`size-1.5 rounded-full ${inc.status === 'Investigating' ? 'bg-blue-500 animate-pulse' : inc.status === 'Mitigated' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <span className="text-[11px] font-bold text-slate-700">{inc.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="size-7 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">{inc.initial}</div>
                      <span className="text-[11px] font-bold text-slate-700">{inc.assignee}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-slate-200 hover:text-slate-400">
                      <MoreVertical className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-60">
        <div className="flex items-center gap-6">
          <span>CyberSecurity TOKEN: XA-9912-PR</span>
          <span>ACTIVE VPN: HQ-TUNNEL-01</span>
        </div>
        <span>© 2024 Avanzo Cyber Defense Group. Confidential</span>
      </div>
    </div>
  )
}
