import { useState, useEffect } from "react"
import { Megaphone, Plus, Calendar, Check, MoreHorizontal, Loader2 } from "lucide-react"
import { notificationsService } from "@/services/notifications";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

type Announcement = {
  id: string;
  title: string;
  body: string;
  date: string;
  urgent: boolean;
}

export default function TechnicalAnnouncementsPage() {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [read, setRead] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const res = await notificationsService.getBroadcasts();
        const data = Array.isArray(res) ? res : (res.results || []);
        
        const mapped: Announcement[] = data.map((b: any) => ({
          id: b.id,
          title: b.title,
          body: b.message,
          date: b.created_at ? format(parseISO(b.created_at), 'MMM dd, yyyy') : "Recently",
          urgent: b.is_urgent || false
        }));

        setAnnouncements(mapped);
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
        toast.error("Failed to synchronize announcement board.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
        <div className="flex h-[80vh] items-center justify-center bg-[#fcfcfc]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Compiling Broadcast Registry...</p>
            </div>
        </div>
    );
  }

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
          onClick={() => toast.info("Post announcement coming soon.")}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-[13px] font-bold text-white hover:bg-violet-700 shadow-lg shadow-violet-600/20 transition-all font-headline"
        >
          <Plus className="size-4" />
          Post Update
        </button>
      </div>

      <div className="max-w-4xl space-y-5 flex-1">
        {announcements.length > 0 ? (
            announcements.map((a) => (
              <article
                key={a.id}
                className={`relative rounded-2xl border bg-white p-8 shadow-sm transition-all duration-300 ${read[a.id] ? 'border-slate-100 opacity-70' : 'border-violet-100 hover:shadow-md'}`}
              >
                {a.urgent && !read[a.id] && (
                  <div className="absolute top-0 right-8 -translate-y-1/2 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                    Urgent Notice
                  </div>
                )}
                
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-5">
                    <div className={`mt-1 flex size-12 shrink-0 items-center justify-center rounded-2xl ${read[a.id] ? 'bg-slate-50 text-slate-400' : 'bg-violet-50 text-violet-600'}`}>
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
                      className={`mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors ${read[a.id] ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600 hover:bg-violet-50 hover:text-violet-700'}`}
                      disabled={read[a.id]}
                      onClick={() => setRead((r) => ({ ...r, [a.id]: true }))}
                    >
                      <Check className={`size-3.5 ${read[a.id] ? 'block' : 'hidden'}`} />
                      {read[a.id] ? "Read" : "Mark as read"}
                    </button>
                  </div>
                </div>
              </article>
            ))
        ) : (
            <div className="flex flex-col items-center justify-center min-h-[40vh] bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
                 <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                    <Megaphone className="size-6 text-slate-300" />
                 </div>
                 <h2 className="text-lg font-bold text-slate-900 font-headline">All Clear</h2>
                 <p className="text-sm font-medium text-slate-400 mt-2">No department-wide announcements found at this time.</p>
            </div>
        )}
      </div>
    </div>
  )
}
