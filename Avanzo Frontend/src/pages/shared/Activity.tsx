import { useState, useEffect } from "react"
import { Search, Bell, Filter, MoreVertical, Clock, CheckCircle2, AlertCircle, Activity as ActivityIcon, User, ChevronDown, Terminal } from "lucide-react"
import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import { 
  isTechnicalEmployeeTrack, 
  isCyberSecurityEmployeeTrack 
} from "@/lib/employeeTrack"
import { CyberSecurityPortalLayout } from "@/components/portal/cyber_security/CyberSecurityPortalLayout"
import { TechnicalPortalLayout } from "@/components/portal/technical/TechnicalPortalLayout"

export default function ActivityPage() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActivity() {
      try {
        setLoading(true)
        const res = await api.get("/api/activity/feed/")
        setActivities(extractResults(res.data))
      } catch (e) {
        console.error("Failed to fetch activity", e)
        toast.error("Could not load system activity feed.")
      } finally {
        setLoading(false)
      }
    }
    fetchActivity()
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

  const getEventIconColor = (type: string) => {
    if (type.includes("completed") || type.includes("approved")) return "text-emerald-500 bg-emerald-50"
    if (type.includes("rejected") || type.includes("rejected")) return "text-rose-500 bg-rose-50"
    if (type.includes("created")) return "text-blue-500 bg-blue-50"
    return "text-violet-600 bg-violet-50"
  }

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="size-10 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Scanning Logs...</p>
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
              Audit Logs
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              A comprehensive history of all system events and user actions.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                <input
                  className="w-64 bg-white border border-slate-100 rounded-2xl pl-11 pr-4 py-3 text-[12px] font-bold text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:border-violet-200 transition-all placeholder:text-slate-300"
                  placeholder="Filter by actor or event..."
                />
             </div>
             <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[11px] font-black shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest text-slate-600">
                <Filter className="h-4 w-4" />
                All Events
                <ChevronDown className="h-3 w-3 ml-1" />
             </button>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
           <div className="p-8 border-b border-slate-50 bg-slate-50/20 flex items-center gap-3">
              <Terminal className="size-5 text-slate-400" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Real-time Stream</h3>
           </div>
           
           <div className="divide-y divide-slate-50">
              {activities.length > 0 ? activities.map((event, i) => (
                <div key={event.id || i} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-all">
                   <div className="flex items-start gap-6">
                      <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${getEventIconColor(event.event_type)}`}>
                         <ActivityIcon className="size-5" />
                      </div>
                      <div className="space-y-1">
                         <h4 className="text-sm font-black text-slate-900 tracking-tight">{event.title}</h4>
                         <p className="text-xs text-slate-500 font-medium leading-relaxed">{event.detail}</p>
                         <div className="flex flex-wrap items-center gap-4 mt-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <User className="size-3" />
                               {event.actor_name}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <Clock className="size-3" />
                               {new Date(event.timestamp).toLocaleString()}
                            </span>
                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-0.5 border-slate-100 text-slate-400 bg-slate-50/50">
                               {event.event_type_display}
                            </Badge>
                         </div>
                      </div>
                   </div>
                   
                   {event.metadata && Object.keys(event.metadata).length > 0 && (
                     <button className="text-[10px] font-black text-violet-600 hover:text-violet-800 uppercase tracking-widest transition-colors flex items-center gap-2">
                        View Metadata
                        <ChevronDown className="size-3" />
                     </button>
                   )}
                </div>
              )) : (
                <div className="p-24 flex flex-col items-center justify-center text-center">
                   <div className="size-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                      <ActivityIcon className="size-8" />
                   </div>
                   <p className="text-lg font-bold text-slate-900">No activity logged yet</p>
                   <p className="text-sm text-slate-400 mt-2">The system will log events as they happen across the organization.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </PageWrapper>
  )
}
