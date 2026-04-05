import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Umbrella,
  Stethoscope,
  User,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const LEAVE_STATS = [
  { 
    label: "Annual Leave", 
    used: 15, 
    total: 20, 
    color: "bg-violet-600", 
    icon: Umbrella,
    iconBg: "bg-violet-50 text-violet-600"
  },
  { 
    label: "Sick Leave", 
    used: 8, 
    total: 10, 
    color: "bg-red-500", 
    icon: Stethoscope,
    iconBg: "bg-red-50 text-red-500"
  },
  { 
    label: "Personal Leave", 
    used: 4, 
    total: 5, 
    color: "bg-blue-500", 
    icon: User,
    iconBg: "bg-blue-50 text-blue-500"
  }
]

const RECENT_REQUESTS = [
  {
    type: "Annual Leave",
    sub: "Family vacation",
    duration: "Oct 12 - Oct 15",
    days: "(4 days)",
    status: "Approved",
    statusColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
    statusIcon: CheckCircle2,
    appliedOn: "Sep 28, 2023"
  },
  {
    type: "Sick Leave",
    sub: "Medical checkup",
    duration: "Nov 02 - Nov 02",
    days: "(1 day)",
    status: "Pending",
    statusColor: "text-amber-600 bg-amber-50 border-amber-100",
    statusIcon: Clock,
    appliedOn: "Oct 25, 2023"
  },
  {
    type: "Personal Leave",
    sub: "Personal errands",
    duration: "Aug 15 - Aug 16",
    days: "(2 days)",
    status: "Rejected",
    statusColor: "text-red-600 bg-red-50 border-red-100",
    statusIcon: XCircle,
    appliedOn: "Aug 01, 2023"
  },
  {
    type: "Annual Leave",
    sub: "Summer break",
    duration: "Jul 01 - Jul 10",
    days: "(10 days)",
    status: "Approved",
    statusColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
    statusIcon: CheckCircle2,
    appliedOn: "Jun 15, 2023"
  }
]

export default function CyberSecurityLeavePage() {
  return (
    <div className="space-y-8 pt-4 pb-12 font-display">
      <div className="mb-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase italic font-headline">Leave Requests</h1>
        <p className="text-slate-500 mt-2 font-medium italic">Manage your absence and track your remaining leave balance.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {LEAVE_STATS.map((stat, i) => (
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
                <h4 className="font-black text-[13px] uppercase tracking-[0.2em] text-slate-900 italic font-headline">Apply for Leave</h4>
              </div>

              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Leave Type</label>
                  <select className="w-full h-12 bg-slate-50 border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-violet-600/10 focus:border-violet-100 outline-none transition-all appearance-none cursor-pointer">
                    <option>Select type...</option>
                    <option>Annual Leave</option>
                    <option>Sick Leave</option>
                    <option>Personal Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                    <input type="date" className="w-full h-12 bg-slate-50 border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-violet-600/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
                    <input type="date" className="w-full h-12 bg-slate-50 border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-violet-600/10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Reason</label>
                  <textarea 
                    placeholder="Describe the reason for your leave..."
                    className="w-full h-32 bg-slate-50 border-slate-100 rounded-xl p-4 text-sm font-medium text-slate-600 outline-none focus:bg-white focus:ring-2 focus:ring-violet-600/10 resize-none"
                  />
                </div>

                <Button className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-violet-600/20 active:scale-95 transition-all mt-4">
                  Submit Application
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Requests Table */}
        <div className="lg:col-span-8">
          <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white h-full">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white sm:sticky sm:top-0 z-10">
              <h4 className="font-black text-[13px] uppercase tracking-[0.2em] text-slate-900 tracking-tight leading-none italic font-headline">Recent Requests</h4>
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
                  {RECENT_REQUESTS.map((req, i) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                      <td className="px-8 py-6">
                        <p className="text-[13px] font-bold text-slate-900 group-hover:text-violet-700 transition-colors uppercase tracking-tight leading-none">{req.type}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1.5 leading-none italic">{req.sub}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-[13px] font-black text-slate-600 leading-none">{req.duration}</p>
                        <p className="text-[10px] font-bold text-slate-300 mt-1.5 leading-none italic">{req.days}</p>
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
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
