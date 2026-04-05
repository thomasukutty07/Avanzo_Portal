import { useState, useEffect } from "react";
import { 
  Plus,
  Filter,
  MoreVertical,
  Clock,
  Loader2
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
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
            open: "New",
            progress: "Investigating",
            resolved: "Resolved"
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
            status: statusMap[t.status] || t.status,
            assignee: t.assignee_name || "Unassigned",
            initial: t.assignee_name ? t.assignee_name.split(' ').map((n:any) => n[0]).join('') : "??",
            sevColor: sevStyles[sev] || sevStyles.MEDIUM,
            statusColor: statusColors[t.status] || "text-slate-400"
          };
        });

        setIncidents(mapped);

        // Update Stats
        const criticalCount = data.filter((t: any) => t.priority === "critical").length;
        const unassignedCount = data.filter((t: any) => !t.assignee).length;

        setStats([
          { label: "AVG. RESOLUTION TIME", value: "4.2h", sub: "-12% vs last mo", color: "text-emerald-500", barColor: "bg-violet-600", val: 65 },
          { label: "UNASSIGNED INCIDENTS", value: String(unassignedCount).padStart(2, '0'), sub: "Requiring triage", extra: unassignedCount > 0 ? "SLA deadline approaching" : "All triaged", hasWarning: unassignedCount > 0 },
          { label: "CRITICAL INCIDENTS", value: String(criticalCount).padStart(2, '0'), sub: "Active now", barColor: "bg-red-500", val: criticalCount > 0 ? 100 : 0 },
          { label: "MAINTENANCE DEFICIT", value: "14%", sub: "-5% improvement", color: "text-red-500", barColor: "bg-red-500", val: 14 },
        ]);

      } catch (error) {
        console.error("Failed to fetch incidents:", error);
        toast.error("Failed to synchronize incident feed.");
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  if (loading) {
    return (
        <div className="flex h-[80vh] items-center justify-center bg-[#fcfcfc]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Scanning Network Health...</p>
            </div>
        </div>
    );
  }
  return (
    <div className="space-y-6 pb-12 font-display bg-[#fcfcfc] min-h-screen">

      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 mb-1">
            TECHNICAL MANAGEMENT
          </p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-headline">Incident Management</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Real-time overview and lifecycle management of technical incidents.</p>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-6 px-8 rounded-xl shadow-lg shadow-violet-600/20 active:scale-95 transition-all uppercase tracking-widest text-xs">
          <Plus className="size-4 mr-2" />
          Create New Incident
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s: any, i: number) => (
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
                <div className="mt-4 flex items-center gap-2 text-[9px] font-bold text-amber-600 uppercase tracking-tight">
                  <Clock className="size-3" />
                  {s.extra}
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
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
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Showing {incidents.length} of {totalCount} total incidents</span>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left bg-white">
            <thead className="bg-[#f8f9fa] text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Incident ID</th>
                <th className="px-8 py-5">Description</th>
                <th className="px-8 py-5">Severity</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Assignee</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incidents.length > 0 ? (
                incidents.map((inc, i) => (
                  <tr key={i} className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                    <td className="px-8 py-6">
                      <span className="font-bold text-[12px] text-violet-700 block">{inc.id}</span>
                      <span className="text-[9px] font-bold text-slate-400 block mt-1 tracking-tight">{inc.time}</span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-[13px] font-bold text-slate-900 group-hover:text-violet-700 transition-colors leading-none">{inc.desc}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1.5 leading-none uppercase tracking-tighter">{inc.target}</p>
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
                        <span className={`text-[11px] font-bold ${inc.assignee === 'Unassigned' ? 'text-slate-400 font-medium' : 'text-slate-700'}`}>
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
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[11px]">
                    No active incidents detected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-8 py-5 bg-white border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Page 1 of 1</p>
          <div className="flex gap-2">
            <Button disabled variant="outline" className="h-8 min-w-[80px] text-[10px] font-bold uppercase tracking-widest border-slate-200">Previous</Button>
            <Button disabled variant="outline" className="h-8 min-w-[80px] text-[10px] font-bold uppercase tracking-widest border-slate-200 text-slate-400">Next</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
