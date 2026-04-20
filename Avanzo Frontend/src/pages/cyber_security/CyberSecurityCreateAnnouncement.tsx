import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { notificationsService } from "@/services/notifications"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Send, Loader2 } from "lucide-react"

export default function CyberSecurityCreateAnnouncementPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const fd = new FormData(e.currentTarget)
      const data = {
        title: String(fd.get("title") ?? "").trim(),
        message: String(fd.get("message") ?? "").trim(),
        severity: "info",
        target_scope: "department",
        department: "Cyber Security"
      }

      if (!data.title || !data.message) {
        toast.error("Intel headline and briefing are required.")
        setSubmitting(false)
        return
      }

      await notificationsService.createBroadcast(data)
      toast.success("Broadcast transmitted. Node sync initialized.")
      navigate("/security/announcements", { replace: true })
    } catch (err: any) {
      console.error(err)
      toast.error("Failed to transmit tactical intelligence node.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 pt-4 min-h-screen pb-12 font-sans bg-[#fcfcfc]">
      <div className="mb-6">
        <Link
          to="/security/announcements"
          className="group flex items-center gap-2 text-[10px] font-black text-violet-600 tracking-widest hover:text-violet-800 transition-colors uppercase"
        >
          <ArrowLeft className="size-3 group-hover:-translate-x-1 transition-transform" />
          Back to broadcasts
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-slate-900 tracking-tight leading-none">New broadcast</h1>
        <p className="text-slate-500 mt-3 text-xs font-normal text-slate-400">Draft and transmit official cybersecurity intelligence to the unit.</p>
      </div>

      <form
        className="max-w-3xl space-y-8 rounded-3xl border border-slate-100 bg-white p-10 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <label htmlFor="title" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              Broadcast Headline
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              disabled={submitting}
              className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-[13px] font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-violet-600/5 focus:border-violet-100 outline-none transition-all"
              placeholder="e.g. Critical Node Maintenance - Sector 7G"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="message" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              Intelligence Briefing
            </label>
            <textarea
              id="message"
              name="message"
              rows={8}
              required
              disabled={submitting}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-[13px] font-medium text-slate-600 placeholder:text-slate-300 focus:bg-white outline-none resize-none leading-relaxed"
              placeholder="Detailed intelligence briefing for the cyber security response team..."
            />
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
              <Send className="size-3.5 mr-3" />
            )}
            {submitting ? "SENDING..." : "SEND BROADCAST"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            className="h-12 px-8 border-slate-100 bg-white text-[10px] font-black tracking-[0.2em] text-slate-500 hover:bg-slate-50 rounded-2xl"
            onClick={() => navigate("/security/announcements")}
          >
            CANCEL
          </Button>
        </div>
      </form>
    </div>
  )
}
