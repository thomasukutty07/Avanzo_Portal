import { useState, useEffect, useRef } from "react"
import {
  BarChart3, TrendingUp, Activity,
  Users, Calendar, AlertCircle, CheckCircle2, Clock,
  Zap, Download, RefreshCw,
  SlidersHorizontal
} from "lucide-react"
import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import { PerformanceConfigModal } from "@/components/insights/PerformanceConfigModal"

// ─── Helpers ─────────────────────────────────────────────
function extractResults(data: any): any[] {
  return data?.results ?? (Array.isArray(data) ? data : [])
}

function SectionAnchor({ id }: { id: string }) {
  return <div id={id} className="-mt-20 pt-20 pointer-events-none" />
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  color = "text-violet-600",
  bg = "bg-violet-50",
}: {
  icon: any
  title: string
  subtitle: string
  color?: string
  bg?: string
}) {
  return (
    <div className="flex items-center gap-5 mb-8">
      <div className={`size-12 rounded-2xl ${bg} ${color} flex items-center justify-center shrink-0 shadow-sm`}>
        <Icon className="size-6" />
      </div>
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight font-headline leading-tight">
          {title}
        </h2>
        <p className="text-slate-400 text-xs font-bold mt-0.5">{subtitle}</p>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color = "text-violet-600", bg = "bg-violet-50" }: any) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-7 shadow-sm hover:shadow-lg transition-all group">
      <div className={`size-10 rounded-xl ${bg} ${color} flex items-center justify-center mb-5`}>
        <Icon className="size-5" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{label}</p>
      <p className="text-3xl font-black text-slate-900 tracking-tight leading-none font-headline">{value ?? "—"}</p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 py-16 text-center">
      <p className="text-slate-300 font-black text-sm uppercase tracking-widest">{message}</p>
    </div>
  )
}

// ─── Nav Pills ───────────────────────────────────────────
const NAV_SECTIONS = [
  { id: "insights",    label: "Insights",     icon: BarChart3 },
  { id: "performance", label: "Performance",  icon: TrendingUp },
  { id: "activity",    label: "Audit Logs",   icon: Activity },
]

