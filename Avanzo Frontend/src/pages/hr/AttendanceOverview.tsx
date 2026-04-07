import { HRPortalChrome } from "@/components/portal/hr/HRPortalChrome"
import { api } from "@/lib/axios"
import { useEffect, useState } from "react"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { toast } from "sonner"
import { 
  UserCheck, 
  Clock, 
  UserMinus, 
  MoreVertical, 
  Download,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ExternalLink,
  Eye,
  Settings,
  ShieldCheck,
  AlertCircle
} from "lucide-react"

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Configuration moved inside component for reactivity

interface AttendanceLog {
  name: string;
  email: string;
  dept: string;
  date: string;
  checkin: string;
  checkout: string;
  status: string;
  color: string;
  initial: string;
}




export default function HRAttendanceOverview() {
  useDesignPortalLightTheme()
  const [logs, setLogs] = useState<AttendanceLog[]>([])
  const [stats, setStats] = useState<any>({
    clockedIn: 0, late: 0, missing: 0, total: 0
  })

  const STATS = [
    { label: "Present Today", value: stats.clockedIn.toString(), sub: "Scanning Registry", trend: "+2.4%", color: "text-emerald-500", icon: UserCheck },
    { label: "Late Arrivals", value: stats.late.toString(), sub: "Avg: 0m Delay", trend: "-1.2%", color: "text-amber-500", icon: Clock },
    { label: "Absent Logs", value: stats.missing.toString(), sub: "Approved Leaves", trend: "0.0%", color: "text-red-500", icon: UserMinus },
    { label: "Varsity Score", value: "100", sub: "Operational Health", trend: "Stable", color: "text-violet-600", icon: TrendingUp },
  ]

  useEffect(() => {
    async function fetchAttendance() {
      try {
        const res = await api.get("/api/attendance/pulse/")
        const data = res.data
        
        setStats({
          clockedIn: data.clocked_in,
          late: data.late,
          missing: data.missing,
          total: data.total_employees
        })

        const mapped = data.employees?.map((e: any) => {
          let statusText = "UNKNOWN"
          let color = "bg-slate-500"
          
          if (e.status === 'clocked_in' || e.status === 'clocked_out') {
             if (e.is_late) {
                statusText = "Late Arrival"
                color = "bg-amber-500 shadow-amber-500/10"
             } else {
                statusText = "Verified"
                color = "bg-emerald-500 shadow-emerald-500/10"
             }
          } else {
             statusText = "Missing"
             color = "bg-red-500 shadow-red-500/10"
          }

          return {
            name: e.employee_name,
            email: e.employee_code || "Unknown ID",
            dept: e.department || "No Dept",
            date: new Date().toLocaleDateString(),
            checkin: e.clock_in_time ? new Date(e.clock_in_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--",
            checkout: e.clock_out_time ? new Date(e.clock_out_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--",
            status: statusText,
            color: color,
            initial: e.employee_name ? e.employee_name.substring(0, 2).toUpperCase() : "??"
          }
        }) || []
        
        setLogs(mapped)
      } catch (e) {
        console.error(e)
      }
    }
    fetchAttendance()
  }, [])

  return (
    <HRPortalChrome>
      <div className="space-y-6 pb-12 font-display bg-[#fcfcfc] min-h-screen">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div className="font-headline">
                <p className="text-[10px] font-black tracking-[0.2em] text-violet-600 mb-1">
                    Workforce Analytics
                </p>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                    Attendance Registry
                </h1>
                <p className="text-slate-500 mt-2 text-sm font-medium italic">High-resolution workforce presence tracking and reliability telemetry.</p>
            </div>
            <div className="flex items-center gap-3 font-headline">
                <Button variant="outline" className="h-11 rounded-xl border-slate-200 text-[11px] font-black text-slate-600 px-6 bg-white hover:bg-slate-50 tracking-widest transition-all">
                    Filter Analytics
                </Button>
                <Button onClick={() => toast.success("Compiling attendance report...")} className="h-11 rounded-xl bg-violet-600 text-white text-[11px] font-black px-6 shadow-lg shadow-violet-600/20 hover:bg-violet-700 tracking-widest transition-all">
                    <Download className="mr-2 size-4 stroke-[3px]" /> Export Telemetry
                </Button>
            </div>
        </div>

        {/* Overview Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
             <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all group font-headline">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
                    <div className={`size-8 rounded-xl ${stat.color.replace('text-', 'bg-').replace('-500', '-50').replace('text-violet-600', 'bg-violet-50 text-violet-600')} flex items-center justify-center`}>
                       <stat.icon className="size-4" />
                    </div>
                </div>
                <p className={`text-4xl font-black tracking-tight ${stat.color.includes('violet') ? 'text-slate-900' : stat.color}`}>{stat.value}</p>
                <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter italic">{stat.sub}</span>
                    <Badge className={`${stat.trend === 'Stable' ? 'bg-slate-50 text-slate-400' : stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} border-none rounded-lg text-[9px] font-black tracking-widest`}>
                        {stat.trend}
                    </Badge>
                </div>
             </div>
          ))}
        </div>

        {/* Charts & Intel Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Presence Trend */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-8 h-[440px] flex flex-col">
                <div className="flex items-center justify-between mb-8 font-headline">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Presence Velocity</h3>
                    <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-50">
                      {['Daily', 'Weekly', 'Monthly'].map((period) => (
                        <button key={period} className={`px-5 py-2 text-[10px] font-black rounded-lg transition-all tracking-widest ${period === 'Daily' ? 'bg-white shadow-md text-violet-700' : 'text-slate-300'}`}>
                          {period}
                        </button>
                      ))}
                    </div>
                </div>
                <div className="flex-1 min-h-0 flex items-center justify-center bg-slate-50/50 border border-slate-100 rounded-2xl">
                    <div className="text-center">
                       <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Total Workforce Present</p>
                       <p className="text-7xl font-black text-slate-900 tracking-tight">{stats.clockedIn} / {Math.max(stats.total, 1)}</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions / Indicators */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-violet-600 rounded-2xl p-8 shadow-xl shadow-violet-600/20 text-white relative overflow-hidden group">
                    <TrendingUp className="absolute -right-4 -bottom-4 size-32 text-white/10 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2 leading-none">Global Sync Rate</p>
                    <h4 className="text-4xl font-black font-headline tracking-tight mb-8">98.1<span className="text-lg opacity-60 ml-1">%</span></h4>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 w-fit px-4 py-2 rounded-xl border border-white/10">
                        <UserCheck className="size-3" /> All Systems Nominal
                    </div>
                </div>
                
                <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                   <h5 className="text-[10px] font-black text-slate-400 tracking-widest mb-6 leading-none">Reliability Metrics</h5>
                   <div className="space-y-6">
                      {[
                        { label: "On-time Arrival", val: 88, color: "bg-emerald-500" },
                        { label: "Overtime Logged", val: 42, color: "bg-violet-600" },
                        { label: "Unauthorized Absc.", val: 4, color: "bg-red-500" },
                      ].map((m, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex justify-between items-center text-[9px] font-black tracking-widest">
                                <span className="text-slate-400">{m.label}</span>
                                <span className="text-slate-900">{m.val}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                <div className={`h-full ${m.color} transition-all duration-1000`} style={{ width: `${m.val}%` }} />
                            </div>
                        </div>
                      ))}
                   </div>
                </div>
            </div>
        </div>

        {/* Global Log Registry */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-12">
           <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-black text-slate-900 font-headline tracking-tight">Active Pulse Logs</h3>
              <button className="text-[10px] font-black uppercase tracking-widest text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-2">
                Full History <ExternalLink className="size-3" />
              </button>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                  <tr>
                    <th className="px-8 py-6">Staff Internal Profile</th>
                    <th className="px-8 py-6">Vertical Unit</th>
                    <th className="px-8 py-6">Intelligence Date</th>
                    <th className="px-8 py-6">Check-in</th>
                    <th className="px-8 py-6">Check-out</th>
                    <th className="px-8 py-6">Duty Status</th>
                    <th className="px-8 py-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map((log, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-sm group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm">
                            {log.initial}
                          </div>
                          <div>
                            <p className="text-[14px] font-black text-slate-900 uppercase tracking-tight font-headline group-hover:text-violet-700 transition-colors">{log.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 leading-none tabular-nums">{log.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{log.dept}</span>
                      </td>
                      <td className="px-8 py-6 text-[11px] font-black text-slate-400 tabular-nums">{log.date}</td>
                      <td className="px-8 py-6 text-sm font-black text-slate-900 tabular-nums">{log.checkin}</td>
                      <td className="px-8 py-6 text-sm font-black text-slate-900 tabular-nums">{log.checkout}</td>
                      <td className="px-8 py-6">
                        <span className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${log.color}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-3 text-slate-200 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all outline-none">
                              <MoreVertical className="size-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 font-display rounded-2xl p-1.5 shadow-2xl border-slate-200 z-[100]">
                            <DropdownMenuLabel className="px-3.5 py-2.5 text-[9px] font-black uppercase tracking-[0.18em] text-slate-300 italic">Contextual Intelligence</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => toast.info(`Initializing full telemetry for ${log.name}`)} className="rounded-xl px-3 py-2.5 cursor-pointer group">
                                <div className="size-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center mr-3 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                                  <Eye className="size-3.5" />
                                </div>
                                <span className="font-black text-[11px] text-slate-700 uppercase tracking-tight">View Pulse Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success("Verification protocol complete.")} className="rounded-xl px-3 py-2.5 cursor-pointer group">
                                <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mr-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                  <ShieldCheck className="size-3.5" />
                                </div>
                                <span className="font-black text-[11px] text-slate-700 uppercase tracking-tight">Verify Presence</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-50" />
                            <DropdownMenuItem onClick={() => toast.warning("Adjustment registry locked.")} className="rounded-xl px-3 py-2.5 cursor-pointer group">
                                <div className="size-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mr-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                  <Settings className="size-3.5" />
                                </div>
                                <span className="font-black text-[11px] text-slate-700 uppercase tracking-tight">Manual Adjustment</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.error("Shift alert issued.")} className="rounded-xl px-3 py-2.5 cursor-pointer group hover:bg-red-50">
                                <div className="size-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mr-3 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                  <AlertCircle className="size-3.5" />
                                </div>
                                <span className="font-black text-[11px] text-red-600 uppercase tracking-tight">Issue Compliance Alert</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
           
           {/* Pagination */}
           <div className="p-4 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between px-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page 01 of 50</p>
              <div className="flex gap-2">
                 <button className="size-9 rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 opacity-50 cursor-not-allowed bg-white">
                    <ChevronLeft className="size-4" />
                 </button>
                 {[1, 2, 3].map(p => (
                   <button key={p} className={`size-9 rounded-xl text-[11px] font-black transition-all ${p === 1 ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}>
                      {p.toString().padStart(2, '0')}
                   </button>
                 ))}
                 <button className="size-9 rounded-xl border border-slate-100 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all">
                    <ChevronRight className="size-4" />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </HRPortalChrome>
  )
}
