import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  Clock,
  CheckCircle2,
  Loader2,
  X,
  Activity
} from "lucide-react";
import { attendanceService } from "@/services/attendance";
import { toast } from "sonner";
import { format } from "date-fns";

interface AttendanceClockWidgetProps {
  compact?: boolean;
  onToggleSidebar?: (open: boolean) => void;
}

export const AttendanceClockWidget: React.FC<AttendanceClockWidgetProps> = ({ onToggleSidebar }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLog, setCurrentLog] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const hasAutoOpened = useRef(false);

  useEffect(() => {
    fetchCurrentStatus();
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchCurrentStatus = async () => {
    try {
      setRefreshing(true);
      const status = await attendanceService.getToday();
      setCurrentLog(status);
    } catch (err) {
      console.error("Failed to fetch attendance status", err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !refreshing && currentLog && !currentLog.has_clocked_in && !hasAutoOpened.current) {
       setIsOpen(true);
       hasAutoOpened.current = true;
    }
  }, [loading, refreshing, currentLog]);

  const handleClockIn = async () => {
    try {
      setRefreshing(true);
      await attendanceService.clockIn({ 
        entries: [
          { 
            intent_text: "Daily system check-in.", 
            custom_label: "Attendance" 
          }
        ], 
        general_notes: "System Check-in" 
      });
      toast.success("Check-in successful. Have a great day!");
      await fetchCurrentStatus();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Request failed.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setRefreshing(true);
      
      const payload_entries = (currentLog?.entries || []).map((e: any) => ({
        entry_id: e.id,
        output_text: "Finished today's workday.",
        outcome: "completed"
      }));

      await attendanceService.clockOut({ 
        entries: payload_entries, 
        general_notes: "Clocked out via terminal." 
      });
      toast.success("Check-out successful. Workday logged.");
      await fetchCurrentStatus();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Request failed.");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) return null;

  const statusColor = currentLog?.has_clocked_out 
    ? "bg-slate-100 text-slate-400" 
    : currentLog?.has_clocked_in 
    ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-600/10" 
    : "bg-violet-50 text-violet-600 border-violet-100 shadow-violet-600/10";

  const statusIcon = currentLog?.has_clocked_out ? <CheckCircle2 className="size-3.5" /> : <Clock className="size-3.5" />;
  const statusLabel = currentLog?.has_clocked_out ? "Finished" : currentLog?.has_clocked_in ? "Working" : "Sign In";

  return (
    <>
      <button 
        onClick={() => {
          setIsOpen(true);
          onToggleSidebar?.(false);
        }}
        className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border font-black text-[10px] tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-sm font-headline ${statusColor}`}
      >
        {refreshing ? <Loader2 className="size-3.5 animate-spin" /> : statusIcon}
        <span className="hidden sm:inline">{statusLabel}</span>
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg max-h-[92vh] bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="px-8 py-7 border-b border-slate-50 flex items-center justify-between font-headline bg-white sticky top-0 z-10 transition-colors">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  {currentLog?.has_clocked_in ? "Check Out" : "Daily Attendance"}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-1 uppercase">
                  {currentLog?.has_clocked_in ? "Review your hours and finalize" : "What is your status today?"}
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  onToggleSidebar?.(true);
                }}
                className="p-2.5 hover:bg-slate-50 rounded-2xl text-slate-300 hover:text-slate-900 transition-all active:scale-90"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center space-y-8">
               {/* 1. PRIMARY STATUS */}
               <div className="space-y-4">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Attendance State</p>
                  <div className="flex flex-col items-center gap-4">
                     <div className={`px-10 py-4 rounded-[2rem] text-2xl font-black tracking-tight border transition-all ${
                        currentLog?.has_clocked_out ? 'bg-slate-50 text-slate-400 border-slate-100' :
                        currentLog?.has_clocked_in ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        'bg-violet-50 text-violet-600 border-violet-100'
                     }`}>
                        {currentLog?.has_clocked_out ? 'logged' : currentLog?.has_clocked_in ? 'Working' : 'Not Checked In'}
                     </div>
                     {currentLog?.has_clocked_in && !currentLog?.has_clocked_out && currentLog?.clock_in && (
                        <p className="text-sm font-bold text-emerald-600/80">
                          Clocked in at {(() => {
                            try { return format(new Date(currentLog.clock_in), 'hh:mm a'); } catch (e) { return '—'; }
                          })()}
                        </p>
                     )}
                   </div>
               </div>

               {/* 2. LIVE CLOCK AREA */}
               <div className="grid grid-cols-2 gap-8 w-full max-w-sm py-6 border-y border-slate-50">
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Today</p>
                     <p className="text-lg font-black text-slate-900 tracking-tight">{format(currentTime, 'd MMM yyyy')}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Time</p>
                     <p className="text-lg font-black text-slate-900 tracking-tight tabular-nums">{format(currentTime, 'hh:mm:ss a')}</p>
                  </div>
               </div>

               {/* 3. PRIMARY ACTION */}
               <div className="w-full max-w-[280px]">
                  {!currentLog?.has_clocked_in ? (
                    <button 
                       onClick={handleClockIn}
                       disabled={refreshing}
                       className="w-full h-16 bg-violet-600 hover:bg-violet-700 text-white rounded-[1.25rem] font-black text-base tracking-widest shadow-xl shadow-violet-900/20 active:scale-95 transition-all uppercase disabled:opacity-50 flex items-center justify-center gap-4"
                     >
                       {refreshing ? <Loader2 className="size-5 animate-spin" /> : <Activity className="size-5" />}
                       Check In
                    </button>
                  ) : !currentLog?.has_clocked_out ? (
                    <button 
                       onClick={handleClockOut}
                       disabled={refreshing}
                       className="w-full h-16 bg-slate-900 hover:bg-black text-white rounded-[1.25rem] font-black text-base tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all uppercase disabled:opacity-50 flex items-center justify-center gap-4"
                     >
                       {refreshing ? <Loader2 className="size-5 animate-spin" /> : <CheckCircle2 className="size-5" />}
                       Check Out
                    </button>
                  ) : (
                    <div className="w-full h-16 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-[1.25rem] font-black text-base tracking-widest uppercase border border-emerald-100 gap-3">
                       <CheckCircle2 className="size-5" /> Finished
                    </div>
                  )}
               </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-50 flex justify-end items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest font-headline italic">
              <span className="tabular-nums">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
