import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { MoreVertical, Plus, Shield, ExternalLink, Loader2 } from "lucide-react"

import { projectsService } from "@/services/projects";
import { notificationsService } from "@/services/notifications";
import { useAuth } from "@/context/AuthContext";

import { TicketModal } from "@/components/portal/technical/SupportModals";

export default function TechnicalDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [personalTasks, setPersonalTasks] = useState<any[]>([]);

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
            label: "Project progress",
            value: `${Math.round(avgProgress)}%`,
            sub: "Mission deployment",
            subColor: "text-emerald-500",
            accent: "text-slate-900",
            bar: true,
            barVal: Math.round(avgProgress),
            icon: "📈",
          },
          {
            label: "Active tasks",
            value: activeTasksCount.toString().padStart(2, '0'),
            sub: `${tasksList.filter((t: any) => t.status === "in_progress" || t.status === "progress").length} processing`,
            subColor: "text-slate-400",
            accent: "text-slate-900",
            icon: "✓",
          },
          {
            label: "Critical tasks",
            value: criticalCount.toString().padStart(2, '0'),
            sub: `SLA priority: ${criticalCount}`,
            subColor: "text-red-400",
            accent: "text-red-500",
            icon: "⚠",
          },
          { 
            label: "SLA compliance", 
            value: `${slaVal}%`, 
            sub: slaVal > 90 ? "Optimal hub" : "Alert protocol", 
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
                <p className="text-[11px] font-black text-slate-400 font-headline">Scanning operation center intelligence...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-10 pb-12 font-sans bg-[#fcfcfc] min-h-screen animate-in fade-in duration-700 p-4 md:p-8">
      {/* Page Header */}
      <div className="sticky top-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[#fcfcfc]/80 backdrop-blur-md border-b border-transparent transition-all">
        <div>
          <p className="text-[10px] font-black tracking-[0.3em] text-violet-600 mb-2 leading-none">
            Technical sector
          </p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Operational hub</h1>
          <p className="text-slate-500 mt-2 text-xs font-medium">Real-time engineering telemetry and mission health protocols.</p>
        </div>
        <div className="flex items-center gap-4 self-start md:self-auto">
          <button
            type="button"
            onClick={() => navigate("/technical/leave")}
            className="px-7 py-3 rounded-xl border border-slate-100 bg-white text-slate-900 text-[10px] font-black hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            Leave request
          </button>
          <button
            type="button"
            onClick={() => navigate("/technical/tasks")}
            className="flex items-center gap-3 px-7 py-3 rounded-xl bg-violet-600 text-white text-[10px] font-black hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20 active:scale-95 shadow-md"
          >
            <Plus className="size-4 stroke-[3px]" />
            My tasks
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s: any) => (
          <div key={s.label} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[9px] font-black text-slate-400">{s.label}</p>
              {s.sub && (
                <span className={`text-[10px] font-black ${s.subColor} bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100/50`}>{s.sub}</span>
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

      </div>

      {/* Bottom Grid: Task List + Node Integrity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Personal Task List */}
        <div className="lg:col-span-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-700">
          <div className="flex items-center justify-between px-10 py-8 border-b border-slate-50 bg-slate-50/10">
            <h3 className="font-black text-xl text-slate-900 tracking-tight">Assigned directives</h3>
            <button
              type="button"
              onClick={() => navigate("/technical/tasks")}
              className="text-[10px] font-black text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-3 bg-violet-50 px-5 py-2.5 rounded-xl border border-violet-100 shadow-sm"
            >
              Full roster
              <ExternalLink className="size-3.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {personalTasks.length > 0 ? (
              personalTasks.map((t: any, i: number) => {
                const isUrgent = t.priority === 'high' || t.priority === 'urgent' || t.priority === 'critical';
                
                return (
                  <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 px-6 sm:px-10 py-8 group hover:bg-slate-50/30 transition-all cursor-pointer" onClick={() => toast.info(`Syncing directive: ${t.title}`)}>
                    <div className="size-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-all group-hover:border-violet-100 group-hover:shadow-xl group-hover:rotate-6">
                      {isUrgent ? "⚠" : t.task_type === 'bug' ? "🐛" : "🔧"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[16px] font-black text-slate-900 group-hover:text-violet-700 transition-colors tracking-tight leading-none mb-2.5">{t.title}</p>
                      <p className="text-[11px] text-slate-300 font-black leading-none opacity-80">
                        {t.project_name || "Strategic unit"} • {t.due_date ? `due ${t.due_date}` : "Mission pending"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                       <div className={`px-5 py-2 rounded-xl text-[10px] font-black shrink-0 border transition-all shadow-sm ${
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
                  </div>
                );
              })
            ) : (
                <div className="px-10 py-24 text-center opacity-30">
                   <Shield className="size-12 mx-auto mb-6 text-slate-200" />
                   <p className="text-[11px] font-black tracking-[0.2em]">Operational stack synchronized</p>
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
