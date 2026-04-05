import { useState } from "react"
import { Plus, RotateCcw, ChevronLeft, ChevronRight, Zap } from "lucide-react"

type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
type Status = "In Progress" | "To Do" | "Review"

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

const TASKS: Task[] = [
  {
    id: "1",
    title: "Implement Zero-Trust API Authentication",
    taskId: "SEC-40291",
    project: "Bastion Core",
    status: "In Progress",
    priority: "CRITICAL",
    dueDate: "Today",
    dotColor: "bg-red-500",
  },
  {
    id: "2",
    title: "Database Schema Encryption Update",
    taskId: "SEC-40312",
    project: "Cloud Sync",
    status: "To Do",
    priority: "HIGH",
    dueDate: "Oct 14",
    dotColor: "bg-amber-500",
  },
  {
    id: "3",
    title: "Audit Log Dashboard Refactor",
    taskId: "UI-1102",
    project: "Bastion Core",
    status: "Review",
    priority: "MEDIUM",
    dueDate: "Oct 16",
    dotColor: "bg-violet-500",
  },
  {
    id: "4",
    title: "Update Documentation for SDK v2.1",
    taskId: "DOC-092",
    project: "Documentation",
    status: "To Do",
    priority: "LOW",
    dueDate: "Oct 20",
    dotColor: "bg-slate-400",
  },
]

const PRIORITY_STYLES: Record<Priority, string> = {
  CRITICAL: "border border-red-500 text-red-600",
  HIGH: "border border-amber-500 text-amber-600",
  MEDIUM: "border border-violet-500 text-violet-600",
  LOW: "border border-slate-300 text-slate-500",
}

const PROJECT_STYLES: Record<string, string> = {
  "Bastion Core": "bg-violet-100 text-violet-700",
  "Cloud Sync": "bg-slate-100 text-slate-600",
  "Documentation": "bg-slate-100 text-slate-600",
}

export default function TechnicalTasksPage() {
  const [activePage, setActivePage] = useState(1)

  return (
    <div className="space-y-6 pb-12 font-display bg-[#fcfcfc] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
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
          <button className="flex items-center gap-1.5 bg-violet-700 hover:bg-violet-800 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-colors">
            <Plus className="size-4" />
            New Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Filters */}
        <div className="col-span-1 lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-end gap-6 justify-between">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 w-full">
                <div className="space-y-2 relative">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Project</label>
                    <select className="w-full appearance-none border-b border-slate-200 bg-transparent py-1.5 text-sm font-bold text-slate-700 outline-none focus:border-violet-600 cursor-pointer pr-6">
                        <option>All Projects</option>
                    </select>
                    <div className="absolute right-0 bottom-2 pointer-events-none text-slate-400">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                </div>
                <div className="space-y-2 relative">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Due Date</label>
                    <select className="w-full appearance-none border-b border-slate-200 bg-transparent py-1.5 text-sm font-bold text-slate-700 outline-none focus:border-violet-600 cursor-pointer pr-6">
                        <option>Anytime</option>
                    </select>
                    <div className="absolute right-0 bottom-2 pointer-events-none text-slate-400">
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="2.5" width="11" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M4 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M10 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M1.5 6.5H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                </div>
                <div className="space-y-2 relative">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
                    <select className="w-full appearance-none border-b border-slate-200 bg-transparent py-1.5 text-sm font-bold text-slate-700 outline-none focus:border-violet-600 cursor-pointer pr-6">
                        <option>All Statuses</option>
                    </select>
                    <div className="absolute right-0 bottom-2 pointer-events-none text-slate-400">
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M1 3H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M3 6H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M5 9H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                </div>
            </div>
            <button className="flex items-center gap-1.5 text-violet-600 hover:text-violet-800 text-[11px] font-bold pb-2 pl-4 shrink-0 transition-colors">
                <RotateCcw className="size-3.5" />
                <span>Reset<br/>Filters</span>
            </button>
        </div>

        {/* Completion Velocity */}
        <div className="col-span-1 lg:col-span-4 bg-[#4a148c] text-white rounded-2xl p-6 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300 mb-1">Completion Velocity</p>
            <p className="text-4xl font-black font-headline mb-3">84%</p>
            <p className="text-sm font-medium text-violet-200">
                You have <span className="underline decoration-violet-400 decoration-2 underline-offset-4">3 critical</span> tasks due today.
            </p>
        </div>
      </div>

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
                    {TASKS.map((task) => (
                        <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
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
                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded ${PROJECT_STYLES[task.project]}`}>
                                    {task.project}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5">
                                    {task.status === "In Progress" ? (
                                        <>
                                            <div className="size-3 rounded-full border-[3px] border-amber-500 overflow-hidden"></div>
                                            <span className="text-[11px] font-bold text-amber-500">{task.status}</span>
                                        </>
                                    ) : task.status === "To Do" ? (
                                        <>
                                            <div className="size-3 rounded-full border-2 border-slate-300"></div>
                                            <span className="text-[11px] font-bold text-slate-500">{task.status}</span>
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
                    ))}
                </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 mt-auto bg-white rounded-b-2xl">
              <span className="text-[11px] font-bold text-slate-500">
                  Showing <span className="text-slate-900">12</span> of <span className="text-slate-900">48</span> tasks
              </span>
              <div className="flex items-center gap-1">
                  <button className="p-1 text-slate-400 hover:text-slate-700">
                      <ChevronLeft className="size-4" />
                  </button>
                  {[1, 2, 3].map(page => (
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

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommendation */}
        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 flex gap-4 items-start">
            <div className="bg-white size-14 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                <Zap className="size-6 text-violet-700" fill="currentColor" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Daily Recommendation</h3>
                <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                    System analysis suggests starting with <span className="text-violet-700 font-bold">SEC-40291</span> to clear the highest security risk bottleneck for the next release.
                </p>
            </div>
        </div>

        {/* Collaboration */}
        <div className="bg-violet-100 border border-violet-200 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden">
            <h3 className="text-sm font-bold text-violet-900 mb-1 z-10">Team Collaboration</h3>
            <p className="text-xs font-semibold text-violet-700 max-w-[200px] z-10">
                3 teammates are working on tasks related to yours.
            </p>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center">
                <div className="size-8 rounded-full border-2 border-violet-100 relative -mr-3 z-[3]">
                    <img src="https://i.pravatar.cc/150?u=1" alt="Avatar" className="size-full rounded-full object-cover" />
                </div>
                <div className="size-8 rounded-full border-2 border-violet-100 relative -mr-3 z-[2]">
                    <img src="https://i.pravatar.cc/150?u=2" alt="Avatar" className="size-full rounded-full object-cover" />
                </div>
                <div className="size-8 rounded-full border-2 border-violet-100 bg-violet-700 text-white flex items-center justify-center text-[10px] font-bold relative z-[1]">
                    +6
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
