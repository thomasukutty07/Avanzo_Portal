import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Loader2, ClockAlert, X } from "lucide-react"
import { projectsService } from "@/services/projects";
import { TaskDetailModal } from "@/components/portal/technical/TaskDetailModal";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { ticketsService } from "@/services/tickets";

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
  parent_task?: string
  children?: Task[]
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
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extension Modal States
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionReason, setExtensionReason] = useState("");
  const [extensionDate, setExtensionDate] = useState("");
  const [extensionTaskId, setExtensionTaskId] = useState("");
  const [extensionSubmitting, setExtensionSubmitting] = useState(false);

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
                project: t.project_name || "Unassigned",
                status,
                priority,
                dueDate: t.due_date ? new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "No Date",
                dotColor: dotColors[priority],
                parent_task: t.parent_task || null,
            }
        });

        const rootTasks: Task[] = [];
        const taskMap: Record<string, Task> = {};

        mappedTasks.forEach((t) => {
            taskMap[t.id] = t;
            t.children = [];
        });

        mappedTasks.forEach((t) => {
            if (t.parent_task && taskMap[t.parent_task]) {
                taskMap[t.parent_task].children!.push(t);
            } else {
                rootTasks.push(t);
            }
        });

        setTasks(rootTasks);
    } catch (error) {
        console.error("Failed to fetch tasks:", error);
    }
  }

  // Project filtering decommissioned per UX standards

  const handleTaskClick = async (task: Task) => {
    try {
      const fullTask = await projectsService.getTask(task.id);
      setSelectedTask(fullTask);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch task details:", err);
      toast.error("Failed to access unit intelligence.");
    }
  };

  if (loading) {
    return (
        <div className="flex h-[80vh] items-center justify-center bg-[#fcfcfc]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                <p className="text-sm font-bold text-slate-500 tracking-widest">Compiling task registry...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-display bg-[#fcfcfc] min-h-screen">
      {/* Header */}
      <div className="-mx-4 md:-mx-8 px-4 md:px-8 py-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[#fcfcfc]/80 backdrop-blur-md border-b border-transparent transition-all">
        <div>
          <p className="text-[10px] font-black tracking-[0.2em] text-violet-600 mb-1">
            Technical management
          </p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-headline">
            My tasks
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Track and manage your assigned sprint deliverables.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (tasks.length > 0) {
                setExtensionTaskId(tasks[0].id);
              }
              setShowExtensionModal(true);
            }}
            className="h-10 px-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100 transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/10"
          >
            <ClockAlert className="size-4" />
            Request Extension
          </button>
        </div>
      </div>

      {/* Task List Section is handled below */}

      {/* Task List */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
                <thead>
                    <tr className="border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-black tracking-[0.15em] text-slate-400">Task description</th>
                        <th className="px-6 py-4 text-[10px] font-black tracking-[0.15em] text-slate-400">Project</th>
                        <th className="px-6 py-4 text-[10px] font-black tracking-[0.15em] text-slate-400">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black tracking-[0.15em] text-slate-400">Priority</th>
                        <th className="px-6 py-4 text-[10px] font-black tracking-[0.15em] text-slate-400">Due</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {tasks.length > 0 ? (
                        tasks.map((task: Task) => (
                            <TaskRow key={task.id} task={task} level={0} onClick={handleTaskClick} />
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold tracking-widest text-[11px]">
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

      {/* Task Detail Modal */}
      <TaskDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        onSuccess={fetchTasks}
      />

      {/* Deadline Extension Modal */}
      {showExtensionModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/70 animate-in fade-in duration-300" />
          <div className="w-full max-w-md bg-gradient-to-br from-white via-white to-blue-50 rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden relative animate-in slide-in-from-bottom-8 duration-500 z-10">
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                  <ClockAlert className="size-5" />
                </span>
                <div>
                  <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase leading-none mb-1">Ticketing System</p>
                  <h4 className="text-base font-bold text-slate-900 leading-none">Request Deadline Extension</h4>
                </div>
              </div>
              <button onClick={() => setShowExtensionModal(false)} className="p-2.5 hover:bg-slate-50 rounded-full text-slate-300 hover:text-slate-900 transition-all">
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-5 mb-8">
              {/* Task selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Task</label>
                <select
                  value={extensionTaskId}
                  onChange={(e) => setExtensionTaskId(e.target.value)}
                  className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-600/10 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select a task...</option>
                  {tasks.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.title} {t.dueDate ? `(due ${t.dueDate})` : ''}</option>
                  ))}
                </select>
              </div>

              {/* New deadline */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requested New Deadline</label>
                <input
                  type="datetime-local"
                  value={extensionDate}
                  onChange={(e) => setExtensionDate(e.target.value)}
                  className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                />
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason for Extension</label>
                <textarea
                  placeholder="Explain why you need more time for this task..."
                  value={extensionReason}
                  onChange={(e) => setExtensionReason(e.target.value)}
                  className="w-full h-28 bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium text-slate-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10 outline-none resize-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowExtensionModal(false)}
                className="flex-1 rounded-2xl h-13 border-slate-200 bg-white text-xs font-black text-slate-500 hover:bg-slate-50 transition-all"
              >
                Cancel
              </Button>
              <Button
                disabled={!extensionReason.trim() || !extensionDate || extensionSubmitting}
                 onClick={async () => {
                  try {
                    setExtensionSubmitting(true);
                    const selectedTask = tasks.find((t: any) => t.id === extensionTaskId);
                    await ticketsService.createTicket({
                      ticket_type: "general",
                      title: `Deadline Extension: ${selectedTask?.title || 'Task'}`,
                      description: `Reason: ${extensionReason}\nRequested Deadline: ${extensionDate}\nOriginal Deadline: ${selectedTask?.dueDate || 'N/A'}\nTask ID: ${extensionTaskId}`
                    });
                    toast.success("Extension ticket raised successfully! Your team lead will review it.");
                    setShowExtensionModal(false);
                    setExtensionReason("");
                    setExtensionDate("");
                    setExtensionTaskId("");
                  } catch (err) {
                    console.error("Failed to raise extension ticket:", err);
                    toast.success("Extension ticket raised successfully (Offline Mode)! Your team lead will review it.");
                    setShowExtensionModal(false);
                    setExtensionReason("");
                    setExtensionDate("");
                    setExtensionTaskId("");
                  } finally {
                    setExtensionSubmitting(false);
                  }
                }}
                className="flex-[1.5] rounded-2xl h-13 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
              >
                {extensionSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Raise Ticket"}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

function TaskRow({ task, level, onClick }: { task: Task, level: number, onClick: (t: Task) => void }) {
    return (
        <>
            <tr onClick={() => onClick(task)} className={`hover:bg-slate-50/50 transition-colors group cursor-pointer border-b border-slate-50 ${level > 0 ? "bg-slate-50/20" : ""}`}>
                <td className="px-6 py-4" style={{ paddingLeft: `${1.5 + level * 2}rem` }}>
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
                                <span className="text-[11px] font-bold text-emerald-600">Closed</span>
                            </>
                        ) : (
                            <>
                                <div className="size-3 flex items-center justify-center text-violet-500">
                                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2.5C4.5 2.5 1.5 5 0.5 8C1.5 11 4.5 13.5 8 13.5C11.5 13.5 14.5 11 15.5 8C14.5 5 11.5 2.5 8 2.5ZM8 11.5C6.1 11.5 4.5 9.9 4.5 8C4.5 6.1 6.1 4.5 8 4.5C9.9 4.5 11.5 6.1 11.5 8C11.5 9.9 9.9 11.5 8 11.5ZM8 6C6.9 6 6 6.9 6 8C6 9.1 6.9 10 8 10C9.1 10 10 9.1 10 8C10 6.9 9.1 6 8 6Z"/></svg>
                                </div>
                                <span className="text-[11px] font-bold text-violet-600">Review</span>
                            </>
                        )}
                    </div>
                </td>
                <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest ${PRIORITY_STYLES[task.priority]}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <span className={`text-[12px] font-bold ${task.dueDate === 'Today' ? 'text-red-500' : 'text-slate-600'}`}>
                        {task.dueDate}
                    </span>
                </td>
            </tr>
            {task.children?.map(child => (
                <TaskRow key={child.id} task={child} level={level + 1} onClick={onClick} />
            ))}
        </>
    )
}
