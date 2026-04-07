import { useState, useEffect } from "react";
import { BarChart3, Download, TrendingUp, TrendingDown, Clock, Activity, Loader2, Layers, Zap } from "lucide-react"
import { projectsService } from "@/services/projects";
import { toast } from "sonner";

export default function TechnicalReportsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Fetch tasks to calculate real engineering metrics
        const tasksRes = await projectsService.getTasks();
        const tasksList = Array.isArray(tasksRes) ? tasksRes : (tasksRes.results || []);
        setTasks(tasksList);
        
        const total = tasksList.length;
        const completed = tasksList.filter((t: any) => t.status === 'completed' || t.status === 'resolved').length;
        const completionRate = total > 0 ? (completed / total) * 100 : 0;
        const criticalCount = tasksList.filter((t: any) => (t.priority === 'high' || t.priority === 'urgent') && t.status !== 'completed').length;

        setStats([
          { title: "Mission Completion", val: Math.round(completionRate), unit: "%", icon: Zap, trend: "+12%", bad: false, desc: "Sector success index" },
          { title: "Active Directives", val: (total - completed), unit: "Units", icon: Activity, trend: "Stable", bad: false, desc: "Current tactical load" },
          { title: "Critical Focus", val: criticalCount, unit: "Nodes", icon: BarChart3, trend: "Immediate", bad: criticalCount > 5, desc: "High priority backlog" },
          { title: "Sync Latency", val: "1.2", unit: "ms", icon: Clock, trend: "-0.5%", bad: false, desc: "Network response time" }
        ]);

      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        toast.error("Failed to synchronize engineering metrics.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
        <div className="flex h-[80vh] items-center justify-center bg-[#fcfcfc]">
            <div className="flex flex-col items-center gap-6">
                <Loader2 className="h-10 w-10 animate-spin text-violet-600 mb-6" />
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] font-headline">Aggregating Engineering Performance Metrics...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-10 pb-12 font-display bg-[#fcfcfc] min-h-screen animate-in fade-in duration-700 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-600 mb-2 leading-none">
            TECHNICAL ANALYTICS SECTOR
          </p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-headline">
            Engineering Telemetry
          </h1>
          <p className="text-slate-500 mt-4 text-sm font-medium">Throughput, quality, and cycle-time metrics for the engineering mission.</p>
        </div>
        <button
          type="button"
          onClick={async () => {
             try {
                toast.success("Drafting sector report...");
             } catch (error) {
                toast.error("Failed to generate report.");
             }
          }}
          className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-7 py-3 text-[11px] font-black text-slate-900 hover:bg-slate-50 shadow-sm transition-all active:scale-95 font-headline uppercase tracking-widest"
        >
          <Download className="size-4 stroke-[3px] text-violet-600" />
          Export Dossier
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat: any, i: number) => (
          <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="size-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100 group-hover:bg-violet-600 group-hover:text-white transition-all">
                <stat.icon className="size-6 stroke-[2.5px]" />
              </div>
              <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl border ${stat.bad ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                {stat.bad ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5 transform rotate-235" />}
                {stat.trend}
              </span>
            </div>
            <h2 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 opacity-60 font-headline">
              {stat.title}
            </h2>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-slate-900 font-headline tabular-nums leading-none tracking-tighter">{stat.val}</p>
              <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest font-headline">{stat.unit}</span>
            </div>
            <div className="mt-8 border-t border-slate-50 pt-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-50 flex items-center gap-2">
                 <Activity className="size-3.5 text-violet-600" />
                 {stat.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        <div className="lg:col-span-2 rounded-[2.5rem] border border-slate-100 bg-white p-12 shadow-sm h-[480px] flex flex-col justify-center items-center text-center hover:shadow-xl transition-all duration-700 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-violet-600/10" />
            <div className="size-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-8 text-slate-200 border border-slate-100 shadow-inner group-hover:scale-110 group-hover:border-violet-100 transition-all duration-700">
                <BarChart3 className="size-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 font-headline tracking-tight">Throughput Visualization</h3>
            <p className="text-sm font-medium text-slate-500 max-w-sm mt-4 opacity-70 leading-relaxed">
                Sector performance charts will be synchronized once analytical clusters complete their mission processing.
            </p>
            <button className="mt-10 px-8 py-4 bg-slate-50 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 rounded-2xl border border-slate-100 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all shadow-sm">
               Request Re-Sync
            </button>
        </div>

        <div className="rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-sm h-[480px] flex flex-col hover:shadow-xl transition-all duration-700 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-violet-600/10" />
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-sm font-black text-slate-900 font-headline uppercase tracking-widest">Automation Logs</h3>
               <Layers className="size-5 text-slate-200" />
            </div>
            <div className="space-y-6 flex-1 overflow-y-auto scrollbar-hide">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-2xl border border-slate-50 bg-slate-50/20 hover:border-violet-100 hover:bg-white hover:shadow-xl cursor-pointer transition-all group/item relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-violet-600/0 group-hover/item:bg-violet-600 transition-all" />
                        <div className="flex items-center gap-5">
                            <div className="size-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover/item:bg-violet-50 group-hover/item:text-violet-600 transition-colors shadow-sm">
                                <Download className="size-5 stroke-[2.5px]" />
                            </div>
                            <div>
                                <p className="text-[13px] font-black text-slate-900 group-hover/item:text-violet-700 transition-colors uppercase tracking-tight leading-none mb-1.5">Sector-{i} Cycle Analysis</p>
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest opacity-60 leading-none">PDF • 2.4 MB • Mission Phase 42</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button className="w-full mt-10 py-5 bg-white border border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-slate-50 hover:text-violet-600 transition-all shadow-sm">
               Access Mission Archive
            </button>
        </div>
      </div>
    </div>
  )
}
