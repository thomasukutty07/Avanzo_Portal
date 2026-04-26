import { useState } from "react"
import { X, Plus, Trash2, Target } from "lucide-react"
import { api } from "@/lib/axios"
import { toast } from "sonner"

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  departments: any[]
}

const LEVEL_OPTIONS = ["company", "department", "individual"]
const CADENCE_OPTIONS = ["quarterly", "annual", "monthly"]

export function ObjectiveModal({ open, onClose, onSuccess, departments }: Props) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    level: "company",
    cadence: "quarterly",
    department: "",
    period_start: "",
    period_end: "",
  })
  const [keyResults, setKeyResults] = useState([
    { title: "", tracking_type: "percentage", target_value: "100" },
  ])

  if (!open) return null

  const updateField = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const updateKR = (i: number, k: string, v: string) =>
    setKeyResults((krs) => krs.map((kr, idx) => (idx === i ? { ...kr, [k]: v } : kr)))

  const addKR = () =>
    setKeyResults((krs) => [...krs, { title: "", tracking_type: "percentage", target_value: "100" }])

  const removeKR = (i: number) => setKeyResults((krs) => krs.filter((_, idx) => idx !== i))

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return }
    setSaving(true)
    try {
      const payload: any = {
        title: form.title,
        description: form.description,
        level: form.level,
        cadence: form.cadence,
        period_start: form.period_start || undefined,
        period_end: form.period_end || undefined,
        department: form.level === "department" && form.department ? form.department : undefined,
      }
      const objRes = await api.post("/api/goals/objectives/", payload)
      const objectiveId = objRes.data.id

      // Create key results linked to the objective
      await Promise.allSettled(
        keyResults
          .filter((kr) => kr.title.trim())
          .map((kr) =>
            api.post("/api/goals/key-results/", {
              objective: objectiveId,
              title: kr.title,
              tracking_type: kr.tracking_type,
              target_value: parseFloat(kr.target_value) || 100,
            })
          )
      )

      toast.success("Objective created successfully!")
      onSuccess()
      onClose()
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to create objective")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Target className="size-5" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 tracking-tight">New Objective</h2>
              <p className="text-[11px] text-slate-400 font-bold">Define an OKR for your organisation</p>
            </div>
          </div>
          <button onClick={onClose} className="size-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X className="size-4 text-slate-600" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Title *</label>
            <input
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
              placeholder="e.g. Improve customer satisfaction to 95%"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Description</label>
            <textarea
              rows={2}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all resize-none"
              placeholder="What does success look like?"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>

          {/* Level + Cadence */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Level</label>
              <select
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={form.level}
                onChange={(e) => updateField("level", e.target.value)}
              >
                {LEVEL_OPTIONS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Cadence</label>
              <select
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={form.cadence}
                onChange={(e) => updateField("cadence", e.target.value)}
              >
                {CADENCE_OPTIONS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Department (only if level = department) */}
          {form.level === "department" && (
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Department</label>
              <select
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={form.department}
                onChange={(e) => updateField("department", e.target.value)}
              >
                <option value="">Select department…</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Period Start</label>
              <input type="date" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={form.period_start} onChange={(e) => updateField("period_start", e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Period End</label>
              <input type="date" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={form.period_end} onChange={(e) => updateField("period_end", e.target.value)} />
            </div>
          </div>

          {/* Key Results */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Key Results</label>
              <button onClick={addKR} className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">
                <Plus className="size-3.5" /> Add KR
              </button>
            </div>
            <div className="space-y-3">
              {keyResults.map((kr, i) => (
                <div key={i} className="bg-slate-50 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      placeholder={`Key Result ${i + 1} title`}
                      value={kr.title}
                      onChange={(e) => updateKR(i, "title", e.target.value)}
                    />
                    {keyResults.length > 1 && (
                      <button onClick={() => removeKR(i)} className="size-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors shrink-0">
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      className="bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none"
                      value={kr.tracking_type}
                      onChange={(e) => updateKR(i, "tracking_type", e.target.value)}
                    >
                      <option value="percentage">Percentage</option>
                      <option value="number">Number</option>
                      <option value="binary">Binary (Done/Not Done)</option>
                    </select>
                    {kr.tracking_type !== "binary" && (
                      <input
                        type="number"
                        className="bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none"
                        placeholder="Target value"
                        value={kr.target_value}
                        onChange={(e) => updateKR(i, "target_value", e.target.value)}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-8 py-6 border-t border-slate-100">
          <button onClick={onClose} className="px-6 py-3 bg-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-all">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            {saving ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="size-4" />}
            {saving ? "Creating…" : "Create Objective"}
          </button>
        </div>
      </div>
    </div>
  )
}
