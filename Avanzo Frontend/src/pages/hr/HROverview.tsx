import { useEffect, useState } from "react"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import {
  Users,
  UserPlus,
  CheckCircle2,
  ClipboardList,
  Plus,
  Loader2,
  ChevronRight,
  Zap,
  Shield,
  Activity
} from "lucide-react"
import type { LeaveRequest, User } from "@/types"
import { HRPortalChrome } from "@/components/portal/hr/HRPortalChrome"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"


export default function HROverview() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [recentEmployees, setRecentEmployees] = useState<User[]>([])
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([])
  const [stats, setStats] = useState<any[]>([])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        const [eRes, lRes, aRes] = await Promise.all([
          api.get("/api/auth/employees/"),
          api.get("/api/leaves/requests/"),
          api.get("/api/attendance/pulse/"),
        ])

        const allEmployees = extractResults<User>(eRes.data)
        const leaves = extractResults<LeaveRequest>(lRes.data)
        const attendance = aRes.data; 
        const attendanceRate = attendance.attendance_rate || 0;

        setRecentEmployees(allEmployees.slice(0, 4))
        setPendingLeaves(
          leaves.filter((x) => x.status === "pending" || x.status === "tl_approved").slice(0, 3)
        )

        const newThisMonth = allEmployees.filter(e => {
          if (!e.date_of_joining) return false;
          const joinDate = new Date(e.date_of_joining);
          const now = new Date();
          return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
        }).length;

        setStats([
            { label: "Total Employees", value: allEmployees.length.toString().padStart(2, '0'), sub: "Active", icon: Users, color: "text-slate-900" },
            { label: "New Hires", value: newThisMonth.toString().padStart(2, '0'), sub: "This Month", icon: UserPlus, color: "text-slate-900" },
            { label: "Attendance Rate", value: `${Math.round(attendanceRate)}%`, sub: `${attendance.present_now || 0}/${attendance.total_workforce || 0} Present`, valueColor: "text-emerald-500", icon: CheckCircle2, color: "text-emerald-500" },
            { label: "Pending Leaves", value: leaves.filter(l => l.status === 'pending' || l.status === 'tl_approved').length.toString().padStart(2, '0'), sub: "Needs Review", valueColor: "text-amber-500", icon: ClipboardList, color: "text-amber-500" },
        ])
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
        toast.error("Failed to load dashboard data.")
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [])

  if (loading) {
    return (
        <HRPortalChrome>
            <div className="flex h-[80vh] items-center justify-center bg-[#fcfcfc]">
                <div className="flex flex-col items-center gap-6">
                    <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
                    <p className="text-[11px] font-black text-slate-400 tracking-[0.2em] font-headline">Loading employee data...</p>
                </div>
            </div>
        </HRPortalChrome>
    );
  }

  return (
    <HRPortalChrome>
      <div className="space-y-12 font-display bg-[#fcfcfc] min-h-screen animate-in fade-in duration-700">
        {/* Page Header */}
        <div className="sticky top-0 z-30 -mx-6 md:-mx-10 px-6 md:px-10 py-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[#fcfcfc]/80 backdrop-blur-md border-b border-transparent transition-all">
            <div>
                <p className="text-[10px] font-black text-violet-600 mb-1 leading-none">
                    HR Dashboard
                </p>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight font-headline leading-none">
                    Employee Overview
                </h1>
                <p className="text-slate-500 mt-2 text-sm font-medium">Workforce analytics, leave management, and hiring status.</p>
            </div>
            <div className="flex items-center gap-4 self-start md:self-auto">
                <button
                    type="button"
                    onClick={() => toast.info("Exporting employee list…")}
                    className="px-7 py-3 rounded-xl border border-slate-100 bg-white text-slate-900 text-[11px] font-black hover:bg-slate-50 transition-all shadow-sm active:scale-95 font-headline"
                >
                    Export List
                </button>
                <button
                    type="button"
                    onClick={() => navigate("/employee-registration")}
                    className="flex items-center gap-3 px-7 py-3 rounded-xl bg-violet-600 text-white text-[11px] font-black hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20 active:scale-95 shadow-md font-headline"
                >
                    <Plus className="size-4 stroke-[3px]" />
                    Add Employee
                </button>
            </div>
        </div>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s: any) => (
                <div key={s.label} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 hover:shadow-xl hover:-translate-y-1 transition-all group">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{s.label}</p>
                        <div className={`size-10 rounded-[1.2rem] bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100/50 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all`}>
                           <s.icon className="size-5 stroke-[2.5px]" />
                        </div>
                    </div>
                    <p className={`text-5xl font-black tracking-tight font-headline tabular-nums leading-none ${s.valueColor || 'text-slate-900'}`}>{s.value}</p>
                    <div className="mt-8 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 tracking-widest opacity-60 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100/50">{s.sub}</span>
                        <div className="size-2 bg-slate-50 border border-slate-100 rounded-full" />
                    </div>
                </div>
            ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Recent Employee Table */}
          <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-700">
            <div className="flex items-center justify-between px-10 py-8 border-b border-slate-50 bg-slate-50/10">
              <h3 className="font-headline font-black text-xl text-slate-900 tracking-tight">Recent Hires</h3>
              <button 
                onClick={() => navigate("/employees")}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-3 bg-violet-50 px-5 py-2.5 rounded-xl border border-violet-100 shadow-sm"
              >
                View Employees <ChevronRight className="size-3.5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] border-b border-slate-50">
                  <tr>
                    <th className="px-10 py-6">Employee Profile</th>
                    <th className="px-10 py-6 text-center">Work Status</th>
                    <th className="px-10 py-6 text-right">Joining Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentEmployees.length > 0 ? recentEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/30 transition-all group cursor-pointer" onClick={() => toast.info(`Viewing employee details: ${emp.first_name}`)}>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-6">
                          <div className="size-14 rounded-2xl bg-white border border-slate-100 p-2 shadow-sm flex items-center justify-center font-black text-slate-300 text-sm uppercase group-hover:rounded-xl group-hover:border-violet-100 group-hover:shadow-xl transition-all">
                            {emp.first_name?.[0]}{emp.last_name?.[0]}
                          </div>
                          <div>
                            <p className="text-[16px] font-black text-slate-900 font-headline uppercase tracking-tight group-hover:text-violet-600 transition-colors leading-none">{emp.first_name} {emp.last_name}</p>
                            <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mt-2">{emp.role_display || emp.role || 'Sector Unit'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                         <div className="flex justify-center">
                            <span className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
                                ACTIVE
                            </span>
                         </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <p className="text-[12px] font-black text-slate-400 tabular-nums uppercase tracking-widest opacity-60">
                          {emp.date_of_joining ? new Date(emp.date_of_joining).toLocaleDateString() : 'Pending'}
                        </p>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-10 py-24 text-center opacity-30">
                        <Zap className="size-12 mx-auto mb-6 text-slate-200" />
                        <p className="text-[11px] font-black uppercase tracking-[0.2em]">Employee list empty</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Leaves */}
          <div className="lg:col-span-4 space-y-8">
             <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 hover:shadow-xl transition-all duration-700 overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/10" />
                <div className="flex items-center justify-between mb-10">
                   <h3 className="font-black text-xl text-slate-900 font-headline tracking-tight">Compliance Queue</h3>
                   <span className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-[9px] font-black tracking-widest border border-amber-100 shadow-sm">Pending triage</span>
                </div>
                <div className="space-y-6">
                   {pendingLeaves.length > 0 ? (
                     pendingLeaves.map((leave) => (
                       <div key={leave.id} className="p-6 rounded-[1.8rem] bg-slate-50 border border-transparent hover:bg-white hover:border-violet-100 hover:shadow-xl transition-all cursor-pointer group/item relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-violet-600/0 group-hover/item:bg-violet-600 transition-all" />
                          <div className="flex justify-between items-start mb-4">
                             <p className="text-[13px] font-black text-slate-900 font-headline uppercase tracking-tight group-hover/item:text-violet-600 transition-colors">REQ #{leave.id.slice(0, 5)}</p>
                             <span className="text-[10px] font-black text-slate-300 tabular-nums uppercase">{leave.start_date.split('-').slice(1).join('/')}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium line-clamp-1 mb-6 uppercase tracking-tight opacity-80">{leave.reason || 'General leave request'}</p>
                          <div className="flex items-center justify-between mt-2">
                             <div className="flex items-center gap-3">
                                <div className="size-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-violet-600 text-[10px] font-black shadow-sm group-hover/item:bg-violet-600 group-hover/item:text-white transition-all">
                                  {leave.employee_name?.[0]}
                                </div>
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight group-hover/item:text-violet-600 transition-colors">{leave.employee_name?.split(' ')[0]}</span>
                             </div>
                             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-violet-600 opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0">
                                Review <ChevronRight className="size-3 stroke-[3px]" />
                             </div>
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="py-20 text-center opacity-30">
                        <CheckCircle2 className="size-12 mx-auto mb-6 text-slate-200" />
                        <p className="text-[11px] font-black uppercase tracking-[0.2em]">Queue Synchronized</p>
                     </div>
                   )}
                </div>
                <button 
                  onClick={() => navigate("/leave-requests")}
                  className="w-full mt-10 py-5 border border-slate-100 rounded-2xl text-[11px] font-black tracking-[0.3em] text-slate-300 hover:bg-slate-50 hover:text-violet-600 transition-all font-headline shadow-sm"
                >
                   Access Leave Hub
                </button>
             </div>

             <div className="bg-violet-600 rounded-[2.5rem] p-10 text-white shadow-xl shadow-violet-600/20 overflow-hidden relative group hover:scale-[1.02] transition-all duration-700 min-h-[300px] flex flex-col justify-between">
                <div className="absolute -right-10 -top-10 p-4 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-1000">
                   <Activity className="size-48" />
                </div>
                <div className="relative z-10">
                   <h4 className="text-2xl font-black mb-3 font-headline uppercase tracking-tight">System Status</h4>
                   <p className="text-violet-100 text-[11px] font-black uppercase tracking-widest opacity-60 leading-relaxed">System-wide background synchronization of personnel metrics is currently operational.</p>
                </div>
                <div className="mt-10 relative z-10">
                   <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <div className="h-full bg-white w-2/3 animate-pulse shadow-[0_0_10px_white]" />
                   </div>
                   <div className="flex justify-between items-center mt-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">PROTOCOL 88-X</span>
                      <Shield className="size-4 opacity-40" />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </HRPortalChrome>
  )
}
