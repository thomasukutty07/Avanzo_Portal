import { useState } from "react"
import { Megaphone, Plus, Calendar, Check, MoreHorizontal } from "lucide-react"

export default function TechnicalAnnouncementsPage() {
  const items = [
    {
      title: "Deployment window — Saturday 02:00 UTC",
      body: "Kubernetes cluster upgrades; expect brief API blips across the platform for approximately 15 minutes. Services will auto-recover.",
      date: "Mar 28, 2026",
      urgent: true,
    },
    {
      title: "New code review SLA",
      body: "Reviews requested before 14:00 local should be completed same day. Please make sure your GitHub integrations are properly hooked up to Slack.",
      date: "Mar 20, 2026",
      urgent: false,
    },
    {
      title: "Database Performance Notice",
      body: "We are monitoring queries to the main analytics DB. If you are writing intensive reports, please rate-limit your batch calls.",
      date: "Mar 15, 2026",
      urgent: false,
    }
  ]

  const [read, setRead] = useState<Record<string, boolean>>({})

  return (
    <div className="space-y-6 pb-12 font-display bg-[#fcfcfc] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 mb-1">
            TECHNICAL MANAGEMENT
          </p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-headline">
            Announcements
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Department-wide updates and maintenance notices.</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-[13px] font-bold text-white hover:bg-violet-700 shadow-lg shadow-violet-600/20 transition-all"
        >
          <Plus className="size-4" />
          Post Update
        </button>
      </div>

      <div className="max-w-4xl space-y-5">
        {items.map((a) => (
          <article
            key={a.title}
            className={`relative rounded-2xl border bg-white p-8 shadow-sm transition-all duration-300 ${read[a.title] ? 'border-slate-100 opacity-70' : 'border-violet-100 hover:shadow-md'}`}
          >
            {a.urgent && !read[a.title] && (
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                Urgent Notice
              </div>
            )}
            
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-5">
                <div className={`mt-1 flex size-12 shrink-0 items-center justify-center rounded-2xl ${read[a.title] ? 'bg-slate-50 text-slate-400' : 'bg-violet-50 text-violet-600'}`}>
                  <Megaphone className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Calendar className="size-3" />
                      {a.date}
                    </p>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 font-headline mb-2">{a.title}</h2>
                  <p className="text-sm font-medium leading-relaxed text-slate-500 max-w-2xl">{a.body}</p>
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-3">
                <button className="text-slate-300 hover:text-slate-600 transition-colors">
                  <MoreHorizontal className="size-5" />
                </button>
                <button
                  type="button"
                  className={`mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors ${read[a.title] ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600 hover:bg-violet-50 hover:text-violet-700'}`}
                  disabled={read[a.title]}
                  onClick={() => setRead((r) => ({ ...r, [a.title]: true }))}
                >
                  <Check className={`size-3.5 ${read[a.title] ? 'block' : 'hidden'}`} />
                  {read[a.title] ? "Read" : "Mark as read"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
