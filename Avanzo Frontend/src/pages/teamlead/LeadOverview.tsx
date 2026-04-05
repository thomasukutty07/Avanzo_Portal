import { TeamLeadChrome } from "@/components/portal/teamlead/TeamLeadChrome"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { attendanceService } from "@/services/attendance"
import { leavesService } from "@/services/leaves"
import { projectsService } from "@/services/projects"
import { toast } from "sonner"
import { 
  ClipboardList, 
  CheckCircle2, 
  Zap, 
  CalendarDays,
  AlertTriangle, 
  Loader2,
  Clock,
  Check,
  XCircle,
  Calendar
} from "lucide-react"

export default function LeadOverview() {
  useDesignPortalLightTheme()
  const navigate = useNavigate()
  const [feed, setFeed] = useState<any[]>([])
  const [approvals, setApprovals] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [feedData, leaveData, taskData, projectData] = await Promise.all([
        attendanceService.getTeamFeed(),
        leavesService.getLeaveRequests(),
        projectsService.getTasks(),
        projectsService.getProjects()
      ]);
      
      setFeed(Array.isArray(feedData) ? feedData : (feedData.results || []))
      setApprovals(Array.isArray(leaveData) ? leaveData.filter((r:any) => r.status === 'pending') : (leaveData.results?.filter((r:any) => r.status === 'pending') || []))
      setTasks(Array.isArray(taskData) ? taskData : (taskData.results || []))
      setProjects(Array.isArray(projectData) ? projectData : (projectData.results || []))
    } catch (error) {
      console.error("Data fetch error:", error)
      setFeed([])
      setApprovals([])
      setTasks([])
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (id: string, action: 'approve' | 'reject', name: string) => {
     try {
        if (action === 'approve') {
           await leavesService.tlApprove(id, { tl_comment: "Approved from Tactical Dashboard." })
           toast.success(`Leave request for ${name} has been synchronized.`)
        } else {
           await leavesService.rejectRequest(id, { tl_comment: "Declined due to team capacity." })
           toast.info(`Leave request for ${name} rejected.`)
        }
        fetchData()
     } catch (error) {
        toast.error("Operation failed.")
     }
  }

  const getAction = (entry: any) => {
    if (entry.clock_in_time && !entry.clock_out_time) return "clocked in"
    if (entry.clock_out_time) return "clocked out"
    return "intent logged"
  }

  const pendingTasks = tasks.filter(t => t.status !== 'completed').length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const criticalTasks = tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length

  const STATS = [
    { label: "Active Directives", value: pendingTasks.toString(), sub: "Tactical Load", color: "blue", icon: ClipboardList },
    { label: "Completed Objectives", value: completedTasks.toString(), sub: "Mission Total", color: "green", icon: CheckCircle2 },
    { label: "Critical Support", value: criticalTasks.toString(), sub: "Immediate Response", color: "orange", icon: Zap },
    { label: "Active Projects", value: projects.length.toString(), sub: "Operational Reach", color: "primary", icon: CalendarDays },
  ]

  return (
    <TeamLeadChrome>
      <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
        <header>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 font-headline leading-none uppercase">Operational Intelligence</h2>
          <p className="text-sm font-bold text-slate-400 mt-3 uppercase tracking-widest leading-none">Real-time team synchronization active</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <button
              key={i}
              onClick={() => toast.info(`Viewing analytics for ${stat.label}`)}
              className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] text-left group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${
                  stat.color === 'blue' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                  stat.color === 'green' ? 'bg-green-50 text-green-600 border border-green-100' :
                  stat.color === 'orange' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                  'bg-violet-50 text-violet-600 border border-violet-100'
                }`}>
                  <stat.icon className="size-6 stroke-[3px]" />
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider text-slate-400 bg-slate-50 border border-slate-100/50`}>
                  {stat.sub}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] leading-none">{stat.label}</p>
              <h3 className="text-4xl font-black mt-3 text-slate-900 font-headline tabular-nums tracking-tight">{stat.value}</h3>
              {stat.color === "orange" && criticalTasks > 0 && (
                <div className="mt-4 text-[9px] text-orange-600 font-black flex items-center gap-1.5 animate-pulse uppercase tracking-[0.1em]">
                  <AlertTriangle className="size-3.5" />
                  SECTOR ALERT: CRITICAL LOAD
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Project Progress */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm flex flex-col hover:shadow-xl transition-all duration-500">
            <div className="flex items-center justify-between mb-10">
              <h4 className="font-black text-xl text-slate-900 font-headline tracking-tight uppercase">Strategic Deployment</h4>
              <button 
                onClick={() => toast.info("Archive access locked.")}
                className="text-[11px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-100 hover:bg-white hover:text-violet-600 transition-all shadow-sm"
              >
                Current Portfolio
              </button>
            </div>
            
            <div className="flex-1 space-y-10">
               {projects.length === 0 && !loading ? (
                 <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                    <Zap className="size-10 text-slate-200 mb-4" />
                    <p className="text-[11px] font-black uppercase tracking-[0.2em]">No Active Strategic Projects</p>
                 </div>
               ) : (
                 projects.slice(0, 3).map((p, i) => (
                   <div key={i} className="group cursor-pointer" onClick={() => toast.info(`Syncing project metadata: ${p.name}`)}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="space-y-1">
                           <p className="text-slate-900 text-[15px] font-black uppercase tracking-tight group-hover:text-violet-600 transition-colors leading-none">{p.name}</p>
                           <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest opacity-80">{p.client_name || 'Internal Directive'}</p>
                        </div>
                        <span className="text-xl font-black font-headline tabular-nums text-slate-900 leading-none">82%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 group-hover:border-violet-100 transition-colors shadow-inner">
                        <div 
                          className="bg-violet-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(124,58,237,0.3)]" 
                          style={{ width: `${82}%` }} 
                        />
                      </div>
                   </div>
                 ))
               )}
            </div>

            <button 
              onClick={() => navigate("/projects")}
              className="mt-12 p-3 text-center text-[10px] font-black text-violet-600 hover:bg-violet-50 transition-all border border-violet-100 rounded-2xl uppercase tracking-[0.2em]"
            >
              Access Global Portfolio
            </button>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden hover:shadow-xl transition-all duration-500">
            <div className="p-10 border-b border-slate-50">
              <h4 className="font-black text-xl text-slate-900 font-headline tracking-tight uppercase">Tactical Feed</h4>
            </div>
            
            <div className="flex-1 p-10 space-y-10 overflow-y-auto max-h-[500px] scrollbar-hide">
              {loading ? (
                 <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Loader2 className="size-8 animate-spin text-violet-600 mb-6" />
                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] leading-relaxed">Decrypting Intelligence<br/>Network...</p>
                 </div>
              ) : feed.length > 0 ? (
                feed.map((entry, i) => (
                  <div key={i} className="flex gap-6 group cursor-pointer hover:translate-x-1 transition-transform">
                    <div className="relative shrink-0">
                      <div className="size-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center ring-4 ring-white uppercase font-black text-slate-400 shadow-sm group-hover:bg-violet-600 group-hover:text-white transition-all">
                        {entry.employee_name?.split(' ').map((n: any) => n[0]).join('')}
                      </div>
                      <span className={`absolute -bottom-1 -right-1 size-6 ${entry.clock_in_time ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-amber-500 shadow-amber-500/20'} border-4 border-white rounded-2xl flex items-center justify-center shadow-lg transition-all group-hover:scale-110`}>
                        {entry.clock_in_time ? <CheckCircle2 className="size-3 text-white" /> : <Clock className="size-3 text-white" />}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] leading-tight mb-2">
                        <span className="font-black text-slate-900 group-hover:text-violet-600 transition-colors uppercase tracking-tight">{entry.employee_name}</span>
                        <span className="text-slate-400 font-bold ml-1.5 opacity-60"> {getAction(entry)}</span>
                      </p>
                      <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest flex items-center gap-2 opacity-80">
                        <Clock className="size-3.5" />
                        {entry.clock_in_time ? `${entry.clock_in_time}` : 'Operational Log'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 opacity-40">
                   <Zap className="size-10 text-slate-200 mx-auto mb-4" />
                   <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">No Recent Tactical Movements</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => toast.info("Opening secure sync logs...")}
              className="p-6 text-center text-[11px] font-black text-violet-600 hover:bg-slate-50 transition-all border-t border-slate-50 uppercase tracking-[0.2em]"
            >
              Access Intelligence Logs
            </button>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden hover:shadow-xl transition-all duration-500">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between">
              <h4 className="font-black text-xl text-slate-900 font-headline tracking-tight uppercase">Personnel Actions</h4>
              {approvals.length > 0 && (
                 <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest border border-amber-100 shadow-sm">
                   {approvals.length} ACTIVE
                 </span>
              )}
            </div>
            
            <div className="flex-1 p-10 space-y-8 overflow-y-auto max-h-[500px] scrollbar-hide">
              {approvals.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                    <div className="size-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center mb-8 border border-slate-100 shadow-sm">
                      <CheckCircle2 className="size-10 text-slate-100" />
                    </div>
                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">Queue Synchronized</p>
                 </div>
              ) : approvals.map((req, i) => (
                <div key={i} className="p-8 rounded-3xl border border-slate-100 bg-slate-50/20 space-y-6 transition-all hover:bg-white hover:shadow-xl group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-600/0 group-hover:bg-violet-600 transition-all" />
                  <div className="flex gap-5">
                    <div className="size-14 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-sm text-slate-300 border border-slate-100 uppercase ring-4 ring-slate-50/50 group-hover:bg-violet-600 group-hover:text-white transition-all">
                       {req.employee_name?.split(' ').map((n:any) => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="text-[15px] font-black text-slate-900 leading-tight uppercase tracking-tight group-hover:text-violet-600 transition-colors mb-1.5">{req.employee_name}</p>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-white px-2.5 py-1 rounded-lg border border-slate-100/50 shadow-sm">{req.leave_type_display || req.leave_type}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-[11px] font-black text-slate-500 bg-white px-5 py-3 rounded-2xl border border-slate-100 tabular-nums shadow-sm">
                    <Calendar className="size-4 text-violet-600" />
                    <span className="opacity-80 lowercase tracking-normal">from</span> {req.start_date} <span className="opacity-80 lowercase tracking-normal">to</span> {req.end_date}
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button 
                      onClick={() => handleApproval(req.id, 'reject', req.employee_name)}
                      className="flex-1 py-4 text-[11px] font-black text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 bg-white border border-slate-100 rounded-2xl uppercase tracking-widest transition-all flex items-center justify-center gap-2.5 active:scale-95"
                    >
                      <XCircle className="size-4" />
                      Decline
                    </button>
                    <button 
                      onClick={() => handleApproval(req.id, 'approve', req.employee_name)}
                      className="flex-1 py-4 text-[11px] font-black text-white bg-violet-600 hover:bg-violet-700 rounded-2xl uppercase tracking-widest transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2.5 active:scale-95"
                    >
                      <Check className="size-4 stroke-[3px]" />
                      Authorize
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => navigate("/team")}
              className="p-6 text-center text-[10px] font-black text-slate-400 hover:text-violet-600 transition-all border-t border-slate-50 uppercase tracking-[0.2em]"
            >
              Unified Directory Hub
            </button>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-700">
          <div className="p-10 border-b border-slate-50 flex items-center justify-between">
            <h4 className="font-black text-xl text-slate-900 font-headline tracking-tight uppercase">Operational Roadmap</h4>
            <button 
              onClick={() => navigate("/tasks")}
              className="text-[11px] font-black text-violet-600 uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-3 bg-violet-50 px-5 py-2.5 rounded-xl border border-violet-100"
            >
              Intelligence Center
              <Zap className="size-3.5 fill-violet-600" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-10 py-6">Mission Objective</th>
                  <th className="px-10 py-6">Sector</th>
                  <th className="px-10 py-6">Priority</th>
                  <th className="px-10 py-6">Deadline</th>
                  <th className="px-10 py-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tasks.length === 0 && !loading ? (
                   <tr>
                     <td colSpan={5} className="px-10 py-20 text-center opacity-30">
                        <ClipboardList className="size-12 mx-auto mb-4 text-slate-200" />
                        <p className="text-[11px] font-black uppercase tracking-[0.2em]">No Operational Directives Found</p>
                     </td>
                   </tr>
                ) : tasks.slice(0, 5).map((task, i) => (
                  <tr key={i} className="group hover:bg-slate-50/30 transition-all cursor-pointer" onClick={() => toast.info(`Syncing unit metadata: ${task.title}`)}>
                    <td className="px-10 py-7">
                       <div className="flex flex-col gap-1.5 min-w-[240px]">
                         <span className="font-black text-[15px] text-slate-900 group-hover:text-violet-600 transition-colors uppercase tracking-tight leading-none truncate">{task.title}</span>
                         <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest opacity-80 leading-none">{task.project_name || 'Global Operational Unit'}</span>
                       </div>
                    </td>
                    <td className="px-10 py-7">
                       <span className="inline-flex px-3 py-1 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-lg border border-slate-100 shadow-sm">
                         {task.task_type || 'General'}
                       </span>
                    </td>
                    <td className="px-10 py-7">
                      <span className={`px-4 py-2 text-[10px] font-black rounded-xl uppercase tracking-widest border transition-all ${
                        task.priority === 'urgent' || task.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100 shadow-sm shadow-red-500/5' :
                        task.priority === 'tactical' || task.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm' :
                        'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm'
                      }`}>
                        {task.priority || 'Normal'}
                      </span>
                    </td>
                    <td className="px-10 py-7 text-[11px] font-black text-slate-400 tabular-nums uppercase tracking-widest opacity-80">
                       <div className="flex items-center gap-2">
                         <Calendar className="size-3.5" />
                         {task.due_date || 'TBD'}
                       </div>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <div className="inline-flex items-center gap-3 bg-white px-5 py-2.5 rounded-xl border border-slate-100 shadow-sm group-hover:border-violet-100 transition-colors">
                        <span className={`size-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)] ${
                           task.status === 'completed' ? 'bg-emerald-500' :
                           task.status === 'in_progress' ? 'bg-blue-500 animate-pulse' :
                           'bg-slate-300'
                        }`}></span>
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{task.status?.replace('_', ' ') || 'Registered'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tasks.length > 5 && (
             <div className="px-10 py-8 border-t border-slate-50 bg-slate-50/20 text-center">
                <button 
                  onClick={() => navigate("/tasks")}
                  className="text-[11px] font-black text-slate-400 hover:text-violet-600 transition-colors uppercase tracking-[0.2em]"
                >
                  View All {tasks.length} Operational Units
                </button>
             </div>
          )}
        </div>
      </div>
    </TeamLeadChrome>
  )
}
