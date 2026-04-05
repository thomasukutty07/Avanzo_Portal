import { useState, useEffect } from "react"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
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
  ShieldCheck,
  Zap,
  Globe,
  ExternalLink
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const STATS = [
  { 
    label: "ACTIVE THREATS", 
    value: criticalCount.toString().padStart(2, "0"), 
    sub: "+12% vs last 24h", 
    icon: AlertTriangle, 
    color: "text-red-500",
    bgIcon: <AlertTriangle className="absolute -right-4 -bottom-4 size-24 text-red-500/5 rotate-12" />
  },
  { 
    label: "OPEN INCIDENTS", 
    value: openIncidentsCount.toString().padStart(2, "0"), 
    sub: "8 Unassigned", 
    icon: Zap, 
    color: "text-violet-600",
    bgIcon: <Zap className="absolute -right-4 -bottom-4 size-24 text-violet-600/5" />
  },
  { 
    label: "SYSTEM RISK", 
    value: "LOW", 
    sub: "All nodes secure", 
    icon: ShieldCheck, 
    color: "text-emerald-500",
    bgIcon: <ShieldCheck className="absolute -right-4 -bottom-4 size-24 text-emerald-500/5 -rotate-12" />
  },
  { 
    label: "GLOBAL UPTIME", 
    value: "99.9%", 
    sub: "Region: Global", 
    icon: Globe, 
    color: "text-violet-700",
    bgIcon: <Globe className="absolute -right-4 -bottom-4 size-24 text-violet-700/5" />
  },
]

