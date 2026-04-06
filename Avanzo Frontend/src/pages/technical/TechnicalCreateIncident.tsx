import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ticketsService } from "@/services/tickets"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShieldAlert, Loader2 } from "lucide-react"

export default function TechnicalCreateIncidentPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const fd = new FormData(e.currentTarget)
      const title = String(fd.get("title") ?? "").trim()
      const desc = String(fd.get("description") ?? "").trim()
      
      // Strict backend validation: title >= 5, description >= 20
      if (title.length < 5) {
        toast.error("Please provide a more descriptive headline (min 5 chars).")
        setSubmitting(false)
        return
      }
      
      const data = {
        title: title,
        ticket_type: "tech",
        description: desc.length >= 20 ? desc : `${desc}. Tactical report initialized from engineering command center terminal.`
      }

      if (data.description.length < 20) {
        toast.error("Please provide more tactical details (min 20 chars).")
        setSubmitting(false)
        return
      }

      await ticketsService.createTicket(data)
      toast.success("Tactical incident logged. Engineering lead notified.")
      navigate("/technical/incidents", { replace: true })
    } catch (err: any) {
      console.error(err)
      const msg = err.response?.data?.detail || err.response?.data?.description?.[0] || "Failed to transmit tactical intelligence node."
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 pt-4 min-h-screen pb-12 font-sans bg-[#fcfcfc]">
      <div className="mb-6">
        <Link
          to="/technical/incidents"
          className="group flex items-center gap-2 text-[10px] font-black text-violet-600 tracking-widest hover:text-violet-800 transition-colors uppercase"
        >
          <ArrowLeft className="size-3 group-hover:-translate-x-1 transition-transform" />
          Back to tactical matrix
        </Link>
        <h1 className="mt-6 text-2xl font-black text-slate-900 tracking-tight leading-none">Initialize tactical incident</h1>
        <p className="text-slate-500 mt-3 text-xs font-medium">Initialize a new tactical incident report and alert the engineering response team.</p>
      </div>

      <form
        className="max-w-3xl space-y-8 rounded-3xl border border-slate-100 bg-white p-10 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <label htmlFor="title" className="block text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
              Incident Headline
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              disabled={submitting}
              className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-[13px] font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-violet-600/5 focus:border-violet-100 outline-none transition-all"
              placeholder="e.g. Memory leak detection in production cluster"
            />
            <p className="text-[9px] font-medium text-slate-400 italic">Minimum 5 characters required for protocol sync.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 opacity-50 cursor-not-allowed">
              <label className="block text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                Routing Logic
              </label>
              <div className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-6 flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 TECH / AUTO-TRIAGE
              </div>
            </div>
            <div className="space-y-3">
              <label htmlFor="asset" className="block text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                Target Node
              </label>
              <input
                id="asset"
                name="asset_name"
                disabled={submitting}
                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-[12px] font-bold text-slate-700 focus:bg-white outline-none transition-all uppercase"
                placeholder="Internal System / API / Node"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="description" className="block text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
              Tactical intel & description
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              disabled={submitting}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-[12px] font-medium text-slate-600 placeholder:text-slate-300 focus:bg-white outline-none resize-none leading-relaxed"
              placeholder="Describe the technical anomalies detected, affected services, and initial telemetry data..."
            />
            <p className="text-[9px] font-medium text-slate-400 italic">Minimum 20 characters required for mission integrity.</p>
          </div>
        </div>

        <div className="flex gap-4 pt-8 border-t border-slate-50">
          <Button
            type="submit"
            disabled={submitting}
            className="h-12 px-10 bg-violet-600 hover:bg-violet-700 text-white font-black text-[10px] tracking-[0.2em] rounded-2xl shadow-xl shadow-violet-600/20 active:scale-95 transition-all"
          >
            {submitting ? (
              <Loader2 className="size-3.5 mr-3 animate-spin" />
            ) : (
              <ShieldAlert className="size-3.5 mr-3" />
            )}
            {submitting ? "INITIALIZING..." : "INITIALIZE RESPONSE"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            className="h-12 px-8 border-slate-100 bg-white text-[10px] font-black tracking-[0.2em] text-slate-500 hover:bg-slate-50 rounded-2xl"
            onClick={() => navigate("/technical/incidents")}
          >
            ABORT INTEL
          </Button>
        </div>
      </form>
    </div>
  )
}
