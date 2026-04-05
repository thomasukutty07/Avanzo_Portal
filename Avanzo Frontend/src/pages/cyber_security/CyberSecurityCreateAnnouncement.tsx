import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Send } from "lucide-react"

export default function CyberSecurityCreateAnnouncementPage() {
  const navigate = useNavigate()
  return (
    <div className="space-y-8 pt-4 min-h-screen pb-12 font-display">
      <div className="mb-6">
        <Link
          to="/cyber_security/announcements"
          className="group flex items-center gap-2 text-[10px] font-black text-violet-600 uppercase tracking-widest hover:text-violet-800 transition-colors font-headline"
        >
          <ArrowLeft className="size-3 group-hover:-translate-x-1 transition-transform" />
          Back to tactical feed
        </Link>
        <h1 className="mt-6 text-3xl font-black text-slate-900 tracking-tight leading-none uppercase italic font-headline">Broadcast Intel</h1>
        <p className="text-slate-500 mt-2 font-medium italic font-headline">Draft a critical update for the CyberSecurity operations channel.</p>
      </div>

      <form
        className="max-w-3xl space-y-8 rounded-3xl border border-slate-100 bg-white p-10 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          const title = String(fd.get("title") ?? "").trim()
          if (!title) {
            toast.error("An intelligence title is required before broadcasting.")
            return
          }
          toast.success("Broadcast queued for local deployment.")
          navigate("/cyber_security/announcements", { replace: true })
        }}
      >
        <div className="space-y-3 font-headline">
          <label htmlFor="title" className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Intel Headline
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-[14px] font-black text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-violet-600/5 focus:border-violet-100 outline-none transition-all uppercase tracking-tight"
            placeholder="e.g. EMERGENCY PATCH: CVE-2024-X42"
          />
        </div>
        
        <div className="space-y-3 font-headline">
          <label htmlFor="body" className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Intelligence Content
          </label>
          <textarea
            id="body"
            name="body"
            rows={10}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-[14px] font-bold text-slate-600 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-violet-600/5 focus:border-violet-100 outline-none transition-all resize-none italic leading-relaxed"
            placeholder="Detail the critical vulnerability or operational update for the team..."
          />
        </div>

        <div className="flex gap-4 pt-6 border-t border-slate-50">
          <Button
            type="submit"
            className="h-14 px-10 bg-violet-600 hover:bg-violet-700 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-violet-600/20 active:scale-95 transition-all font-headline"
          >
            <Send className="size-4 mr-3" />
            Establish Broadcast
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-14 px-8 border-slate-100 bg-white text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-50 rounded-2xl font-headline"
            onClick={() => navigate("/cyber_security/announcements")}
          >
            Abort Draft
          </Button>
        </div>
      </form>
    </div>
  )
}
