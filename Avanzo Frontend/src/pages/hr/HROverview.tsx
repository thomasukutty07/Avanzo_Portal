import { useEffect, useState } from "react"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import { Card, CardContent } from "@/components/ui/card"
import {
  Users,
  UserPlus,
  CheckCircle2,
  ClipboardList,
  Plus,
} from "lucide-react"
import type { LeaveRequest, User } from "@/types"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from 'recharts'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HRPortalChrome } from "@/components/portal/hr/HRPortalChrome"

const attendanceData = [
  { name: 'MON', value: 75 },
  { name: 'TUE', value: 85 },
  { name: 'WED', value: 95 },
  { name: 'THU', value: 88 },
  { name: 'FRI', value: 100 },
  { name: 'SAT', value: 45 },
  { name: 'SUN', value: 30 },
]

export default function HROverview() {
  const [employeesCount, setEmployeesCount] = useState(0)
  const [recentEmployees, setRecentEmployees] = useState<User[]>([])
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const [eRes, lRes] = await Promise.all([
          api.get("/api/auth/employees/"),
          api.get("/api/leaves/requests/"),
        ])
        const allEmployees = extractResults<User>(eRes.data)
        const leaves = extractResults<LeaveRequest>(lRes.data)
        
        setEmployeesCount(allEmployees.length)
        setRecentEmployees(allEmployees.slice(0, 4))
        setPendingLeaves(
          leaves.filter((x) => x.status === "pending" || x.status === "tl_approved").slice(0, 3)
        )
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
      } finally {
        // isLoading not used
      }
    }
    load()
  }, [])

  return (
    <HRPortalChrome>
      <div className="p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Employees" 
            value={employeesCount.toLocaleString()} 
            trend="+4%" 
            icon={<Users className="size-5" />}
            iconBg="bg-violet-100 text-violet-600"
          />
          <StatCard 
            title="New Registrations" 
            value="28" 
            trend="+12%" 
            icon={<UserPlus className="size-5" />}
            iconBg="bg-blue-100 text-blue-600"
          />
          <StatCard 
            title="Attendance Today" 
            value="96.4%" 
            trend="On time" 
            icon={<CheckCircle2 className="size-5" />}
            iconBg="bg-emerald-100 text-emerald-600"
          />
          <StatCard 
            title="Leave Requests Pending" 
            value={pendingLeaves.length.toString()} 
            trend="High" 
            icon={<ClipboardList className="size-5" />}
            iconBg="bg-amber-100 text-amber-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Employee Hires */}
          <Card className="lg:col-span-2 border-none shadow-premium overflow-hidden bg-white rounded-3xl">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-6 border-b border-slate-50">
                <h2 className="font-bold text-slate-900">Recent Employee Hires</h2>
                <Button variant="link" className="text-violet-600 font-bold text-xs p-0 h-auto">View All</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                      <th className="px-6 py-4 font-bold">Employee</th>
                      <th className="px-6 py-4 font-bold">Department</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold">Join Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentEmployees.map((emp, i) => (
                      <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`size-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${['bg-orange-400', 'bg-blue-400', 'bg-emerald-400', 'bg-violet-400'][i % 4]}`}>
                              {emp.first_name[0]}{emp.last_name[0]}
                            </div>
                            <p className="text-sm font-bold text-slate-700">{emp.first_name} {emp.last_name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-500">{emp.department_name || "Engineering"}</td>
                        <td className="px-6 py-4">
                          <Badge className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold border-none shadow-none ${i === 2 ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                            {i === 2 ? 'Onboarding' : 'Active'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-400">Oct {12 + (i * 3)}, 2023</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Weekly Chart */}
          <Card className="border-none shadow-premium bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-bold text-slate-900">Attendance Weekly</h2>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last 7 Days</p>
              </div>
              
              <div className="flex-1 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                      dy={10}
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(237, 233, 254, 0.4)'}}
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold'}}
                    />
                    <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={24}>
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value === 100 ? '#7C3AED' : '#EDE9FE'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Average Rate</p>
                  <p className="text-xl font-black text-slate-900">92.4%</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Peak Day</p>
                  <p className="text-xl font-black text-slate-900">Wednesday</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leave Requests */}
          <Card className="border-none shadow-premium bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-6">
                <h2 className="font-bold text-slate-900">Leave Requests</h2>
                <Button variant="link" className="text-violet-600 font-bold text-xs p-0 h-auto">Manage</Button>
              </div>
              <div className="px-6 pb-6 space-y-4">
                {pendingLeaves.length > 0 ? pendingLeaves.map((leave) => (
                  <div key={leave.id} className="flex items-center justify-between p-1">
                    <div className="flex items-center gap-4">
                      <div className="size-11 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100 bg-slate-50">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${leave.employee_name}`} alt={leave.employee_name} className="size-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{leave.employee_name}</p>
                        <p className="text-[10px] font-medium text-slate-400">{leave.leave_type_display || "Sick Leave"} • {leave.created_at ? '2 days' : 'Today'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="size-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                        <Plus className="size-4 rotate-45" />
                      </button>
                      <button className="size-8 rounded-full bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-100 hover:bg-violet-700 transition-colors">
                        <CheckCircle2 className="size-4" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="py-12 text-center">
                    <p className="text-sm text-slate-400 font-medium">No pending leave requests</p>
                  </div>
                )}
                {pendingLeaves.length > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                     <div className="flex items-center gap-3">
                       <div className="size-11 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100 bg-slate-50">
                          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Robert" alt="Robert" className="size-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Robert Fox</p>
                          <p className="text-[10px] font-medium text-slate-400">Vacation • 5 days</p>
                        </div>
                     </div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">2h Ago</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Internal Announcements */}
          <Card className="border-none shadow-premium bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-6">
                <h2 className="font-bold text-slate-900">Internal Announcements</h2>
                <Button variant="secondary" className="bg-violet-50 hover:bg-violet-100 text-violet-600 font-bold text-[10px] h-8 px-4 rounded-lg uppercase tracking-tight">Post New</Button>
              </div>
              <div className="px-6 pb-6 space-y-6">
                <AnnouncementItem 
                  title="Annual Company Retreat 2024"
                  description="Pack your bags! Our annual retreat location has been chosen. Check the policy for travel reimbursements and itinerary details."
                  date="Oct 24, 2023"
                  comments={12}
                  iconBg="bg-violet-50 text-violet-600"
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="M14 9l-9 13" /><path d="M20 3.5a2.1 2.1 0 0 0-1.4.6l-6.3 6.3a2.1 2.1 0 1 0 3 3l6.3-6.3a2.1 2.1 0 0 0-.6-3.6Z" /><path d="m15 13 4 4" /><path d="m11.5 9.5 4 4" /><path d="M16 11l-4 4" /></svg>}
                />
                <AnnouncementItem 
                  title="Updated Health Benefits Policy"
                  description="We have expanded our mental health coverage starting next month. View the updated documentation in the HR portal."
                  date="Oct 22, 2023"
                  comments={5}
                  iconBg="bg-blue-50 text-blue-600"
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="M9 12h6" /><path d="M12 9v6" /></svg>}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </HRPortalChrome>
  )
}

function StatCard({ title, value, trend, icon, iconBg }: { title: string, value: string, trend: string, icon: React.ReactNode, iconBg: string }) {
  return (
    <Card className="border-none shadow-premium bg-white rounded-3xl overflow-hidden group hover:-translate-y-1 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-2xl ${iconBg} shadow-sm group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          <Badge className="bg-emerald-50 text-emerald-600 border-none shadow-none text-[10px] font-bold px-2 py-0.5 rounded-lg">
            {trend}
          </Badge>
        </div>
        <div className="mt-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function AnnouncementItem({ title, description, date, comments, icon, iconBg }: { title: string, description: string, date: string, comments: number, icon: React.ReactNode, iconBg: string }) {
  return (
    <div className="flex gap-4 group">
      <div className={`shrink-0 size-10 rounded-xl flex items-center justify-center ${iconBg} group-hover:scale-105 transition-transform`}>
        {icon}
      </div>
      <div className="space-y-1.5 flex-1 pb-6 border-b border-slate-50 last:border-0 last:pb-0">
        <h3 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-violet-600 transition-colors uppercase tracking-tight">{title}</h3>
        <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-2">{description}</p>
        <div className="flex items-center gap-4 pt-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-3"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            {date}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            {comments} Comments
          </div>
        </div>
      </div>
    </div>
  )
}
