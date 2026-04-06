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
    label: "Annual leave", 
    used: 15, 
    total: 20, 
    color: "bg-violet-600", 
    icon: Umbrella,
    iconBg: "bg-violet-50 text-violet-600"
  },
  { 
    label: "Sick leave", 
    used: 8, 
    total: 10, 
    color: "bg-red-500", 
    icon: Stethoscope,
    iconBg: "bg-red-50 text-red-500"
  },
  { 
    label: "Personal leave", 
    used: 4, 
    total: 5, 
    color: "bg-blue-500", 
    icon: User,
    iconBg: "bg-blue-50 text-blue-500"
  }
]

const RECENT_REQUESTS = [
  {
    type: "Annual leave",
    sub: "Family vacation",
    duration: "Oct 12 - Oct 15",
    days: "(4 days)",
    status: "Approved",
    statusColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
    statusIcon: CheckCircle2,
    appliedOn: "Sep 28, 2023"
  },
  {
    type: "Sick leave",
    sub: "Medical checkup",
    duration: "Nov 02 - Nov 02",
    days: "(1 day)",
    status: "Pending",
    statusColor: "text-amber-600 bg-amber-50 border-amber-100",
    statusIcon: Clock,
    appliedOn: "Oct 25, 2023"
  },
  {
    type: "Personal leave",
    sub: "Personal errands",
    duration: "Aug 15 - Aug 16",
    days: "(2 days)",
    status: "Rejected",
    statusColor: "text-red-600 bg-red-50 border-red-100",
    statusIcon: XCircle,
    appliedOn: "Aug 01, 2023"
  },
  {
    type: "Annual leave",
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
    <div className="space-y-8 pt-4 pb-12 font-headline bg-[#fcfcfc] min-h-screen">
      <div className="mb-2 space-y-1">
        <p className="text-[9px] font-black tracking-[0.2em] text-violet-600">
          Personnel • Absence protocol
        </p>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Leave registry</h1>
        <p className="text-slate-500 mt-2 text-xs font-medium">Manage personnel absence and track operational leave balance.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {LEAVE_STATS.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm shadow-slate-100 rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-5">
                <span className="text-[10px] font-black text-slate-400 tracking-widest">{stat.label}</span>
                <div className={`size-8 rounded-xl ${stat.iconBg} flex items-center justify-center shadow-sm`}>
                  <stat.icon className="size-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-black text-slate-900 leading-none">{stat.used.toString().padStart(2, '0')}</span>
                <span className="text-slate-300 font-black text-sm">/ {stat.total} days</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Apply Form */}
        <div className="lg:col-span-4">
          <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="size-4 text-violet-600">
                  <Plus className="size-full" />
                </div>
                <h4 className="font-black text-[12px] tracking-[0.2em] text-slate-900">Apply for leave</h4>
              </div>

              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 tracking-widest">Leave type</label>
                  <select className="w-full h-11 bg-slate-50 border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-violet-600/10 focus:border-violet-100 outline-none transition-all appearance-none cursor-pointer">
                    <option>Select type...</option>
                    <option>Annual leave</option>
                    <option>Sick leave</option>
                    <option>Personal leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 tracking-widest">Start date</label>
                    <input type="date" className="w-full h-11 bg-slate-50 border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-violet-600/10" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 tracking-widest">End date</label>
                    <input type="date" className="w-full h-11 bg-slate-50 border-slate-100 rounded-xl px-4 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-violet-600/10" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 tracking-widest">Reason</label>
                  <textarea 
                    placeholder="Describe the reason for your leave..."
                    className="w-full h-28 bg-slate-50 border-slate-100 rounded-xl p-4 text-xs font-medium text-slate-600 outline-none focus:bg-white focus:ring-2 focus:ring-violet-600/10 resize-none"
                  />
                </div>

                 <Button className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-black text-[10px] tracking-[0.2em] rounded-xl shadow-lg shadow-violet-600/20 active:scale-95 transition-all mt-2">
                  Submit application
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Requests Table */}
        <div className="lg:col-span-8">
          <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white h-full">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white sm:sticky sm:top-0 z-10">
              <h4 className="font-black text-[12px] tracking-[0.2em] text-slate-900 tracking-tight leading-none italic">Recent requests</h4>
              <button className="text-[9px] font-black tracking-widest text-violet-600 hover:text-violet-800 transition-colors">View all</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-[8px] font-black text-slate-300 tracking-[0.2em] border-b border-slate-50">
                  <tr>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Applied on</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {RECENT_REQUESTS.map((req, i) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                      <td className="px-6 py-5">
                        <p className="text-[12px] font-black text-slate-900 group-hover:text-violet-700 transition-colors tracking-tight leading-none">{req.type}</p>
                        <p className="text-[9px] font-black text-slate-400 mt-1.5 leading-none italic">{req.sub}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[12px] font-black text-slate-600 leading-none">{req.duration}</p>
                        <p className="text-[9px] font-black text-slate-300 mt-1.5 leading-none italic tracking-tight">{req.days}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[8px] font-black tracking-widest ${req.statusColor}`}>
                          <req.statusIcon className="size-2.5" />
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-[10px] text-slate-400 tabular-nums">
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
