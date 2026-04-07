import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { MoreVertical, Plus, Shield, ExternalLink, Loader2, Zap } from "lucide-react"

import { projectsService } from "@/services/projects";
import { notificationsService } from "@/services/notifications";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow, parseISO } from "date-fns";
import { TicketModal } from "@/components/portal/technical/SupportModals";

export default function TechnicalDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [personalTasks, setPersonalTasks] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch projects to calculate overall progress
        const projectsRes = await projectsService.getProjects();
        const projectsList = Array.isArray(projectsRes) ? projectsRes : (projectsRes.results || []);

        // Fetch personal tasks (assigned to me)
        const tasksRes = await projectsService.getTasks({ assignee: user?.id });
        const tasksList = Array.isArray(tasksRes) ? tasksRes : (tasksRes.results || []);
        
        // Fetch all team tasks for global sector stats
        const allTasksRes = await projectsService.getTasks();
        const allTasks = Array.isArray(allTasksRes) ? allTasksRes : (allTasksRes.results || []);

        setPersonalTasks(tasksList.filter((t: any) => t.status !== 'completed' && t.status !== 'resolved').slice(0, 3));

        // Fetch updates from broadcasts
        const broadcastsRes = await notificationsService.getBroadcasts();
        const broadcastsList = Array.isArray(broadcastsRes) ? broadcastsRes : (broadcastsRes.results || []);
        setUpdates(broadcastsList.slice(0, 3));

        // Calculate Stats
        const activeTasksCount = tasksList.filter((t: any) => t.status !== 'completed' && t.status !== 'resolved').length;
        const avgProgress = projectsList.length > 0 
          ? projectsList.reduce((acc: number, curr: any) => acc + (curr.progress || curr.weighted_progress || 0), 0) / projectsList.length
          : 0;
        
        const criticalCount = tasksList.filter((t: any) => (t.priority === 'high' || t.priority === 'urgent' || t.priority === 'critical') && t.status !== 'completed').length;

        // Dynamic SLA calculation
        const completedTasks = allTasks.filter((t: any) => t.status === 'completed' || t.status === 'resolved').length;
        const slaVal = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 100;

        setStats([
          {
            label: "PROJECT PROGRESS",
            value: `${Math.round(avgProgress)}%`,
            sub: "Mission Deployment",
            subColor: "text-emerald-500",
            accent: "text-slate-900",
            bar: true,
            barVal: Math.round(avgProgress),
            icon: "📈",
          },
          {
            label: "ACTIVE TASKS",
            value: activeTasksCount.toString().padStart(2, '0'),
            sub: `${tasksList.filter((t: any) => t.status === "in_progress" || t.status === "progress").length} Processing`,
            subColor: "text-slate-400",
            accent: "text-slate-900",
            icon: "✓",
          },
          {
            label: "CRITICAL TASKS",
            value: criticalCount.toString().padStart(2, '0'),
            sub: `SLA Priority: ${criticalCount}`,
            subColor: "text-red-400",
            accent: "text-red-500",
            icon: "⚠",
          },
          { 
            label: "SLA COMPLIANCE", 
            value: `${slaVal}%`, 
            sub: slaVal > 90 ? "Optimal Hub" : "Alert Protocol", 
            color: slaVal > 90 ? "text-emerald-500" : "text-amber-500", 
            val: slaVal,
            accent: "text-slate-900"
          },
        ]);

      } catch (error) {
        console.error("Dashboard synchronization failed:", error);
        toast.error("Failed to synchronize operation overview.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
        fetchDashboardData();
    }
  }, [user]);



  if (loading) {
    return (
        <div className="flex h-[80vh] items-center justify-center bg-[#fcfcfc]">
            <div className="flex flex-col items-center gap-6">
                <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] font-headline">Scanning Operation Center Intelligence...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-10 pb-12 font-sans bg-[#fcfcfc] min-h-screen animate-in fade-in duration-700 p-4 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-600 mb-2 leading-none">
            TECHNICAL SECTOR
          </p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Operational Hub</h1>
          <p className="text-slate-500 mt-4 text-xs font-medium">Real-time engineering telemetry and mission health protocols.</p>
        </div>
        <div className="flex items-center gap-4 self-start md:self-auto">
          <button
            type="button"
            onClick={() => navigate("/technical/leave")}
            className="px-7 py-3 rounded-xl border border-slate-100 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            LEAVE REQUEST
          </button>
          <button
            type="button"
            onClick={() => navigate("/technical/tasks")}
            className="flex items-center gap-3 px-7 py-3 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20 active:scale-95 shadow-md"
          >
            <Plus className="size-4 stroke-[3px]" />
            MY TASKS
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s: any) => (
          <div key={s.label} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{s.label}</p>
              {s.sub && (
                <span className={`text-[10px] font-black ${s.subColor} uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100/50`}>{s.sub}</span>
              )}
            </div>
            <p className={`text-2xl font-black tracking-tight ${s.accent} leading-none`}>{s.value}</p>
            {s.bar && (
              <div className="mt-8 h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner group-hover:border-violet-100 transition-colors">
                <div
                  className="h-full bg-violet-600 rounded-full shadow-[0_0_10px_rgba(124,58,237,0.3)] transition-all duration-[2000ms]"
                  style={{ width: `${s.barVal}%` }}
                />
              </div>
            )}
            {!s.bar && s.val !== undefined && (
               <div className="mt-8 h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                  <div className={`h-full bg-slate-200 transition-all duration-1000`} style={{ width: `${s.val}%` }} />
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Mission Burndown</h3>
              <p className="text-[10px] font-medium text-slate-400 mt-2 uppercase tracking-widest opacity-60">
                Point velocity vs. projected mission trajectory
              </p>
            </div>
            <span className="px-5 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 shadow-sm">
              Sector Node Alpha
            </span>
          </div>

          <div className="h-64 w-full mt-10 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-slate-100">
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Mission Completion</p>
               <p className="text-5xl font-black text-slate-900 tracking-tight">{stats[0]?.value || "0%"}</p>
          </div>
        </div>

        {/* Project Updates */}
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col hover:shadow-xl transition-all duration-500 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/10" />
          <h3 className="text-[12px] font-black text-slate-900 mb-8 uppercase tracking-[0.2em]">Tactical Sync</h3>
          <div className="flex-1 space-y-8">
            {updates.length > 0 ? (
              updates.map((u: any, i: number) => (
                <div key={i} className="flex gap-4 group cursor-pointer hover:translate-x-1 transition-transform" onClick={() => toast.info(`Accessing briefing: ${u.title}`)}>
                  <div className="mt-1 flex flex-col items-center">
                    <div className="size-2.5 rounded-full shrink-0 bg-violet-600 shadow-[0_0_8px_rgba(124,58,237,0.4)]" />
                    {i < updates.length - 1 && (
                      <div className="w-[2px] flex-1 bg-slate-50 mt-2 rounded-full" />
                    )}
                  </div>
                  <div className="pb-3 border-b border-transparent min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 mb-1.5 tabular-nums">
                      {formatDistanceToNow(parseISO(u.created_at || new Date().toISOString()), { addSuffix: true }).toUpperCase()}
                    </p>
                    <p className="text-[12px] font-black text-slate-900 leading-tight mb-2 uppercase tracking-tight group-hover:text-violet-600 transition-colors truncate">{u.title}</p>
                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed line-clamp-2 opacity-80 italic">{u.message}</p>
                  </div>
                </div>
              ))
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                   <Zap className="size-10 text-slate-100 mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Sync Offline</p>
                </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => toast.info("Synchronizing historical logs…")}
            className="mt-8 w-full py-4 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-400 hover:bg-slate-50 hover:text-violet-600 transition-all uppercase tracking-[0.2em] active:scale-95 shadow-sm font-headline"
          >
            Mission History
          </button>
        </div>
      </div>

      {/* Bottom Grid: Task List + Node Integrity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Personal Task List */}
        <div className="lg:col-span-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-700">
          <div className="flex items-center justify-between px-10 py-8 border-b border-slate-50 bg-slate-50/10">
            <h3 className="font-black text-xl text-slate-900 tracking-tight uppercase">Assigned Directives</h3>
            <button
              type="button"
              onClick={() => navigate("/technical/tasks")}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-3 bg-violet-50 px-5 py-2.5 rounded-xl border border-violet-100 shadow-sm"
            >
              Full Roster
              <ExternalLink className="size-3.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {personalTasks.length > 0 ? (
              personalTasks.map((t: any, i: number) => {
                const isUrgent = t.priority === 'high' || t.priority === 'urgent' || t.priority === 'critical';
                
                return (
                  <div key={i} className="flex items-center gap-8 px-10 py-8 group hover:bg-slate-50/30 transition-all cursor-pointer" onClick={() => toast.info(`Syncing directive: ${t.title}`)}>
                    <div className="size-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-all group-hover:border-violet-100 group-hover:shadow-xl group-hover:rotate-6">
                      {isUrgent ? "⚠" : t.task_type === 'bug' ? "🐛" : "🔧"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[16px] font-black text-slate-900 group-hover:text-violet-700 transition-colors uppercase tracking-tight leading-none mb-2.5">{t.title}</p>
                      <p className="text-[11px] text-slate-300 font-black uppercase tracking-widest leading-none opacity-80">
                        {t.project_name || "Strategic Unit"} • {t.due_date ? `Due ${t.due_date}` : "MISSION PENDING"}
                      </p>
                    </div>
                    <div className={`px-5 py-2 rounded-xl text-[10px] font-black shrink-0 uppercase tracking-widest border transition-all shadow-sm ${
                      isUrgent ? 'bg-red-50 text-red-600 border-red-100' :
                      t.priority === 'medium' ? 'bg-violet-50 text-violet-600 border-violet-100' :
                      'bg-slate-50 text-slate-400 border-slate-100'
                    }`}>
                      {t.priority || 'Normal'}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toast.info(`Options for: ${t.title}`) }}
                      className="p-3 text-slate-200 hover:text-slate-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 shadow-sm"
                    >
                      <MoreVertical className="size-5" />
                    </button>
                  </div>
                );
              })
            ) : (
                <div className="px-10 py-24 text-center opacity-30">
                   <Shield className="size-12 mx-auto mb-6 text-slate-200" />
                   <p className="text-[11px] font-black uppercase tracking-[0.2em]">Operational Stack Synchronized</p>
                </div>
            )}
          </div>
        </div>
      </div>

      <TicketModal 
        isOpen={isTicketModalOpen} 
        onClose={() => setIsTicketModalOpen(false)} 
        onSuccess={() => toast.success("System pulse record synchronized.")}
      />
    </div>
  )
}
