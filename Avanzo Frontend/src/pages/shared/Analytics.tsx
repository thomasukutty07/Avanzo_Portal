import { useState, useEffect } from "react"
import { TrendingUp, Users, Calendar, Download, PieChart, Activity, AlertCircle } from "lucide-react"
import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { 
  isTechnicalEmployeeTrack, 
  isCyberSecurityEmployeeTrack 
} from "@/lib/employeeTrack"
import { TechnicalPortalLayout } from "@/components/portal/technical/TechnicalPortalLayout"
import { CyberSecurityPortalLayout } from "@/components/portal/cyber_security/CyberSecurityPortalLayout"

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true)
        const res = await api.get("/api/analytics/admin/dashboard/")
        setData(res.data)
      } catch (e) {
        console.error("Failed to fetch analytics", e)
        toast.error("Could not load organization analytics.")
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  const isAdmin = user?.role === "Admin"
  const isTechnical = isTechnicalEmployeeTrack(user as any)
  const isCyber = isCyberSecurityEmployeeTrack(user as any)

  const PageWrapper = ({ children }: { children: React.ReactNode }) => {
    if (isAdmin) {
      return <OrganizationAdminChrome>{children}</OrganizationAdminChrome>
    }
    if (isTechnical) {
      return <TechnicalPortalLayout>{children}</TechnicalPortalLayout>
    }
    if (isCyber) {
        return <CyberSecurityPortalLayout>{children}</CyberSecurityPortalLayout>
    }
    return (
      <div className="bg-[#fcfcfc] min-h-screen">
        {children}
      </div>
    )
  }

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="size-10 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Aggregating Data...</p>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="p-6 md:p-10 space-y-10 animate-in fade-in duration-700 min-h-screen font-display bg-[#fcfcfc] text-slate-900">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight font-headline">
              Insights & Analytics
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              Real-time organizational health and productivity metrics.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[11px] font-black shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest text-slate-600">
                <Calendar className="h-4 w-4" />
                Last 30 Days
             </button>
             <button className="flex items-center gap-2 px-6 py-3 bg-violet-600 border border-violet-500 rounded-2xl text-[11px] font-black shadow-lg shadow-violet-600/20 hover:bg-violet-700 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-white">
                <Download className="h-4 w-4" />
                Export CSV
             </button>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { label: "Attendance Rate", value: data?.attendance?.clocked_in ? Math.round((data.attendance.clocked_in / data.attendance.total_expected) * 100) + "%" : "0%", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
             { label: "Project Velocity", value: data?.projects?.overall_progress_pct ? data.projects.overall_progress_pct + "%" : "0%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
             { label: "Pending Leaves", value: data?.pending_leaves || 0, icon: Calendar, color: "text-orange-500", bg: "bg-orange-50" },
             { label: "Open Tickets", value: data?.open_tickets || 0, icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" },
           ].map((metric) => (
             <div key={metric.label} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all group">
                <div className={`size-12 rounded-2xl ${metric.bg} ${metric.color} flex items-center justify-center mb-6`}>
                   <metric.icon className="size-6" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{metric.label}</p>
                <p className="text-4xl font-black text-slate-900 tracking-tight leading-none font-headline">{metric.value}</p>
             </div>
           ))}
        </div>

        {/* Secondary Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Productivity Chart Placeholder */}
           <div className="lg:col-span-8 bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm overflow-hidden relative">
              <div className="flex items-center justify-between mb-12">
                 <h3 className="text-xl font-black text-slate-900 tracking-tight font-headline flex items-center gap-3">
                    <Activity className="size-5 text-slate-400" />
                    Productivity Heatmap
                 </h3>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                       <div className="size-2 rounded-full bg-violet-600" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="size-2 rounded-full bg-slate-100" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Previous</span>
                    </div>
                 </div>
              </div>
              
              <div className="h-64 flex items-end gap-4 px-2">
                 {[40, 70, 45, 90, 65, 80, 55, 75, 60, 85, 40, 95].map((val, i) => (
                   <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar">
                      <div className="w-full relative h-full flex flex-col justify-end">
                         <div 
                           className="w-full bg-slate-50 rounded-t-xl group-hover/bar:bg-violet-50 transition-colors" 
                           style={{ height: '100%' }} 
                         />
                         <div 
                           className="absolute bottom-0 w-full bg-violet-600/10 group-hover/bar:bg-violet-600 transition-all rounded-t-xl" 
                           style={{ height: `${val}%` }} 
                         />
                      </div>
                      <span className="text-[9px] font-black text-slate-300 group-hover/bar:text-slate-900 transition-colors uppercase tracking-widest">
                         {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                      </span>
                   </div>
                 ))}
              </div>
           </div>

           {/* Distribution Chart Placeholder */}
           <div className="lg:col-span-4 bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 tracking-tight font-headline mb-10 flex items-center gap-3">
                 <PieChart className="size-5 text-slate-400" />
                 Resource Mix
              </h3>
              
              <div className="space-y-8">
                 {[
                   { label: "Engineering", pct: 45, color: "bg-violet-600" },
                   { label: "Design", pct: 25, color: "bg-indigo-500" },
                   { label: "Marketing", pct: 15, color: "bg-blue-400" },
                   { label: "Operations", pct: 15, color: "bg-slate-200" },
                 ].map((dept) => (
                   <div key={dept.label} className="space-y-3">
                      <div className="flex items-center justify-between">
                         <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{dept.label}</span>
                         <span className="text-[11px] font-black text-slate-400">{dept.pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                         <div className={`h-full ${dept.color} rounded-full`} style={{ width: `${dept.pct}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </PageWrapper>
  )
}
