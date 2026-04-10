import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import { toast } from "sonner"
import { MoreVertical, Shield, ExternalLink, Loader2 } from "lucide-react"
import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"


export default function AdminDashboard() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [updates, setUpdates] = useState<any[]>([])
  const [attendancePulse, setAttendancePulse] = useState<any>({ clocked_in: 0, missing: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [tRes, pRes, bRes, pulseRes] = await Promise.all([
          api.get("/api/projects/tasks/"),
          api.get("/api/projects/projects/"),
          api.get("/api/notifications/broadcasts/"),
          api.get("/api/attendance/pulse/")
        ]);
        
        const rawTasks = extractResults(tRes.data);
        const rawProjects = extractResults(pRes.data);
        const rawBroadcasts = extractResults(bRes.data);

        setTasks(rawTasks);
        setProjects(rawProjects);
        setUpdates(rawBroadcasts);
        setAttendancePulse(pulseRes.data);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Derived Stats
  const activeTasksCount = tasks.filter(t => t.status !== "resolved" && t.status !== "completed").length;
  const criticalBugsCount = tasks.filter(t => (t.priority === "high" || t.priority === "urgent") && t.status !== "resolved").length;
  const avgProgress = projects.length > 0 
    ? Math.round(projects.reduce((acc, p) => acc + (p.weighted_progress || p.progress || 0), 0) / projects.length)
    : 0;

  const dynamicStats = [
    {
      label: "Employees Present",
      value: (attendancePulse?.clocked_in ?? 0).toString().padStart(2, '0'),
      sub: `${attendancePulse?.total_employees || 0} Total Employees`,
      subColor: "text-emerald-500",
      accent: "text-emerald-600",
      bar: true,
      barVal: (attendancePulse?.total_employees > 0) ? (attendancePulse.clocked_in / attendancePulse.total_employees) * 100 : 0,
    },
    {
      label: "Active Tasks",
      value: activeTasksCount.toString().padStart(2, '0'),
      sub: `${tasks.filter(t => t.status === "in_progress").length} in progress`,
      subColor: "text-slate-400",
      accent: "text-slate-900",
    },
    {
      label: "System Alerts",
      value: criticalBugsCount.toString().padStart(2, '0'),
      sub: `Employees Absent: ${attendancePulse?.missing || 0}`,
      subColor: "text-slate-400",
      accent: "text-slate-900",
    },
    {
      label: "Project Progress",
      value: `${avgProgress}%`,
      sub: "Average Completion",
      accent: "text-slate-900",
      bar: true,
      barVal: avgProgress,
    },
  ];



  const dynamicTasks = tasks.slice(0, 3).map(t => ({
    icon: (t.task_type === "bug" || t.priority === "urgent") ? "⚠" : "🔧",
    title: t.title,
    sub: `${t.project_name || 'Global'} • ${t.completion_pct || t.progress || 0}% complete`,
    priority: (t.priority || 'Normal'),
    priorityStyle: (t.priority === "high" || t.priority === "urgent") ? "bg-red-50 text-red-600 border border-red-100" : 
                   t.priority === "medium" || t.priority === "tactical" ? "bg-violet-50 text-violet-600 border border-violet-100" :
                   "bg-slate-50 text-slate-400 border border-slate-100"
  }));



  if (loading) {
    return (
      <OrganizationAdminChrome>
        <div className="flex h-[80vh] items-center justify-center bg-[#fcfcfc]">
          <div className="flex flex-col items-center gap-6">
            <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
            <p className="text-[11px] font-bold text-slate-400 font-headline">Loading Dashboard...</p>
          </div>
        </div>
      </OrganizationAdminChrome>
    );
  }

  return (
    <OrganizationAdminChrome>
      <div className="p-6 md:p-10 space-y-10 animate-in fade-in duration-700 min-h-screen font-display bg-[#fcfcfc] text-slate-900">
        {/* Page Header */}
        <div className="sticky top-0 z-30 -mx-6 md:-mx-10 px-6 md:px-10 py-6 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fcfcfc]/80 backdrop-blur-md border-b border-transparent transition-all">
          <div>
            <h1 className="text-[32px] font-bold text-slate-900 tracking-tight font-headline leading-none">
              Dashboard
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">Overview of employees, tasks, and projects.</p>
          </div>
          <div className="flex items-center gap-4 self-start md:self-auto">
            <button
              type="button"
              onClick={() => toast.info("Starting new sector analysis…")}
              className="px-7 py-3 rounded-xl border border-slate-100 bg-white text-slate-900 text-[11px] font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              Analyze dashboard
            </button>
            <button
              type="button"
              onClick={() => { navigate("/admin-notifications") }}
              className="flex items-center gap-3 px-7 py-3 rounded-xl bg-violet-600 text-white text-[11px] font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20 active:scale-95"
            >
              <Shield className="size-4" />
              View notifications
            </button>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {dynamicStats.map((s) => (
            <div key={s.label} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[9px] font-bold text-slate-400">{s.label}</p>
                {s.sub && (
                  <span className={`text-[10px] font-bold ${s.subColor} bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100/50`}>{s.sub}</span>
                )}
              </div>
              <p className={`text-5xl font-bold tracking-tight font-headline ${s.accent} leading-none`}>{s.value}</p>
              {s.bar && (
                <div className="mt-8 h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner group-hover:border-violet-100 transition-colors">
                  <div
                    className="h-full bg-violet-600 rounded-full shadow-[0_0_10px_rgba(124,58,237,0.3)] transition-all duration-[2000ms]"
                    style={{ width: `${s.barVal}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>



        {/* Bottom Grid: Task List + Node Integrity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Personal Task List */}
        <div className="lg:col-span-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-700">
            <div className="flex items-center justify-between px-10 py-8 border-b border-slate-50 bg-slate-50/10">
              <h3 className="font-headline font-bold text-xl text-slate-900 tracking-tight">Recent Tasks</h3>
              <button
                type="button"
                onClick={() => navigate("/users")}
                className="text-[10px] font-bold text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-3 bg-violet-50 px-5 py-2.5 rounded-xl border border-violet-100 shadow-sm"
              >
                Manage Employees
                <ExternalLink className="size-3.5" />
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {dynamicTasks.length > 0 ? dynamicTasks.map((t, i) => (
                <div key={i} className="flex items-center gap-8 px-10 py-8 group hover:bg-slate-50/30 transition-all cursor-pointer">
                  <div className="size-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-all group-hover:border-violet-100 group-hover:shadow-xl group-hover:rotate-6">
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-bold text-slate-900 group-hover:text-violet-700 transition-colors tracking-tight leading-none mb-2.5">{t.title}</p>
                    <p className="text-[11px] text-slate-300 font-bold leading-none opacity-80">{t.sub}</p>
                  </div>
                  <div className={`px-5 py-2 rounded-xl text-[10px] font-bold shrink-0 border transition-all shadow-sm ${t.priorityStyle}`}>
                    {t.priority}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toast.info(`Options for: ${t.title}`) }}
                    className="p-3 text-slate-200 hover:text-slate-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 shadow-sm"
                  >
                    <MoreVertical className="size-5" />
                  </button>
                </div>
              )) : (
                <div className="px-10 py-24 text-center opacity-30">
                   <Shield className="size-12 mx-auto mb-6 text-slate-200" />
                   <p className="text-[11px] font-bold">No tasks found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </OrganizationAdminChrome>
  )
}
