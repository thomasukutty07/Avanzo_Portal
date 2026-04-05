import { TeamLeadChrome } from "@/components/portal/teamlead/TeamLeadChrome"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { 
  ClipboardList, 
  CheckCircle2, 
  Zap, 
  CalendarDays, 
  AlertTriangle, 
  MessageSquare, 
  Flag, 
  Plus
} from "lucide-react"

const STATS = [
  { label: "Active Tasks", value: "24", sub: "+12%", color: "blue", icon: ClipboardList },
  { label: "Completed Tasks", value: "142", sub: "Overall", color: "green", icon: CheckCircle2 },
  { label: "Team Productivity", value: "94%", sub: "+2%", color: "primary", icon: Zap },
  { label: "Project Deadlines", value: "3 Upcoming", sub: "Critical: Project Alpha", color: "orange", icon: CalendarDays },
]

const ACTIVITIES = [
  { user: "Sarah Miller", action: "completed UI Review", time: "10 minutes ago", icon: <CheckCircle2 className="text-[10px] text-white" />, badgeColor: "bg-green-500", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHKGI4TKnniQXUa6O_I2UiTEBPOSnzJWzfL3YZetsRTBCHSs1iOzf3O7eVZCCKp8MdBtA95rO1d3CiP86nseP7h3lNanxUdtCur6LxBMb_nDiKgSUQSbkx_hnqfGjnsNa9QfNq2RkiRFVkPkb-tUtKNq1-MOu02iQuc8IrK-04ZUVCXEgVv2UWo5nCy1A4gFftfVqLDwlamNVryFcEE_AzDt1b3APrNzc41XmDgpWVPZfyMhlBpODVQH3xXCAN0BCW3Z47Z6-igmE" },
  { user: "James Chen", action: "commented on Database API", time: "45 minutes ago", icon: <MessageSquare className="text-[10px] text-white" />, badgeColor: "bg-blue-500", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTM-hZ-TaGxo4agsgbQt33_kGRmdMl-t5bbaWSTroBPQ6zP0VfHBGsLaLB3zlGizeBFHoMJlVEGc22qx2I-mtlsmwKybqVvXUOKhmFFii3o1qscQmyMnNZwH90PetxFTpi7SBCPZcL6boNvopI4CCxpLJdNVxSUU8vIBXUD13x-56vltnqWXh-8FIi5tijXwAe5Fg4qUqqmagRAwsHQhWDa3wrjYIbfyo_B2ESYN4NhsDP-x-98UpMNQxillkkzfG2ZLDxeBRIZbA" },
  { user: "Mike Ross", action: "updated status of Q3 Planning", time: "2 hours ago", icon: <Flag className="text-[10px] text-white" />, badgeColor: "bg-orange-500", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDojy_q_3sli6wsyTGnyhDCYPVFpSjiP5AAY_IatQ5YAcfLO7vu83Rqor5azzhHmRtGRFPGFoYjdq7xcyzrgd7ZYiAJ7Eg5P2_naTitmyebIA29DvgPfvsEH0tj8bOYOy4egnFI-FXxlO-GTVR2bEL_RcYAZGo2nNi6xLQR9qH4WZLmWAxNO0-QoP2acWrpD1QTUnyZj89TgDSOHlB-8bDZKWXa7w-1UZPWgL-OMc_hU8QTq8j3QDpaZCB6gOHTUvTYvCNJkCLsBUA" },
]

export default function LeadOverview() {
  useDesignPortalLightTheme()
  const navigate = useNavigate()

  return (
    <TeamLeadChrome>
      <div className="p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <button
              key={i}
              onClick={() => toast.info(`Viewing details for ${stat.label}`)}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:scale-[1.02] active:scale-95 text-left group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${
                  stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  stat.color === 'green' ? 'bg-green-50 text-green-600' :
                  stat.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                  'bg-violet-50 text-violet-600'
                }`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  stat.sub.startsWith('+') ? 'text-green-500 bg-green-50' : 'text-slate-400 bg-slate-50'
                }`}>
                  {stat.sub}
                </span>
              </div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-900">{stat.value}</h3>
              {stat.label === "Project Deadlines" && (
                <div className="mt-2 text-[10px] text-orange-600 font-bold flex items-center gap-1 group-hover:animate-pulse uppercase tracking-[0.02em]">
                  <AlertTriangle className="h-3 w-3" />
                  CRITICAL: PROJECT ALPHA
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Progress */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-bold text-lg">Project Progress</h4>
              <select 
                onChange={() => toast.info("Timespan updated")}
                className="text-sm bg-slate-100 border-none rounded-lg focus:ring-violet-600/50 cursor-pointer"
              >
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
              </select>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-3 px-2">
              {[
                { h: "h-2/3", label: "W1", opacity: "bg-violet-600/40" },
                { h: "h-3/4", label: "W2", opacity: "bg-violet-600/50" },
                { h: "h-4/5", label: "W3", opacity: "bg-violet-600/60" },
                { h: "h-full", label: "W4", opacity: "bg-violet-600" },
              ].map((bar, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                  <div className={`w-full bg-slate-100 rounded-t-lg relative overflow-hidden transition-all group-hover:bg-slate-200 cursor-help ${bar.label === 'W4' ? 'h-56' : i === 0 ? 'h-32' : i === 1 ? 'h-48' : 'h-40'}`}>
                    <div className={`absolute bottom-0 w-full transition-all group-hover:brightness-110 ${bar.opacity} ${bar.h}`}></div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${bar.label === 'W4' ? 'text-violet-600' : 'text-slate-400'}`}>
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-100">
              {[
                { name: "Project Alpha", val: 82, color: "bg-violet-600" },
                { name: "Project Beta", val: 45, color: "bg-violet-600/60" },
                { name: "Gamma Design", val: 96, color: "bg-green-500" },
              ].map((p, i) => (
                <div key={i} className="group cursor-pointer" onClick={() => toast.info(`Viewing status for ${p.name}`)}>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors group-hover:text-violet-600">{p.name}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-slate-900">{p.val}%</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`${p.color} h-full transition-all duration-1000`} style={{ width: `${p.val}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-6 border-b border-slate-100">
              <h4 className="font-bold text-lg">Team Activity</h4>
            </div>
            
            <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[480px]">
              {ACTIVITIES.map((act, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer hover:translate-x-1 transition-transform">
                  <div className="relative shrink-0">
                    <div className="size-10 rounded-full bg-slate-100 overflow-hidden ring-2 ring-white">
                      <img alt={act.user} className="size-full object-cover" src={act.img} />
                    </div>
                    <span className={`absolute -bottom-1 -right-1 size-5 ${act.badgeColor} border-2 border-white rounded-full flex items-center justify-center`}>
                      {act.icon}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-bold text-slate-900 hover:text-violet-600 transition-colors">{act.user}</span>
                      <span className="text-slate-600"> {act.action}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">{act.time}</p>
                  </div>
                </div>
              ))}
              
              <div className="flex gap-4 group cursor-pointer hover:translate-x-1 transition-transform">
                <div className="relative shrink-0">
                  <div className="size-10 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm">JD</div>
                  <span className="absolute -bottom-1 -right-1 size-5 bg-violet-600 border-2 border-white rounded-full flex items-center justify-center">
                    <Plus className="text-[10px] text-white h-3 w-3" />
                  </span>
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-bold text-slate-900 transition-colors">Jane Doe</span>
                    <span className="text-slate-600"> joined the Mobile Team</span>
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">5 hours ago</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => toast.info("Opening full activity feed...")}
              className="p-4 text-center text-sm font-bold text-violet-600 hover:bg-slate-50 transition-colors border-t border-slate-100 rounded-b-xl"
            >
              View All Activity
            </button>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-bold text-lg">Active Project Tasks</h4>
            <button 
              onClick={() => navigate("/tasks")}
              className="text-sm font-bold text-violet-600 hover:underline"
            >
              Manage Tasks
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Task Name</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: "Client Dashboard Redesign", priority: "High", date: "Oct 24, 2023", status: "In Progress", statusColor: "bg-blue-500" },
                  { name: "Database Optimization", priority: "Medium", date: "Oct 28, 2023", status: "Pending Review", statusColor: "bg-orange-500" },
                  { name: "Mobile App Prototypes", priority: "Low", date: "Nov 02, 2023", status: "Not Started", statusColor: "bg-slate-300" },
                ].map((task, i) => (
                  <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => toast.info(`Viewing details for: ${task.name}`)}>
                    <td className="px-6 py-4 font-bold text-sm text-slate-900 group-hover:text-violet-600 transition-colors">{task.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].slice(0, i % 2 + 1).map((_, j) => (
                          <div key={j} className="size-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden ring-1 ring-slate-100">
                            <img alt="team member" src={`https://i.pravatar.cc/100?img=${j + i * 5}`} />
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
                        task.priority === 'High' ? 'bg-red-50 text-red-600' :
                        task.priority === 'Medium' ? 'bg-orange-50 text-orange-600' :
                        'bg-green-50 text-green-600'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">{task.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${task.statusColor}`}></span>
                        <span className="text-xs font-bold text-slate-700">{task.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </TeamLeadChrome>
  )
}
