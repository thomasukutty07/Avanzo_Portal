import React, { useState } from "react";
import { 
  X, 
  Calendar, 
  Target,
  Loader2,
  Clock,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { projectsService } from "@/services/projects";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any | null;
  onSuccess: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  task,
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number>(task?.completion_pct || 0);

  React.useEffect(() => {
    if (task) {
      setProgress(task.completion_pct || 0);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleUpdateProgress = async () => {
    try {
      setLoading(true);
      await projectsService.updateTaskProgress(task.id, progress);
      toast.success("Progress saved successfully");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save progress.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      setLoading(true);
      await projectsService.updateTaskProgress(task.id, 100);
      toast.success("Task completed!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8 duration-500">
        
        {/* Simple & Elegant Header */}
        <div className="px-10 py-10 flex items-start justify-between">
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-violet-50 text-violet-600 text-[10px] font-black uppercase tracking-widest border border-violet-100">
                  {task.priority || "Medium"}
                </span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  TK-{task.id.substring(0, 5).toUpperCase()}
                </span>
             </div>
             <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight font-headline">
               {task.title}
             </h3>
             <div className="flex items-center gap-3">
                <div className="size-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                   <Target className="size-3" />
                </div>
                <span className="text-xs font-bold text-slate-500">
                  Part of <span className="text-slate-900">{task.project_name || "Avanzo Project"}</span>
                </span>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-slate-50 rounded-full text-slate-300 hover:text-slate-900 transition-all active:scale-95"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-12">
          
          {/* Flat Grid Details */}
          <div className="flex flex-wrap gap-8">
             <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                   <Calendar className="size-4" />
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Deadline</p>
                   <p className="text-xs font-bold text-slate-700">{task.due_date || "---"}</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                   <Clock className="size-4" />
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Complexity</p>
                   <p className="text-xs font-bold text-slate-700">{task.complexity || 1} Points</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-300">
                   <Sparkles className="size-4" />
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Status</p>
                   <p className="text-xs font-bold text-slate-700 capitalize">{task.status?.replace('_', ' ') || "Open"}</p>
                </div>
             </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
             <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Description
             </p>
             <div className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50">
                {task.description || "No description provided for this task."}
             </div>
          </div>

          {/* Minimalist Progress */}
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900 tracking-tight">Work Progress</p>
                <div className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-black tracking-tighter tabular-nums">
                   {progress}% DONE
                </div>
             </div>
             
             <div className="relative group px-1">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  value={progress}
                  onChange={(e) => setProgress(parseInt(e.target.value))}
                  disabled={task.status === 'resolved' || task.status === 'closed'}
                  className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-violet-600 transition-all hover:h-2"
                />
                <div className="flex justify-between mt-3 px-1">
                   {[0, 25, 50, 75, 100].map(v => (
                     <span key={v} className={`text-[9px] font-bold ${progress >= v ? 'text-violet-600' : 'text-slate-300'}`}>{v}%</span>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-xs font-bold text-slate-400 hover:text-slate-900 transition-all"
          >
            Dismiss
          </button>
          
          {task.status !== 'resolved' && task.status !== 'closed' && (
            <>
              <Button
                variant="outline"
                onClick={handleUpdateProgress}
                disabled={loading}
                className="flex-1 h-14 rounded-2xl border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                {loading ? <Loader2 className="size-4 animate-spin mx-auto" /> : "Save Changes"}
              </Button>
              
              <Button
                onClick={handleMarkComplete}
                disabled={loading}
                className="flex-[1.5] h-14 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition-all flex items-center justify-center gap-2 group shadow-xl shadow-slate-900/10"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : (
                  <>
                    <span>Complete Task</span>
                    <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
