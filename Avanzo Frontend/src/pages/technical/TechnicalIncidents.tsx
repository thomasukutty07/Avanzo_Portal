import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus,
  Filter,
  MoreVertical,
  Clock,
  Loader2,
  Activity,
  ShieldAlert
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ticketsService } from "@/services/tickets";
import { toast } from "sonner";
import { formatDistanceToNow, parseISO } from "date-fns";

type Incident = {
  id: string;
  time: string;
  desc: string;
  target: string;
  sev: string;
  status: string;
  assignee: string;
  initial: string;
  sevColor: string;
  statusColor: string;
}

export default function TechnicalIncidentsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        const res = await ticketsService.getTickets({ type: "incident" });
        const data = Array.isArray(res) ? res : (res.results || []);
        setTotalCount(Array.isArray(res) ? res.length : (res.count || 0));

        const mapped: Incident[] = data.map((t: any) => {
          const sev = (t.priority || "MEDIUM").toUpperCase();
          const statusMap: Record<string, string> = {
            open: "NEW",
            progress: "INVESTIGATING",
            resolved: "RESOLVED"
          };
          
          const sevStyles: Record<string, string> = {
            CRITICAL: "text-red-600 bg-red-50 border-red-100",
            HIGH: "text-orange-600 bg-orange-50 border-orange-100",
            MEDIUM: "text-amber-600 bg-amber-50 border-amber-100",
            LOW: "text-slate-600 bg-slate-50 border-slate-100"
          };

          const statusColors: Record<string, string> = {
            open: "text-slate-400",
            progress: "text-blue-500",
            resolved: "text-emerald-500"
          };

          return {
            id: `INC-${t.id.substring(0, 8).toUpperCase()}`,
            time: t.created_at ? `Reported ${formatDistanceToNow(parseISO(t.created_at))} ago` : "Recently",
            desc: t.title,
            target: t.asset_name || "Internal System",
            sev,
            status: statusMap[t.status] || t.status.toUpperCase(),
            assignee: t.assignee_name || "Unassigned",
            initial: t.assignee_name ? t.assignee_name.split(' ').map((n:any) => n[0]).join('') : "??",
            sevColor: sevStyles[sev] || sevStyles.MEDIUM,
            statusColor: statusColors[t.status] || "text-slate-400"
          };
        });

        setIncidents(mapped);

        // Update Stats based on REAL data
        const criticalCount = data.filter((t: any) => t.priority === "critical" || t.priority === "high").length;
        const unassignedCount = data.filter((t: any) => !t.assignee).length;
        const resolvedCount = data.filter((t: any) => t.status === "resolved").length;
        const resolutionRate = data.length > 0 ? Math.round((resolvedCount / data.length) * 100) : 100;

        setStats([
          { 
            label: "Resolution Efficiency", 
            value: `${resolutionRate}%`, 
            sub: "Operational index", 
            color: resolutionRate > 80 ? "text-emerald-500" : "text-amber-500", 
            barColor: "bg-violet-600", 
            val: resolutionRate 
          },
          { 
            label: "Unassigned Incidents", 
            value: String(unassignedCount).padStart(2, '0'), 
            sub: "Awaiting triage", 
            extra: unassignedCount > 0 ? "Pending attention" : "Queue synced", 
            hasWarning: unassignedCount > 0 
          },
          { 
            label: "Critical Alerts", 
            value: String(criticalCount).padStart(2, '0'), 
            sub: "Active threats", 
            barColor: "bg-red-500", 
            val: criticalCount > 0 ? 100 : 0 
          },
          { 
            label: "System Integrity", 
            value: "99.9%", 
            sub: "Stable infrastructure", 
            color: "text-emerald-500", 
            barColor: "bg-emerald-500", 
            val: 99 
          },
        ]);

      } catch (error) {
        console.error("Failed to fetch incidents:", error);
        toast.error("FAILED TO SYNC REGISTRY.");
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  if (loading) {
    return (
        <div className="flex h-[80vh] items-center justify-center bg-[#fcfcfc]">
            <div className="flex flex-col items-center gap-6">
                <Loader2 className="h-10 w-10 animate-spin text-violet-600 mb-2" />
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] font-headline text-center">Synchronizing Incident Matrix...</p>
            </div>
        </div>
    );
  }
  return (
    <div className="space-y-10 pb-12 font-sans bg-[#fcfcfc] min-h-screen animate-in fade-in duration-700">

      <div className="flex items-center justify-between mb-8 px-4 md:px-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-600 mb-2 leading-none">
            Infrastructure Sector
          </p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none font-headline">Incident Management</h1>
          <p className="text-slate-500 mt-4 text-[11px] font-bold leading-none opacity-60">Lifecycle management of active operational and system incidents.</p>
        </div>
        <Button 
          onClick={() => navigate("/technical/incidents/create")}
          className="bg-violet-600 hover:bg-violet-700 text-white font-black py-6 px-8 rounded-[1.5rem] shadow-lg shadow-violet-600/20 active:scale-95 transition-all uppercase tracking-widest text-[10px] font-headline"
        >
          <Plus className="size-4 mr-2 stroke-[3px]" />
          Create New Incident
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-8">
        {stats.map((s: any, i: number) => (
          <div key={i} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden group">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 leading-none font-headline">{s.label}</p>
            <div className="flex items-center gap-4">
              <h3 className="text-4xl font-black text-slate-900 leading-none tabular-nums font-headline tracking-tighter">{s.value}</h3>
              <span className={`text-[9px] font-black ${s.color || 'text-slate-400'} uppercase tracking-[0.2em] bg-slate-50 px-2 py-1 rounded-lg`}>{s.sub}</span>
            </div>
            
            {s.val ? (
              <div className="mt-8 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50 shadow-inner">
                <div className={`h-full ${s.barColor} transition-all duration-[2000ms] shadow-[0_0_8px_rgba(0,0,0,0.1)]`} style={{ width: `${s.val}%` }} />
              </div>
            ) : s.extra ? (
              <div className="mt-8 flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <Activity className={`size-4 ${s.hasWarning ? 'text-amber-500' : 'text-emerald-500'}`} />
                {s.extra}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white p-3 rounded-[1.5rem] border border-slate-100 shadow-sm mx-4 md:mx-8">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="ghost" className="h-10 bg-slate-50 border-none rounded-xl px-5 text-[10px] font-bold text-slate-500 hover:bg-slate-100 uppercase tracking-widest font-headline">
            <Filter className="size-4 mr-2" />
            Filter Data
          </Button>
          <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1" />
          <select className="h-10 bg-white border border-slate-100 rounded-xl px-4 text-[10px] font-bold text-slate-600 focus:ring-violet-600/10 cursor-pointer min-w-[150px] font-headline tracking-widest">
            <option>Severity: All</option>
            <option>Severity: Critical</option>
          </select>
          <select className="h-10 bg-white border border-slate-100 rounded-xl px-4 text-[10px] font-bold text-slate-600 focus:ring-violet-600/10 cursor-pointer min-w-[150px] font-headline tracking-widest">
            <option>Status: All Active</option>
            <option>Status: Investigating</option>
          </select>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] px-6 font-headline">Monitoring {incidents.length} / {totalCount} active records</span>
      </div>

      {/* Incidents Registry */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-12 mx-4 md:mx-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left bg-white">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 font-headline">
              <tr>
                <th className="px-10 py-6">Incident ID</th>
                <th className="px-10 py-6">Description</th>
                <th className="px-10 py-6">Severity</th>
                <th className="px-10 py-6">Operation Status</th>
                <th className="px-10 py-6">Assignee</th>
                <th className="px-10 py-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {incidents.length > 0 ? (
                incidents.map((inc, i) => (
                  <tr key={i} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                    <td className="px-10 py-8">
                      <span className="font-black text-[13px] text-violet-700 block tracking-tight">{inc.id}</span>
                      <span className="text-[9px] font-black text-slate-300 block mt-2 uppercase tracking-widest italic">{inc.time}</span>
                    </td>
                    <td className="px-10 py-8">
                      <p className="text-[14px] font-black text-slate-900 group-hover:text-violet-700 transition-colors leading-none tracking-tight">{inc.desc}</p>
                      <p className="text-[9px] text-slate-300 font-black mt-2.5 leading-none uppercase tracking-[0.2em] opacity-60 font-headline">{inc.target}</p>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-3 py-1 rounded-[10px] text-[9px] font-black tracking-widest border shadow-sm ${inc.sevColor}`}>
                        {inc.sev}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <div className={`size-2.5 rounded-full bg-current ${inc.statusColor} ${inc.status === 'INVESTIGATING' ? 'animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.2)]' : ''}`} />
                        <span className={`text-[12px] font-black uppercase tracking-widest ${inc.statusColor}`}>{inc.status}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-inner group-hover:scale-110 transition-transform">
                          {inc.initial}
                        </div>
                        <span className={`text-[11px] font-black uppercase tracking-widest ${inc.assignee === 'UNASSIGNED' ? 'text-slate-300' : 'text-slate-700'}`}>
                          {inc.assignee}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button className="p-3 text-slate-200 hover:text-slate-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 shadow-sm">
                        <MoreVertical className="size-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-10 py-24 text-center">
                    <ShieldAlert className="size-12 mx-auto mb-6 text-slate-100" />
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">Registry synced. No active incidents detected.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-10 py-6 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none tabular-nums">Page 01 of 01</p>
          <div className="flex gap-4">
            <Button disabled variant="ghost" className="h-10 px-8 text-[10px] font-bold uppercase tracking-widest border border-slate-100 bg-white shadow-sm opacity-50">Previous</Button>
            <Button disabled variant="ghost" className="h-10 px-8 text-[10px] font-bold uppercase tracking-widest border border-slate-100 bg-white shadow-sm opacity-50">Next</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
