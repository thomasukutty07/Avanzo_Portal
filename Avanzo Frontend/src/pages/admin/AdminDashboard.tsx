import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import { toast } from "sonner"
import { MoreVertical, Shield, ExternalLink, Loader2, Zap } from "lucide-react"
import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [updates, setUpdates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [tRes, pRes, bRes] = await Promise.all([
          api.get("/api/projects/tasks/"),
          api.get("/api/projects/projects/"),
          api.get("/api/notifications/broadcasts/")
        ]);
        
        const rawTasks = extractResults(tRes.data);
        const rawProjects = extractResults(pRes.data);
        const rawBroadcasts = extractResults(bRes.data);

        setTasks(rawTasks);
        setProjects(rawProjects);
        setUpdates(rawBroadcasts);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
        toast.error("Sector synchronization failed.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Derived Stats
  const activeTasksCount = tasks.filter(t => t.status !== "resolved" && t.status !== "completed").length;
  const criticalBugsCount = tasks.filter(t => (t.priority === "high" || t.priority === "urgent") && t.status !== "resolved").length;
  const avgProgress = projects.length > 0 
    ? Math.round(projects.reduce((acc, p) => acc + (p.weighted_progress || p.progress || 0), 0) / projects.length)
    : 0;

  const dynamicStats = [
    {
      label: "PROJECT PROGRESS",
      value: `${avgProgress}%`,
      sub: "Average Completion",
      subColor: "text-emerald-500",
      accent: "text-slate-900",
      bar: true,
      barVal: avgProgress,
      icon: "📈",
    },
    {
      label: "ACTIVE TASKS",
      value: activeTasksCount.toString().padStart(2, '0'),
      sub: `${tasks.filter(t => t.status === "in_progress").length} In Progress`,
      subColor: "text-slate-400",
      accent: "text-slate-900",
      icon: "✓",
    },
    {
      label: "OPEN BUGS",
      value: criticalBugsCount.toString().padStart(2, '0'),
      sub: `Current Load: ${criticalBugsCount}`,
      subColor: "text-red-400",
      accent: "text-red-500",
      icon: "⚠",
    },
    {
      label: "SYSTEM USERS",
      value: projects.reduce((acc, p) => acc + (p.team?.length || 0), 0).toString().padStart(2, '0'),
      sub: "Total Registered Personnel",
      subColor: "text-slate-400",
      accent: "text-slate-900",
      icon: "👥",
    },
  ];

  const dynamicUpdates = updates.slice(0, 3).map(b => ({
    ago: b.created_at ? new Date(b.created_at).toLocaleDateString() : 'SYNC...',
    title: b.title,
    desc: b.message,
    dot: b.severity === "critical" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "bg-violet-600 shadow-[0_0_8px_rgba(124,58,237,0.4)]",
  }));

  const dynamicTasks = tasks.slice(0, 3).map(t => ({
    icon: (t.task_type === "bug" || t.priority === "urgent") ? "⚠" : "🔧",
    title: t.title,
    sub: `${t.project_name || 'Global'} • ${t.completion_pct || t.progress || 0}% sync`,
    priority: (t.priority || 'Normal').toUpperCase(),
    priorityStyle: (t.priority === "high" || t.priority === "urgent") ? "bg-red-50 text-red-600 border border-red-100" : 
                   t.priority === "medium" || t.priority === "tactical" ? "bg-violet-50 text-violet-600 border border-violet-100" :
                   "bg-slate-50 text-slate-400 border border-slate-100"
  }));

  // Create real burn-down data or empty state
  const BURNDOWN_DATA = [
    { day: "T-MINUS", actual: avgProgress, ideal: 100 },
    { day: "NOW", actual: avgProgress, ideal: avgProgress },
    { day: "TARGET", actual: null, ideal: 0 },
  ];

  if (loading) {
    return (
      <OrganizationAdminChrome>
        <div className="flex h-[80vh] items-center justify-center bg-[#fcfcfc]">
          <div className="flex flex-col items-center gap-6">
            <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] font-headline">Decrypting Sector Intelligence...</p>
          </div>
        </div>
      </OrganizationAdminChrome>
    );
  }

  return (
    <OrganizationAdminChrome>
      <div className="p-6 md:p-10 space-y-10 animate-in fade-in duration-700 min-h-screen font-display bg-[#fcfcfc] text-slate-900">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 mb-1">
              ORGANIZATION MANAGEMENT
            </p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight font-headline uppercase leading-none">
              Command Overview
            </h1>
            <p className="text-slate-500 mt-4 text-sm font-medium">High-level mission analytics and sector health protocols.</p>
          </div>
          <div className="flex items-center gap-4 self-start md:self-auto">
            <button
              type="button"
              onClick={() => toast.info("Starting new sector analysis…")}
              className="px-7 py-3 rounded-xl border border-slate-100 bg-white text-slate-900 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              Analyze Hub
            </button>
            <button
              type="button"
              onClick={() => { navigate("/admin-notifications") }}
              className="flex items-center gap-3 px-7 py-3 rounded-xl bg-violet-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20 active:scale-95"
            >
              <Shield className="size-4" />
              Incidents
            </button>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {dynamicStats.map((s) => (
            <div key={s.label} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{s.label}</p>
                {s.sub && (
                  <span className={`text-[10px] font-black ${s.subColor} uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100/50`}>{s.sub}</span>
                )}
              </div>
              <p className={`text-5xl font-black tracking-tight font-headline ${s.accent} leading-none`}>{s.value}</p>
              {s.bar && (
                <div className="mt-8 h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner group-hover:border-violet-100 transition-colors">
                  <div
                    className="h-full bg-violet-600 rounded-full shadow-[0_0_10px_rgba(124,58,237,0.3)] transition-all duration-[2000ms]"
                    style={{ width: `${s.barVal}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Main Grid: Chart + Updates */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sprint Burndown Chart */}
          <div className="lg:col-span-9 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 hover:shadow-xl transition-all duration-500 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-violet-600/10" />
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xl font-black text-slate-900 font-headline uppercase tracking-tight">Mission Burndown</h3>
                <p className="text-[11px] font-medium text-slate-400 mt-2 uppercase tracking-widest opacity-60">
                  Sector velocity vs. projected mission trajectory
                </p>
              </div>
              <span className="px-5 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 shadow-sm">
                Global Sector Alpha
              </span>
            </div>

            <div className="h-64 w-full mt-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={BURNDOWN_DATA} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="idealGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fontWeight: 900, fill: "#94a3b8" }}
                    dy={12}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ borderRadius: "20px", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", fontSize: "11px", fontWeight: "black", textTransform: 'uppercase' }}
                    cursor={{ stroke: "#7c3aed", strokeWidth: 1, strokeDasharray: "4 4" }}
                  />
                  <ReferenceLine
                    y={50}
                    stroke="#f1f5f9"
                    strokeDasharray="8 8"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="ideal"
                    stroke="#e2e8f0"
                    strokeWidth={3}
                    strokeDasharray="10 5"
                    fill="url(#idealGrad)"
                    dot={false}
                    connectNulls
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#7c3aed"
                    strokeWidth={4}
                    fill="url(#actualGrad)"
                    dot={{ fill: "#7c3aed", strokeWidth: 5, stroke: "#fff", r: 4 }}
                    activeDot={{ r: 8, fill: "#7c3aed", stroke: "#fff", strokeWidth: 3 }}
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Project Updates */}
          <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col hover:shadow-xl transition-all duration-500 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-violet-600/10" />
            <h3 className="text-[12px] font-black text-slate-900 mb-8 uppercase tracking-[0.2em]">Sector Intelligence</h3>
            <div className="flex-1 space-y-8">
              {dynamicUpdates.length > 0 ? (
                dynamicUpdates.map((u, i) => (
                  <div key={i} className="flex gap-4 group cursor-pointer hover:translate-x-1 transition-transform">
                    <div className="mt-1 flex flex-col items-center">
                      <div className={`size-2.5 rounded-full shrink-0 ${u.dot}`} />
                      {i < dynamicUpdates.length - 1 && (
                        <div className="w-[2px] flex-1 bg-slate-50 mt-2 rounded-full" />
                      )}
                    </div>
                    <div className="pb-3 border-b border-transparent">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 mb-1.5 tabular-nums">{u.ago}</p>
                      <p className="text-[12px] font-black text-slate-900 leading-tight mb-2 uppercase tracking-tight group-hover:text-violet-600 transition-colors">{u.title}</p>
                      <p className="text-[10px] font-medium text-slate-500 leading-relaxed line-clamp-2 opacity-80">{u.desc}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                   <Zap className="size-10 text-slate-100 mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Feed Offline</p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => toast.info("Opening mission archive…")}
              className="mt-8 w-full py-4 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-400 hover:bg-slate-50 hover:text-violet-600 transition-all uppercase tracking-[0.2em] active:scale-95 shadow-sm"
            >
              Archive Feed
            </button>
          </div>
        </div>

        {/* Bottom Grid: Task List + Node Integrity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Personal Task List */}
          <div className="lg:col-span-9 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-700">
            <div className="flex items-center justify-between px-10 py-8 border-b border-slate-50 bg-slate-50/10">
              <h3 className="font-headline font-black text-xl text-slate-900 tracking-tight uppercase">Strategic Directives</h3>
              <button
                type="button"
                onClick={() => navigate("/users")}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-3 bg-violet-50 px-5 py-2.5 rounded-xl border border-violet-100 shadow-sm"
              >
                Global List
                <ExternalLink className="size-3.5" />
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {dynamicTasks.length > 0 ? dynamicTasks.map((t, i) => (
                <div key={i} className="flex items-center gap-8 px-10 py-8 group hover:bg-slate-50/30 transition-all cursor-pointer">
                  <div className="size-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-all group-hover:border-violet-100 group-hover:shadow-xl group-hover:rotate-6">
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-black text-slate-900 group-hover:text-violet-700 transition-colors uppercase tracking-tight leading-none mb-2.5">{t.title}</p>
                    <p className="text-[11px] text-slate-300 font-black uppercase tracking-widest leading-none opacity-80">{t.sub}</p>
                  </div>
                  <div className={`px-5 py-2 rounded-xl text-[10px] font-black shrink-0 uppercase tracking-widest border transition-all shadow-sm ${t.priorityStyle}`}>
                    {t.priority}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toast.info(`Options for: ${t.title}`) }}
                    className="p-3 text-slate-200 hover:text-slate-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 shadow-sm"
                  >
                    <MoreVertical className="size-5" />
                  </button>
                </div>
              )) : (
                <div className="px-10 py-24 text-center opacity-30">
                   <Shield className="size-12 mx-auto mb-6 text-slate-200" />
                   <p className="text-[11px] font-black uppercase tracking-[0.2em]">Strategic Registry Synchronized</p>
                </div>
              )}
            </div>
          </div>

          {/* Node Integrity */}
          <div className="lg:col-span-3 relative overflow-hidden rounded-[2.5rem] bg-violet-600 p-8 text-white shadow-xl shadow-violet-600/20 flex flex-col justify-between group hover:shadow-2xl hover:scale-[1.02] transition-all duration-700 min-h-[400px]">
             {/* Decorative circles */}
             <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-700" />
             <div className="pointer-events-none absolute right-4 bottom-4 size-32 rounded-full bg-white/5 blur-xl" />

             <div className="flex items-start justify-between relative z-10">
               <div className="size-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all">
                 <Shield className="size-6 text-white" />
               </div>
               <button
                 type="button"
                 onClick={() => toast.info("Expanding node telemetry…")}
                 className="p-2 px-5 bg-white/10 hover:bg-white/20 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-colors border border-white/5"
                >
                  FULL SCAN
                </button>
             </div>

             <div className="relative z-10">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-3 ml-1">SYSTEM INTEGRITY</p>
               <h3 className="text-3xl font-black mb-10 leading-tight font-headline uppercase tracking-tight">Sync Health Portfolio</h3>
               <div className="space-y-4">
                 <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shadow-inner">
                   <span className="text-[11px] font-black uppercase tracking-widest text-white/70">CORE ENGINE</span>
                   <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                     <span className="size-2 bg-emerald-400 rounded-full animate-pulse" />
                     OPERATIONAL
                   </span>
                 </div>
                 <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shadow-inner">
                   <span className="text-[11px] font-black uppercase tracking-widest text-white/70">SYNC LATENCY</span>
                   <span className="text-[10px] font-black text-white uppercase tracking-widest tabular-nums font-headline">12.8ms</span>
                 </div>
               </div>
             </div>

             <button className="relative z-10 w-full mt-10 py-5 bg-white text-violet-700 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-violet-50 transition-all shadow-xl active:scale-95">
               Synchronize Node
             </button>
          </div>
        </div>
      </div>
    </OrganizationAdminChrome>
  )
}
