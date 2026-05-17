import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { MoreVertical, Plus, Shield, ExternalLink, Loader2, Clock, Calendar, CheckCircle2, Circle } from "lucide-react"

import { projectsService } from "@/services/projects";
import { useAuth } from "@/context/AuthContext";
import { TicketModal } from "@/components/portal/technical/SupportModals";
import { DashboardCalendar } from "@/components/portal/shared/DashboardCalendar";
import { TaskDetailModal } from "@/components/portal/technical/TaskDetailModal";
import { Button } from "@/components/ui/button";

export default function TechnicalDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [personalTasks, setPersonalTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  const [stats, setStats] = useState<any[]>([]);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  
  // Task detail modal states
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Daily confirmation popup states
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmTask, setConfirmTask] = useState<any | null>(null);
  const [confirmStage, setConfirmStage] = useState<'prompt' | 'start'>('prompt');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch projects to calculate overall progress
        const projectsRes = await projectsService.getProjects();
        const projectsList = Array.isArray(projectsRes) ? projectsRes : (projectsRes.results || []);
        setProjects(projectsList);

        // Fetch personal tasks (assigned to me)
        const tasksRes = await projectsService.getTasks({ assignee: user?.id });
        const tasksList = Array.isArray(tasksRes) ? tasksRes : (tasksRes.results || []);
        
        // Fetch all team tasks for global sector stats
        const allTasksRes = await projectsService.getTasks();
        const allTasks = Array.isArray(allTasksRes) ? allTasksRes : (allTasksRes.results || []);

        setPersonalTasks(tasksList.filter((t: any) => t.status !== 'completed' && t.status !== 'resolved').slice(0, 3));

        // Daily Confirmation Check
        const todayStr = new Date().toISOString().split('T')[0];
        const todayTasks = tasksList.filter((task: any) => {
          return (
            task.status !== 'completed' &&
            task.status !== 'resolved' &&
            task.status !== 'closed' &&
            task.start_date === todayStr
          );
        });

        const pendingConfirm = todayTasks.find((task: any) => {
          const startedTime = localStorage.getItem(`avanzo_task_started_time_${task.id}_${todayStr}`);
          return !startedTime;
        });

        if (pendingConfirm) {
          setConfirmTask(pendingConfirm);
          const confirmed = localStorage.getItem(`avanzo_task_confirmed_${pendingConfirm.id}_${todayStr}`) === "true";
          setConfirmStage(confirmed ? 'start' : 'prompt');
          setShowConfirmPopup(true);
        }



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
            sub: "Overall progress",
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
            label: "Tasks on track", 
            value: `${slaVal}%`, 
            sub: slaVal > 90 ? "On track" : "Needs attention", 
            color: slaVal > 90 ? "text-emerald-500" : "text-amber-500", 
            val: slaVal,
            accent: "text-slate-900"
          },
        ]);

      } catch (error) {
        console.error("Dashboard data load failed:", error);
        toast.error("Failed to load dashboard data.");
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
                <p className="text-sm font-black text-slate-400 font-headline">Loading dashboard...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-10 pb-12 font-sans bg-[#fcfcfc] min-h-screen animate-in fade-in duration-700 p-4 md:p-8">
      {/* Page Header */}
      <div className="-mx-4 md:-mx-8 px-4 md:px-8 py-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[#fcfcfc]/80 backdrop-blur-md border-b border-transparent transition-all">
        <div>
          <p className="text-[12px] font-black tracking-[0.2em] text-violet-600 mb-2 leading-none uppercase">
            Dashboard
          </p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Overview</h1>
          <p className="text-slate-500 mt-2 text-xs font-medium">View your projects, tasks, and overall progress.</p>
        </div>
        <div className="flex items-center gap-4 self-start md:self-auto">
          <button
            type="button"
            onClick={() => navigate("/technical/leave")}
            className="px-7 py-3 rounded-xl border border-slate-100 bg-white text-slate-900 text-xs font-black hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            Leave request
          </button>
          <button
            type="button"
            onClick={() => navigate("/technical/tasks")}
            className="flex items-center gap-3 px-7 py-3 rounded-xl bg-violet-600 text-white text-xs font-black hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20 active:scale-95 shadow-md"
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
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{s.label}</p>
              {s.sub && (
                <span className={`text-[11px] font-black ${s.subColor} bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100/50`}>{s.sub}</span>
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
               <div className="mt-8 h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner group-hover:border-slate-200 transition-colors">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${s.val > 90 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'}`} 
                    style={{ width: `${s.val}%` }} 
                  />
               </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Grid: Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-700">
          <div className="flex items-center justify-between px-10 py-8 border-b border-slate-50 bg-slate-50/10">
            <h3 className="font-black text-xl text-slate-900 tracking-tight">Active projects</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {projects.length > 0 ? (
              projects.map((p: any, i: number) => {
                const percentage = p.completion_percentage || p.progress || 0;
                return (
                  <div key={i} onClick={() => navigate(`/technical/projects/${p.id}`)} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 px-6 sm:px-10 py-8 group hover:bg-slate-50/30 transition-all cursor-pointer">

                    <div className="flex-1 min-w-0">
                      <p className="text-[16px] font-black text-slate-900 group-hover:text-violet-700 transition-colors tracking-tight leading-none mb-2.5">{p.title}</p>
                      <p className="text-xs text-slate-400 font-bold leading-none">
                        {p.client_name || "Internal project"} • {p.target_end_date ? `due ${p.target_end_date}` : "No due date"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto sm:justify-end">
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-lg font-black font-headline tabular-nums text-slate-900 leading-none">{percentage}%</span>
                        <div className="w-24 sm:w-32 h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner group-hover:border-violet-100 transition-colors">
                          <div 
                            className="bg-violet-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(124,58,237,0.3)]" 
                            style={{ width: `${percentage}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
                <div className="px-10 py-24 text-center opacity-40">
                   <Shield className="size-12 mx-auto mb-6 text-slate-300" />
                   <p className="text-sm font-black tracking-[0.1em] text-slate-400 uppercase">No active projects</p>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Task List + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Personal Task List */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-700">
          <div className="flex items-center justify-between px-10 py-8 border-b border-slate-50 bg-slate-50/10">
            <h3 className="font-black text-xl text-slate-900 tracking-tight">Assigned tasks</h3>
            <button
              type="button"
              onClick={() => navigate("/technical/tasks")}
              className="text-xs font-black text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-3 bg-violet-50 px-5 py-2.5 rounded-xl border border-violet-100 shadow-sm"
            >
              View all
              <ExternalLink className="size-3.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {personalTasks.length > 0 ? (
              personalTasks.map((t: any, i: number) => {
                const isUrgent = t.priority === 'high' || t.priority === 'urgent' || t.priority === 'critical';
                
                return (
                  <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 px-6 sm:px-10 py-8 group hover:bg-slate-50/30 transition-all cursor-pointer" onClick={() => { setSelectedTask(t); setIsTaskModalOpen(true); }}>
                    <div className="size-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-all group-hover:border-violet-100 group-hover:shadow-xl group-hover:rotate-6">
                      {isUrgent ? "⚠" : t.task_type === 'bug' ? "🐛" : "🔧"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[16px] font-black text-slate-900 group-hover:text-violet-700 transition-colors tracking-tight leading-none mb-2.5">{t.title}</p>
                      <p className="text-xs text-slate-400 font-bold leading-none">
                        {t.project_name || "Project"} • {t.due_date ? `due ${t.due_date}` : "No due date"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                       <div className={`px-5 py-2 rounded-xl text-xs font-black shrink-0 border transition-all shadow-sm ${
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
                <div className="px-10 py-24 text-center opacity-40">
                   <Shield className="size-12 mx-auto mb-6 text-slate-300" />
                   <p className="text-sm font-black tracking-[0.1em] text-slate-400 uppercase">No pending tasks</p>
                </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-4">
          <DashboardCalendar />
        </div>
      </div>

      <TicketModal 
        isOpen={isTicketModalOpen} 
        onClose={() => setIsTicketModalOpen(false)} 
        onSuccess={() => toast.success("Record updated successfully.")}
      />

      <TaskDetailModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        onSuccess={async () => {
          // Refresh list
          const tasksRes = await projectsService.getTasks({ assignee: user?.id });
          const tasksList = Array.isArray(tasksRes) ? tasksRes : (tasksRes.results || []);
          setPersonalTasks(tasksList.filter((t: any) => t.status !== 'completed' && t.status !== 'resolved').slice(0, 3));
        }}
      />

      {/* Daily Work Start Confirmation Popup overlay */}
      {showConfirmPopup && confirmTask && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden relative animate-in slide-in-from-bottom-8 duration-500">
            {/* Ambient background accent glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-200/30 rounded-full blur-3xl -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-200/30 rounded-full blur-3xl -z-10 pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6">
              <span className="p-2.5 rounded-2xl bg-amber-50 text-amber-500 border border-amber-100">
                <Calendar className="size-5" />
              </span>
              <div>
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase leading-none mb-1">Today's Schedule</p>
                <h4 className="text-base font-bold text-slate-900 leading-none">Daily Work Start</h4>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100/80">
                <span className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-600 text-[9px] font-black uppercase tracking-widest border border-violet-100">
                  {confirmTask.priority || "Medium"}
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mt-2.5 mb-1.5 leading-snug">
                  {confirmTask.title}
                </h3>
                <p className="text-xs font-semibold text-slate-400">
                  Part of {confirmTask.project_name || "Avanzo Project"}
                </p>
              </div>

              {confirmStage === 'prompt' ? (
                <p className="text-sm font-bold text-slate-700 leading-relaxed">
                  Today, are you going to do this work?
                </p>
              ) : (
                <p className="text-sm font-bold text-violet-700 leading-relaxed">
                  Ready to begin! Please log your exact starting timestamp below.
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setShowConfirmPopup(false)}
                className="flex-1 rounded-2xl h-13 border-slate-200 bg-white text-xs font-black text-slate-500 hover:bg-slate-50 transition-all"
              >
                Later
              </Button>
              
              {confirmStage === 'prompt' ? (
                <Button
                  onClick={() => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    localStorage.setItem(`avanzo_task_confirmed_${confirmTask.id}_${todayStr}`, "true");
                    setConfirmStage('start');
                    toast.success("Availability confirmed. Now start your work!");
                  }}
                  className="flex-[1.5] rounded-2xl h-13 bg-violet-600 hover:bg-violet-700 text-white text-xs font-black shadow-lg shadow-violet-600/20 transition-all flex items-center justify-center gap-2"
                >
                  OK
                </Button>
              ) : (
                <Button
                  onClick={async () => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const exactTime = new Date().toLocaleTimeString();
                    localStorage.setItem(`avanzo_task_started_time_${confirmTask.id}_${todayStr}`, new Date().toISOString());
                    localStorage.setItem(`avanzo_task_confirmed_${confirmTask.id}_${todayStr}`, "true");

                    // Call backend to update status to "progress" automatically
                    try {
                      await projectsService.updateTaskProgress(confirmTask.id, 0); // Trigger in-progress status
                    } catch (e) {
                      console.error("Failed to automatically update task status:", e);
                    }

                    toast.success(`Work started precisely at ${exactTime}! Time logged.`);
                    setShowConfirmPopup(false);
                    // Refresh dashboard data
                    const tasksRes = await projectsService.getTasks({ assignee: user?.id });
                    const tasksList = Array.isArray(tasksRes) ? tasksRes : (tasksRes.results || []);
                    setPersonalTasks(tasksList.filter((t: any) => t.status !== 'completed' && t.status !== 'resolved').slice(0, 3));
                  }}
                  className="flex-[1.5] rounded-2xl h-13 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  Now I am starting this work
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
