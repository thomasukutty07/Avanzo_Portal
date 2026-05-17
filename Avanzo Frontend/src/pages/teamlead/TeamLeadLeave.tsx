import { useState, useEffect } from "react";
import {
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Umbrella,
  Stethoscope,
  User as UserIcon,
  Loader2
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { leavesService } from "@/services/leaves";
import { ticketsService } from "@/services/tickets";
import { projectsService } from "@/services/projects";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { format, parseISO, differenceInDays } from "date-fns";

type LeaveRequest = {
  type: string;
  sub: string;
  duration: string;
  days: string;
  status: string;
  statusColor: string;
  statusIcon: any;
  appliedOn: string;
}

export default function TeamLeadLeavePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<any[]>([]);

  // Form State
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);



  useEffect(() => {
    fetchLeaveData();
  }, [user]);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      const [requestsRes] = await Promise.all([
        leavesService.getLeaveRequests(),
      ]);

      const rawRequests = Array.isArray(requestsRes) ? requestsRes : (requestsRes.results || []);

      // Compute balances from approved leaves
      const annualUsed = rawRequests.filter((r: any) => r.leave_type === 'annual' && r.status === 'approved').length;
      const sickUsed = rawRequests.filter((r: any) => r.leave_type === 'sick' && r.status === 'approved').length;
      const personalUsed = rawRequests.filter((r: any) => r.leave_type === 'personal' && r.status === 'approved').length;

      setBalances([
        { label: "Annual Leave", used: annualUsed, total: 20, color: "bg-violet-600", icon: Umbrella, iconBg: "bg-violet-50 text-violet-600 border-violet-100" },
        { label: "Sick Leave", used: sickUsed, total: 10, color: "bg-red-500", icon: Stethoscope, iconBg: "bg-red-50 text-red-500 border-red-100" },
        { label: "Personal Leave", used: personalUsed, total: 5, color: "bg-blue-500", icon: UserIcon, iconBg: "bg-blue-50 text-blue-500 border-blue-100" },
      ]);

      const mappedRequests: LeaveRequest[] = rawRequests.map((r: any) => {
        const start = parseISO(r.start_date);
        const end = parseISO(r.end_date);
        const days = differenceInDays(end, start) + 1;

        let statusColor = "text-amber-600 bg-amber-50 border-amber-100";
        let statusIcon = Clock;
        if (r.status === "approved") {
          statusColor = "text-emerald-600 bg-emerald-50 border-emerald-100";
          statusIcon = CheckCircle2;
        } else if (r.status === "rejected") {
          statusColor = "text-red-600 bg-red-50 border-red-100";
          statusIcon = XCircle;
        }

        return {
          type: r.leave_type_display || r.leave_type,
          sub: r.reason || "No reason provided",
          duration: `${format(start, 'MMM dd')} - ${format(end, 'MMM dd')}`,
          days: `${days} day${days > 1 ? 's' : ''}`,
          status: r.status_display || r.status,
          statusColor,
          statusIcon,
          appliedOn: format(parseISO(r.created_at), 'MMM dd, yyyy'),
        };
      });

      setRequests(mappedRequests);
    } catch (error) {
      console.error("Leave data fetch failed:", error);
      toast.error("Failed to load leave data.");
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveType || !startDate || !endDate || !reason) {
      toast.error("Please fill all fields.");
      return;
    }
    try {
      setSubmitting(true);
      await leavesService.createLeaveRequest({
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason,
      });
      toast.success("Leave request submitted successfully.");
      setLeaveType("");
      setStartDate("");
      setEndDate("");
      setReason("");
      await fetchLeaveData();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-[#fcfcfc]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading leave data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-display bg-[#fcfcfc] min-h-screen">
      <div className="mb-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 mb-1 leading-none">
          TEAM LEAD
        </p>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-headline">Leave Requests</h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">Manage your leave and track your remaining balance.</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {balances.map((b: any, i: number) => (
          <Card key={i} className="border border-slate-100 shadow-sm rounded-2xl bg-white p-6 hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-5">
              <div className={`size-12 rounded-2xl ${b.iconBg} border flex items-center justify-center`}>
                <b.icon className="size-5" />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{b.label}</p>
                <p className="text-lg font-black text-slate-900 tracking-tight leading-none mt-1">{b.total - b.used} <span className="text-xs font-bold text-slate-400">remaining</span></p>
              </div>
            </div>
            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
              <div
                className={`h-full ${b.color} rounded-full transition-all duration-1000`}
                style={{ width: `${((b.total - b.used) / b.total) * 100}%` }}
              />
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-2">{b.used} of {b.total} used</p>
          </Card>
        ))}
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Apply Form */}
        <div className="lg:col-span-4">
          <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white h-full">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Plus className="size-4 text-violet-600" />
                <h4 className="font-bold text-sm text-slate-900 uppercase tracking-widest font-headline">Apply for Leave</h4>
              </div>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leave Type</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-600/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select type...</option>
                    <option value="annual">Annual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="personal">Personal Leave</option>
                    <option value="casual">Casual Leave</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-600/10 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-600/10 transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe the reason for your leave..."
                    className="w-full h-24 bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-medium text-slate-600 outline-none resize-none focus:ring-2 focus:ring-violet-600/10 transition-all"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-violet-600/20 active:scale-95 transition-all"
                >
                  {submitting ? "Processing..." : "Submit Application"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Requests Table */}
        <div className="lg:col-span-8">
          <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white h-full">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white sm:sticky sm:top-0 z-10">
              <h4 className="font-bold text-[15px] text-slate-900 tracking-tight font-headline">Recent Requests</h4>
              <button className="text-[10px] font-black uppercase tracking-widest text-violet-600 hover:text-violet-800 transition-colors">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] border-b border-slate-50">
                  <tr>
                    <th className="px-8 py-5">Type</th>
                    <th className="px-8 py-5">Duration</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Applied On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {requests.length > 0 ? (
                    requests.map((req: LeaveRequest, i: number) => (
                      <tr key={i} className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                        <td className="px-8 py-6">
                          <p className="text-[13px] font-bold text-slate-900 group-hover:text-violet-700 transition-colors uppercase tracking-tight leading-none">{req.type}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1.5 leading-none">{req.sub}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-[13px] font-black text-slate-600 leading-none">{req.duration}</p>
                          <p className="text-[10px] font-bold text-slate-300 mt-1.5 leading-none">{req.days}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${req.statusColor}`}>
                            <req.statusIcon className="size-3" />
                            {req.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right font-bold text-[11px] text-slate-400 tabular-nums">
                          {req.appliedOn}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[11px]">
                        No leave history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

    </div>
  )
}
