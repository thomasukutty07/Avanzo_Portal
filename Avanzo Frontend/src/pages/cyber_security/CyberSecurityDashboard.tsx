import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import {
  AlertTriangle, 
  MoreVertical,
  ShieldCheck,
  Zap,
  Plus,
  ExternalLink
} from "lucide-react"
import { Card } from "@/components/ui/card"


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
      <div className="sticky top-0 z-30 -mx-6 md:-mx-10 px-6 md:px-10 py-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fcfcfc]/80 backdrop-blur-md border-b border-transparent transition-all">
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-[9px] font-black hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20"
          >
            <Plus className="size-3" />
            Create New Incident
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
                    <p className="text-[9px] text-slate-400 font-black mb-2">{s.label}</p>
                    <div className={`size-7 rounded-lg ${s.color.replace('text-', 'bg-').replace('-600', '-50').replace('text-red-500', 'bg-red-50 text-red-600').replace('text-violet-700', 'bg-violet-50 text-violet-700').replace('text-red-600', 'bg-red-50 text-red-600').replace('text-emerald-500', 'bg-emerald-50 text-emerald-600').replace('text-amber-500', 'bg-amber-50 text-amber-600')} flex items-center justify-center`}>
                       <s.icon className="size-3.5" />
                    </div>
                </div>
                <p className={`text-3xl font-black tracking-tight ${s.color} transition-colors group-hover:text-slate-900`}>{s.value}</p>
                <div className="mt-3 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-400">{s.sub}</span>
                    <div className="size-1 bg-slate-100 rounded-full" />
                </div>
             </div>
          </Card>
        ))}
      </div>

      {/* Main Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Alerts Feed */}
        <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-[480px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="size-1.5 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
              <h4 className="font-black text-slate-900 text-sm">Threat Feed</h4>
            </div>
            <span className="text-[9px] font-black text-slate-400">Live Sync</span>
          </div>

          <div className="flex-1 space-y-3.5 overflow-y-auto pr-1 no-scrollbar">
            {ALERTS.length > 0 ? (
              ALERTS.map((alert, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-50 hover:border-slate-100 hover:bg-slate-50/50 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2.5">
                    <span className={`px-2 py-0.5 rounded-[6px] text-[8px] font-black border shadow-sm ${alert.color}`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 tabular-nums">{alert.time}</span>
                  </div>
                  <h5 className="text-[13px] font-black text-slate-900 group-hover:text-violet-700 transition-colors leading-tight tracking-tight">
                    {alert.title}
                  </h5>
                  <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-50">
                     <p className="text-[9px] font-black text-slate-400">Source: {alert.source}</p>
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

          <button className="mt-6 w-full py-3.5 rounded-xl bg-slate-50 text-[9px] font-black text-slate-500 hover:bg-violet-50 hover:text-violet-700 transition-all border border-slate-100">
            Export Historical Logs
          </button>
        </div>


      </div>

      {/* Incident Management Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-12">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h4 className="font-black text-slate-900 tracking-tight text-sm">Active Incident Matrix</h4>
          <button className="text-[10px] font-black text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-2">
            Historical Data <ExternalLink className="size-3" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[9px] font-black text-slate-400 border-b border-slate-50">
              <tr>
                <th className="px-6 py-5">Incident Unit</th>
                <th className="px-6 py-5">Intelligence Description</th>
                <th className="px-6 py-5">Impact</th>
                <th className="px-6 py-5">Operation Status</th>
                <th className="px-6 py-5">Tactical Lead</th>
                <th className="px-6 py-5 text-right">Matrix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {incidents.slice(0, 10).map((inc, i) => (
                <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-6 py-6 font-black text-[11px] text-violet-700 tracking-tight">{inc.id?.slice(0, 8)}</td>
                  <td className="px-6 py-6">
                    <p className="text-[12px] font-black text-slate-900 leading-none tracking-tight">{inc.title}</p>
                    <p className="text-[9px] text-slate-400 font-black mt-2 leading-none">Protocol: XA-99-ALPHA</p>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`px-2 py-0.5 rounded-[6px] text-[8px] font-black border shadow-sm ${inc.ticket_type === 'tech' ? 'text-red-600 bg-red-50 border-red-100' : 'text-orange-600 bg-orange-50 border-orange-100'}`}>
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
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold text-xs">No active incident registry found</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-center py-6 text-[8px] font-black text-slate-400 border-t border-slate-50 px-4">
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
