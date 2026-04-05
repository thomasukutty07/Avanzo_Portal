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

export default function TechnicalLeavePage() {
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
        leavesService.getLeaveRequests({ employee: user?.id })
      ]);

      const requestsData = Array.isArray(requestsRes) ? requestsRes : (requestsRes.results || []);
      
      const mapped: LeaveRequest[] = requestsData.map((r: any) => {
        const typeMap: Record<string, string> = {
            annual: "Annual Leave",
            sick: "Sick Leave",
            casual: "Personal Leave",
            maternity: "Maternity Leave",
            paternity: "Paternity Leave"
        };

        const statusMap: Record<string, any> = {
            pending: { label: "Pending", color: "text-amber-600 bg-amber-50 border-amber-100", icon: Clock },
            approved: { label: "Approved", color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: CheckCircle2 },
            rejected: { label: "Rejected", color: "text-red-600 bg-red-50 border-red-100", icon: XCircle }
        };

        const currentStatus = statusMap[r.status] || statusMap.pending;
        const start = parseISO(r.start_date);
        const end = parseISO(r.end_date);
        const dayCount = differenceInDays(end, start) + 1;

        return {
          type: typeMap[r.leave_type] || r.leave_type,
          sub: r.reason || "No reason provided",
          duration: `${format(start, 'MMM dd')} - ${format(end, 'MMM dd')}`,
          days: `(${dayCount} day${dayCount !== 1 ? 's' : ''})`,
          status: currentStatus.label,
          statusColor: currentStatus.color,
          statusIcon: currentStatus.icon,
          appliedOn: format(parseISO(r.created_at), 'MMM dd, yyyy')
        };
      });

      setRequests(mapped);

      // Mock balances based on user or common defaults since backend might not have it yet
      setBalances([
        { label: "Annual Leave", used: requestsData.filter((r:any) => r.leave_type === 'annual' && r.status === 'approved').length * 2, total: 20, color: "bg-violet-600", icon: Umbrella, iconBg: "bg-violet-50 text-violet-600" },
        { label: "Sick Leave", used: requestsData.filter((r:any) => r.leave_type === 'sick' && r.status === 'approved').length, total: 10, color: "bg-red-500", icon: Stethoscope, iconBg: "bg-red-50 text-red-500" },
        { label: "Personal Leave", used: requestsData.filter((r:any) => r.leave_type === 'casual' && r.status === 'approved').length, total: 5, color: "bg-blue-500", icon: UserIcon, iconBg: "bg-blue-50 text-blue-500" }
      ]);

    } catch (error) {
      console.error("Failed to fetch leave data:", error);
      toast.error("Failed to synchronize leave accounts.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveType || !startDate || !endDate || !reason) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      // Backend expects 'earned' for annual leave, 'sick' for sick, 'casual' for personal
      let mappedType = leaveType;
      if (leaveType === 'annual') mappedType = 'earned';
      if (leaveType === 'personal') mappedType = 'casual';
      
      await leavesService.createLeaveRequest({
        leave_type: mappedType,
        start_date: startDate,
        end_date: endDate,
        reason
      });
      toast.success("Leave application submitted successfully.");
      // Reset form
      setLeaveType("");
      setStartDate("");
      setEndDate("");
      setReason("");
      fetchLeaveData();
    } catch (error: any) {
      console.error("Failed to submit leave:", error.response?.data || error);
      const apiErr = error.response?.data;
      const msg = apiErr?.non_field_errors?.[0] || apiErr?.leave_type?.[0] || "Failed to submit application. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
        <div className="flex h-[80vh] items-center justify-center bg-[#fcfcfc]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Reconciling Leave Balances...</p>
            </div>
        </div>
    );
  }
  return (
    <div className="space-y-6 pb-12 font-display bg-[#fcfcfc] min-h-screen">
      <div className="mb-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 mb-1">
          TECHNICAL MANAGEMENT
        </p>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-headline">Leave Requests</h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">Manage your absence and track your remaining leave balance.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {balances.map((stat: any, i: number) => (
          <Card key={i} className="border-none shadow-sm shadow-slate-100 rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">{stat.label}</span>
                <div className={`size-10 rounded-xl ${stat.iconBg} flex items-center justify-center shadow-sm`}>
                  <stat.icon className="size-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-black text-slate-900 leading-none font-headline">{stat.used.toString().padStart(2, '0')}</span>
                <span className="text-slate-300 font-bold text-lg font-headline">/ {stat.total} Days</span>
              </div>
              <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${stat.color} transition-all duration-1000`} 
                  style={{ width: `${(stat.used / stat.total) * 100}%` }} 
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Apply Form */}
        <div className="lg:col-span-4">
          <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white h-full">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="size-5 text-violet-600">
                  <Plus className="size-full" />
                </div>
                <h4 className="font-bold text-[15px] text-slate-900 font-headline">Apply for Leave</h4>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Leave Type</label>
                  <select 
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full h-12 bg-slate-50 border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-violet-600/10 focus:border-violet-100 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select type...</option>
                    <option value="annual">Annual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="personal">Personal Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full h-12 bg-slate-50 border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-violet-600/10" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full h-12 bg-slate-50 border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-violet-600/10" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Reason</label>
                  <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe the reason for your leave..."
                    className="w-full h-32 bg-slate-50 border-slate-100 rounded-xl p-4 text-sm font-medium text-slate-600 outline-none focus:bg-white focus:ring-2 focus:ring-violet-600/10 resize-none"
                  />
                </div>

                <Button 
                    disabled={submitting}
                    className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-violet-600/20 active:scale-95 transition-all mt-4"
                >
                  {submitting ? <Loader2 className="size-4 animate-spin" /> : "Submit Application"}
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
