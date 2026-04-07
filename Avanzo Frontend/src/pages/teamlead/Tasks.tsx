import TeamLeadChrome from "@/components/portal/teamlead/TeamLeadChrome";
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme";
import { NewTaskModal, ReviewTaskModal } from "@/components/portal/teamlead/TeamLeadActionForms";
import { projectsService } from "@/services/projects";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  MoreHorizontal,
  Zap,
  Loader2
} from "lucide-react";

export default function LeadTasksPage() {
  useDesignPortalLightTheme();
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [reviewTask, setReviewTask] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await projectsService.getTasks();
      setTasks(Array.isArray(data) ? data : (data.results || []));
    } catch (error) {
      toast.error("Telemetry synchronization failed.");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.project_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <TeamLeadChrome>
      <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <header>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 font-headline leading-none">Operational Roadmap</h2>
            <p className="text-xs font-bold text-slate-400 mt-2 font-headline leading-none opacity-60">Manage sector objectives and tactical unit deployments</p>
          </header>
          <button 
            onClick={() => setIsNewTaskOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-black rounded-xl hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-600/20 transition-all text-[11px] uppercase tracking-widest active:scale-95 shadow-md shadow-violet-600/10"
          >
            <Plus className="size-4 stroke-[3px]" />
            Assign Task
          </button>
        </div>

        {/* Filters/Search Row */}
        <div className="flex flex-col md:flex-row gap-5">
           <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-4.5 text-slate-300 group-focus-within:text-violet-600 transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Synchronize with mission objectives..." 
                className="w-full bg-white border border-slate-100 rounded-2xl pl-16 pr-6 py-4 text-[13px] font-bold text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:border-violet-200 transition-all placeholder:text-slate-200 outline-none shadow-sm"
              />
           </div>
           <button className="flex items-center gap-2.5 px-6 py-4 bg-white border border-slate-100 text-slate-900 font-black rounded-2xl hover:bg-slate-50 transition-all text-[11px] uppercase tracking-widest shadow-sm active:scale-95">
              <Filter className="size-4 text-violet-600" />
              Advanced Matrix
           </button>
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-700">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.15em]">
                <tr>
                  <th className="px-8 py-5">Mission Directive</th>
                  <th className="px-8 py-5">Intel Sector</th>
                  <th className="px-8 py-5">Tactical Priority</th>
                  <th className="px-8 py-5">Synchronization</th>
                  <th className="px-8 py-5 text-right">Operational Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                   <tr>
                     <td colSpan={5} className="px-8 py-32 text-center text-[11px] font-black uppercase tracking-widest text-slate-300">
                        <Loader2 className="size-10 animate-spin text-violet-600 mx-auto mb-6" />
                        Synchronizing Roadmap...
                     </td>
                   </tr>
                ) : filteredTasks.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="px-8 py-24 text-center opacity-30 text-[11px] font-black uppercase tracking-widest text-slate-300">
                        <Zap className="size-12 mx-auto mb-6" />
                        No Strategic Directives Active
                     </td>
                   </tr>
                ) : filteredTasks.map((task, i) => (
                  <tr key={i} className="group hover:bg-slate-50/30 transition-all cursor-pointer" onClick={() => task.status === 'review' ? setReviewTask(task) : toast.info(`Syncing unit metadata: ${task.title}`)}>
                    <td className="px-8 py-7">
                       <div className="flex flex-col gap-1 min-w-[240px]">
                         <span className="font-black text-sm text-slate-900 group-hover:text-violet-600 transition-colors uppercase tracking-tight leading-none">{task.title}</span>
                         <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1 opacity-80 leading-none">{task.project_name || 'Individual Directive'}</span>
                       </div>
                    </td>
                    <td className="px-8 py-7">
                       <span className="inline-flex px-3 py-1 bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest rounded-lg border border-slate-100 shadow-sm">
                         {task.task_type || 'General'}
                       </span>
                    </td>
                    <td className="px-8 py-7">
                      <span className={`px-4 py-2 text-[9px] font-black rounded-xl uppercase tracking-widest border transition-all ${
                        task.priority === 'urgent' || task.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100 shadow-sm shadow-red-500/5' :
                        task.priority === 'tactical' || task.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm' :
                        'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm'
                      }`}>
                        {task.priority || 'Normal'}
                      </span>
                    </td>
                    <td className="px-8 py-7 text-[10px] font-black text-slate-400 tabular-nums uppercase tracking-widest opacity-80">
                       <div className="flex items-center gap-2">
                         <Calendar className="size-3.5" />
                         {task.due_date || 'tbd'}
                       </div>
                    </td>
                    <td className="px-8 py-7 text-right">
                       <div className="flex items-center justify-end gap-3">
                          <div className={`inline-flex items-center gap-2.5 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm group-hover:border-violet-100 transition-colors`}>
                            <span className={`size-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)] ${
                              task.status === 'closed' ? 'bg-emerald-500' :
                              task.status === 'progress' ? 'bg-blue-500 animate-pulse' :
                              task.status === 'review' ? 'bg-amber-500 animate-pulse' :
                              task.status === 'rework' ? 'bg-red-500' :
                              'bg-slate-300'
                            }`}></span>
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{task.status?.replace('_', ' ') || 'Registered'}</span>
                          </div>
                          <button className="p-2.5 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all shadow-sm">
                             <MoreHorizontal className="size-5" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <NewTaskModal 
        open={isNewTaskOpen} 
        onOpenChange={setIsNewTaskOpen} 
        onSuccess={fetchTasks}
      />
      {reviewTask && (
        <ReviewTaskModal 
          open={!!reviewTask} 
          onOpenChange={(open) => !open && setReviewTask(null)} 
          task={reviewTask}
          onSuccess={fetchTasks}
        />
      )}
    </TeamLeadChrome>
  );
}
