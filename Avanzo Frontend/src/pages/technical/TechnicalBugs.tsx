import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { Bug, Filter, Plus, MoreVertical, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ticketsService } from "@/services/tickets";
import { toast } from "sonner";
import { formatDistanceToNow, parseISO } from "date-fns";

type BugData = {
  id: string;
  title: string;
  sev: string;
  status: string;
  age: string;
  component: string;
}

export default function TechnicalBugsPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true);
  const [bugs, setBugs] = useState<BugData[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchBugs = async () => {
      try {
        setLoading(true);
        const res = await ticketsService.getTickets({ type: "bug" });
        const data = Array.isArray(res) ? res : (res.results || []);
        setTotalCount(Array.isArray(res) ? res.length : (res.count || 0));

        const mapped: BugData[] = data.map((t: any) => {
          const sevMap: Record<string, string> = {
            critical: "P1",
            high: "P1",
            medium: "P2",
            low: "P3"
          };

          const statusMap: Record<string, string> = {
            open: "Open",
            progress: "In progress",
            resolved: "Resolved"
          };

          return {
            id: `BUG-${t.id.substring(0, 4).toUpperCase()}`,
            title: t.title,
            sev: sevMap[t.priority] || "P2",
            status: statusMap[t.status] || t.status,
            age: t.created_at ? formatDistanceToNow(parseISO(t.created_at)) : "Recently",
            component: t.asset_name || "Frontend"
          };
        });

        setBugs(mapped);

        // Update Stats
        const openCount = data.filter((t: any) => t.status !== "resolved").length;
        const criticalCount = data.filter((t: any) => t.priority === "critical").length;

        setStats([
          { label: "OPEN BUGS", value: String(openCount), sub: `${data.filter((t: any) => t.status === 'open').length} require triage`, color: "text-amber-500", barColor: "bg-amber-500", val: data.length > 0 ? (openCount / data.length) * 100 : 0 },
          { label: "CRITICAL SEVERITY", value: String(criticalCount), sub: "SLA < 4 hours", color: "text-red-500", barColor: "bg-red-500", val: criticalCount > 0 ? 100 : 0, isUrgent: criticalCount > 0 },
          { label: "RESOLUTION VELOCITY", value: "84%", sub: "Efficiency rating", color: "text-emerald-500", barColor: "bg-violet-600", val: 84 },
        ]);

      } catch (error) {
        console.error("Failed to fetch bugs:", error);
        toast.error("Failed to synchronize bug tracker.");
      } finally {
        setLoading(false);
      }
    };

    fetchBugs();
  }, []);

  if (loading) {
    return (
        <div className="flex h-[80vh] items-center justify-center bg-[#fcfcfc]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Compiling Defect Registry...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-display bg-[#fcfcfc] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 mb-1">
            TECHNICAL MANAGEMENT
          </p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-headline">
            Bug Tracking
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Triage and resolution status for reported defects.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
            onClick={() => navigate("/technical/reports")}
          >
            View All Reports
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-[13px] font-bold text-white hover:bg-violet-700 shadow-lg shadow-violet-600/20 transition-all"
            title="Wire to your bug tracker API"
          >
            <Plus className="size-4" />
            Report Bug
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((s: any, i: number) => (
          <Card key={i} className={`border-none shadow-sm rounded-2xl overflow-hidden bg-white ${s.isUrgent ? 'ring-2 ring-red-500 shadow-red-500/10' : 'shadow-slate-100'}`}>
            <CardContent className="p-7 relative">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 leading-none">{s.label}</p>
              <div className="flex items-center gap-3">
                <h3 className="text-3xl font-bold text-slate-900 font-headline">{s.value}</h3>
                <span className={`text-[10px] font-bold ${s.color} uppercase tracking-tight`}>{s.sub}</span>
              </div>
              <div className="mt-8 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                <div className={`h-full ${s.barColor} transition-all duration-1000`} style={{ width: `${s.val}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 bg-white transition-colors">
            <Filter className="size-3.5" />
            Filters
          </button>
          <div className="h-6 w-px bg-slate-200 hidden md:block" />
          <select className="h-9 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 border-transparent focus:ring-2 focus:ring-violet-600/20 outline-none">
            <option>Severity: All</option>
            <option>P1 Critical</option>
            <option>P2 High</option>
          </select>
          <select className="h-9 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 border-transparent focus:ring-2 focus:ring-violet-600/20 outline-none">
            <option>Status: Open</option>
            <option>Status: All</option>
          </select>
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Showing {bugs.length} of {totalCount} total defects
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-100 bg-[#f8f9fa]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Bug Description</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Component</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Severity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Age</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bugs.length > 0 ? (
                bugs.map((r: BugData) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1.5 shrink-0">
                          <Bug className="size-3.5 text-slate-400 group-hover:text-violet-600 transition-colors" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-[13px]">{r.title}</p>
                          <p className="text-[11px] font-semibold text-violet-600 mt-1 cursor-pointer hover:underline">{r.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded bg-slate-100 text-slate-600">
                        {r.component}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {r.status === "In progress" ? (
                          <>
                            <div className="size-2.5 rounded-full border-2 border-amber-500 overflow-hidden" />
                            <span className="text-[11px] font-bold text-amber-500">{r.status}</span>
                          </>
                        ) : r.status === "Open" ? (
                          <>
                            <div className="size-2.5 rounded-full bg-violet-500" />
                            <span className="text-[11px] font-bold text-violet-600">{r.status}</span>
                          </>
                        ) : (
                          <>
                            <div className="size-2.5 rounded-full bg-emerald-500" />
                            <span className="text-[11px] font-bold text-emerald-600">{r.status}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest ${r.sev === 'P1' ? 'border-red-500 text-red-600' : r.sev === 'P2' ? 'border-amber-500 text-amber-600' : 'border-slate-300 text-slate-500'}`}>
                        {r.sev}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[11px] font-bold text-slate-500">
                      {r.age}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-300 hover:text-slate-600 p-1.5 rounded transition-colors">
                        <MoreVertical className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[11px]">
                    No active defects registered in the central system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-white">
          <span className="text-[11px] font-bold text-slate-500">
            Page 1 of 1
          </span>
          <div className="flex items-center gap-1">
            <button disabled className="p-1 text-slate-200">
              <ChevronLeft className="size-4" />
            </button>
            <button className="size-6 rounded text-[11px] font-bold flex items-center justify-center bg-violet-700 text-white">1</button>
            <button disabled className="p-1 text-slate-200">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
