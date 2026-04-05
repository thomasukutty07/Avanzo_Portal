import { TeamLeadChrome } from "@/components/portal/teamlead/TeamLeadChrome"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { NewTaskModal } from "@/components/portal/teamlead/NewTaskModal"
import { projectsService } from "@/services/projects"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { 
  Plus, 
  MoreHorizontal, 
  MessageSquare, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertTriangle, 
  Timer,
  Zap,
  Loader2,
  Calendar
} from "lucide-react"

export default function TaskManagement() {
  useDesignPortalLightTheme()
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const data = await projectsService.getTasks()
      setTasks(Array.isArray(data) ? data : (data.results || []))
    } catch (error) {
      toast.error("Workflow synchronization failed.")
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter(t => t.status === status)
  }

  const COLUMNS = [
    { id: 'todo', title: 'Tactical Backlog', color: 'bg-slate-300', count: getTasksByStatus('todo').length },
    { id: 'in_progress', title: 'Active Deployment', color: 'bg-blue-500', count: getTasksByStatus('in_progress').length },
    { id: 'review', title: 'Mission Audit', color: 'bg-amber-500', count: getTasksByStatus('review').length },
    { id: 'completed', title: 'Secured Goals', color: 'bg-emerald-500', count: getTasksByStatus('completed').length },
  ]

  return (
    <TeamLeadChrome>
      <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 font-headline leading-none uppercase">Unit Workflow</h2>
            <p className="text-sm font-bold text-slate-400 mt-3 uppercase tracking-widest leading-none">Task synchronization and tactical deployment active</p>
          </div>
          <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
            <button className="px-5 py-2.5 text-[11px] font-black bg-white text-violet-600 rounded-xl shadow-lg shadow-violet-600/5 border border-violet-100 transition-all uppercase tracking-widest">Kanban Board</button>
            <button onClick={() => toast.info("List synchronization locked.")} className="px-5 py-2.5 text-[11px] font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest">Dossier View</button>
            <button onClick={() => toast.info("Timeline telemetry unavailable.")} className="px-5 py-2.5 text-[11px] font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest">Timeline</button>
          </div>
        </header>

        {loading ? (
             <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="size-10 animate-spin text-violet-600 mb-6" />
                <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">Synchronizing Tactical Workflow...</p>
             </div>
        ) : (
          <div className="flex gap-10 pb-12 overflow-x-auto min-h-[calc(100vh-320px)] scrollbar-hide">
            {COLUMNS.map((col) => (
              <div key={col.id} className="w-[340px] flex flex-col gap-6 shrink-0">
                <div className="flex items-center justify-between px-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                  <div className="flex items-center gap-3">
                    <span className={`size-3 rounded-full ${col.color} shadow-[0_0_8px_rgba(0,0,0,0.1)]`}></span>
                    <h3 className="font-black text-slate-900 font-headline uppercase tracking-widest text-xs">{col.title}</h3>
                    <span className="bg-white border border-slate-100 px-3 py-1 rounded-lg text-[10px] font-black text-slate-400 tracking-widest tabular-nums shadow-sm">{col.count}</span>
                  </div>
                  <button onClick={() => toast.info(`Accessing ${col.title} sector menu...`)} className="text-slate-300 hover:text-violet-600 transition-colors bg-white p-1.5 rounded-lg border border-slate-100 shadow-sm">
                    <MoreHorizontal className="size-4" />
                  </button>
                </div>

                <div className="space-y-6 flex-1">
                  {getTasksByStatus(col.id).map((task, idx) => (
                    <div key={idx} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden" onClick={() => toast.info(`Syncing task metadata: ${task.title}`)}>
                      <div className="flex justify-between items-start mb-6">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${
                          task.priority === 'urgent' || task.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100/50 shadow-sm shadow-red-500/10' :
                          'bg-violet-50 text-violet-600 border-violet-100/50'
                        }`}>
                          {task.task_type || 'Directive'}
                        </span>
                        {task.status === 'completed' && <CheckCircle2 className="size-4 text-emerald-500" />}
                        {(task.priority === 'urgent' || task.priority === 'high') && <AlertTriangle className="size-4 text-red-600 animate-pulse" />}
                      </div>
                      
                      <h4 className="text-[15px] font-black text-slate-900 mb-6 leading-tight group-hover:text-violet-600 transition-colors uppercase tracking-tight">{task.title}</h4>
                      
                      {task.status === 'in_progress' && (
                         <div className="flex items-center gap-4 my-8">
                            <div className="flex-1 bg-slate-50 rounded-full h-2.5 overflow-hidden border border-slate-100 shadow-inner group-hover:border-violet-100 transition-colors">
                              <div className="bg-amber-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(245,158,11,0.3)]" style={{ width: '65%' }}></div>
                            </div>
                            <span className="text-[11px] font-black text-slate-700 tabular-nums">65%</span>
                         </div>
                      )}

                      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                        <div className="flex -space-x-3">
                           <div className="size-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm group-hover:rotate-12 transition-all">
                             {task.assigned_to_name?.split(' ').map((n:any) => n[0]).join('') || 'U'}
                           </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                          <Timer className="size-3.5 mr-1" />
                          <span className="text-[10px] font-black uppercase tracking-widest tabular-nums">{task.due_date || 'TBD'}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={() => setIsNewTaskOpen(true)}
                    className="w-full py-8 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/10 text-slate-300 hover:text-violet-600 hover:border-violet-200 hover:bg-violet-50 transition-all text-[11px] font-black flex items-center flex-col justify-center gap-4 uppercase tracking-[0.2em] active:scale-95 group shadow-sm hover:shadow-xl"
                  >
                    <div className="size-10 rounded-2xl bg-white flex items-center justify-center border border-slate-100 shadow-sm group-hover:border-violet-200 group-hover:rotate-90 transition-all">
                      <Plus className="size-5" />
                    </div>
                    New Directive
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <NewTaskModal open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen} />
    </TeamLeadChrome>
  )
}
