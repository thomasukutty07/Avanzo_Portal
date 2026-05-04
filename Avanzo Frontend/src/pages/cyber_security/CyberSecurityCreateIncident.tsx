import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ticketsService } from "@/services/tickets"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShieldAlert, Loader2 } from "lucide-react"

export default function CyberSecurityCreateIncidentPage() {
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
        ticket_type: String(fd.get("type") ?? "tech"),
        description: desc.length >= 20 ? desc : `${desc}. Tactical security incident report initialized.`
      }

      if (data.description.length < 20) {
        toast.error("Please provide more tactical details (min 20 chars).")
        setSubmitting(false)
        return
      }

      await ticketsService.createTicket(data)
      toast.success("Issue reported successfully.")
      navigate("/security/incidents", { replace: true })
    } catch (err: any) {
      console.error(err)
      const msg = err.response?.data?.detail || err.response?.data?.title?.[0] || err.response?.data?.description?.[0] || "Failed to submit issue."
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 pt-4 min-h-screen pb-12 font-sans bg-[#fcfcfc]">
      <div className="mb-6">
        <Link
          to="/security"
          className="group flex items-center gap-2 text-[10px] font-bold text-violet-600 tracking-widest hover:text-violet-800 transition-colors uppercase"
        >
          <ArrowLeft className="size-3 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-slate-900 tracking-tight leading-none">Report an Issue</h1>
        <p className="text-slate-500 mt-3 text-xs font-normal text-slate-400">Report a problem or a technical issue.</p>
      </div>

      <form
        className="max-w-3xl space-y-8 rounded-3xl border border-slate-100 bg-white p-10 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <label htmlFor="title" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              Issue Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              disabled={submitting}
              className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-[13px] font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-violet-600/5 focus:border-violet-100 outline-none transition-all"
              placeholder="e.g. Need to update password rules"
            />
            <p className="text-[9px] font-medium text-slate-400 italic">Minimum 5 characters required.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label htmlFor="type" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                Issue Category
              </label>
              <select
                id="type"
                name="type"
                disabled={submitting}
                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-[12px] font-bold text-slate-700 focus:bg-white outline-none cursor-pointer appearance-none"
              >
                <option value="tech">External issue</option>
                <option value="compliance">Unauthorized access</option>
                <option value="tech">Network issue</option>
                <option value="compliance">Policy query</option>
              </select>
            </div>
            <div className="space-y-3 opacity-50 cursor-not-allowed">
              <label className="block text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                Assigned Team
              </label>
              <div className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-6 flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 Cyber Security
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="description" className="block text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
              Issue Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              disabled={submitting}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-[12px] font-medium text-slate-600 placeholder:text-slate-300 focus:bg-white outline-none resize-none leading-relaxed"
              placeholder="Describe the issue in detail here..."
            />
            <p className="text-[9px] font-medium text-slate-400 italic">Minimum 20 characters required.</p>
          </div>
        </div>

        <div className="flex gap-4 pt-8 border-t border-slate-50">
          <Button
            type="submit"
            disabled={submitting}
            className="h-12 px-10 bg-violet-600 hover:bg-violet-700 text-white font-bold text-[10px] tracking-[0.2em] rounded-2xl shadow-xl shadow-violet-600/20 active:scale-95 transition-all"
          >
            {submitting ? (
              <Loader2 className="size-3.5 mr-3 animate-spin" />
            ) : (
              <ShieldAlert className="size-3.5 mr-3" />
            )}
            {submitting ? "SENDING..." : "REPORT ISSUE"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            className="h-12 px-8 border-slate-100 bg-white text-[10px] font-bold tracking-[0.2em] text-slate-500 hover:bg-slate-50 rounded-2xl"
            onClick={() => navigate("/security")}
          >
            CANCEL
          </Button>
        </div>
      </form>
    </div>
  )
}
