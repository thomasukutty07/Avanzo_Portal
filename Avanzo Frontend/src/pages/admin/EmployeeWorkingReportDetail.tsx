import {
  ArrowLeft, Clock, Download, HardDriveDownload, Search,
  TrendingUp, Users, Loader2, CheckCircle2, AlertTriangle,
  XCircle, Timer, LogIn, LogOut, Mail, Briefcase, ChevronDown, ChevronUp
} from "lucide-react"
import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useState, useEffect, type ReactElement } from "react"
import { api } from "@/lib/axios"
import ExcelJS from "exceljs"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// ─── Types ────────────────────────────────────────────────
interface EntryRecord {
  project: string
  task: string | null
  intent: string
  output: string | null
  outcome: string | null
  outcome_reason: string | null
  hours: number | null
  confidence: number | null
}

interface ReportRecord {
  employee_name: string
  employee_id: string | null
  email: string
  department: string
  designation: string | null
  role: string
  clock_in: string | null
  clock_out: string | null
  is_late: boolean
  is_early_exit: boolean
  total_working_hours: string | number
  progress_status: "Completed" | "In Progress" | "Pending" | "Idle" | "Missing"
  general_notes: string | null
  completed_tasks: number
  partial_tasks: number
  blocked_tasks: number
  pending_tasks: number
  remaining_workload: string
  entries: EntryRecord[]
}

// ─── Helpers ──────────────────────────────────────────────
const STATUS_STYLE: Record<string, string> = {
  Completed:    "bg-emerald-50 text-emerald-600 border-emerald-100",
  "In Progress":"bg-blue-50 text-blue-600 border-blue-100",
  Pending:      "bg-orange-50 text-orange-600 border-orange-100",
  Idle:         "bg-slate-100 text-slate-500 border-slate-200",
  Missing:      "bg-rose-50 text-rose-500 border-rose-100",
}

const OUTCOME_ICON: Record<string, ReactElement> = {
  completed:    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
  partial:      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />,
  blocked:      <XCircle className="h-3.5 w-3.5 text-rose-500" />,
  carried_over: <Timer className="h-3.5 w-3.5 text-orange-400" />,
  not_started:  <XCircle className="h-3.5 w-3.5 text-slate-400" />,
}

const OUTCOME_LABEL: Record<string, string> = {
  completed:    "Completed",
  partial:      "Partial",
  blocked:      "Blocked",
  carried_over: "Carried Over",
  not_started:  "Not Started",
}

