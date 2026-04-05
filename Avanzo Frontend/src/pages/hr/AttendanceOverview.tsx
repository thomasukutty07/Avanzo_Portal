import { HRPortalChrome } from "@/components/portal/hr/HRPortalChrome"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { toast } from "sonner"
import { 
  UserCheck, 
  Clock, 
  UserMinus, 
  MoreVertical, 
  Filter,
  Download,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const STATS = [
  { label: "Present Today", value: "94.2%", sub: "188/200 employees", change: "+2.4%", color: "green", icon: UserCheck },
  { label: "Late Arrivals", value: "12", sub: "Avg: 45m late", change: "+12%", color: "orange", icon: Clock },
  { label: "Absent", value: "5", sub: "All approved leaves", change: "-0.8%", color: "red", icon: UserMinus },
]

const LOGS = [
  { name: "Sarah Jenkins", email: "sarah.j@avanzo.com", dept: "Engineering", date: "Oct 14, 2023", checkin: "08:45 AM", checkout: "05:30 PM", status: "Present", color: "bg-green-100 text-green-700", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBszWErZ91VCTDZJgeVG1ZipmB04UJQiFJUnULkMaYqW4b1BLVvO-UEvU1c1_lB4VTgg85rlcnj2WQGaulKO9Br3ZGdjyvNcGoAMC-1lAietty_KEen9JF4_E0T06ouDSRRDEt3QzKDoPvLvcNczldR1ckaRdkYP6lfnbJ_ujEZ0iay94LMdXRVX0CoE8wIf7Wuw5N4RnlQqiX5_YoEI3LhnzGD6WNFT4PA9bhR9gKcXlTSuwmp1VAWyqeNjSzI9O4jQNbS1sE-gz8" },
  { name: "Alex Thompson", email: "alex.t@avanzo.com", dept: "Design", date: "Oct 14, 2023", checkin: "09:15 AM", checkout: "06:05 PM", status: "Late", color: "bg-orange-100 text-orange-700", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuASMKbX5SoeASadwBQQkhc-sJ46pNniNaf99LGIudS1-lhuMDJ9MKHlPkLM-8pqgYHYM2hxs8FX1wqsceSOhLpbx0gVSkgqTPjFeMqy3KXBPTzJ0EU5MRAEPykcaPlTCHf83BwA3vnrvLCR9uAKy7y-fbohDK7jbw5WYRxxS_GMgrzfQkgV4DnTtPzwljJhY3UoIcxDI849UMtDDfSJCi1tKkjdeo3vrNu81Bxu1PIlYV1sxYXJOv3zfM3W4u98jBIoX9yC8VRDfNE" },
  { name: "Emily Rivera", email: "emily.r@avanzo.com", dept: "Marketing", date: "Oct 14, 2023", checkin: "--:--", checkout: "--:--", status: "Absent", color: "bg-red-100 text-red-700", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIXRhCs1-4LeyA3ukABxuXk6PzTrsvxBrWHnE1vI9y2POFWcO5sfovInMLb13fFYFpA-N_ytwRbQ1S6-h9h8v7wa4xTSAgWjuRNPG7RRUu28I3UyyBF6j-3F08R1pCMxXopXWukTeXJ4o3qhmecvos4Ch-Tvdj-jb6E0jUmJOSgMBZtH0n32bu3UNk3zGq3MEcdMIudHugueGCYyaYLZUJacfP3mRfv5RxNDk75O7rod7wu6hGY2Vwi4R6DA1AWHHpQU410aqP-A0" },
  { name: "David Kim", email: "david.k@avanzo.com", dept: "Human Resources", date: "Oct 14, 2023", checkin: "08:55 AM", checkout: "05:45 PM", status: "Present", color: "bg-green-100 text-green-700", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0n-jNL8UB3fk2_eK9Vz3ByZYRCgoTU8h8LREJ7R2WPGUs1BEgv7BvXE4904tLe3x6mK2vww84-dNnbo7ubhUssiHcWbtn-gyGg1DoZlFzvFGPAdhPf_uWSbMtfnQctYJ9GBPta8-9tTYuKtpRDFpL2xalOBajrP7qjKYh79M1cZuPty88vr_5ZVSOxXEr8msKh06RcC5bdR9MomocbwvMxfDVsmkA6xNlMbpedXUh2naeHcAhQeMzE_Fh_DEk-ROe74DNCjbjC6w" },
]

const CHART_DATA = [
  { day: "1 Oct", value: 150 },
  { day: "2 Oct", value: 140 },
  { day: "4 Oct", value: 160 },
  { day: "7 Oct", value: 155 },
  { day: "10 Oct", value: 170 },
  { day: "14 Oct", value: 188 },
]

export default function HRAttendanceOverview() {
  useDesignPortalLightTheme()

  return (
    <HRPortalChrome>
      <div className="p-8 space-y-8">
        {/* Title / Action Strip */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-headline text-[1.75rem] font-bold tracking-[-0.02em] text-[#191c1d]">Attendance Analytics</h1>
            <p className="font-body text-[#494456] mt-1 text-sm font-medium">Monitoring workforce presence and reliability across sectors.</p>
          </div>
          <button 
            onClick={() => toast.success("Compiling attendance report for download...")}
            className="flex items-center gap-2 bg-violet-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-violet-900/10 hover:bg-violet-800 transition-all active:scale-95"
          >
            <Download className="h-4 w-4" />
            Export Monthly Report
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STATS.map((stat, i) => (
            <button
              key={i}
              onClick={() => toast.info(`Diving into ${stat.label} history...`)}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:scale-[1.02] active:scale-95 text-left group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${
                  stat.color === 'green' ? 'bg-green-50 text-green-600' :
                  stat.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                  'bg-red-50 text-red-600'
                }`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  stat.change.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-3xl font-extrabold mt-1 text-slate-900">{stat.value}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-wider">{stat.sub}</p>
            </button>
          ))}
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <div>
              <h4 className="font-headline text-lg font-bold text-slate-900">Attendance Trends</h4>
              <p className="font-body text-sm text-slate-500 font-medium">Employee presence percentage over time.</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
              {['Daily', 'Weekly', 'Monthly'].map((period) => (
                <button
                  key={period}
                  onClick={() => toast.info(`Switched view to ${period}`)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${period === 'Daily' ? 'bg-white shadow-sm text-violet-700' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h4 className="font-headline text-lg font-bold text-slate-900">Recent Attendance Logs</h4>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select className="text-sm font-bold border-slate-200 bg-slate-50 rounded-xl focus:ring-violet-700 focus:border-violet-700 cursor-pointer flex-1 sm:flex-none py-2 px-4">
                <option>All Departments</option>
                <option>Engineering</option>
                <option>Design</option>
                <option>Marketing</option>
              </select>
              <button 
                onClick={() => toast.info("Opening advanced filters...")}
                className="p-2 text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Check-in</th>
                  <th className="px-6 py-4">Check-out</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-body">
                {LOGS.map((log, i) => (
                  <tr key={i} className="group hover:bg-violet-50/30 transition-colors cursor-pointer" onClick={() => toast.info(`Viewing full log for ${log.name}`)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 overflow-hidden ring-2 ring-white shadow-sm shrink-0">
                          <img className="h-full w-full object-cover" src={log.img} alt={log.name} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate transition-colors group-hover:text-violet-700 leading-tight">{log.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter truncate">{log.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{log.dept}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-400">{log.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{log.checkin}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{log.checkout}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${log.color}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-violet-700 transition-colors">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-white border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Page 1 of 50</p>
            <div className="flex gap-2">
              <button 
                disabled
                className="flex items-center justify-center size-10 text-slate-300 border border-slate-100 rounded-xl transition-all opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {[1, 2, 3].map((p) => (
                <button 
                  key={p}
                  onClick={() => toast.info(`Navigating to page ${p}`)}
                  className={`size-10 text-xs font-bold rounded-xl transition-all ${p === 1 ? 'bg-violet-700 text-white shadow-lg shadow-violet-900/20' : 'text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
                >
                  {p}
                </button>
              ))}
              <button 
                onClick={() => toast.info("Next page")}
                className="flex items-center justify-center size-10 text-slate-500 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </HRPortalChrome>
  )
}
