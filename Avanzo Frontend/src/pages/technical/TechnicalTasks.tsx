import { useState, useEffect } from "react"
import { Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { projectsService } from "@/services/projects";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
type Status = "In Progress" | "To Do" | "Review" | "Rework" | "Closed"

type Task = {
  id: string
  title: string
  taskId: string
  project: string
  status: Status
  priority: Priority
  dueDate: string
  dotColor: string
}

const PRIORITY_STYLES: Record<string, string> = {
  CRITICAL: "border border-red-500 text-red-600",
  HIGH: "border border-amber-500 text-amber-600",
  MEDIUM: "border border-violet-500 text-violet-600",
  LOW: "border border-slate-300 text-slate-500",
}

export default function TechnicalTasksPage() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState(1)
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const initData = async () => {
        try {
            // Primary task registry synchronization
            await fetchTasks();
        } catch (error) {
            console.error("Failed to init tasks page:", error);
            toast.error("Failed to synchronize task workspace.");
        } finally {
            setLoading(false);
        }
    }
    initData();
  }, []);

  const fetchTasks = async (projectId?: string) => {
    try {
        const params: any = { assignee: user?.id };
        if (projectId && projectId !== "All Projects") {
            params.project = projectId;
        }
        
        const res = await projectsService.getTasks(params);
        const data = Array.isArray(res) ? res : (res.results || []);
        setTotalCount(Array.isArray(res) ? res.length : (res.count || 0));

        const mappedTasks: Task[] = data.map((t: any) => {
            let status: Status = "To Do";
            if (t.status === "progress") status = "In Progress";
            if (t.status === "review") status = "Review";
            if (t.status === "rework") status = "Rework";
            if (t.status === "closed") status = "Closed";

            let priority: Priority = "MEDIUM";
            if (t.priority === "critical") priority = "CRITICAL";
            if (t.priority === "high") priority = "HIGH";
            if (t.priority === "low") priority = "LOW";

            const dotColors: Record<string, string> = {
                CRITICAL: "bg-red-500",
                HIGH: "bg-amber-500",
                MEDIUM: "bg-violet-500",
                LOW: "bg-slate-400",
            };

            return {
                id: t.id,
                title: t.title,
                taskId: `TK-${t.id.substring(0, 5).toUpperCase()}`,
                project: t.project_title || "Unassigned",
                status,
                priority,
                dueDate: t.due_date ? new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "No Date",
                dotColor: dotColors[priority],
            }
        });

        setTasks(mappedTasks);
    } catch (error) {
        console.error("Failed to fetch tasks:", error);
    }
  }

  // Project filtering decommissioned per UX standards

  const handleTaskClick = async (task: Task) => {
    if (task.status === "Closed" || task.status === "Review") {
        toast.info("Task is currently waiting for review or is closed.");
        return;
    }
    
    try {
        if (task.status === "To Do") {
            await projectsService.updateTaskProgress(task.id, 10);
            toast.success("Task started (In Progress).");
        } else if (task.status === "In Progress" || task.status === "Rework") {
            await projectsService.updateTaskProgress(task.id, 100);
            toast.success("Task marked as ready for review.");
        }
        fetchTasks();
    } catch (err) {
        toast.error("Failed to update task.");
    }
  };

  if (loading) {
    return (
        <div className="flex h-[80vh] items-center justify-center bg-[#fcfcfc]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Compiling Task Registry...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-display bg-[#fcfcfc] min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[#fcfcfc]/80 backdrop-blur-md border-b border-transparent transition-all">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 mb-1">
            TECHNICAL MANAGEMENT
          </p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-headline">
            My Tasks
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Track and manage your assigned sprint deliverables.</p>
        </div>
        <div className="flex items-center gap-4">
        </div>
      </div>

      {/* Task List Section is handled below */}

      {/* Task List */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
                <thead>
                    <tr className="border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Task Description</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Project</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Priority</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Due</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {tasks.length > 0 ? (
                        tasks.map((task: Task) => (
                            <tr key={task.id} onClick={() => handleTaskClick(task)} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                <td className="px-6 py-4">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1.5 shrink-0">
                                            <div className={`size-1.5 rounded-full ${task.dotColor}`} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-[13px]">{task.title}</p>
                                            <p className="text-[11px] font-semibold text-slate-400 mt-1">⤑ {task.taskId}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded bg-violet-100 text-violet-700`}>
                                        {task.project}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                        {task.status === "In Progress" || task.status === "Rework" ? (
                                            <>
                                                <div className={`size-3 rounded-full border-[3px] ${task.status === 'Rework' ? 'border-red-500' : 'border-amber-500'} overflow-hidden`}></div>
                                                <span className={`text-[11px] font-bold ${task.status === 'Rework' ? 'text-red-500' : 'text-amber-500'}`}>{task.status}</span>
                                            </>
                                        ) : task.status === "To Do" ? (
                                            <>
                                                <div className="size-3 rounded-full border-2 border-slate-300"></div>
                                                <span className="text-[11px] font-bold text-slate-500">{task.status}</span>
                                            </>
                                        ) : task.status === "Closed" ? (
                                            <>
                                                <div className="size-3 rounded-full bg-emerald-500"></div>
                                                <span className="text-[11px] font-bold text-emerald-600">{task.status}</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="size-3 flex items-center justify-center text-violet-500">
                                                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2.5C4.5 2.5 1.5 5 0.5 8C1.5 11 4.5 13.5 8 13.5C11.5 13.5 14.5 11 15.5 8C14.5 5 11.5 2.5 8 2.5ZM8 11.5C6.1 11.5 4.5 9.9 4.5 8C4.5 6.1 6.1 4.5 8 4.5C9.9 4.5 11.5 6.1 11.5 8C11.5 9.9 9.9 11.5 8 11.5ZM8 6C6.9 6 6 6.9 6 8C6 9.1 6.9 10 8 10C9.1 10 10 9.1 10 8C10 6.9 9.1 6 8 6Z"/></svg>
                                                </div>
                                                <span className="text-[11px] font-bold text-violet-600">{task.status}</span>
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${PRIORITY_STYLES[task.priority]}`}>
                                        {task.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[12px] font-bold ${task.dueDate === 'Today' ? 'text-red-500' : 'text-slate-600'}`}>
                                        {task.dueDate}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[11px]">
                                No tasks found in registry.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 mt-auto bg-white rounded-b-2xl">
              <span className="text-[11px] font-bold text-slate-500">
                  Showing <span className="text-slate-900">{tasks.length}</span> of <span className="text-slate-900">{totalCount}</span> tasks
              </span>
              <div className="flex items-center gap-1">
                  <button className="p-1 text-slate-400 hover:text-slate-700">
                      <ChevronLeft className="size-4" />
                  </button>
                  {[1].map(page => (
                      <button 
                        key={page}
                        onClick={() => setActivePage(page)}
                        className={`size-6 rounded text-[11px] font-bold flex items-center justify-center ${activePage === page ? 'bg-violet-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                          {page}
                      </button>
                  ))}
                  <button className="p-1 text-slate-400 hover:text-slate-700">
                      <ChevronRight className="size-4" />
                  </button>
              </div>
          </div>
      </div>

      {/* Cards Removed */}
    </div>
  )
}
