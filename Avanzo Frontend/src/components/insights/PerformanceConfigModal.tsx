import { useState, useEffect } from "react"
import { X, SlidersHorizontal, Save } from "lucide-react"
import { api } from "@/lib/axios"
import { toast } from "sonner"

interface Props {
  open: boolean
  onClose: () => void
}

export function PerformanceConfigModal({ open, onClose }: Props) {
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [weights, setWeights] = useState({
    attendance_weight: 25,
    delivery_weight: 35,
    quality_weight: 25,
    reliability_weight: 15,
  })

  useEffect(() => {
    if (!open) return
    setLoading(true)
    api.get("/api/performance/config/")
      .then((r) => setWeights({
        attendance_weight: Math.round(parseFloat(r.data.weight_attendance ?? 0.20) * 100),
        delivery_weight: Math.round(parseFloat(r.data.weight_delivery ?? 0.35) * 100),
        quality_weight: Math.round(parseFloat(r.data.weight_quality ?? 0.25) * 100),
        reliability_weight: Math.round(parseFloat(r.data.weight_reliability ?? 0.20) * 100),
      }))
      .catch(() => toast.error("Could not load config"))
      .finally(() => setLoading(false))
  }, [open])

  if (!open) return null

  const total = weights.attendance_weight + weights.delivery_weight + weights.quality_weight + weights.reliability_weight
  const isValid = Math.round(total) === 100

  const update = (k: keyof typeof weights, v: number) =>
    setWeights((w) => ({ ...w, [k]: v }))

  const handleSave = async () => {
    if (!isValid) { toast.error("Weights must total exactly 100%"); return }
    setSaving(true)
    try {
      const payload = {
        weight_attendance: weights.attendance_weight / 100,
        weight_delivery: weights.delivery_weight / 100,
        weight_quality: weights.quality_weight / 100,
        weight_reliability: weights.reliability_weight / 100,
      }
      await api.put("/api/performance/config/", payload)
      toast.success("Performance weights updated!")
      onClose()
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to update config")
    } finally {
      setSaving(false)
    }
  }

  const SLIDERS = [
    { key: "attendance_weight" as const, label: "Attendance", color: "bg-blue-500", desc: "Clock-in/out consistency, lateness" },
    { key: "delivery_weight" as const, label: "Delivery", color: "bg-violet-500", desc: "Task completion rate & velocity" },
    { key: "quality_weight" as const, label: "Quality", color: "bg-emerald-500", desc: "Output quality & review scores" },
    { key: "reliability_weight" as const, label: "Reliability", color: "bg-amber-500", desc: "Consistency over time" },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-8 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <SlidersHorizontal className="size-5" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 tracking-tight">Performance Weights</h2>
              <p className="text-[11px] text-slate-400 font-bold">Configure how scores are calculated</p>
            </div>
          </div>
          <button onClick={onClose} className="size-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X className="size-4 text-slate-600" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="size-8 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {SLIDERS.map(({ key, label, color, desc }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-black text-slate-900">{label}</span>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">{desc}</p>
                    </div>
                    <span className="text-xl font-black text-slate-900 w-16 text-right">{weights[key]}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={weights[key]}
                    onChange={(e) => update(key, parseInt(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--tw-${color.replace("bg-", "")}) ${weights[key]}%, #f1f5f9 ${weights[key]}%)`
                    }}
                  />
                </div>
              ))}

              {/* Total indicator */}
              <div className={`flex items-center justify-between p-4 rounded-2xl ${isValid ? "bg-emerald-50" : "bg-rose-50"}`}>
                <span className={`text-[11px] font-black uppercase tracking-widest ${isValid ? "text-emerald-600" : "text-rose-600"}`}>
                  Total Weight
                </span>
                <span className={`text-xl font-black ${isValid ? "text-emerald-600" : "text-rose-600"}`}>
                  {total}% {isValid ? "✓" : `— needs ${100 - total > 0 ? "+" : ""}${100 - total}%`}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-8 py-6 border-t border-slate-100">
          <button onClick={onClose} className="px-6 py-3 bg-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-all">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !isValid || loading}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            {saving ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="size-4" />}
            {saving ? "Saving…" : "Save Weights"}
          </button>
        </div>
      </div>
    </div>
  )
}