// ─── Main Component ──────────────────────────────────────
export default function AdminInsightsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [deptHealth, setDeptHealth] = useState<any[]>([])
  const [performance, setPerformance] = useState<any[]>([])
  const [activityFeed, setActivityFeed] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("insights")
  const [refreshing, setRefreshing] = useState(false)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Modal states
  const [showPerfConfigModal, setShowPerfConfigModal] = useState(false)

  async function fetchAll() {
    try {
      const [anaRes, healthRes, perfRes, actRes] = await Promise.allSettled([
        api.get("/api/analytics/admin/dashboard/"),
        api.get("/api/analytics/admin/department-health/"),
        api.get("/api/performance/live-leaderboard/"),
        api.get("/api/activity/feed/"),
      ])

      if (anaRes.status === "fulfilled") setAnalytics(anaRes.value.data)
      if (healthRes.status === "fulfilled") setDeptHealth(extractResults(healthRes.value.data))

      // Live leaderboard — fall back to snapshot leaderboard if live errors
      if (perfRes.status === "fulfilled") {
        const data = perfRes.value.data
        setPerformance(Array.isArray(data) ? data : extractResults(data))
      } else {
        console.warn("[Insights] live-leaderboard failed:", perfRes.reason?.response?.status, perfRes.reason?.message)
        // Fallback: try the snapshot leaderboard
        try {
          const fallback = await api.get("/api/performance/leaderboard/")
          setPerformance(extractResults(fallback.data))
        } catch (fb) {
          console.warn("[Insights] leaderboard fallback also failed:", fb)
        }
      }

      if (actRes.status === "fulfilled") setActivityFeed(extractResults(actRes.value.data))
      else console.warn("[Insights] activity/feed failed:", actRes.reason?.message)
    } catch {
      toast.error("Failed to load some sections.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // Scroll-spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id)
        })
      },
      { rootMargin: "-30% 0px -60% 0px" }
    )
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [loading])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAll()
    toast.info("Refreshing all sections…")
  }

  if (loading) {
    return (
      <OrganizationAdminChrome>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="size-10 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Loading Organisation Insights…</p>
          </div>
        </div>
      </OrganizationAdminChrome>
    )
  }

  return (
    <OrganizationAdminChrome>
      <div className="min-h-screen bg-[#fcfcfc] font-display text-slate-900">

        {/* ── Sticky Page Header ───────────────────────────── */}
        <div className="sticky top-0 z-30 bg-[#fcfcfc]/90 backdrop-blur-md border-b border-slate-100 px-6 md:px-10 py-5 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 font-headline leading-tight">
              Organisation Insights
            </h1>
            <p className="text-slate-400 text-xs font-bold mt-0.5">
              Unified view — Skills · Performance · Audit
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => toast.success("Export coming soon!")}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 rounded-xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-violet-700 shadow-md shadow-violet-600/20 transition-all"
            >
              <Download className="size-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* ── Sticky Section Nav ───────────────────────────── */}
        <div className="sticky top-[73px] z-20 bg-[#fcfcfc]/90 backdrop-blur-md border-b border-slate-100 px-6 md:px-10 overflow-x-auto">
          <div className="flex items-center gap-1 py-2">
            {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  activeSection === id
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable Content ───────────────────────────── */}
        <div className="px-6 md:px-10 py-10 space-y-20">

          {/* ══ INSIGHTS ══════════════════════════════════════ */}
          <div ref={(el) => { sectionRefs.current["insights"] = el }}>
            <SectionAnchor id="insights" />
            <SectionHeader icon={BarChart3} title="Insights" subtitle="Real-time org-wide KPI summary" color="text-violet-600" bg="bg-violet-50" />

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              <StatCard label="Clocked In Today" value={analytics?.attendance?.clocked_in ?? 0} icon={Users} color="text-blue-600" bg="bg-blue-50" />
              <StatCard label="Project Velocity" value={analytics?.projects?.overall_progress_pct ? `${analytics.projects.overall_progress_pct}%` : "0%"} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" />
              <StatCard label="Pending Leaves" value={analytics?.pending_leaves ?? 0} icon={Calendar} color="text-orange-600" bg="bg-orange-50" />
              <StatCard label="Open Tickets" value={analytics?.open_tickets ?? 0} icon={AlertCircle} color="text-rose-600" bg="bg-rose-50" />
            </div>

            {/* Department Health */}
            {deptHealth.length > 0 && (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50">
                  <h3 className="font-black text-slate-900 tracking-tight">Department Health</h3>
                </div>
                <div className="divide-y divide-slate-50">
                  {deptHealth.map((dept: any) => (
                    <div key={dept.department_id} className="flex items-center justify-between px-8 py-5 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`size-2.5 rounded-full ${dept.health_status === "green" ? "bg-emerald-500" : dept.health_status === "yellow" ? "bg-amber-400" : "bg-rose-500"}`} />
                        <span className="font-black text-slate-900 text-sm">{dept.department_name}</span>
                      </div>
                      <div className="flex items-center gap-8 text-right">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Score</p>
                          <p className="font-black text-slate-900">{dept.avg_performance_score}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Open Tickets</p>
                          <p className={`font-black ${dept.open_tickets_count > 5 ? "text-rose-600" : "text-slate-900"}`}>{dept.open_tickets_count}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projects</p>
                          <p className="font-black text-slate-900">{dept.active_projects_count}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>



          {/* ══ PERFORMANCE ═══════════════════════════════════ */}
          <div ref={(el) => { sectionRefs.current["performance"] = el }}>
            <SectionAnchor id="performance" />
            <div className="flex items-center justify-between mb-8">
              <SectionHeader icon={TrendingUp} title="Performance" subtitle="Live scores — current week across all employees" color="text-emerald-600" bg="bg-emerald-50" />
              <button
                onClick={() => setShowPerfConfigModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 shadow-sm transition-all shrink-0"
              >
                <SlidersHorizontal className="size-4" /> Score Weights
              </button>
            </div>

            {performance.length === 0 ? (
              <EmptyState message="No employees found in your organisation" />
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                {/* Column header */}
                <div className="hidden md:grid grid-cols-[2rem_1fr_5rem_5rem_5rem_5rem_6rem] gap-4 px-8 py-3 border-b border-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400">
                  <span>#</span>
                  <span>Employee</span>
                  <span className="text-center">Attend.</span>
                  <span className="text-center">Delivery</span>
                  <span className="text-center">Quality</span>
                  <span className="text-center">Reliability</span>
                  <span className="text-right">Overall</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {performance.slice(0, 15).map((item: any, idx: number) => {
                    const overall = Number(item.overall_score ?? 0)
                    const attend  = Number(item.attendance_score ?? 0)
                    const deliver = Number(item.delivery_score ?? 0)
                    const quality = Number(item.quality_score ?? 0)
                    const reliab  = Number(item.reliability_score ?? 0)
                    const medal   = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : null
                    const scoreColor = overall >= 75 ? "text-emerald-600" : overall >= 50 ? "text-amber-500" : "text-rose-500"
                    const barColor   = overall >= 75 ? "bg-emerald-500" : overall >= 50 ? "bg-amber-400" : "bg-rose-400"

                    return (
                      <div key={item.employee_id ?? idx} className="flex flex-col md:grid md:grid-cols-[2rem_1fr_5rem_5rem_5rem_5rem_6rem] gap-4 px-8 py-5 hover:bg-slate-50/50 transition-colors items-center">
                        {/* Rank */}
                        <span className="text-sm font-black text-slate-300 text-center">
                          {medal ?? `#${item.rank ?? idx + 1}`}
                        </span>

                        {/* Identity */}
                        <div className="flex items-center gap-3 min-w-0 w-full">
                          <div className="size-9 rounded-2xl bg-violet-600 text-white flex items-center justify-center text-sm font-black shrink-0 shadow-sm shadow-violet-600/20">
                            {(item.employee_name ?? "?")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 text-sm truncate">{item.employee_name}</p>
                            <p className="text-[10px] text-slate-400 font-bold truncate">{item.department}{item.role ? ` · ${item.role}` : ""}</p>
                          </div>
                        </div>

                        {/* Sub-scores */}
                        {[attend, deliver, quality, reliab].map((val, si) => (
                          <div key={si} className="flex flex-col items-center gap-1 w-full">
                            <span className="text-[11px] font-black text-slate-700">{val.toFixed(0)}</span>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${val >= 75 ? "bg-emerald-400" : val >= 50 ? "bg-amber-400" : "bg-rose-400"}`}
                                style={{ width: `${Math.min(val, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}

                        {/* Overall */}
                        <div className="flex flex-col items-end gap-1 w-full">
                          <span className={`text-base font-black ${scoreColor} leading-none`}>{overall.toFixed(1)}</span>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(overall, 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {performance.length > 0 && (
                  <div className="px-8 py-4 border-t border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="size-3" />
                    Live — current week ({performance[0]?.period_start ?? "..."} → {performance[0]?.period_end ?? "..."})
                  </div>
                )}
              </div>
            )}
          </div>


          {/* ══ ACTIVITY ══════════════════════════════════════ */}
          <div ref={(el) => { sectionRefs.current["activity"] = el }}>
            <SectionAnchor id="activity" />
            <SectionHeader icon={Activity} title="Audit Logs" subtitle="Last 20 system events across the organisation" color="text-rose-600" bg="bg-rose-50" />

            {activityFeed.length === 0 ? (
              <EmptyState message="No audit events recorded yet" />
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-50">
                  {activityFeed.slice(0, 20).map((event: any, idx: number) => (
                    <div key={event.id ?? idx} className="flex items-start gap-5 px-8 py-5 hover:bg-slate-50/50 transition-colors">
                      <div className="size-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Zap className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-900 text-sm leading-snug">
                          {event.event_type ?? event.action ?? "System Event"}
                        </p>
                        {event.description && (
                          <p className="text-[11px] text-slate-400 font-medium mt-1 line-clamp-1">{event.description}</p>
                        )}
                        <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mt-1.5">
                          {event.actor_name ?? event.actor ?? "System"} ·{" "}
                          {event.timestamp ? new Date(event.timestamp).toLocaleString() : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {event.is_success !== false ? (
                          <CheckCircle2 className="size-4 text-emerald-400" />
                        ) : (
                          <Clock className="size-4 text-orange-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────── */}
      <PerformanceConfigModal
        open={showPerfConfigModal}
        onClose={() => setShowPerfConfigModal(false)}
      />
    </OrganizationAdminChrome>
  )
}
