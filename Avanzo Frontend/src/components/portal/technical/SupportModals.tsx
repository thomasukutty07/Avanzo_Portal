import React, { useState } from "react";
import { 
  X, 
  AlertCircle, 
  Settings, 
  Code, 
  ShieldAlert,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { ticketsService } from "@/services/tickets";
import { toast } from "sonner";

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: "capacity" | "compliance" | "general" | "tech";
  onSuccess?: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultType = "tech",
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ticket_type: defaultType,
    priority: "medium"
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error("Please provide both a title and description.");
      return;
    }

    try {
      setLoading(true);
      await ticketsService.createTicket(formData);
      setSuccess(true);
      toast.success("Ticket registered in central registry.");
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
        onClose();
        setFormData({ title: "", description: "", ticket_type: defaultType, priority: "medium" });
      }, 2000);
    } catch (error) {
      console.error("Ticket creation failed:", error);
      toast.error("Failed to register ticket. Internal system error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10 font-headline">
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">System Report</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Operational Lifecycle Management</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {success ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 font-headline">
            <div className="size-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <CheckCircle2 className="size-8" />
            </div>
            <h4 className="text-xl font-black text-slate-900 uppercase">Registry Updated</h4>
            <p className="text-sm font-medium text-slate-500 max-w-xs">Your system report has been successfully indexed. Engineering will triage shortly.</p>
          </div>
        ) : (
          <form className="p-8 space-y-6 overflow-y-auto" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Report category</label>
                  <div className="relative">
                    <select 
                      value={formData.ticket_type}
                      onChange={(e: any) => setFormData({...formData, ticket_type: e.target.value})}
                      className="w-full h-12 bg-slate-50 border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-violet-600/10 transition-all appearance-none outline-none cursor-pointer"
                    >
                      <option value="tech">Technical Issue</option>
                      <option value="capacity">Capacity Limit</option>
                      <option value="compliance">Compliance Guard</option>
                      <option value="general">General Support</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                       {formData.ticket_type === 'tech' ? <Code className="size-3.5 text-violet-600" /> : 
                        formData.ticket_type === 'capacity' ? <Settings className="size-3.5 text-amber-600" /> :
                        <ShieldAlert className="size-3.5 text-red-600" />}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Severity impact</label>
                  <select 
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full h-12 bg-slate-50 border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-violet-600/10 transition-all appearance-none outline-none cursor-pointer"
                  >
                    <option value="low">P3 - Routine</option>
                    <option value="medium">P2 - Priority</option>
                    <option value="high">P1 - Critical</option>
                    <option value="critical">P0 - Incident</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Report summary</label>
                <input 
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Memory leak in production cluster B"
                  className="w-full h-12 bg-slate-50 border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-violet-600/10 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Technical details</label>
                  <span className="text-[9px] font-bold text-slate-300 uppercase italic">Markdown supported</span>
                </div>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the anomalies, logs, or system states observed..."
                  className="w-full h-40 bg-slate-50 border-slate-100 rounded-2xl p-4 text-xs font-medium text-slate-600 focus:bg-white focus:ring-2 focus:ring-violet-600/10 transition-all outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-black text-xs uppercase tracking-[0.1em] rounded-xl shadow-lg shadow-violet-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-headline"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : (
                  <>
                    <AlertCircle className="size-4" />
                    Register System Report
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full h-12 bg-white border border-slate-100 text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest rounded-xl transition-all font-headline"
              >
                Cancel Triage
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