const ALERTS = [
  { severity: "CRITICAL", title: "DDoS Attack Detected on Edge Cluster", source: "192.168.1.184", time: "14:22:11", color: "bg-red-50 text-red-600 border-red-100" },
  { severity: "HIGH", title: "Unauthorized Admin Access Attempt", source: "LDAP Server 02", time: "14:18:45", color: "bg-orange-50 text-orange-600 border-orange-100" },
  { severity: "INFO", title: "Security Policy Update Deployed", source: "Global_Master_01", time: "14:05:12", color: "bg-blue-50 text-blue-600 border-blue-100" },
  { severity: "MEDIUM", title: "Anomaly in Core Data Transfer", source: "Sector 7G", time: "13:55:22", color: "bg-amber-50 text-amber-600 border-amber-100" },
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
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadIncidents() {
      try {
        const res = await api.get("/api/tickets/tickets/");
        const raw = extractResults(res.data);
        // Only show tech/compliance as "incidents" for this dashboard
        setIncidents(raw.filter(t => t.ticket_type === "tech" || t.ticket_type === "compliance"));
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    }
    loadIncidents();
  }, []);

  const openIncidentsCount = incidents.filter(i => i.status === "open").length;
  const criticalCount = incidents.filter(i => i.status !== "resolved").length; // Approximation

  if (loading) return <div className="p-10 text-slate-400 font-bold uppercase animate-pulse">Syncing Operational Center...</div>;

  return (
    <div className="space-y-6 pb-12 font-display bg-[#fcfcfc] min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 mb-1">
            CYBER DEFENSE OPERATIONS
          </p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-headline">
            Security Intelligence
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Real-time threat monitoring and incident response command.</p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl border-2 border-violet-100 text-violet-700 text-[13px] font-bold hover:bg-violet-50 transition-colors"
          >
            Audit Logs
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-[13px] font-bold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-600/20"
          >
            <Plus className="size-4" />
            New Incident
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((s, i) => (
          <Card key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all group relative overflow-hidden">
             {s.bgIcon}
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2 font-headline">{s.label}</p>
                    <div className={`size-8 rounded-lg ${s.color.replace('text-', 'bg-').replace('-600', '-50').replace('text-red-500', 'bg-red-50 text-red-600').replace('text-violet-700', 'bg-violet-50 text-violet-700')} flex items-center justify-center`}>
                       <s.icon className="size-4" />
                    </div>
                </div>
                <p className={`text-4xl font-black tracking-tight font-headline ${s.color} transition-colors group-hover:text-slate-900`}>{s.value}</p>
                <div className="mt-4 flex items-center justify-between font-headline">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{s.sub}</span>
                    <div className="size-1 bg-slate-100 rounded-full" />
                </div>
             </div>
          </Card>
        ))}
      </div>

      {/* Main Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Alerts Feed */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="size-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
              <h4 className="font-black text-slate-900 font-headline">Threat Feed</h4>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">LIVE SYNC</span>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2 no-scrollbar">
            {ALERTS.map((alert, i) => (
              <div key={i} className="p-5 rounded-2xl border border-slate-50 hover:border-slate-100 hover:bg-slate-50/50 transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-3 font-headline">
                  <span className={`px-2.5 py-1 rounded-[6px] text-[9px] font-black uppercase tracking-widest border shadow-sm ${alert.color}`}>
                    {alert.severity}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 tabular-nums">{alert.time}</span>
                </div>
                <h5 className="text-[14px] font-bold text-slate-900 group-hover:text-violet-700 transition-colors leading-tight font-headline uppercase tracking-tight">
                  {alert.title}
                </h5>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50 font-headline">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Source: {alert.source}</p>
                   <ArrowRight className="size-3 text-slate-200 group-hover:text-violet-600 transition-all" />
                </div>
              </div>
            ))}
          </div>

          <button className="mt-6 w-full py-4 rounded-xl bg-slate-50 text-[10px] font-black text-slate-500 hover:bg-violet-50 hover:text-violet-700 transition-all uppercase tracking-widest border border-slate-100 font-headline">
            Export Historical Logs
          </button>
        </div>

        {/* Analytics Section */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-10">
            <h4 className="font-black text-slate-900 font-headline uppercase tracking-tight">Intelligence Matrix</h4>
            <select className="text-[10px] font-black bg-slate-50 border border-slate-100 rounded-lg focus:ring-0 cursor-pointer px-4 py-2 uppercase tracking-widest text-slate-500 font-headline">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-12">
            <div className="md:col-span-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 leading-none font-headline">Attack Trend Analysis</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CHART_DATA}>
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                      {CHART_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'FRI' ? '#7c3aed' : '#f1efff'} />
                      ))}
                    </Bar>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="md:col-span-2 space-y-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 leading-none font-headline">Vulnerability distribution</p>
              <div className="space-y-6">
                {[
                  { label: "CRITICAL", val: 12, color: "bg-red-500" },
                  { label: "HIGH", val: 28, color: "bg-orange-500" },
                  { label: "MEDIUM", val: 45, color: "bg-amber-500" },
                  { label: "LOW SEVERITY", val: 15, color: "bg-emerald-500" },
                ].map((v, i) => (
                  <div key={i} className="space-y-2.5 font-headline">
                    <div className="flex justify-between items-center text-[10px] font-black">
                      <span className="text-slate-400 tracking-[0.1em]">{v.label}</span>
                      <span className="text-slate-900 tabular-nums">{v.val}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 shadow-inner rounded-full overflow-hidden">
                      <div className={`h-full ${v.color} transition-all duration-1000 shadow-md`} style={{ width: `${v.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-between p-6 bg-slate-50/50 border border-slate-100 rounded-2xl">
             <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-violet-600 shadow-sm">
                   <ShieldCheck className="size-5" />
                </div>
                <div>
                   <p className="text-[14px] font-black text-slate-900 leading-none font-headline uppercase tracking-tight text-emerald-600">Secure Protocol Active</p>
                   <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest font-headline">Token Auth Enabled</p>
                </div>
             </div>
             <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-violet-600 font-headline">Verifying Nodes...</Button>
          </div>
        </div>
      </div>

      {/* Incident Management Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-12 font-headline">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h4 className="font-black text-slate-900 font-headline uppercase tracking-tight">Active Incident Matrix</h4>
          <button className="text-[11px] font-black uppercase tracking-widest text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-2">
            Historical Data <ExternalLink className="size-3" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
              <tr>
                <th className="px-8 py-6">Incident Unit</th>
                <th className="px-8 py-6">Intelligence Description</th>
                <th className="px-8 py-6">Impact</th>
                <th className="px-8 py-6">Operation Status</th>
                <th className="px-8 py-6">Tactical Lead</th>
                <th className="px-8 py-6 text-right">Matrix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { id: "INC-2024-001", desc: "SQL Injection Probe on Edge Cluster", sev: "CRITICAL", status: "Scanning", assignee: "M. Lopez", initial: "ML", color: "text-red-600 bg-red-50 border-red-100" },
                { id: "SOC-2024-882", desc: "Anomaly in Global API Access Patterns", sev: "HIGH", status: "Mitigating", assignee: "K. Wright", initial: "KW", color: "text-orange-600 bg-orange-50 border-orange-100" },
                { id: "VUL-2024-119", desc: "Version mismatch on HQ-VPN-Tunnel", sev: "MEDIUM", status: "Resolved", assignee: "S. Chen", initial: "SC", color: "text-amber-600 bg-amber-50 border-amber-100" },
              ].map((inc, i) => (
                <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-8 py-7 font-black text-[13px] text-violet-700 font-headline uppercase tracking-tight">{inc.id}</td>
                  <td className="px-8 py-7">
                    <p className="text-[13px] font-black text-slate-900 leading-none uppercase tracking-tight font-headline">{inc.desc}</p>
                    <p className="text-[10px] text-slate-400 font-black mt-2 leading-none uppercase tracking-widest">Protocol: XA-99-ALPHA</p>
                  </td>
                  <td className="px-8 py-7">
                    <span className={`px-2.5 py-1 rounded-[6px] text-[9px] font-black tracking-widest border shadow-sm ${inc.color}`}>
                      {inc.sev}
                    </span>
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-2">
                      <span className={`size-1.5 rounded-full ${inc.status === 'Scanning' ? 'bg-red-500 animate-pulse' : inc.status === 'Mitigating' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <span className="text-[12px] font-black text-slate-700 uppercase tracking-tight">{inc.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-slate-50 flex items-center justify-center text-[11px] font-black text-slate-400 border border-slate-100 group-hover:bg-violet-600 group-hover:text-white transition-all">{inc.initial}</div>
                      <span className="text-[12px] font-black text-slate-700 uppercase tracking-tight">{inc.assignee}</span>
                    </div>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <button className="p-3 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all">
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
      <div className="flex items-center justify-between py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50 px-4 font-headline">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
             <div className="size-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50" />
             <span>VPN: HQ-TUNNEL-01-SECURE</span>
          </div>
          <span>SESSION: {new Date().getTime().toString(16).toUpperCase()}</span>
        </div>
        <span className="opacity-50">© 2024 Avanzo Cyber Group. All Rights Reserved.</span>
      </div>
    </div>
  )
}

function ArrowRight(props: any) {
  if (loading) return <div className="p-10 text-slate-400 font-bold uppercase animate-pulse">Syncing Operational Center...</div>;

  return (
    <svg 
      {...props}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
