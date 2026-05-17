import React, { useState } from "react";
import { 
  X, 
  Calendar, 
  Target,
  Loader2,
  Clock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  FileUp,
  MessageSquareWarning,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { projectsService } from "@/services/projects";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  
  // Execution Workflow States
  const [workConfirmed, setWorkConfirmed] = useState(false);
  const [workStarted, setWorkStarted] = useState(false);
  const [showStruggleModal, setShowStruggleModal] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [ticketReason, setTicketReason] = useState("");
  const [ticketDate, setTicketDate] = useState("");

  const [phases, setPhases] = useState([
    { id: 1, name: "Initial Research & Scope", completed: true },
    { id: 2, name: "Drafting / Development", completed: false },
    { id: 3, name: "Internal Review", completed: false }
  ]);
  const [docUploaded, setDocUploaded] = useState(false);

  React.useEffect(() => {
    if (task) {
      setProgress(task.completion_pct || 0);
      if (task.completion_pct === 100) {
        setPhases(phases.map(p => ({ ...p, completed: true })));
      }
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
    } catch (error: any) {
      const msg = error?.response?.data?.detail || "Failed to save progress.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      setLoading(true);
      await projectsService.updateTaskProgress(task.id, 100);
      toast.success("Task marked as complete!");
      onSuccess();
      onClose();
    } catch (error: any) {
      const msg = error?.response?.data?.detail || "Failed to update status.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTask = async () => {
    try {
      setLoading(true);
      await api.patch(`/api/projects/tasks/${task.id}/`, { status: "progress" });
      toast.success("Task accepted.");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error("Failed to accept task.");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectTask = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejecting the task.");
      return;
    }
    try {
      setLoading(true);
      await api.patch(`/api/projects/tasks/${task.id}/`, { status: "rejected", reject_reason: rejectReason });
      toast.success("Task rejected.");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error("Failed to reject task.");
    } finally {
      setLoading(false);
      setShowRejectModal(false);
      setRejectReason("");
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
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Start Date</p>
                   <p className="text-xs font-bold text-slate-700">{task.start_date ? new Date(task.start_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : "---"}</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                   <Calendar className="size-4" />
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Deadline</p>
                   <p className="text-xs font-bold text-slate-700">{task.due_date ? new Date(task.due_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : "---"}</p>
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
                   <p className={`text-xs font-bold capitalize ${
                      task.status === 'resolved' ? 'text-emerald-600' :
                      task.status === 'closed' ? 'text-slate-400' :
                      task.status === 'progress' ? 'text-amber-600' :
                      'text-slate-700'
                    }`}>
                      {task.status === 'progress' ? 'In Progress' : task.status?.replace('_', ' ') || 'Open'}
                    </p>
                    {task.status === 'resolved' && (
                      <p className="text-[9px] text-slate-400 font-medium mt-0.5">Drag to reopen</p>
                    )}
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

           {/* Phase Tracking & Progress */}
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <p className="text-xs font-bold text-slate-900 tracking-tight">Work Progress & Phases</p>
                 <div className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-black tracking-tighter tabular-nums">
                    {progress}% DONE
                 </div>
              </div>
              
              <div className="space-y-3">
                {phases.map(phase => (
                  <div key={phase.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-violet-100 transition-all">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => {
                          const newPhases = phases.map(p => p.id === phase.id ? { ...p, completed: !p.completed } : p);
                          setPhases(newPhases);
                          const completedCount = newPhases.filter(p => p.completed).length;
                          setProgress(Math.round((completedCount / newPhases.length) * 100));
                        }}
                        className="text-slate-400 hover:text-violet-600 transition-colors"
                      >
                        {phase.completed ? <CheckCircle2 className="size-5 text-emerald-500" /> : <Circle className="size-5" />}
                      </button>
                      <span className={`text-sm font-bold ${phase.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {phase.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {progress === 100 && (
                <div className={`mt-6 p-6 rounded-2xl border-2 border-dashed ${docUploaded ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'} flex flex-col items-center justify-center gap-4 transition-all`}>
                  <div className={`p-3 rounded-full ${docUploaded ? 'bg-emerald-100 text-emerald-600' : 'bg-white shadow-sm text-slate-400'}`}>
                    <FileUp className="size-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900">{docUploaded ? "Documentation Uploaded" : "Documentation Phase"}</p>
                    <p className="text-xs text-slate-500 mt-1">{docUploaded ? "Task is ready for final closure." : "You must upload final documentation to close this task."}</p>
                  </div>
                  {!docUploaded && (
                    <Button onClick={() => setDocUploaded(true)} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold px-6">
                      Upload Document
                    </Button>
                  )}
                </div>
              )}
           </div>

           {/* Execution Workflow */}
           {task.status === "progress" && (
             <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
               <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                 <Target className="size-4 text-violet-600" />
                 Execution & Actions
               </h4>
               
               {!workConfirmed ? (
                 <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                   <div>
                     <p className="text-sm font-bold text-slate-800">Are you going to do this work today?</p>
                     <p className="text-xs text-slate-500 mt-1">Please confirm your availability for today.</p>
                   </div>
                   <Button onClick={() => setWorkConfirmed(true)} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-sm">
                     Confirm OK
                   </Button>
                 </div>
               ) : !workStarted ? (
                 <div className="bg-violet-50 p-5 rounded-xl shadow-sm border border-violet-100 flex items-center justify-between">
                   <div>
                     <p className="text-sm font-bold text-violet-900">Work Confirmed.</p>
                     <p className="text-xs text-violet-600 mt-1">Log your exact start time now.</p>
                   </div>
                   <Button onClick={() => { setWorkStarted(true); toast.success("Work started precisely at " + new Date().toLocaleTimeString()); }} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-sm">
                     Now I am starting this work
                   </Button>
                 </div>
               ) : (
                 <div className="grid grid-cols-2 gap-4">
                   <Button variant="outline" onClick={() => setShowStruggleModal(true)} className="h-auto py-4 flex flex-col items-center gap-2 rounded-xl border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700">
                     <MessageSquareWarning className="size-5" />
                     <span className="text-xs font-bold">Report Struggle</span>
                   </Button>
                   <Button variant="outline" onClick={() => setShowExtensionModal(true)} className="h-auto py-4 flex flex-col items-center gap-2 rounded-xl border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700">
                     <AlertCircle className="size-5" />
                     <span className="text-xs font-bold">Request Extension</span>
                   </Button>
                 </div>
               )}
             </div>
           )}

           {task.status === "rejected" && task.reject_reason && (
              <div className="space-y-4">
                 <p className="text-sm font-semibold text-red-400 uppercase tracking-widest flex items-center gap-2">
                    Rejection Reason
                 </p>
                 <div className="text-sm font-medium text-red-600 leading-relaxed bg-red-50 p-6 rounded-2xl border border-red-100">
                    {task.reject_reason}
                 </div>
              </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-xs font-bold text-slate-400 hover:text-slate-900 transition-all"
          >
            Dismiss
          </button>
          
          {(task.status === "open" || task.status === "assigned" || task.status === "pending") ? (
            <>
              <Button
                variant="outline"
                onClick={() => setShowRejectModal(true)}
                disabled={loading}
                className="flex-[1.5] h-14 rounded-2xl border-red-200 bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-all"
              >
                Reject Task
              </Button>
              <Button
                onClick={handleAcceptTask}
                disabled={loading}
                className="flex-[1.5] h-14 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/20"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : "Accept Task"}
              </Button>
            </>
          ) : (
            <>
                <Button
                  variant="outline"
                  onClick={handleUpdateProgress}
                  disabled={loading || task.status === "rejected"}
                  className="flex-1 h-14 rounded-2xl border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                >
                  {loading ? <Loader2 className="size-4 animate-spin mx-auto" /> : "Save Changes"}
                </Button>
                
                <Button
                  onClick={handleMarkComplete}
                  disabled={loading || task.status === "rejected" || (progress === 100 && !docUploaded)}
                  className="flex-[1.5] h-14 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition-all flex items-center justify-center gap-2 group shadow-xl shadow-slate-900/10"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : (
                    <>
                      <span>{progress === 100 && docUploaded ? "Close Task" : "Complete Task"}</span>
                      <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </>
          )}
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Reject Task</h3>
            <p className="text-xs text-slate-500 mb-6">Please provide a reason for rejecting this assignment.</p>
            
            <div className="space-y-4 mb-8">
              <Label className="text-xs font-bold text-slate-700">Rejection Reason</Label>
              <Textarea 
                placeholder="Briefly explain why this task cannot be accepted..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full h-32 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm resize-none focus:bg-white transition-all"
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowRejectModal(false)}
                className="flex-1 rounded-xl h-11"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRejectTask}
                disabled={loading || !rejectReason.trim()}
                className="flex-1 rounded-xl h-11 bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? <Loader2 className="size-4 animate-spin mx-auto" /> : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showStruggleModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Report a Struggle</h3>
            <p className="text-xs text-slate-500 mb-6">Encountered an issue? Describe it below and optionally upload a document or screenshot.</p>
            
            <div className="space-y-4 mb-8">
              <Label className="text-xs font-bold text-slate-700">Issue Description</Label>
              <Textarea 
                placeholder="What seems to be the problem..."
                className="w-full h-24 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm resize-none focus:bg-white transition-all"
              />
              <div className="pt-2">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2 border-dashed border-2 border-slate-200 text-slate-400 hover:text-violet-600 hover:border-violet-300 hover:bg-violet-50 h-16 rounded-xl">
                  <FileUp className="size-5" />
                  <span className="text-xs font-bold">Upload Supporting Document</span>
                </Button>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowStruggleModal(false)} className="flex-1 rounded-xl h-11">
                Cancel
              </Button>
              <Button onClick={() => { setShowStruggleModal(false); toast.success("Struggle report submitted to Admin."); }} className="flex-[1.5] rounded-xl h-11 bg-amber-500 hover:bg-amber-600 text-white">
                Submit Report
              </Button>
            </div>
          </div>
        </div>
      )}

      {showExtensionModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Request Deadline Extension</h3>
            <p className="text-xs text-slate-500 mb-6">Submit a ticket to request more time for this task.</p>
            
            <div className="space-y-4 mb-8">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Requested Deadline</Label>
                <input 
                  type="datetime-local"
                  value={ticketDate}
                  onChange={(e) => setTicketDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:bg-white transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Reason for Extension</Label>
                <Textarea 
                  placeholder="Explain why you need more time..."
                  value={ticketReason}
                  onChange={e => setTicketReason(e.target.value)}
                  className="w-full h-24 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm resize-none focus:bg-white transition-all"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowExtensionModal(false)} className="flex-1 rounded-xl h-11">
                Cancel
              </Button>
              <Button 
                onClick={() => { setShowExtensionModal(false); toast.success("Extension ticket raised."); setTicketReason(""); setTicketDate(""); }} 
                disabled={!ticketReason.trim() || !ticketDate}
                className="flex-[1.5] rounded-xl h-11 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Raise Ticket
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
