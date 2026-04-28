import {
  CalendarDays, FileText, Lock, Search, ShieldCheck, X,
  Calendar, Loader2, TrendingUp
} from "lucide-react"
import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { api } from "@/lib/axios"

// ─── Types ────────────────────────────────────────────────────
interface WorkingReportSnapshot {
  id: string
  report_id: string
  report_type: "daily" | "range"
  date_from: string | null
  date_to: string | null
  generated_at: string
}

// ─── Date Range Picker Modal ───────────────────────────────────
function RangePickerModal({
  onClose,
  onGenerate,
  isGenerating,
}: {
  onClose: () => void
  onGenerate: (start: string, end: string) => void
  isGenerating: boolean
}) {
  const today = new Date().toISOString().split("T")[0]
  const ninetyDaysAgo = new Date(Date.now() - 89 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]

  const [startDate, setStartDate] = useState(ninetyDaysAgo)
  const [endDate, setEndDate] = useState(today)

  const diffDays =
    Math.floor(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1

  const isValid =
    startDate &&
    endDate &&
    startDate <= endDate &&
    endDate <= today &&
    diffDays <= 90

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-violet-600/10 w-full max-w-md p-8 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Generate Range Report
            </h2>
            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
              Max 90 days · up to today
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Date fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              From
            </label>
            <input
              type="date"
              value={startDate}
              max={today}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-violet-600/5 focus:border-violet-300 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              To
            </label>
            <input
              type="date"
              value={endDate}
              max={today}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-violet-600/5 focus:border-violet-300 outline-none transition-all"
            />
          </div>
        </div>

        {/* Range summary pill */}
        {startDate && endDate && (
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest ${
              isValid
                ? "bg-violet-50 text-violet-600 border border-violet-100"
                : "bg-rose-50 text-rose-500 border border-rose-100"
            }`}
          >
            <TrendingUp className="size-3.5" />
            {isValid
              ? `${diffDays} day${diffDays !== 1 ? "s" : ""} selected`
              : diffDays > 90
              ? "Range exceeds 90 days"
              : "Invalid date range"}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => isValid && onGenerate(startDate, endDate)}
            disabled={!isValid || isGenerating}
            className="flex-1 py-3 rounded-xl bg-violet-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Calendar className="size-3.5" />
                Generate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────
export default function EmployeeWorkingReportList() {
  const navigate = useNavigate()
  const [snapshots, setSnapshots] = useState<WorkingReportSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState("")

  // ── Load existing reports ───────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/api/reports/working/")
        setSnapshots(res.data.results ?? res.data)
      } catch {
        toast.error("Failed to load reports")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Generate range report ───────────────────────────────────
  const handleGenerateRange = async (startDate: string, endDate: string) => {
    setIsGenerating(true)
    toast.loading("Generating range report…", { id: "gen_range" })
    try {
      const res = await api.post("/api/reports/working/generate_range/", {
        start_date: startDate,
        end_date: endDate,
      })
      setSnapshots((prev) => [res.data, ...prev])
      setShowModal(false)
      toast.success("Range report generated successfully", { id: "gen_range" })
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? "Failed to generate report"
      toast.error(msg, { id: "gen_range" })
    } finally {
      setIsGenerating(false)
    }
  }

  // ── Filter ──────────────────────────────────────────────────
  const filtered = snapshots.filter((s) => {
    const q = search.toLowerCase()
    return (
      s.report_id.toLowerCase().includes(q) ||
      (s.date_from ?? "").includes(q) ||
      (s.date_to ?? "").includes(q)
    )
  })

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })

  return (
    <OrganizationAdminChrome>
      {showModal && (
        <RangePickerModal
          onClose={() => setShowModal(false)}
          onGenerate={handleGenerateRange}
          isGenerating={isGenerating}
        />
      )}

      <div className="p-6 md:p-10 space-y-10 animate-in fade-in duration-500 min-h-screen font-display bg-[#fcfcfc] text-slate-900">

        {/* Header */}
        <div className="sticky top-0 z-30 -mx-6 md:-mx-10 px-6 md:px-10 py-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#fcfcfc]/80 backdrop-blur-md border-b border-transparent transition-all">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-6 w-6 text-violet-600" />
              <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight font-headline">
                Employee Working Reports
              </h1>
            </div>
            <p className="text-slate-500 text-sm font-medium">
              Select a date range to generate an immutable performance report.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 border border-violet-500 rounded-2xl text-[11px] font-black shadow-lg shadow-violet-600/20 hover:bg-violet-700 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Calendar className="h-4 w-4" />
            Generate Report
          </button>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
            <h3 className="text-xl font-black text-slate-900 tracking-tight font-headline flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-400" />
              Historical Reports
            </h3>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
              <input
                className="w-full sm:w-64 bg-[#F1F5F9] border-transparent rounded-xl pl-11 pr-4 py-3 text-[12px] font-bold text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:bg-white focus:border-violet-200 transition-all placeholder:text-slate-400 tracking-tight"
                placeholder="Search ID or date…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/30 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                <tr>
                  <th className="px-10 py-6">Report ID</th>
                  <th className="px-10 py-6">Type</th>
                  <th className="px-10 py-6">Period</th>
                  <th className="px-10 py-6">Generated At</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-10 py-24 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="size-8 animate-spin text-violet-500" />
                        <p className="text-slate-400 font-bold text-sm">Loading reports…</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length > 0 ? (
                  filtered.map((snapshot) => (
                    <tr key={snapshot.id} className="group hover:bg-slate-50/50 transition-all cursor-default">
                      {/* Report ID */}
                      <td className="px-10 py-7">
                        <div className="font-black text-slate-900 tracking-tight text-sm">
                          {snapshot.report_id}
                        </div>
                      </td>

                      {/* Type badge */}
                      <td className="px-10 py-7">
                        {snapshot.report_type === "range" ? (
                          <span className="px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest bg-blue-50 text-blue-600 border border-blue-100 inline-flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            Range
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3 w-3" />
                            Daily
                          </span>
                        )}
                      </td>

                      {/* Period */}
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-slate-300 shrink-0" />
                          <div>
                            {snapshot.report_type === "range" && snapshot.date_from && snapshot.date_to ? (
                              <>
                                <p className="font-bold text-slate-700 text-sm">
                                  {formatDate(snapshot.date_from)}
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold">
                                  → {formatDate(snapshot.date_to)}
                                </p>
                              </>
                            ) : (
                              <p className="font-bold text-slate-700 text-sm">
                                {snapshot.date_from ? formatDate(snapshot.date_from) : "—"}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Generated at */}
                      <td className="px-10 py-7">
                        <p className="font-bold text-slate-700 text-sm">
                          {new Date(snapshot.generated_at).toLocaleDateString("en-US", {
                            month: "short", day: "2-digit", year: "numeric",
                          })}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-0.5">
                          {new Date(snapshot.generated_at).toLocaleTimeString("en-US", {
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </td>

                      {/* Locked */}
                      <td className="px-10 py-7">
                        <span className="px-4 py-1.5 rounded-xl text-[9px] font-black tracking-widest bg-violet-50 text-violet-600 border border-violet-100 inline-flex items-center gap-2">
                          <Lock className="h-3 w-3" />
                          Locked
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-10 py-7 text-right">
                        <button
                          onClick={() => navigate(`/reports/working/${snapshot.id}`)}
                          className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black text-slate-600 hover:text-violet-700 hover:border-violet-200 hover:bg-violet-50 transition-all shadow-sm tracking-widest uppercase"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-10 py-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="h-12 w-12 text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold">No reports found.</p>
                        <p className="text-slate-300 text-sm mt-1">Click "Generate Report" to create your first one.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </OrganizationAdminChrome>
  )
}
