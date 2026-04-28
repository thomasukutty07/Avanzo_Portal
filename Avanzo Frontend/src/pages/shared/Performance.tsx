import { useState, useEffect } from "react"
import { TrendingUp, BarChart3, Award, Calendar, ChevronRight, Activity, Zap, Shield, Target } from "lucide-react"
import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/context/AuthContext"
import { TechnicalPortalLayout } from "@/components/portal/technical/TechnicalPortalLayout"
import { 
  isTechnicalEmployeeTrack, 
  isCyberSecurityEmployeeTrack 
} from "@/lib/employeeTrack"
import { CyberSecurityPortalLayout } from "@/components/portal/cyber_security/CyberSecurityPortalLayout"

export default function PerformancePage() {
  const { user } = useAuth()
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [liveScore, setLiveScore] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPerformance() {
      try {
        setLoading(true)
        const [sRes, lRes] = await Promise.all([
          api.get("/api/performance/history/"),
          api.get("/api/performance/my-score/")
        ])
        setSnapshots(extractResults(sRes.data))
        setLiveScore(lRes.data)
      } catch (e) {
        console.error("Failed to fetch performance data", e)
        toast.error("Could not load your performance profile.")
      } finally {
        setLoading(false)
      }
    }
    fetchPerformance()
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

  const scoreMetrics = [
    { label: "Attendance", value: Number(liveScore?.attendance_score ?? 0), icon: Calendar, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Delivery", value: Number(liveScore?.delivery_score ?? 0), icon: Zap, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Quality", value: Number(liveScore?.quality_score ?? 0), icon: Shield, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Reliability", value: Number(liveScore?.reliability_score ?? 0), icon: Target, color: "text-orange-500", bg: "bg-orange-50" },
  ]

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="size-10 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Evaluating Performance...</p>
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
              Performance Review
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              Real-time analytics and historical performance tracking.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[11px] font-black shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest text-slate-600">
                <Calendar className="h-4 w-4" />
                This Month
             </button>
             <button className="flex items-center gap-2 px-6 py-3 bg-violet-600 border border-violet-500 rounded-2xl text-[11px] font-black shadow-lg shadow-violet-600/20 hover:bg-violet-700 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-white">
                <BarChart3 className="h-4 w-4" />
                Detailed Report
             </button>
          </div>
        </div>

        {/* Live Score Radial/Card */}
        <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm flex flex-col lg:flex-row items-center gap-16 overflow-hidden relative">
           <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
              <TrendingUp className="size-64" />
           </div>
           
           <div className="relative">
              <div className="size-48 rounded-full border-[12px] border-slate-50 flex flex-col items-center justify-center relative shadow-inner">
                 <div 
                   className="absolute inset-[-12px] rounded-full border-[12px] border-violet-600 border-t-transparent animate-[spin_3s_linear_infinite]" 
                   style={{ 
                     clipPath: `polygon(50% 50%, 0 0, ${Number(liveScore?.overall_score ?? 0)}% 0, 100% 0, 100% 100%, 0 100%, 0 0)`,
                     transform: `rotate(${Number(liveScore?.overall_score ?? 0) * 3.6}deg)`
                   }} 
                 />
                 <p className="text-6xl font-black text-slate-900 leading-none tracking-tighter">{Math.round(Number(liveScore?.overall_score ?? 0))}</p>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Overall Score</p>
              </div>
           </div>

           <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
              {scoreMetrics.map((m) => (
                <div key={m.label} className="space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className={`size-8 rounded-xl ${m.bg} ${m.color} flex items-center justify-center`}>
                            <m.icon className="size-4" />
                         </div>
                         <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{m.label}</span>
                      </div>
                      <span className="text-[13px] font-black text-slate-900">{Math.round(m.value)}%</span>
                   </div>
                   <Progress value={m.value} className="h-1.5 bg-slate-50" />
                </div>
              ))}
           </div>
        </div>

        {/* Historical Snapshots */}
        <div className="space-y-8">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight font-headline flex items-center gap-3">
                 <Activity className="size-5 text-slate-400" />
                 Historical Snapshots
              </h3>
              <button className="text-[10px] font-black text-violet-600 hover:text-violet-800 uppercase tracking-widest transition-colors">
                 View Archive
              </button>
           </div>

           <div className="grid grid-cols-1 gap-4">
              {snapshots.length > 0 ? snapshots.map((s) => (
                <div key={s.id} className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all group">
                   <div className="flex items-center gap-6">
                      <div className="size-12 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 font-black">
                         <span className="text-[10px] leading-none uppercase">{new Date(s.period_start).toLocaleDateString('en-US', { month: 'short' })}</span>
                         <span className="text-lg leading-none mt-0.5">{new Date(s.period_start).getDate()}</span>
                      </div>
                      <div>
                         <p className="text-sm font-black text-slate-900 tracking-tight">
                            {new Date(s.period_start).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {new Date(s.period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                         </p>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {s.period_type} Snapshot • {Number(s.overall_score).toFixed(1)} Overall
                         </p>
                      </div>
                   </div>

                   <div className="flex items-center gap-10">
                      <div className="flex items-center gap-4">
                         <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rank</span>
                            <span className="text-sm font-black text-slate-900">#{s.rank || 'N/A'}</span>
                         </div>
                         <div className="h-6 w-px bg-slate-100" />
                         <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Growth</span>
                            <span className="text-sm font-black text-emerald-500">+2.4%</span>
                         </div>
                      </div>
                      <button className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-violet-600 group-hover:text-white transition-all">
                         <ChevronRight className="size-4" />
                      </button>
                   </div>
                </div>
              )) : (
                <div className="bg-white rounded-[2.5rem] border border-dashed border-slate-200 p-20 flex flex-col items-center justify-center text-center">
                   <div className="size-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                      <Award className="size-8" />
                   </div>
                   <p className="text-lg font-bold text-slate-900">No snapshots yet</p>
                   <p className="text-sm text-slate-400 mt-2">Performance snapshots are generated at the end of each review period.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </PageWrapper>
  )
}
