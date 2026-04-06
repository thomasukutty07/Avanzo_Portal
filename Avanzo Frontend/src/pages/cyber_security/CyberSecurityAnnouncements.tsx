import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { 
  Megaphone, 
  Calendar, 
  User, 
  Clock, 
  ExternalLink,
  Plus
} from "lucide-react"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import { Button } from "@/components/ui/button"

export default function CyberSecurityAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/api/notifications/broadcasts/")
        setAnnouncements(extractResults(res.data))
        setLoading(false)
      } catch (e) {
        console.error(e)
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="p-10 text-slate-400 font-bold font-headline animate-pulse text-xs italic">Synchronizing broadcast feed...</div>

  return (
    <div className="space-y-8 pt-4 pb-12 font-headline bg-[#fcfcfc] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none italic">Operational broadcasts</h1>
          <p className="text-slate-500 mt-2 text-xs font-medium italic italic">Real-time intelligence and official cybersecurity bulletins.</p>
        </div>
        <Link to="/security/create-announcement">
          <Button className="h-10 px-6 bg-violet-600 hover:bg-violet-700 text-white font-black text-[10px] tracking-[0.2em] rounded-xl shadow-lg shadow-violet-600/20 active:scale-95 transition-all">
            <Plus className="size-3.5 mr-2" />
            New broadcast
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-6">
          {announcements.length > 0 ? (
            announcements.map((item, i) => (
              <div key={i} className="group bg-white rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 shadow-sm border border-violet-100 group-hover:scale-105 transition-transform">
                      <Megaphone className="size-4.5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-slate-900 group-hover:text-violet-700 transition-colors uppercase tracking-[0.1em]">{item.title}</p>
                      <div className="flex items-center gap-3 mt-1.5 font-bold text-[9px] text-slate-400 italic">
                        <span className="flex items-center gap-1"><User className="size-3" /> {item.created_by_name}</span>
                        <span className="flex items-center gap-1"><Calendar className="size-3" /> {new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-violet-50 text-violet-600 text-[8px] font-black tracking-widest rounded-lg border border-violet-100 uppercase tabular-nums">
                    Ref: BC-00{i+1}
                  </span>
                </div>
                <p className="text-[13px] text-slate-600 leading-relaxed font-medium italic opacity-80 group-hover:opacity-100 transition-opacity">
                  {item.message}
                </p>
                <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-50">
                  <button className="text-[9px] font-black text-violet-600 hover:underline tracking-widest flex items-center gap-2">
                    Intelligence briefing <ExternalLink className="size-2.5" />
                  </button>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                       <div className="size-1.5 rounded-full bg-emerald-500 shadow-sm" />
                       <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Active broadcast</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dotted border-slate-200">
               <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                  <Megaphone className="size-6 text-slate-200" />
               </div>
               <p className="text-slate-400 font-bold text-sm italic">No active tactical broadcasts identified</p>
               <p className="text-slate-300 text-[10px] mt-2 italic">Official intelligence will appear in this registry.</p>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 size-40 bg-violet-600/10 rounded-full blur-3xl group-hover:bg-violet-600/20 transition-colors" />
            <h4 className="text-white font-black text-[11px] tracking-[0.2em] mb-6 uppercase">System Health</h4>
            <div className="space-y-6 relative z-10">
              {[
                { label: "Transmission node", val: "Operational", tone: "text-emerald-400" },
                { label: "Alert cadence", val: "Real-time", tone: "text-emerald-400" },
                { label: "Protocol", val: "XA-99-ALPHA", tone: "text-violet-400" },
              ].map((info, i) => (
                <div key={i} className="flex justify-between items-baseline border-b border-white/5 pb-4">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{info.label}</span>
                  <span className={`text-[10px] font-black italic ${info.tone} uppercase`}>{info.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <h4 className="text-slate-900 font-black text-[11px] tracking-[0.2em] mb-6 uppercase italic">Operational Cadence</h4>
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                <Clock className="size-5" />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-800 uppercase italic">Last Sync</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 tabular-nums">0.4s ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
