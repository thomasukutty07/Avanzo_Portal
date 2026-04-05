import { 
  Clock, 
  MoreVertical, 
  Plus, 
  Search, 
  Filter,
  CheckCircle2,
  Timer,
  ChevronRight,
  LayoutGrid,
  List
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const STATS = [
  { label: "Total Tasks", value: "24", sub: "Currently assigned", color: "text-slate-900" },
  { label: "In Progress", value: "08", sub: "Active work", color: "text-violet-600" },
  { label: "Completed", value: "12", sub: "Past 7 days", color: "text-emerald-500" },
  { label: "High Priority", value: "04", sub: "Requires attention", color: "text-red-500" },
]

const TASKS = [
  {
    id: "SEC-TASK-102",
    title: "Audit LDAP Server Logs",
    description: "Perform a deep dive into LDAP access logs for the last 48 hours to identify suspicious binds.",
    priority: "CRITICAL",
    priorityColor: "text-red-600 bg-red-50 border-red-100",
    status: "In Progress",
    statusIcon: Timer,
    progress: 65,
    dueDate: "Today, 17:00",
    assignee: "M. Lopez"
  },
  {
    id: "SEC-TASK-098",
    title: "Update Firewall Rules",
    description: "Apply new egress filtering rules for the production DMZ based on the approved change request #442.",
    priority: "HIGH",
    priorityColor: "text-orange-600 bg-orange-50 border-orange-100",
    status: "Pending",
    statusIcon: Clock,
    progress: 0,
    dueDate: "Tomorrow",
    assignee: "K. Wright"
  },
  {
    id: "SEC-TASK-115",
    title: "Phishing Drill Review",
    description: "Compile and analyze results from the 'Operation Hook' phishing simulation for the HR department.",
    priority: "MEDIUM",
    priorityColor: "text-violet-600 bg-violet-50 border-violet-100",
    status: "In Progress",
    statusIcon: Timer,
    progress: 30,
    dueDate: "Oct 12, 2024",
    assignee: "S. Chen"
  },
  {
    id: "SEC-TASK-084",
    title: "Patch SSL VPN Gateway",
    description: "Apply emergency patch for CVE-2024-4422 on the primary and failover VPN concentrators.",
    priority: "CRITICAL",
    priorityColor: "text-red-600 bg-red-50 border-red-100",
    status: "Completed",
    statusIcon: CheckCircle2,
    progress: 100,
    dueDate: "Completed Oct 01",
    assignee: "M. Lopez"
  }
]

export default function CyberSecurityTasksPage() {
  return (
    <div className="space-y-8 pt-4 pb-12 min-h-screen font-display">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase italic font-headline">My Tasks</h1>
          <p className="text-slate-500 mt-2 font-medium italic">Manage and track your assigned CyberSecurity operations tasks.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-violet-600" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="h-12 w-64 bg-white border border-slate-100 rounded-xl pl-12 pr-4 text-sm font-medium outline-none focus:ring-4 focus:ring-violet-600/5 focus:border-violet-100 transition-all"
            />
          </div>
          <Button variant="outline" className="h-12 w-12 p-0 border-slate-100 bg-white hover:bg-slate-50 rounded-xl">
             <Filter className="size-4 text-slate-400" />
          </Button>
          <Button className="bg-violet-600 hover:bg-violet-700 text-white font-black h-12 px-6 rounded-xl shadow-lg shadow-violet-600/20 active:scale-95 transition-all text-sm uppercase tracking-widest">
             <Plus className="size-4 mr-2" />
             Create Task
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((s, i) => (
          <Card key={i} className="border-none shadow-sm shadow-slate-100 rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-7">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 leading-none">{s.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className={`text-4xl font-black ${s.color} tracking-tight font-headline`}>{s.value}</h3>
              </div>
              <p className="text-[10px] font-bold text-slate-300 mt-2 uppercase tracking-tight italic">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tasks Controls */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
        <div className="flex items-center gap-8">
           {['All Tasks', 'Assigned to Me', 'Team Tasks'].map((tab, i) => (
             <button 
               key={tab} 
               className={`text-[11px] font-black uppercase tracking-[0.2em] relative pb-4 transition-colors font-headline ${i === 1 ? 'text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
             >
               {tab}
               {i === 1 && <div className="absolute bottom-0 left-0 w-full h-1 bg-violet-600 rounded-full" />}
             </button>
           ))}
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
           <Button variant="ghost" className="h-8 w-8 p-0 bg-white shadow-sm border border-slate-100">
              <List className="size-4 text-violet-600" />
           </Button>
           <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600">
              <LayoutGrid className="size-4" />
           </Button>
        </div>
      </div>

      {/* Task Cards */}
      <div className="space-y-4">
        {TASKS.map((task, i) => (
          <Card key={i} className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Title and Badge */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center gap-3">
                     <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest border ${task.priorityColor}`}>
                       {task.priority}
                     </span>
                     <span className="text-[10px] font-bold text-slate-300 tabular-nums uppercase">{task.id}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-violet-700 transition-colors tracking-tight leading-none uppercase italic font-headline">{task.title}</h3>
                  <p className="text-[12px] text-slate-500 font-medium line-clamp-1 italic">{task.description}</p>
                </div>

                {/* Status and Progress */}
                <div className="lg:col-span-4 flex items-center gap-12">
                   <div className="space-y-3 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <task.statusIcon className={`size-4 ${task.status === 'In Progress' ? 'text-violet-600 animate-pulse' : task.status === 'Completed' ? 'text-emerald-500' : 'text-slate-300'}`} />
                        <span className={`text-[11px] font-black uppercase tracking-widest ${task.status === 'In Progress' ? 'text-violet-700' : 'text-slate-500'}`}>{task.status}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${task.status === 'Completed' ? 'bg-emerald-500' : 'bg-violet-600'} transition-all duration-1000`} 
                          style={{ width: `${task.progress}%` }} 
                        />
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Due Date</p>
                      <p className="text-[12px] font-black text-slate-900 group-hover:text-violet-700 transition-colors uppercase tracking-tight italic font-headline">{task.dueDate}</p>
                   </div>
                </div>

                {/* Assignee and Action */}
                <div className="lg:col-span-3 flex items-center justify-between pl-6 border-l border-slate-50">
                   <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-[11px] font-black text-slate-400 border border-slate-100 group-hover:border-violet-100 group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors uppercase italic shadow-sm">
                        {task.assignee.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-[12px] font-black text-slate-900 leading-none group-hover:text-violet-700 transition-colors uppercase italic font-headline">{task.assignee}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Assigned Analyst</p>
                      </div>
                   </div>
                   <Button variant="ghost" className="text-slate-200 hover:text-slate-400 group-hover:text-slate-700">
                     <MoreVertical className="size-5" />
                   </Button>
                </div>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center pt-8">
         <button className="flex items-center gap-2 text-[10px] font-black text-violet-600 hover:text-violet-800 uppercase tracking-widest italic group">
           Load More Tasks
           <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
         </button>
      </div>

    </div>
  )
}
