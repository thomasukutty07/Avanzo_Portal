import TeamLeadChrome from "@/components/portal/teamlead/TeamLeadChrome"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { notificationsService } from "@/services/notifications"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { 
  Plus, 
  Clock, 
  Trash2, 
  Edit3,
  Search,
  Pin,
  Megaphone,
  Loader2
} from "lucide-react"

export default function TeamAnnouncementsPage() {
  useDesignPortalLightTheme()
  const [broadcasts, setBroadcasts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetchBroadcasts()
  }, [])

  const fetchBroadcasts = async () => {
    try {
      setLoading(true)
      const data = await notificationsService.getBroadcasts()
      setBroadcasts(Array.isArray(data) ? data : (data.results || []))
    } catch (error) {
      toast.error("Failed to load announcements.")
      setBroadcasts([])
    } finally {
      setLoading(false)
    }
  }

  const filteredBroadcasts = broadcasts.filter(b => 
    b.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.message?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <TeamLeadChrome>
      <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700 font-sans">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-headline leading-none">Team Announcements</h2>
            <p className="text-sm font-medium text-slate-500 mt-2 font-headline leading-none">Post updates and news for your team</p>
          </div>
          <div className="flex gap-4 shrink-0">
             <button 
              onClick={() => navigate("/team-announcements/create")}
              className="flex items-center gap-2.5 px-6 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-600/20 transition-all text-sm active:scale-95 shadow-md shadow-violet-600/10"
            >
              <Plus className="size-4 stroke-[3px]" />
              Create announcement
            </button>
          </div>
        </div>

        {/* Filters/Search Row */}
        <div className="flex flex-col md:flex-row gap-5">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-4.5 text-slate-300 group-focus-within:text-violet-600 transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements and updates..." 
              className="w-full bg-white border border-slate-100 rounded-2xl pl-16 pr-6 py-4 text-sm font-medium text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:border-violet-200 transition-all placeholder:text-slate-300 outline-none shadow-sm shadow-slate-200/10 tracking-tight"
            />
          </div>
          <select className="bg-white border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold text-slate-700 min-w-[200px] shadow-sm focus:ring-4 focus:ring-violet-600/5 outline-none cursor-pointer">
            <option>All sectors</option>
            <option>Cyber Security</option>
            <option>Operations Hub</option>
            <option>Engineering Unit</option>
          </select>
        </div>

        {/* Announcements List */}
        <div className="space-y-8">
          {loading ? (
             <div className="py-32 text-center text-[11px] font-bold text-slate-300">
                <Loader2 className="size-10 animate-spin text-violet-600 mx-auto mb-6" />
                Loading announcements...
             </div>
          ) : filteredBroadcasts.length === 0 ? (
             <div className="py-32 text-center space-y-6">
                <div className="opacity-30">
                  <Megaphone className="size-16 mx-auto mb-6 text-slate-200" />
                  <p className="text-sm font-medium text-slate-400">No announcements found</p>
                </div>
                <button 
                  onClick={() => navigate("/team-announcements/create")}
                  className="px-8 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20 active:scale-95 text-xs mx-auto"
                >
                  Create announcement
                </button>
             </div>
          ) : filteredBroadcasts.map((item) => (
            <div key={item.id} className="group relative bg-white border border-slate-100 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:border-violet-200 transition-all duration-500">
              {/* Severity Side Accent */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-500 ${
                item.severity === 'critical' ? 'bg-red-500 shadow-[2px_0_15px_rgba(239,68,68,0.3)]' :
                item.severity === 'warning' ? 'bg-amber-500 shadow-[2px_0_15px_rgba(245,158,11,0.3)]' :
                'bg-emerald-500 shadow-[2px_0_15px_rgba(16,185,129,0.3)]'
              }`} />

              <div className="p-8 md:p-10 flex flex-col md:flex-row gap-10">
                {/* Main Content Area */}
                <div className="flex-1 space-y-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-bold capitalize border ${
                      item.severity === 'critical' ? 'bg-red-50 text-red-700 border-red-100' :
                      item.severity === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                      {item.severity || 'Tag'}
                    </span>
                    <div className="h-4 w-px bg-slate-100" />
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="size-3.5" />
                     <span className="text-[10px] font-bold tabular-nums opacity-60">
                        Date: {item.created_at?.split('T')[0] || 'Day 0'}
                      </span>
                    </div>
                    {item.is_active && (
                       <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-violet-50 rounded-full border border-violet-100">
                          <Pin className="size-3 text-violet-600" />
                          <span className="text-[9px] font-bold text-violet-600">Pinned</span>
                       </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tight capitalize group-hover:text-violet-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-slate-500 text-sm leading-relaxed font-medium max-w-3xl opacity-80 italic">
                      "{item.message}"
                    </p>
                  </div>

                  <div className="pt-6 flex flex-wrap items-center justify-between gap-6 border-t border-slate-50">
                    <div className="flex items-center gap-4 group/author cursor-pointer" onClick={() => toast.info(`Profile details: ${item.author_name}`)}>
                      <div className="size-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-violet-600 font-black text-xs shadow-sm ring-4 ring-white group-hover/author:bg-violet-600 group-hover/author:text-white transition-all">
                        {(item.author_name || 'S').split(' ').map((n:any) => n[0]).join('')}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900 group-hover/author:text-violet-600 transition-colors tracking-tight leading-none capitalize">
                          {item.author_name || 'Avanzo Command'}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 leading-none opacity-60">
                          Management
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                       <button 
                        onClick={() => toast.info("Editing announcement...")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-violet-600 hover:bg-violet-50 hover:border-violet-100 transition-all text-xs font-bold shadow-sm"
                      >
                        <Edit3 className="size-3.5" />
                        Edit
                      </button>
                      <button 
                        onClick={() => toast.error("Announcement deleted.")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all text-xs font-bold shadow-sm"
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </TeamLeadChrome>
  )
}
