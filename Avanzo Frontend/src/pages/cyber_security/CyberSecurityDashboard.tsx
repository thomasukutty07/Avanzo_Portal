import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import {
  AlertTriangle, 
  MoreVertical,
  ShieldCheck,
  Zap,
  Plus,
  ExternalLink,
  Calendar
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { projectsService } from "@/services/projects"
import { useAuth } from "@/context/AuthContext"


export default function CyberSecurityDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [incidents, setIncidents] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Daily confirmation popup states
  const [showConfirmPopup, setShowConfirmPopup] = useState(false)
  const [confirmTask, setConfirmTask] = useState<any | null>(null)
  const [confirmStage, setConfirmStage] = useState<'prompt' | 'start'>('prompt')

  useEffect(() => {
    async function loadIncidents() {
      try {
        const [incRes, annRes] = await Promise.all([
          api.get("/api/tickets/"),
          api.get("/api/notifications/")
        ]);
        
        const rawIncidents = extractResults(incRes.data);
        const rawAnnouncements = extractResults(annRes.data);

        // Only show tech/compliance as "incidents" for this dashboard
        setIncidents(rawIncidents.filter((t: any) => t.ticket_type === "tech" || t.ticket_type === "compliance"));
        
        // Filter announcements to show only those from Admin/HR for Cyber employees
        setAnnouncements(rawAnnouncements.filter((a: any) => 
          a.created_by_role === "Admin" || a.created_by_role === "HR"
        ));

        // Daily Work Start Confirmation Check
        if (user?.id) {
          try {
            const tasksRes = await projectsService.getTasks({ assignee: user.id });
            const tasksList = Array.isArray(tasksRes) ? tasksRes : (tasksRes.results || []);
            const todayStr = new Date().toISOString().split('T')[0];
            const todayTasks = tasksList.filter((task: any) => {
              const isActive = task.status !== 'completed' && task.status !== 'resolved' && task.status !== 'closed';
              const startOk = !task.start_date || task.start_date <= todayStr;
              const dueOk = !task.due_date || task.due_date >= todayStr;
              return isActive && startOk && dueOk;
            });
            const pendingConfirm = todayTasks.find((task: any) => {
              return !localStorage.getItem(`avanzo_task_started_time_${task.id}_${todayStr}`);
            });
            if (pendingConfirm) {
              setConfirmTask(pendingConfirm);
              const confirmed = localStorage.getItem(`avanzo_task_confirmed_${pendingConfirm.id}_${todayStr}`) === "true";
              setConfirmStage(confirmed ? 'start' : 'prompt');
              setShowConfirmPopup(true);
            }
          } catch (taskErr) {
            console.error("Task confirmation check failed:", taskErr);
          }
        }

        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    }
    loadIncidents();
  }, [user]);

  const openIncidentsCount = incidents.filter(i => i.status === "open").length;
  const criticalCount = incidents.filter(i => i.status !== "resolved").length; 

  if (loading) return <div className="p-10 text-slate-400 font-bold font-headline animate-pulse text-xs">Loading dashboard...</div>;

  // Derive Stats from real data
  const STATS = [
    { 
      label: "Reported Issues", 
      value: criticalCount.toString().padStart(2, "0"), 
      sub: "Active issues", 
      icon: AlertTriangle, 
      color: "text-red-500",
      bgIcon: <AlertTriangle className="absolute -right-4 -bottom-4 size-20 text-red-500/5 rotate-12" />
    },
    { 
      label: "Open Tasks", 
      value: openIncidentsCount.toString().padStart(2, "0"), 
      sub: "Needs attention", 
      icon: Zap, 
      color: "text-violet-600",
      bgIcon: <Zap className="absolute -right-4 -bottom-4 size-20 text-violet-600/5" />
    },
    { 
      label: "Status", 
      value: criticalCount > 5 ? "High" : criticalCount > 2 ? "Med" : "Low", 
      sub: criticalCount > 0 ? "Issues found" : "All clear", 
      icon: ShieldCheck, 
      color: criticalCount > 5 ? "text-red-600" : criticalCount > 0 ? "text-amber-500" : "text-emerald-500",
      bgIcon: <ShieldCheck className="absolute -right-4 -bottom-4 size-20 text-emerald-500/5 -rotate-12" />
    },
  ]

  // Transform announcements into "Intelligence Feed"
  const BROADCASTS = announcements
    .slice(0, 5)
    .map(a => ({
      severity: "Update",
      title: a.title,
      source: a.created_by_name || "Admin",
      time: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: "bg-violet-50 text-violet-600 border-violet-100"
    }));



  return (
    <div className="space-y-6 pb-12 font-headline bg-[#fcfcfc] min-h-screen">
      {/* Page Header */}
      <div className="sticky top-[64px] z-30 -mx-6 md:-mx-10 px-6 md:px-10 py-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fcfcfc]/80 backdrop-blur-md border-b border-slate-100 transition-all">
        <div>
          <p className="text-[14px] font-black text-violet-600 mb-1">
            Cyber Security Portal
          </p>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            My Dashboard
          </h1>
          <p className="text-slate-500 mt-2 text-[15px] font-normal leading-normal">View your dashboard, see tasks, and report any issues.</p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            className="px-4 py-2 rounded-xl border-2 border-violet-100 text-violet-700 text-[11px] font-bold hover:bg-violet-50 transition-colors"
          >
            Activity logs
          </button>
          <button
            type="button"
            onClick={() => navigate("/security/incidents/create")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-[11px] font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20"
          >
            <Plus className="size-4" />
            Report an Issue
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {STATS.map((s, i) => (
          <Card key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all group relative overflow-hidden">
             {s.bgIcon}
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[14px] text-slate-400 font-semibold mb-2">{s.label}</p>
                    <div className={`size-8 rounded-lg ${s.color.replace('text-', 'bg-').replace('-600', '-50').replace('text-red-500', 'bg-red-50 text-red-600').replace('text-violet-700', 'bg-violet-50 text-violet-700').replace('text-red-600', 'bg-red-50 text-red-600').replace('text-emerald-500', 'bg-emerald-50 text-emerald-600').replace('text-amber-500', 'bg-amber-50 text-amber-600')} flex items-center justify-center`}>
                       <s.icon className="size-4" />
                    </div>
                </div>
                <p className={`text-5xl font-bold tracking-tight ${s.color} transition-colors group-hover:text-slate-900`}>{s.value}</p>
                <div className="mt-3 flex items-center justify-between">
                    <span className="text-[12px] font-bold text-slate-400">{s.sub}</span>
                    <div className="size-1.5 bg-slate-100 rounded-full" />
                </div>
             </div>
          </Card>
        ))}
      </div>

      {/* Main Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Alerts Feed */}
        <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-[480px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="size-2 bg-violet-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(139,92,246,0.4)]" />
              <h4 className="font-bold text-slate-900 text-[18px]">Announcements</h4>
            </div>
            <span className="text-[14px] font-black text-slate-400">Latest updates</span>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto pr-2 no-scrollbar">
            {BROADCASTS.length > 0 ? (
              BROADCASTS.map((broadcast, i) => (
                <div key={i} className="p-6 rounded-2xl border border-slate-50 hover:border-violet-100 hover:bg-violet-50/10 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-[8px] text-[10px] font-semibold border shadow-sm ${broadcast.color}`}>
                      {broadcast.severity}
                    </span>
                    <span className="text-[12px] font-bold text-slate-400 tabular-nums">{broadcast.time}</span>
                  </div>
                  <h5 className="text-[20px] font-bold text-slate-900 group-hover:text-violet-700 transition-colors leading-tight tracking-tight">
                    {broadcast.title}
                  </h5>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                     <p className="text-[14px] font-black text-slate-400 italic">Auth: {broadcast.source}</p>
                     <ArrowRight className="size-4 text-slate-200 group-hover:text-violet-600 transition-all" />
                  </div>
                </div>
              ))
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="size-10 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                        <ShieldCheck className="size-5 text-slate-200" />
                    </div>
                    <p className="text-xs font-bold text-slate-400">No active announcements</p>
                    <p className="text-[9px] text-slate-300 mt-1">Everything looks good</p>
                </div>
            )}
          </div>

          <button className="mt-6 w-full py-3.5 rounded-xl bg-slate-50 text-[11px] font-black text-slate-500 hover:bg-violet-50 hover:text-violet-700 transition-all border border-slate-100">
            Export logs
          </button>
        </div>


      </div>

      {/* Incident Management Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-12">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-sm">Active Issues List</h4>
          <button className="text-[12px] font-semibold text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-2">
            View All <ExternalLink className="size-3.5" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[11px] font-semibold text-slate-400 border-b border-slate-50 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-6">Ticket ID</th>
                <th className="px-6 py-6">Issue Title</th>
                <th className="px-6 py-6">Type</th>
                <th className="px-6 py-6">Status</th>
                <th className="px-6 py-6">Assigned To</th>
                <th className="px-6 py-6 text-right">More</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {incidents.slice(0, 10).map((inc, i) => (
                <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-6 py-8 font-black text-[15px] text-violet-700 tracking-tight">{inc.id?.slice(0, 8)}</td>
                  <td className="px-6 py-8">
                    <p className="text-[17px] font-black text-slate-900 leading-none tracking-tight">{inc.title}</p>
                    <p className="text-[12px] text-slate-400 font-black mt-2 leading-none italic">Ref: {inc.id?.slice(0, 6).toUpperCase()}</p>
                  </td>
                  <td className="px-6 py-8">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border shadow-sm ${inc.ticket_type === 'tech' ? 'text-red-600 bg-red-50 border-red-100' : 'text-orange-600 bg-orange-50 border-orange-100'}`}>
                      {inc.ticket_type_display}
                    </span>
                  </td>
                  <td className="px-6 py-8">
                    <div className="flex items-center gap-2">
                      <span className={`size-2.5 rounded-full ${inc.status === 'open' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.3)]' : inc.status === 'in_review' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <span className="text-[14px] font-black text-slate-700 tracking-tight">{inc.status_display}</span>
                    </div>
                  </td>
                  <td className="px-6 py-8">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-inner">
                        {inc.assigned_to_name?.split(' ').map((n: any) => n[0]).join('') || '??'}
                      </div>
                      <span className="text-[14px] font-black text-slate-700 tracking-tight">{inc.assigned_to_name || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <button className="p-2.5 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all">
                      <MoreVertical className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {incidents.length === 0 && (
                  <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold text-xs">No active issues found</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-center py-6 text-[8px] font-black text-slate-400 border-t border-slate-50 px-4">
        <span className="opacity-50">© 2024 Avanzo Cyber Group. All Rights Reserved.</span>
      </div>

      {/* Daily Work Start Confirmation Popup */}
      {showConfirmPopup && confirmTask && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden relative animate-in slide-in-from-bottom-8 duration-500">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-200/30 rounded-full blur-3xl -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-200/30 rounded-full blur-3xl -z-10 pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6">
              <span className="p-2.5 rounded-2xl bg-amber-50 text-amber-500 border border-amber-100">
                <Calendar className="size-5" />
              </span>
              <div>
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase leading-none mb-1">Today's Schedule</p>
                <h4 className="text-base font-bold text-slate-900 leading-none">Daily Work Start</h4>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100/80">
                <span className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-600 text-[9px] font-black uppercase tracking-widest border border-violet-100">
                  {confirmTask.priority || "Medium"}
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mt-2.5 mb-1.5 leading-snug">
                  {confirmTask.title}
                </h3>
                <p className="text-xs font-semibold text-slate-400">
                  Part of {confirmTask.project_name || "Avanzo Project"}
                </p>
              </div>

              {confirmStage === 'prompt' ? (
                <p className="text-sm font-bold text-slate-700 leading-relaxed">
                  Today, are you going to do this work?
                </p>
              ) : (
                <p className="text-sm font-bold text-violet-700 leading-relaxed">
                  Ready to begin! Please log your exact starting timestamp below.
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setShowConfirmPopup(false)}
                className="flex-1 rounded-2xl h-13 border-slate-200 bg-white text-xs font-black text-slate-500 hover:bg-slate-50 transition-all"
              >
                Later
              </Button>
              
              {confirmStage === 'prompt' ? (
                <Button
                  onClick={() => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    localStorage.setItem(`avanzo_task_confirmed_${confirmTask.id}_${todayStr}`, "true");
                    setConfirmStage('start');
                    toast.success("Availability confirmed. Now start your work!");
                  }}
                  className="flex-[1.5] rounded-2xl h-13 bg-violet-600 hover:bg-violet-700 text-white text-xs font-black shadow-lg shadow-violet-600/20 transition-all flex items-center justify-center gap-2"
                >
                  OK
                </Button>
              ) : (
                <Button
                  onClick={async () => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const exactTime = new Date().toLocaleTimeString();
                    localStorage.setItem(`avanzo_task_started_time_${confirmTask.id}_${todayStr}`, new Date().toISOString());
                    localStorage.setItem(`avanzo_task_confirmed_${confirmTask.id}_${todayStr}`, "true");

                    try {
                      await projectsService.updateTaskProgress(confirmTask.id, 0);
                    } catch (e) {
                      console.error("Failed to automatically update task status:", e);
                    }

                    toast.success(`Work started precisely at ${exactTime}! Time logged.`);
                    setShowConfirmPopup(false);
                  }}
                  className="flex-[1.5] rounded-2xl h-13 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  Now I am starting this work
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ArrowRight(props: any) {
  return (
    <svg 
      {...props}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
