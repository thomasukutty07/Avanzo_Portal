import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import {
  AlertTriangle, 
  MoreVertical,
  ShieldCheck,
  Zap,
  Globe,
  Plus,
  ExternalLink
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CyberSecurityDashboardPage() {
  const navigate = useNavigate()
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadIncidents() {
      try {
        const res = await api.get("/api/tickets/tickets/");
        const raw = extractResults(res.data);
        // Only show tech/compliance as "incidents" for this dashboard
        setIncidents(raw.filter((t: any) => t.ticket_type === "tech" || t.ticket_type === "compliance"));
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    }
    loadIncidents();
  }, []);

  const openIncidentsCount = incidents.filter(i => i.status === "open").length;
  const criticalCount = incidents.filter(i => i.status !== "resolved").length; 

  if (loading) return <div className="p-10 text-slate-400 font-bold font-headline animate-pulse text-xs">Syncing operational center...</div>;

  // Derive Stats from real data
  const STATS = [
    { 
      label: "Active Threats", 
      value: criticalCount.toString().padStart(2, "0"), 
      sub: "Active nodes", 
      icon: AlertTriangle, 
      color: "text-red-500",
      bgIcon: <AlertTriangle className="absolute -right-4 -bottom-4 size-20 text-red-500/5 rotate-12" />
    },
    { 
      label: "Open Incidents", 
      value: openIncidentsCount.toString().padStart(2, "0"), 
      sub: "Requires triage", 
      icon: Zap, 
      color: "text-violet-600",
      bgIcon: <Zap className="absolute -right-4 -bottom-4 size-20 text-violet-600/5" />
    },
    { 
      label: "System Risk", 
      value: criticalCount > 5 ? "High" : criticalCount > 2 ? "Med" : "Low", 
      sub: criticalCount > 0 ? "Vulnerabilities detected" : "All nodes secure", 
      icon: ShieldCheck, 
      color: criticalCount > 5 ? "text-red-600" : criticalCount > 0 ? "text-amber-500" : "text-emerald-500",
      bgIcon: <ShieldCheck className="absolute -right-4 -bottom-4 size-20 text-emerald-500/5 -rotate-12" />
    },
    { 
      label: "Global Uptime", 
      value: "100%", 
      sub: "Status: Secure", 
      icon: Globe, 
      color: "text-violet-700",
      bgIcon: <Globe className="absolute -right-4 -bottom-4 size-20 text-violet-700/5" />
    },
  ]

  // Transform incidents into "Alerts"
  const ALERTS = incidents
    .filter(i => i.status !== "resolved")
    .slice(0, 5)
    .map(i => ({
      severity: i.ticket_type === "compliance" ? "High" : "Critical",
      title: i.title,
      source: i.created_by_name || "Internal System",
      time: new Date(i.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: i.ticket_type === "compliance" ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-red-50 text-red-600 border-red-100"
    }));



  return (
    <div className="space-y-6 pb-12 font-headline bg-[#fcfcfc] min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <p className="text-[9px] font-black tracking-[0.2em] text-violet-600 mb-1">
            Cyber defense operations
          </p>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Security Intelligence
          </h1>
          <p className="text-slate-500 mt-2 text-xs font-medium">Real-time threat monitoring and incident response command.</p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            className="px-4 py-2 rounded-xl border-2 border-violet-100 text-violet-700 text-[11px] font-bold hover:bg-violet-50 transition-colors"
          >
            Audit logs
          </button>
          <button
            type="button"
            onClick={() => navigate("/security/incidents/create")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-[9px] font-black hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20 tracking-[0.1em]"
          >
            <Plus className="size-3" />
            CREATE NEW INCIDENT
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((s, i) => (
          <Card key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all group relative overflow-hidden">
             {s.bgIcon}
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[9px] text-slate-400 font-black tracking-[0.2em] mb-2">{s.label}</p>
                    <div className={`size-7 rounded-lg ${s.color.replace('text-', 'bg-').replace('-600', '-50').replace('text-red-500', 'bg-red-50 text-red-600').replace('text-violet-700', 'bg-violet-50 text-violet-700').replace('text-red-600', 'bg-red-50 text-red-600').replace('text-emerald-500', 'bg-emerald-50 text-emerald-600').replace('text-amber-500', 'bg-amber-50 text-amber-600')} flex items-center justify-center`}>
                       <s.icon className="size-3.5" />
                    </div>
                </div>
                <p className={`text-3xl font-black tracking-tight ${s.color} transition-colors group-hover:text-slate-900`}>{s.value}</p>
                <div className="mt-3 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-400 tracking-tighter">{s.sub}</span>
                    <div className="size-1 bg-slate-100 rounded-full" />
                </div>
             </div>
          </Card>
        ))}
      </div>

      {/* Main Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Alerts Feed */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-[480px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="size-1.5 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
              <h4 className="font-black text-slate-900 text-sm">Threat feed</h4>
            </div>
            <span className="text-[9px] font-black text-slate-400 tracking-widest">Live sync</span>
          </div>

          <div className="flex-1 space-y-3.5 overflow-y-auto pr-1 no-scrollbar">
            {ALERTS.length > 0 ? (
              ALERTS.map((alert, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-50 hover:border-slate-100 hover:bg-slate-50/50 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2.5">
                    <span className={`px-2 py-0.5 rounded-[6px] text-[8px] font-black tracking-widest border shadow-sm ${alert.color}`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 tabular-nums">{alert.time}</span>
                  </div>
                  <h5 className="text-[13px] font-black text-slate-900 group-hover:text-violet-700 transition-colors leading-tight tracking-tight">
                    {alert.title}
                  </h5>
                  <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-50">
                     <p className="text-[9px] font-black text-slate-400 tracking-tight">Source: {alert.source}</p>
                     <ArrowRight className="size-3 text-slate-200 group-hover:text-violet-600 transition-all" />
                  </div>
                </div>
              ))
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="size-10 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                        <ShieldCheck className="size-5 text-slate-200" />
                    </div>
                    <p className="text-xs font-bold text-slate-400">No active threats detected</p>
                    <p className="text-[9px] text-slate-300 mt-1">Satellite nodes reporting clear status</p>
                </div>
            )}
          </div>

          <button className="mt-6 w-full py-3.5 rounded-xl bg-slate-50 text-[9px] font-black text-slate-500 hover:bg-violet-50 hover:text-violet-700 transition-all tracking-widest border border-slate-100">
            Export historical logs
          </button>
        </div>

        {/* Analytics Section */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm flex flex-col h-[480px]">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-black text-slate-900 tracking-tight text-sm">Intelligence matrix</h4>
            <select className="text-[9px] font-black bg-slate-50 border border-slate-100 rounded-lg focus:ring-0 cursor-pointer px-3 py-1.5 tracking-widest text-slate-500">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-10">
            <div className="md:col-span-3">
              <p className="text-[9px] font-black text-slate-400 tracking-widest mb-6 leading-none">Attack trend analysis</p>
              <div className="h-56 w-full flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-slate-100">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Trend Telemetry</p>
                 <p className="text-4xl font-black text-slate-900 tracking-tight">Active Pulse</p>
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <p className="text-[9px] font-black text-slate-400 tracking-widest mb-4 leading-none">Vulnerability distribution</p>
              <div className="space-y-5">
                {[
                  { label: "Critical", val: incidents.filter(i => i.ticket_type === "tech").length, color: "bg-red-500" },
                  { label: "High", val: incidents.filter(i => i.ticket_type === "compliance").length, color: "bg-orange-500" },
                  { label: "Medium", val: 0, color: "bg-amber-500" },
                  { label: "Low severity", val: 0, color: "bg-emerald-500" },
                ].map((v, i) => (
                    v.val > 0 && (
                        <div key={i} className="">
                            <div className="flex justify-between items-center text-[9px] font-black mb-1">
                            <span className="text-slate-400 tracking-[0.1em]">{v.label}</span>
                            <span className="text-slate-900 tabular-nums">{v.val}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-50 shadow-inner rounded-full overflow-hidden">
                            <div className={`h-full ${v.color} transition-all duration-1000 shadow-md`} style={{ width: `${(v.val / (incidents.length || 1)) * 100}%` }} />
                            </div>
                        </div>
                    )
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-between p-5 bg-slate-50/50 border border-slate-100 rounded-xl">
             <div className="flex items-center gap-4">
                <div className="size-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-violet-600 shadow-sm">
                   <ShieldCheck className="size-4.5" />
                </div>
                <div>
                   <p className="text-[13px] font-black text-emerald-600 leading-none tracking-tight">Secure protocol active</p>
                   <p className="text-[9px] font-black text-slate-400 mt-1 tracking-widest">Token auth enabled</p>
                </div>
             </div>
             <Button variant="ghost" className="text-[9px] font-black tracking-widest text-violet-600 h-auto py-1">Verifying nodes...</Button>
          </div>
        </div>
      </div>

      {/* Incident Management Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-12">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h4 className="font-black text-slate-900 tracking-tight text-sm">Active incident matrix</h4>
          <button className="text-[10px] font-black tracking-widest text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-2">
            Historical data <ExternalLink className="size-3" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[9px] font-black text-slate-400 tracking-[0.2em] border-b border-slate-50">
              <tr>
                <th className="px-6 py-5">Incident unit</th>
                <th className="px-6 py-5">Intelligence description</th>
                <th className="px-6 py-5">Impact</th>
                <th className="px-6 py-5">Operation status</th>
                <th className="px-6 py-5">Tactical lead</th>
                <th className="px-6 py-5 text-right">Matrix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {incidents.slice(0, 10).map((inc, i) => (
                <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-6 py-6 font-black text-[11px] text-violet-700 tracking-tight">{inc.id?.slice(0, 8)}</td>
                  <td className="px-6 py-6">
                    <p className="text-[12px] font-black text-slate-900 leading-none tracking-tight">{inc.title}</p>
                    <p className="text-[9px] text-slate-400 font-black mt-2 leading-none tracking-widest">Protocol: XA-99-ALPHA</p>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`px-2 py-0.5 rounded-[6px] text-[8px] font-black tracking-widest border shadow-sm ${inc.ticket_type === 'tech' ? 'text-red-600 bg-red-50 border-red-100' : 'text-orange-600 bg-orange-50 border-orange-100'}`}>
                      {inc.ticket_type_display}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-1.5">
                      <span className={`size-1.5 rounded-full ${inc.status === 'open' ? 'bg-red-500 animate-pulse' : inc.status === 'in_review' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <span className="text-[11px] font-black text-slate-700 tracking-tight">{inc.status_display}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="size-7 rounded-lg bg-slate-50 flex items-center justify-center text-[9px] font-black text-slate-400 border border-slate-100 group-hover:bg-violet-600 group-hover:text-white transition-all">
                        {inc.assigned_to_name?.split(' ').map((n: any) => n[0]).join('') || '??'}
                      </div>
                      <span className="text-[11px] font-black text-slate-700 tracking-tight">{inc.assigned_to_name || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <button className="p-2.5 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all">
                      <MoreVertical className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {incidents.length === 0 && (
                  <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">No active incident registry found</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between py-6 text-[8px] font-black text-slate-400 tracking-widest border-t border-slate-50 px-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
             <div className="size-1.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50" />
             <span>VPN: HQ-TUNNEL-01-SECURE</span>
          </div>
          <span>Session: {new Date().getTime().toString(16).toUpperCase()}</span>
        </div>
        <span className="opacity-50">© 2024 Avanzo Cyber Group. All Rights Reserved.</span>
      </div>
    </div>
  )
}

function ArrowRight(props: any) {
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