// ─── Employee Card ─────────────────────────────────────────
function EmployeeCard({ record }: { record: ReportRecord }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
      {/* ── Summary row ── */}
      <div
        className="flex flex-col md:flex-row items-start md:items-center gap-6 p-7 cursor-pointer hover:bg-slate-50/40 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Avatar */}
        <div className="size-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center text-lg font-black shrink-0 shadow-sm shadow-violet-600/20">
          {record.employee_name[0]}
        </div>

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <p className="font-black text-slate-900 text-base tracking-tight truncate">{record.employee_name}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{record.department}</span>
            {record.designation && (
              <>
                <span className="text-slate-200">·</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{record.designation}</span>
              </>
            )}
            {record.employee_id && (
              <>
                <span className="text-slate-200">·</span>
                <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">{record.employee_id}</span>
              </>
            )}
          </div>
        </div>

        {/* Clock times */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <LogIn className="size-3.5 text-emerald-400 mb-0.5" />
            <span className="text-[11px] font-black text-slate-700">{record.clock_in ?? "—"}</span>
          </div>
          <div className="w-6 h-px bg-slate-200" />
          <div className="flex flex-col items-center">
            <LogOut className="size-3.5 text-rose-400 mb-0.5" />
            <span className="text-[11px] font-black text-slate-700">{record.clock_out ?? "—"}</span>
          </div>
        </div>

        {/* Task pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-100">{record.completed_tasks} Done</span>
          {record.partial_tasks > 0 && <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-600 text-[10px] font-black border border-amber-100">{record.partial_tasks} Partial</span>}
          {record.blocked_tasks > 0 && <span className="px-3 py-1 rounded-lg bg-rose-50 text-rose-600 text-[10px] font-black border border-rose-100">{record.blocked_tasks} Blocked</span>}
          {record.pending_tasks > 0 && <span className="px-3 py-1 rounded-lg bg-orange-50 text-orange-500 text-[10px] font-black border border-orange-100">{record.pending_tasks} Pending</span>}
        </div>

        {/* Hours + Status */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-lg font-black text-slate-900 leading-none">{record.total_working_hours}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">hrs</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${STATUS_STYLE[record.progress_status] ?? ""}`}>
            {record.progress_status}
          </span>
          {record.is_late && (
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-100 text-[9px] font-black text-rose-500 uppercase tracking-widest">Late</span>
          )}
          {expanded ? <ChevronUp className="size-4 text-slate-400 ml-1" /> : <ChevronDown className="size-4 text-slate-400 ml-1" />}
        </div>
      </div>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div className="border-t border-slate-100 px-7 py-6 space-y-5 bg-slate-50/30">

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-500 font-bold">
              <Mail className="size-3.5 text-slate-300" /> {record.email}
            </div>
            {record.role && (
              <div className="flex items-center gap-1.5 text-slate-500 font-bold">
                <Briefcase className="size-3.5 text-slate-300" /> {record.role}
              </div>
            )}
            {record.is_early_exit && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-100 text-[10px] font-black text-amber-600 uppercase tracking-widest">Early Exit</span>
            )}
          </div>

          {/* General notes */}
          {record.general_notes && (
            <div className="bg-white rounded-xl border border-slate-100 px-5 py-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">General Notes</p>
              <p className="text-sm text-slate-700 font-medium leading-relaxed">{record.general_notes}</p>
            </div>
          )}

          {/* Entry breakdown */}
          {record.entries.length > 0 ? (
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Work Log Entries</p>
              {record.entries.map((entry, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-black text-slate-900 text-sm">{entry.project}</p>
                      {entry.task && <p className="text-[10px] text-violet-500 font-bold mt-0.5 uppercase tracking-widest">Task: {entry.task}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {entry.outcome && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                          {OUTCOME_ICON[entry.outcome]} {OUTCOME_LABEL[entry.outcome] ?? entry.outcome}
                        </span>
                      )}
                      {entry.hours != null && (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 border border-blue-100 text-[10px] font-black text-blue-600">
                          <Clock className="size-3" /> {entry.hours}h
                        </span>
                      )}
                      {entry.confidence != null && (
                        <span className="px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-100 text-[10px] font-black text-violet-500">
                          Confidence {entry.confidence}/5
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Morning Intent</p>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">{entry.intent}</p>
                    </div>
                    {entry.output && (
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Evening Output</p>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">{entry.output}</p>
                      </div>
                    )}
                  </div>
                  {entry.outcome_reason && (
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
                      Reason: {entry.outcome_reason.replace(/_/g, " ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center py-4">No work log entries recorded</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────
export default function EmployeeWorkingReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    async function loadReport() {
      try {
        setLoading(true)
        const res = await api.get(`/api/reports/working/${id}/`)
        setReport(res.data)
      } catch (e) {
        console.error(e)
        toast.error("Failed to load snapshot details")
      } finally {
        setLoading(false)
      }
    }
    if (id) loadReport()
  }, [id])

  if (loading) {
    return (
      <OrganizationAdminChrome>
        <div className="flex h-screen w-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="size-8 animate-spin text-violet-600" />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Hydrating Snapshot Data...</p>
          </div>
        </div>
      </OrganizationAdminChrome>
    )
  }

  if (!report) return null

  const records: ReportRecord[] = report.data || []
  const filteredRecords = records.filter(
    (r) =>
      r.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.designation ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const departments = Array.from(new Set(filteredRecords.map((r) => r.department)))

  // ── Stats ──────────────────────────────────────────────
  const totalCompleted = filteredRecords.reduce((s, r) => s + r.completed_tasks, 0)
  const totalBlocked   = filteredRecords.reduce((s, r) => s + r.blocked_tasks, 0)
  const inProgress     = filteredRecords.filter((r) => r.progress_status === "In Progress").length
  const lateCount      = filteredRecords.filter((r) => r.is_late).length

  // ── Export XLSX ────────────────────────────────────────
  const handleExportExcel = async () => {
    if (!records.length) { toast.error("No data to export."); return }
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet("Report")
    ws.columns = [
      { header: "Employee",      key: "employee",      width: 24 },
      { header: "ID",            key: "id",            width: 14 },
      { header: "Department",    key: "department",    width: 18 },
      { header: "Designation",   key: "designation",   width: 18 },
      { header: "Role",          key: "role",          width: 16 },
      { header: "Clock In",      key: "clock_in",      width: 12 },
      { header: "Clock Out",     key: "clock_out",     width: 12 },
      { header: "Late",          key: "late",          width: 8  },
      { header: "Working Hours", key: "hours",         width: 14 },
      { header: "Completed",     key: "completed",     width: 12 },
      { header: "Partial",       key: "partial",       width: 10 },
      { header: "Blocked",       key: "blocked",       width: 10 },
      { header: "Pending",       key: "pending",       width: 10 },
      { header: "Status",        key: "status",        width: 14 },
    ]
    // Style header row
    ws.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6D28D9" } }
    })
    records.forEach((r) => {
      ws.addRow({
        employee:    r.employee_name,
        id:          r.employee_id ?? "",
        department:  r.department,
        designation: r.designation ?? "",
        role:        r.role,
        clock_in:    r.clock_in ?? "",
        clock_out:   r.clock_out ?? "",
        late:        r.is_late ? "Yes" : "No",
        hours:       r.total_working_hours,
        completed:   r.completed_tasks,
        partial:     r.partial_tasks,
        blocked:     r.blocked_tasks,
        pending:     r.pending_tasks,
        status:      r.progress_status,
      })
    })
    const buffer = await wb.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Report_${report.report_id}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported Report #${report.report_id} to Excel`)
  }

  // ── Export PDF ─────────────────────────────────────────
  const handleExportPDF = () => {
    if (!records.length) { toast.error("No data to export."); return }
    const doc = new jsPDF({ orientation: "landscape" })
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text(`Working Report Snapshot — #${report.report_id}`, 14, 16)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(120)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 23)
    doc.setTextColor(0)
    autoTable(doc, {
      startY: 28,
      head: [["Employee", "Dept", "In", "Out", "Late", "Hours", "Done", "Blocked", "Status"]],
      body: records.map((r) => [
        r.employee_name,
        r.department,
        r.clock_in ?? "—",
        r.clock_out ?? "—",
        r.is_late ? "Yes" : "No",
        r.total_working_hours,
        r.completed_tasks,
        r.blocked_tasks,
        r.progress_status,
      ]),
      headStyles: { fillColor: [109, 40, 217], fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 247, 255] },
      styles: { cellPadding: 4 },
    })
    doc.save(`Report_${report.report_id}.pdf`)
    toast.success(`Exported Report #${report.report_id} to PDF`)
  }

  return (
    <OrganizationAdminChrome>
      <div className="p-6 md:p-10 space-y-10 animate-in fade-in duration-500 min-h-screen font-display bg-[#fcfcfc] text-slate-900">

        {/* ── Header ── */}
        <div className="sticky top-0 z-30 -mx-6 md:-mx-10 px-6 md:px-10 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#fcfcfc]/80 backdrop-blur-md border-b border-transparent">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate("/reports")}
              className="flex w-fit items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-violet-600 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Back to Snapshot List
            </button>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight font-headline flex items-center gap-3 mt-2">
              Report Snapshot
              <span className="text-xl text-slate-300 font-bold tracking-normal italic select-all">#{report.report_id}</span>
              <span className="ml-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black tracking-widest uppercase border border-slate-200/50">LOCKED RECORD</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group mr-4 hidden sm:block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
              <input
                className="w-full sm:w-64 bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-[13px] font-bold text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:border-violet-200 transition-all placeholder:text-slate-400 shadow-sm"
                placeholder="Search employee or dept..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 border border-emerald-400 rounded-xl text-[11px] font-black shadow-sm shadow-emerald-500/20 hover:bg-emerald-600 transition-all uppercase tracking-widest text-white"
            >
              <HardDriveDownload className="h-4 w-4" /> Export .XLSX
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest text-slate-600"
            >
              <Download className="h-4 w-4" /> PDF
            </button>
          </div>
        </div>

        {/* ── KPI Stat Cards ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Tracked Personnel", value: filteredRecords.length, icon: Users,         color: "text-violet-600", bg: "bg-violet-50" },
            { label: "Tasks Completed",   value: totalCompleted,         icon: CheckCircle2,  color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Currently Active",  value: inProgress,             icon: TrendingUp,    color: "text-blue-600",   bg: "bg-blue-50" },
            { label: "Late / Blocked",    value: lateCount + totalBlocked, icon: AlertTriangle, color: "text-rose-600",   bg: "bg-rose-50" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 mb-2">{s.label}</p>
                <h3 className="text-4xl font-black text-slate-900 leading-none">{s.value}</h3>
              </div>
              <div className={`p-4 rounded-2xl ${s.bg} ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
            </div>
          ))}
        </section>

        {/* ── Department sections ── */}
        <div className="space-y-8">
          {departments.map((dept) => {
            const deptRecords = filteredRecords.filter((r) => r.department === dept)
            return (
              <section key={dept}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-sm shadow-violet-600/20 text-sm font-black">
                    {dept[0]}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight font-headline">
                    {dept} Department
                  </h3>
                  <span className="ml-auto text-[11px] font-black uppercase tracking-widest text-violet-600 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-violet-100">
                    {deptRecords.length} Members
                  </span>
                </div>
                <div className="space-y-3">
                  {deptRecords.map((record, idx) => (
                    <EmployeeCard key={idx} record={record} />
                  ))}
                </div>
              </section>
            )
          })}

          {departments.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100">
              <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">No records found.</p>
            </div>
          )}
        </div>

      </div>
    </OrganizationAdminChrome>
  )
}
