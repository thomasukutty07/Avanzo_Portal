import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { MoreVertical, Plus, Shield, ExternalLink } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

const BURNDOWN_DATA = [
  { day: "Day 1",  actual: 98, ideal: 100 },
  { day: "Day 4",  actual: 78, ideal: 75  },
  { day: "Day 8",  actual: 52, ideal: 50  },
  { day: "Day 12", actual: 28, ideal: 25  },
  { day: "Deadline", actual: null, ideal: 0 },
]

const PROJECT_UPDATES = [
  {
    ago: "12M AGO",
    title: "Deployment Successful",
    desc: "Staging environment v2.4.1 is now live with enhanced Bastion protocols.",
    dot: "bg-emerald-500",
  },
  {
    ago: "3H AGO",
    title: "Project Planning Meeting",
    desc: "New objectives defined for 'Aether' security sweep. Check documents.",
    dot: "bg-violet-600",
  },
  {
    ago: "YESTERDAY",
    title: "Policy Update",
    desc: "Global MFA requirements have been tightened for administrator accounts.",
    dot: "bg-slate-300",
  },
]

const TASKS = [
  { icon: "🔧", title: "Patch Vulnerability #402", sub: "Avanzo Core Engine • 2h remaining", priority: "HIGH",   priorityStyle: "bg-red-100 text-red-600 border border-red-200" },
  { icon: "🔒", title: "Refactor Encryption Module", sub: "Cryptography Services • 14h remaining", priority: "MEDIUM", priorityStyle: "bg-violet-100 text-violet-600 border border-violet-200" },
  { icon: "🗄️", title: "Database Schema Migration", sub: "Cloud Infrastructure • 1d remaining", priority: "LOW",    priorityStyle: "bg-slate-100 text-slate-500 border border-slate-200" },
]

const STATS = [
  {
    label: "PROJECT PROGRESS",
    value: "74%",
    sub: "+4.2%",
    subColor: "text-emerald-500",
    accent: "text-slate-900",
    bar: true,
    barVal: 74,
    icon: "📈",
  },
  {
    label: "ACTIVE TASKS",
    value: "12",
    sub: "3 finishing today",
    subColor: "text-slate-400",
    accent: "text-slate-900",
    icon: "✓",
  },
  {
    label: "OPEN BUGS",
    value: "03",
    sub: "Critical severity: 3",
    subColor: "text-red-400",
    accent: "text-red-500",
    icon: "⚠",
  },
  {
    label: "NEXT DEADLINE",
    value: "Oct 24",
    sub: "Q2 Security Audit",
    subColor: "text-slate-400",
    accent: "text-slate-900",
    icon: "📅",
  },
]

export default function TechnicalDashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6 pb-12 font-display bg-[#fcfcfc] min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 mb-1">
            TECHNICAL MANAGEMENT
          </p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-headline">
            Operational Overview
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">High-level engineering metrics and project health.</p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            onClick={() => toast.info("Starting new analysis…")}
            className="px-5 py-2.5 rounded-xl border-2 border-violet-200 text-violet-700 text-[13px] font-bold hover:bg-violet-50 transition-colors"
          >
            New Analysis
          </button>
          <button
            type="button"
            onClick={() => { navigate("/technical/incidents") }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-[13px] font-bold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-600/20"
          >
            <Plus className="size-4" />
            View Incidents
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">{s.label}</p>
              {s.sub && (
                <span className={`text-[10px] font-black ${s.subColor}`}>{s.sub}</span>
              )}
            </div>
            <p className={`text-4xl font-black tracking-tight font-headline ${s.accent}`}>{s.value}</p>
            {s.bar && (
              <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full"
                  style={{ width: `${s.barVal}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Grid: Chart + Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sprint Burndown Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-lg font-black text-slate-900 font-headline">Project Burndown</h3>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                Point velocity vs. projected trajectory
              </p>
            </div>
            <span className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
              Phase 42-A
            </span>
          </div>

          <div className="h-56 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={BURNDOWN_DATA} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="idealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }}
                  dy={8}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)", fontSize: "12px" }}
                  cursor={{ stroke: "#7c3aed", strokeWidth: 1, strokeDasharray: "4 4" }}
                />
                <ReferenceLine
                  y={50}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
                {/* Ideal line */}
                <Area
                  type="monotone"
                  dataKey="ideal"
                  stroke="#cbd5e1"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  fill="url(#idealGrad)"
                  dot={false}
                  connectNulls
                />
                {/* Actual line */}
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                  fill="url(#actualGrad)"
                  dot={{ fill: "#7c3aed", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#7c3aed", stroke: "#fff", strokeWidth: 2 }}
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Updates */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col">
          <h3 className="text-base font-black text-slate-900 font-headline mb-6">Project Updates</h3>
          <div className="flex-1 space-y-6">
            {PROJECT_UPDATES.map((u, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-1 flex flex-col items-center">
                  <div className={`size-2.5 rounded-full shrink-0 ${u.dot}`} />
                  {i < PROJECT_UPDATES.length - 1 && (
                    <div className="w-px flex-1 bg-slate-100 mt-2" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{u.ago}</p>
                  <p className="text-[13px] font-black text-slate-900 leading-none mb-1">{u.title}</p>
                  <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{u.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => toast.info("Loading older activity…")}
            className="mt-4 w-full py-2.5 rounded-xl border border-slate-100 text-[11px] font-black text-slate-500 hover:bg-slate-50 hover:text-violet-600 transition-colors uppercase tracking-widest"
          >
            Load Older Activity
          </button>
        </div>
      </div>

      {/* Bottom Grid: Task List + Node Integrity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Personal Task List */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-50">
            <h3 className="font-black text-slate-900 font-headline">Personal Task List</h3>
            <button
              type="button"
              onClick={() => navigate("/technical/tasks")}
              className="text-[11px] font-black uppercase tracking-widest text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-1"
            >
              View All Tasks
              <ExternalLink className="size-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {TASKS.map((t, i) => (
              <div key={i} className="flex items-center gap-5 px-8 py-5 group hover:bg-slate-50/50 transition-colors cursor-pointer">
                <span className="text-2xl shrink-0">{t.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-slate-900 group-hover:text-violet-700 transition-colors leading-none">{t.title}</p>
                  <p className="text-[11px] text-slate-400 font-medium mt-1 leading-none">{t.sub}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0 ${t.priorityStyle}`}>
                  {t.priority}
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toast.info(`Options for: ${t.title}`) }}
                  className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                >
                  <MoreVertical className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Node Integrity */}
        <div className="lg:col-span-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 p-8 text-white shadow-xl shadow-violet-600/25 flex flex-col justify-between">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-6 -top-6 size-40 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute right-4 bottom-4 size-24 rounded-full bg-white/5" />

          <div className="flex items-start justify-between">
            <div className="size-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Shield className="size-5 text-white" />
            </div>
            <button
              type="button"
              onClick={() => toast.info("Expanding node integrity view…")}
              className="size-8 rounded-lg bg-white/15 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <Plus className="size-4 text-white" />
            </button>
          </div>

          <div className="mt-6">
            <h3 className="text-2xl font-black font-headline tracking-tight">Node Integrity</h3>
            <div className="flex items-baseline gap-2 mt-1 mb-3">
              <span className="text-4xl font-black font-headline">99.9%</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-violet-300">Stable</span>
            </div>
            <p className="text-[12px] text-violet-200 font-medium leading-relaxed">
              All operational clusters are reporting optimal latency.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
