import { HRPortalChrome } from "@/components/portal/hr/HRPortalChrome"
import { api } from "@/lib/axios"
import { useEffect, useState } from "react"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { toast } from "sonner"
import {
  UserCheck,
  Clock,
  UserMinus,
  MoreVertical,
  Download,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ExternalLink,
  Eye,
  Settings,
  ShieldCheck,
  AlertCircle,
  Filter,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AttendanceLog {
  name: string
  email: string
  dept: string
  date: string
  checkin: string
  checkout: string
  status: string
  color: string
  initial: string
  isMissing: boolean
}

const PAGE_SIZE = 10

export default function HRAttendanceOverview() {
  useDesignPortalLightTheme()

  const [logs, setLogs] = useState<AttendanceLog[]>([])
  const [stats, setStats] = useState({ clockedIn: 0, late: 0, missing: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [filters, setFilters] = useState({ department: "all", status: "all" })
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE))
  const paginatedLogs = logs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const STATS = [
    { label: "Present Today", value: stats.clockedIn.toString(), sub: "Clocked in", trend: "+2.4%", color: "text-emerald-500", icon: UserCheck },
    { label: "Late Arrivals", value: stats.late.toString(), sub: "After shift start", trend: "-1.2%", color: "text-amber-500", icon: Clock },
    { label: "Absent", value: stats.missing.toString(), sub: "No check-in", trend: "0.0%", color: "text-red-500", icon: UserMinus },
    { label: "Total Staff", value: stats.total.toString(), sub: "Registered", trend: "Stable", color: "text-violet-600", icon: TrendingUp },
  ]

  const filtersActive = filters.department !== "all" || filters.status !== "all"

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    fetchAttendance()
    setCurrentPage(1)
  }, [filters])

  async function fetchDepartments() {
    try {
      const res = await api.get("/api/organization/departments/")
      setDepartments(Array.isArray(res.data) ? res.data : (res.data.results || []))
    } catch (e) {
      console.error(e)
    }
  }

  async function fetchAttendance() {
    try {
      setLoading(true)
      let url = "/api/attendance/pulse/"
      if (filters.department !== "all") url += `?department_id=${filters.department}`
      const res = await api.get(url)
      const data = res.data

      setStats({
        clockedIn: data.clocked_in ?? 0,
        late: data.late ?? 0,
        missing: data.missing ?? 0,
        total: data.total ?? data.total_employees ?? 0,
      })

      const mapped: AttendanceLog[] = (data.employees ?? []).map((e: any) => {
        let statusText = "Missing"
        let color = "bg-red-50 text-red-600 border border-red-100"

        if (e.status === "clocked_in" || e.status === "clocked_out") {
          if (e.is_late) {
            statusText = "Late"
            color = "bg-amber-100/50 text-amber-600 border border-amber-200"
          } else if (e.is_early_exit) {
            statusText = "Early Exit"
            color = "bg-orange-100/50 text-orange-600 border border-orange-200"
          } else {
            statusText = "Present"
            color = "bg-emerald-100/50 text-emerald-600 border border-emerald-200"
          }
        }

        return {
          name: e.employee_name ?? "Unknown",
          email: e.employee_code ?? "—",
          dept: e.department ?? "No Dept",
          date: new Date().toLocaleDateString(),
          checkin: e.clock_in_time ? new Date(e.clock_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--",
          checkout: e.clock_out_time ? new Date(e.clock_out_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--",
          status: statusText,
          color,
          isMissing: statusText === "Missing",
          initial: e.employee_name ? e.employee_name.substring(0, 2).toUpperCase() : "??",
        }
      })

      let filtered = mapped
      if (filters.status === "present") filtered = mapped.filter((l) => !l.isMissing && l.status !== "Late")
      else if (filters.status === "late") filtered = mapped.filter((l) => l.status === "Late")
      else if (filters.status === "absent") filtered = mapped.filter((l) => l.isMissing)

      setLogs([...filtered].sort((a, b) => (a.isMissing ? 1 : 0) - (b.isMissing ? 1 : 0)))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function handleExport() {
    if (logs.length === 0) { toast.error("No data to export."); return }
    const headers = ["Employee Name", "ID", "Department", "Date", "Check-in", "Check-out", "Status"]
    const csv = [headers.join(","), ...logs.map((l) => [`"${l.name}"`, `"${l.email}"`, `"${l.dept}"`, `"${l.date}"`, `"${l.checkin}"`, `"${l.checkout}"`, `"${l.status}"`].join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `Attendance_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Report downloaded.")
  }

  return (
    <HRPortalChrome>
      <div className="space-y-6 pb-12 font-display bg-[#fcfcfc] min-h-screen">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div className="font-headline">
            <div className="flex items-center gap-3 mb-1">
              <p className="text-[10px] font-black tracking-[0.2em] text-violet-600 uppercase">Workforce Analytics</p>
              <Badge className="bg-slate-100 text-slate-500 border-none rounded-lg text-[9px] font-black tracking-widest px-2 py-0.5">
                SHIFT: 09:30 AM – 05:30 PM
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Attendance Registry</h1>
            <p className="text-slate-500 mt-2 text-sm font-medium italic">Workforce presence tracking and attendance telemetry.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsFilterOpen(true)}
              variant="outline"
              className={`h-11 rounded-xl text-sm font-semibold px-5 transition-all ${filtersActive ? "bg-violet-600 text-white border-violet-600 hover:bg-violet-700" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
            >
              <Filter className="mr-2 size-4" />
              Filter {filtersActive && "(Active)"}
            </Button>
            <Button
              onClick={handleExport}
              className="h-11 rounded-xl bg-violet-600 text-white text-sm font-semibold px-5 shadow-lg shadow-violet-600/20 hover:bg-violet-700 transition-all"
            >
              <Download className="mr-2 size-4" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all group font-headline">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
                <div className={`size-8 rounded-xl flex items-center justify-center ${stat.color.replace("text-", "bg-").replace("-500", "-50").replace("text-violet-600", "bg-violet-50")}`}>
                  <stat.icon className={`size-4 ${stat.color}`} />
                </div>
              </div>
              <p className={`text-4xl font-black tracking-tight ${stat.color.includes("violet") ? "text-slate-900" : stat.color}`}>{stat.value}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter italic">{stat.sub}</span>
                <Badge className={`${stat.trend === "Stable" ? "bg-slate-50 text-slate-400" : stat.trend.startsWith("+") ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"} border-none rounded-lg text-[9px] font-black tracking-widest`}>
                  {stat.trend}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-8 h-[440px] flex flex-col">
            <div className="flex items-center justify-between mb-8 font-headline">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Presence Overview</h3>
              <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-50">
                {["Daily", "Weekly", "Monthly"].map((period) => (
                  <button key={period} className={`px-5 py-2 text-[10px] font-black rounded-lg transition-all tracking-widest ${period === "Daily" ? "bg-white shadow-md text-violet-700" : "text-slate-300"}`}>
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 min-h-0 flex items-center justify-center bg-slate-50/50 border border-slate-100 rounded-2xl">
              <div className="text-center">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Total Present</p>
                <p className="text-7xl font-black text-slate-900 tracking-tight">{stats.clockedIn} / {Math.max(stats.total, 1)}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
              <h5 className="text-[10px] font-black text-slate-500 tracking-widest mb-6 leading-none uppercase">Reliability Metrics</h5>
              <div className="space-y-6">
                {[
                  { label: "On-time Arrival", val: 88, color: "bg-emerald-500" },
                  { label: "Overtime Logged", val: 42, color: "bg-violet-600" },
                  { label: "Unauthorized Absence", val: 4, color: "bg-red-500" },
                ].map((m, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-black tracking-widest">
                      <span className="text-slate-600 font-bold">{m.label}</span>
                      <span className="text-slate-900">{m.val}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div className={`h-full ${m.color} transition-all duration-1000`} style={{ width: `${m.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-12">
          <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-black text-slate-900 font-headline tracking-tight">Attendance Logs</h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-2">
              Full History <ExternalLink className="size-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-50">
                <tr>
                  <th className="px-8 py-5">Employee</th>
                  <th className="px-8 py-5">Department</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Check-in</th>
                  <th className="px-8 py-5">Check-out</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-8 py-5">
                        <div className="h-10 w-full bg-slate-50 animate-pulse rounded-xl" />
                      </td>
                    </tr>
                  ))
                ) : paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <AlertCircle className="size-12 mb-4 opacity-20" />
                        <p className="text-sm font-bold uppercase tracking-widest">No records found</p>
                        <p className="text-xs mt-1">Try adjusting your filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-sm group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm">
                            {log.initial}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-violet-700 transition-colors">{log.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{log.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-semibold text-slate-600">{log.dept}</span>
                      </td>
                      <td className="px-8 py-5 text-xs text-slate-500 tabular-nums">{log.date}</td>
                      <td className="px-8 py-5 text-sm font-semibold text-slate-900 tabular-nums">{log.checkin}</td>
                      <td className="px-8 py-5 text-sm font-semibold text-slate-900 tabular-nums">{log.checkout}</td>
                      <td className="px-8 py-5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${log.color}`}>{log.status}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all outline-none">
                              <MoreVertical className="size-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5 shadow-xl border-slate-100 z-[100]">
                            <DropdownMenuLabel className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400">Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => toast.info(`Viewing ${log.name}`)} className="rounded-lg px-3 py-2 cursor-pointer">
                              <Eye className="size-3.5 mr-2 text-violet-500" />
                              <span className="text-sm font-medium">View Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success("Marked as verified.")} className="rounded-lg px-3 py-2 cursor-pointer">
                              <ShieldCheck className="size-3.5 mr-2 text-emerald-500" />
                              <span className="text-sm font-medium">Verify</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-50 my-1" />
                            <DropdownMenuItem onClick={() => toast.warning("Adjustment saved.")} className="rounded-lg px-3 py-2 cursor-pointer">
                              <Settings className="size-3.5 mr-2 text-amber-500" />
                              <span className="text-sm font-medium">Edit Record</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.error("Alert sent.")} className="rounded-lg px-3 py-2 cursor-pointer">
                              <AlertCircle className="size-3.5 mr-2 text-red-500" />
                              <span className="text-sm font-medium text-red-600">Send Alert</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-semibold">
              Page {currentPage} of {totalPages}
              <span className="ml-2 text-slate-400 font-normal">({logs.length} records)</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`size-9 rounded-lg border flex items-center justify-center transition-all ${currentPage === 1 ? "border-slate-100 text-slate-300 cursor-not-allowed" : "border-slate-200 text-slate-600 hover:bg-slate-100 bg-white"}`}
              >
                <ChevronLeft className="size-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...")
                  acc.push(p)
                  return acc
                }, [])
                .map((p, idx) =>
                  p === "..." ? (
                    <span key={`e${idx}`} className="size-9 flex items-center justify-center text-slate-400 text-xs">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className={`size-9 rounded-lg text-sm font-semibold transition-all ${p === currentPage ? "bg-violet-600 text-white shadow-md shadow-violet-600/20" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`size-9 rounded-lg border flex items-center justify-center transition-all ${currentPage === totalPages ? "border-slate-100 text-slate-300 cursor-not-allowed" : "border-slate-200 text-slate-600 hover:bg-slate-100 bg-white"}`}
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent className="sm:max-w-sm flex flex-col p-0 gap-0">
          <div className="px-6 pt-6 pb-4 border-b border-slate-100">
            <SheetTitle className="text-lg font-bold text-slate-900">Filter Records</SheetTitle>
            <SheetDescription className="text-sm text-slate-400 mt-1">
              Filter attendance records by department or status.
            </SheetDescription>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</Label>
              <Select value={filters.department} onValueChange={(val) => setFilters((prev) => ({ ...prev, department: val }))}>
                <SelectTrigger className="h-11 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept: any) => (
                    <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Status</Label>
              <div className="flex flex-col gap-2">
                {[
                  { id: "all",     label: "All",     desc: "Show everyone" },
                  { id: "present", label: "Present", desc: "Clocked in today" },
                  { id: "late",    label: "Late",    desc: "Arrived after shift start" },
                  { id: "absent",  label: "Absent",  desc: "No check-in recorded" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setFilters((prev) => ({ ...prev, status: s.id }))}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border text-left transition-all ${
                      filters.status === s.id ? "bg-violet-50 border-violet-300" : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-semibold ${filters.status === s.id ? "text-violet-700" : "text-slate-800"}`}>{s.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
                    </div>
                    <div className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 ${filters.status === s.id ? "border-violet-500" : "border-slate-300"}`}>
                      {filters.status === s.id && <div className="size-2 rounded-full bg-violet-500" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
            <Button
              onClick={() => { setFilters({ department: "all", status: "all" }); setIsFilterOpen(false) }}
              variant="outline"
              className="flex-1 h-11 rounded-xl border-slate-200 text-sm font-semibold text-slate-500"
            >
              Clear
            </Button>
            <Button
              onClick={() => setIsFilterOpen(false)}
              className="flex-[2] h-11 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 shadow-md shadow-violet-600/20"
            >
              Apply Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </HRPortalChrome>
  )
}
