import { HRPortalChrome } from "@/components/portal/hr/HRPortalChrome"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { notificationsService } from "@/services/notifications"
import { organizationService } from "@/services/organization"
import {
  Send,
  X,
  ShieldCheck,
  Globe,
  Users,
  Eye,
  Settings2,
  AlertTriangle,
  Info,
  Loader2,
  CheckCircle2,
} from "lucide-react"

interface Department {
  id: string
  name: string
}

export default function HRCreateAnnouncementPage() {
  const navigate = useNavigate()
  useDesignPortalLightTheme()

  // Form state
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [targetScope, setTargetScope] = useState<"org_wide" | "department">("org_wide")
  const [severity, setSeverity] = useState<"info" | "critical">("info")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoadingDepts, setIsLoadingDepts] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Fetch departments when scope switches to department
  useEffect(() => {
    if (targetScope === "department") {
      setIsLoadingDepts(true)
      organizationService
        .getDepartments()
        .then((data) => {
          setDepartments(Array.isArray(data) ? data : data.results ?? [])
        })
        .catch(() => toast.error("Failed to load departments"))
        .finally(() => setIsLoadingDepts(false))
    }
  }, [targetScope])

  const isValid =
    title.trim().length > 0 &&
    message.trim().length > 0 &&
    (targetScope === "org_wide" || selectedDepartment !== "")

  const handleBroadcast = async () => {
    if (!isValid) {
      toast.error("Please fill in the title and message before broadcasting.")
      return
    }

    setIsSubmitting(true)
    try {
      await notificationsService.createBroadcast({
        title: title.trim(),
        message: message.trim(),
        severity,
        target_scope: targetScope,
        ...(targetScope === "department" && selectedDepartment
          ? { department: selectedDepartment }
          : {}),
      })
      toast.success("Bulletin successfully broadcasted to the organization.")
      navigate("/hr-announcements")
    } catch (err: unknown) {
      const error = err as { response?: { data?: Record<string, unknown> } }
      const detail =
        error?.response?.data
          ? Object.values(error.response.data).flat().join(" ")
          : "Failed to broadcast bulletin. Please try again."
      toast.error(detail as string)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <HRPortalChrome>
      <div className="max-w-5xl mx-auto p-10 space-y-10 font-display">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline text-3xl font-black text-slate-900 tracking-tight">
              Corporate Bulletin
            </h2>
            <p className="text-slate-500 mt-1 font-medium italic">
              Broadcast verified organizational updates to the entire team.
            </p>
          </div>
          <button
            onClick={() => navigate("/hr-announcements")}
            className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all active:scale-95 border border-slate-100 shadow-sm"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Form / Preview */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col min-h-[600px] transition-all hover:border-violet-100">
              {showPreview ? (
                // Preview Mode
                <div className="flex-1 p-10 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        severity === "critical"
                          ? "bg-red-50 text-red-600 border border-red-100"
                          : "bg-blue-50 text-blue-600 border border-blue-100"
                      }`}
                    >
                      {severity === "critical" ? (
                        <AlertTriangle className="h-3 w-3" />
                      ) : (
                        <Info className="h-3 w-3" />
                      )}
                      {severity === "critical" ? "Critical" : "Info"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-violet-50 text-violet-600 border border-violet-100">
                      {targetScope === "org_wide" ? (
                        <Globe className="h-3 w-3" />
                      ) : (
                        <Users className="h-3 w-3" />
                      )}
                      {targetScope === "org_wide"
                        ? "Entire Organization"
                        : departments.find((d) => d.id === selectedDepartment)?.name ??
                          "Department"}
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 leading-tight">
                    {title || <span className="text-slate-200">Untitled Bulletin</span>}
                  </h3>
                  <p className="text-lg font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {message || <span className="text-slate-200">No content composed yet.</span>}
                  </p>
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <p className="text-[11px] text-emerald-600 font-bold">
                      HR Verified — will appear with authenticity badge
                    </p>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <div className="flex-1 p-10 space-y-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">
                      Announcement Subject
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter Bulletin Title..."
                      maxLength={255}
                      className="w-full bg-transparent border-none p-0 text-3xl font-black text-slate-900 placeholder:text-slate-200 focus:ring-0 leading-tight outline-none"
                    />
                    <p className="text-[10px] text-slate-300 text-right font-medium">
                      {title.length}/255
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">
                      Bulletin Content
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Compose official message..."
                      className="w-full min-h-[300px] bg-transparent border-none p-0 text-lg font-medium text-slate-600 placeholder:text-slate-200 focus:ring-0 resize-none leading-relaxed outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Toolbar */}
              <div className="px-10 py-8 bg-slate-50/30 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPreview((p) => !p)}
                    className="flex items-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-violet-700 hover:bg-violet-50 rounded-2xl transition-all shadow-sm border border-slate-100 bg-white"
                  >
                    <Eye className="h-4 w-4" />
                    {showPreview ? "Edit" : "Preview"}
                  </button>
                </div>

                <button
                  onClick={handleBroadcast}
                  disabled={isSubmitting || !isValid}
                  className="w-full sm:w-auto flex items-center justify-center gap-4 px-10 py-4 bg-violet-700 text-white font-black rounded-[1.5rem] hover:bg-violet-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-violet-900/40 active:scale-95 uppercase tracking-widest text-[11px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Broadcasting...
                    </>
                  ) : (
                    <>
                      Broadcast Bulletin
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </section>
          </div>

          {/* Sidebar / Settings */}
          <div className="space-y-8">
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 space-y-8">
              <h3 className="font-headline text-lg font-bold text-slate-900 flex items-center gap-3 border-b border-slate-50 pb-6 mb-2">
                <Settings2 className="h-5 w-5 text-violet-600" />
                Parameters
              </h3>

              <div className="space-y-6">
                {/* Target Audience */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Target Audience
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => setTargetScope("org_wide")}
                      className={`flex items-center gap-3 px-4 py-3 border rounded-xl text-xs font-bold transition-all w-full text-left ${
                        targetScope === "org_wide"
                          ? "bg-violet-50 border-violet-200 text-violet-700"
                          : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <Globe className="h-4 w-4" />
                      Entire Organization
                      {targetScope === "org_wide" && (
                        <CheckCircle2 className="h-4 w-4 ml-auto text-violet-500" />
                      )}
                    </button>
                    <button
                      onClick={() => setTargetScope("department")}
                      className={`flex items-center gap-3 px-4 py-3 border rounded-xl text-xs font-bold transition-all w-full text-left ${
                        targetScope === "department"
                          ? "bg-violet-50 border-violet-200 text-violet-700"
                          : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      Specific Department
                      {targetScope === "department" && (
                        <CheckCircle2 className="h-4 w-4 ml-auto text-violet-500" />
                      )}
                    </button>
                  </div>

                  {/* Department selector */}
                  {targetScope === "department" && (
                    <div className="mt-3">
                      {isLoadingDepts ? (
                        <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading departments...
                        </div>
                      ) : (
                        <select
                          value={selectedDepartment}
                          onChange={(e) => setSelectedDepartment(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
                        >
                          <option value="">Select a department...</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>

                {/* Severity */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Severity Level
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => setSeverity("info")}
                      className={`flex items-center gap-3 px-4 py-3 border rounded-xl text-xs font-bold transition-all w-full text-left ${
                        severity === "info"
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <Info className="h-4 w-4" />
                      Information
                      {severity === "info" && (
                        <CheckCircle2 className="h-4 w-4 ml-auto text-blue-500" />
                      )}
                    </button>
                    <button
                      onClick={() => setSeverity("critical")}
                      className={`flex items-center gap-3 px-4 py-3 border rounded-xl text-xs font-bold transition-all w-full text-left ${
                        severity === "critical"
                          ? "bg-red-50 border-red-200 text-red-700"
                          : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Critical
                      {severity === "critical" && (
                        <CheckCircle2 className="h-4 w-4 ml-auto text-red-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Verification Badge */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Bulletin Verification
                  </label>
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-tight">
                        Verified Pulse
                      </p>
                      <p className="text-[9px] text-emerald-600/80 font-medium leading-relaxed mt-1">
                        This announcement will include the HR Verification badge for authenticity.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Validation indicator */}
                {!isValid && (title || message) && (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                      {!title.trim()
                        ? "Add a subject title to proceed."
                        : !message.trim()
                          ? "Compose the bulletin content."
                          : "Select a department to proceed."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-violet-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-xl font-black italic tracking-tighter mb-4 opacity-100 text-white">
                  HR Mission Control
                </h4>
                <p className="text-xs font-medium text-white/70 leading-relaxed mb-6">
                  Ensure all bulletins adhere to the corporate communication standards and legal
                  privacy requirements.
                </p>
                <div className="flex gap-2">
                  <div className="h-1 w-8 bg-white/40 rounded-full" />
                  <div className="h-1 w-2 bg-white/40 rounded-full" />
                  <div className="h-1 w-2 bg-white/40 rounded-full" />
                </div>
              </div>
              <div className="absolute -right-12 -bottom-12 size-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
            </div>
          </div>
        </div>
      </div>
    </HRPortalChrome>
  )
}
