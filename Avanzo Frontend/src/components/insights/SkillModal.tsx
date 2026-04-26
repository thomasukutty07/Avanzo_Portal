import { useState } from "react"
import { X, Plus, BookOpen } from "lucide-react"
import { api } from "@/lib/axios"
import { toast } from "sonner"

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const CATEGORIES = [
  { value: "development", label: "Development" },
  { value: "design", label: "Design" },
  { value: "management", label: "Management" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "compliance", label: "Compliance" },
]

export function SkillModal({ open, onClose, onSuccess }: Props) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: "", category: "development", description: "" })

  if (!open) return null

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("Skill name is required"); return }
    setSaving(true)
    try {
      await api.post("/api/skills/catalog/", {
        name: form.name.trim(),
        category: form.category,
        description: form.description,
      })
      toast.success(`Skill "${form.name}" added to catalog!`)
      setForm({ name: "", category: "Technical", description: "" })
      onSuccess()
      onClose()
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to create skill")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BookOpen className="size-5" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 tracking-tight">Add Skill</h2>
              <p className="text-[11px] text-slate-400 font-bold">Add to the organisation skill catalog</p>
            </div>
          </div>
          <button onClick={onClose} className="size-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X className="size-4 text-slate-600" />
          </button>
        </div>

        <div className="p-8 space-y-5">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Skill Name *</label>
            <input
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all"
              placeholder="e.g. React, Python, AWS, Leadership"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setForm((f) => ({ ...f, category: cat.value }))}
                  className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all text-left ${
                    form.category === cat.value
                      ? "bg-amber-50 border-amber-200 text-amber-700"
                      : "bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Description (optional)</label>
            <textarea
              rows={2}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
              placeholder="Brief description of this skill…"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-8 py-6 border-t border-slate-100">
          <button onClick={onClose} className="px-6 py-3 bg-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-all">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {saving ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="size-4" />}
            {saving ? "Adding…" : "Add Skill"}
          </button>
        </div>
      </div>
    </div>
  )
}
