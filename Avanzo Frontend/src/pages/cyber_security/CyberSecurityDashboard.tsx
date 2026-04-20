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
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadIncidents() {
      try {
        const [incRes, annRes] = await Promise.all([
          api.get("/api/tickets/"),
          api.get("/api/notifications/")
        ]);
        
        const rawIncidents = extractResults(incRes.data);
        const rawAnnouncements = extractResults(annRes.data);

        // Only show tech/compliance as "incidents" for this dashboard
        setIncidents(rawIncidents.filter((t: any) => t.ticket_type === "tech" || t.ticket_type === "compliance"));
        
        // Filter announcements to show only those from Admin/HR for Cyber employees
        setAnnouncements(rawAnnouncements.filter((a: any) => 
          a.created_by_role === "Admin" || a.created_by_role === "HR"
        ));

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

  // Transform announcements into "Intelligence Feed"
  const BROADCASTS = announcements
    .slice(0, 5)
    .map(a => ({
      severity: "Broadcast",
      title: a.title,
      source: a.created_by_name || "HQ Command",
      time: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: "bg-violet-50 text-violet-600 border-violet-100"
    }));



  return (
    <div className="space-y-6 pb-12 font-headline bg-[#fcfcfc] min-h-screen">
      {/* Page Header */}
      <div className="sticky top-[64px] z-30 -mx-6 md:-mx-10 px-6 md:px-10 py-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fcfcfc]/80 backdrop-blur-md border-b border-slate-100 transition-all">
        <div>
          <p className="text-[14px] font-black text-violet-600 mb-1">
            Cyber defense operations
          </p>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Security Intelligence
          </h1>
          <p className="text-slate-500 mt-2 text-[15px] font-normal leading-normal">Real-time threat monitoring and incident response center.</p>
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-[11px] font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20"
          >
            <Plus className="size-4" />
            Log New Incident
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
                    <p className="text-[14px] text-slate-400 font-semibold mb-2">{s.label}</p>
                    <div className={`size-8 rounded-lg ${s.color.replace('text-', 'bg-').replace('-600', '-50').replace('text-red-500', 'bg-red-50 text-red-600').replace('text-violet-700', 'bg-violet-50 text-violet-700').replace('text-red-600', 'bg-red-50 text-red-600').replace('text-emerald-500', 'bg-emerald-50 text-emerald-600').replace('text-amber-500', 'bg-amber-50 text-amber-600')} flex items-center justify-center`}>
                       <s.icon className="size-4" />
                    </div>
                </div>
                <p className={`text-5xl font-bold tracking-tight ${s.color} transition-colors group-hover:text-slate-900`}>{s.value}</p>
                <div className="mt-3 flex items-center justify-between">
                    <span className="text-[12px] font-bold text-slate-400">{s.sub}</span>
                    <div className="size-1.5 bg-slate-100 rounded-full" />
                </div>
             </div>
          </Card>
        ))}
      </div>

      {/* Main Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Alerts Feed */}
        <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-[480px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="size-2 bg-violet-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(139,92,246,0.4)]" />
              <h4 className="font-bold text-slate-900 text-[18px]">Intelligence Feed</h4>
            </div>
            <span className="text-[14px] font-black text-slate-400">Live sync</span>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto pr-2 no-scrollbar">
            {BROADCASTS.length > 0 ? (
              BROADCASTS.map((broadcast, i) => (
                <div key={i} className="p-6 rounded-2xl border border-slate-50 hover:border-violet-100 hover:bg-violet-50/10 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-[8px] text-[10px] font-semibold border shadow-sm ${broadcast.color}`}>
                      {broadcast.severity}
                    </span>
                    <span className="text-[12px] font-bold text-slate-400 tabular-nums">{broadcast.time}</span>
                  </div>
                  <h5 className="text-[20px] font-bold text-slate-900 group-hover:text-violet-700 transition-colors leading-tight tracking-tight">
                    {broadcast.title}
                  </h5>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                     <p className="text-[14px] font-black text-slate-400 italic">Auth: {broadcast.source}</p>
                     <ArrowRight className="size-4 text-slate-200 group-hover:text-violet-600 transition-all" />
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

          <button className="mt-6 w-full py-3.5 rounded-xl bg-slate-50 text-[11px] font-black text-slate-500 hover:bg-violet-50 hover:text-violet-700 transition-all border border-slate-100">
            Export historical logs
          </button>
        </div>


      </div>

      {/* Incident Management Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-12">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-sm">Active Incident Matrix</h4>
          <button className="text-[12px] font-semibold text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-2">
            Historical Data <ExternalLink className="size-3.5" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[11px] font-semibold text-slate-400 border-b border-slate-50 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-6">Incident unit</th>
                <th className="px-6 py-6">Intelligence description</th>
                <th className="px-6 py-6">Impact</th>
                <th className="px-6 py-6">Operation status</th>
                <th className="px-6 py-6">Tactical lead</th>
                <th className="px-6 py-6 text-right">Matrix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {incidents.slice(0, 10).map((inc, i) => (
                <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-6 py-8 font-black text-[15px] text-violet-700 tracking-tight">{inc.id?.slice(0, 8)}</td>
                  <td className="px-6 py-8">
                    <p className="text-[17px] font-black text-slate-900 leading-none tracking-tight">{inc.title}</p>
                    <p className="text-[12px] text-slate-400 font-black mt-2 leading-none italic">Reference: {inc.id?.slice(0, 6).toUpperCase()}</p>
                  </td>
                  <td className="px-6 py-8">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border shadow-sm ${inc.ticket_type === 'tech' ? 'text-red-600 bg-red-50 border-red-100' : 'text-orange-600 bg-orange-50 border-orange-100'}`}>
                      {inc.ticket_type_display}
                    </span>
                  </td>
                  <td className="px-6 py-8">
                    <div className="flex items-center gap-2">
                      <span className={`size-2.5 rounded-full ${inc.status === 'open' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.3)]' : inc.status === 'in_review' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <span className="text-[14px] font-black text-slate-700 tracking-tight">{inc.status_display}</span>
                    </div>
                  </td>
                  <td className="px-6 py-8">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-inner">
                        {inc.assigned_to_name?.split(' ').map((n: any) => n[0]).join('') || '??'}
                      </div>
                      <span className="text-[14px] font-black text-slate-700 tracking-tight">{inc.assigned_to_name || 'Unassigned'}</span>
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
