import { TeamLeadChrome } from "@/components/portal/teamlead/TeamLeadChrome"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { notificationsService } from "@/services/notifications"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { 
  Plus, 
  Clock, 
  Trash2, 
  Edit3,
  Search,
  Pin,
  Megaphone,
  Loader2,
  Calendar
} from "lucide-react"

export default function TeamAnnouncementsPage() {
  useDesignPortalLightTheme()
  const [broadcasts, setBroadcasts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchBroadcasts()
  }, [])

  const fetchBroadcasts = async () => {
    try {
      setLoading(true)
      const data = await notificationsService.getBroadcasts()
      setBroadcasts(Array.isArray(data) ? data : (data.results || []))
    } catch (error) {
      toast.error("Intelligence synchronization failed.")
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
      <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <header>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 font-headline leading-none uppercase">Team Communications</h2>
            <p className="text-sm font-bold text-slate-400 mt-3 uppercase tracking-widest leading-none">Broadcast critical strategic updates and sector alerts</p>
          </header>
          <div className="flex gap-4">
             <Link 
              to="/teamlead/announcements/create"
              className="flex items-center gap-2.5 px-7 py-3 bg-violet-600 text-white font-black rounded-xl hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-600/20 transition-all text-[11px] uppercase tracking-widest active:scale-95 shadow-md shadow-violet-600/10"
            >
              <Plus className="size-4 stroke-[3px]" />
              New Broadcast
            </Link>
          </div>
        </div>

        {/* Filters/Search Row */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-slate-300 group-focus-within:text-violet-600 transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter intelligence feeds and updates..." 
              className="w-full bg-white border border-slate-100 rounded-3xl pl-16 pr-6 py-4.5 text-[14px] font-black text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:border-violet-200 transition-all placeholder:text-slate-200 outline-none shadow-sm shadow-slate-200/10"
            />
          </div>
          <select className="bg-white border border-slate-100 rounded-2xl px-6 py-4 text-[11px] font-black text-slate-700 min-w-[220px] shadow-sm uppercase tracking-[0.2em] focus:ring-4 focus:ring-violet-600/5 outline-none cursor-pointer">
            <option>All Sectors</option>
            <option>Cyber Security</option>
            <option>Operations Hub</option>
            <option>Engineering Unit</option>
          </select>
        </div>

        {/* Announcements List */}
        <div className="space-y-10">
          {loading ? (
             <div className="py-40 text-center">
                <Loader2 className="size-10 animate-spin text-violet-600 mx-auto mb-6" />
                <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">Synchronizing Intelligence Feeds...</p>
             </div>
          ) : filteredBroadcasts.length === 0 ? (
             <div className="py-40 text-center opacity-30">
                <Megaphone className="size-16 mx-auto mb-6 text-slate-200" />
                <p className="text-[11px] font-black uppercase tracking-[0.2em]">No Strategic Updates Found</p>
             </div>
          ) : filteredBroadcasts.map((item) => (
            <div key={item.id} className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-2xl hover:border-violet-100 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-violet-600/0 group-hover:bg-violet-600 transition-all duration-500 shadow-[0_0_15px_rgba(124,58,237,0.4)]" />
              
              {item.is_active && (
                <div className="absolute top-12 right-12 text-violet-600 bg-violet-50 p-4 rounded-3xl shadow-lg shadow-violet-600/10 border border-violet-100 animate-pulse">
                  <Pin className="size-6 stroke-[2.5px]" />
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-10">
                 <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${
                   item.severity === 'critical' ? 'bg-red-50 text-red-700 border-red-100' :
                   item.severity === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                   'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm'
                 }`}>
                   {item.severity || 'Tactical'}
                 </span>
                 <div className="h-1.5 w-1.5 bg-slate-200 rounded-full" />
                 <div className="flex items-center gap-3 text-slate-300">
                    <Clock className="size-4.5" />
                    <span className="text-[11px] font-black uppercase tracking-widest tabular-nums">{item.created_at?.split('T')[0] || 'Mission Day'}</span>
                 </div>
              </div>

              <h3 className="font-headline text-3xl font-black text-slate-900 group-hover:text-violet-600 transition-colors mb-8 leading-tight tracking-tight uppercase">{item.title}</h3>
              <p className="text-slate-600 text-[16px] leading-[1.8] font-medium mb-12 max-w-5xl opacity-80">{item.message}</p>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-10 pt-10 border-t border-slate-50">
                <div className="flex items-center gap-5 group/author cursor-pointer" onClick={() => toast.info(`Syncing unit records: ${item.author_name || 'Directive Source'}`)}>
                  <div className="size-16 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center text-violet-700 font-black text-xs shadow-sm group-hover/author:bg-violet-600 group-hover/author:text-white transition-all ring-8 ring-white p-1">
                    <div className="size-full flex items-center justify-center bg-white rounded-2xl group-hover/author:bg-violet-500 transition-colors">
                       {(item.author_name || 'System').split(' ').map((n:any) => n[0]).join('')}
                    </div>
                  </div>
                  <div>
                    <p className="text-[15px] font-black text-slate-900 group-hover/author:text-violet-600 transition-colors uppercase tracking-tight">{item.author_name || 'Avanzo Strategic'}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none mt-2.5 opacity-60 flex items-center gap-2">
                       <Megaphone className="size-3 text-violet-600" />
                       Strategic Command Center
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                   <button 
                    onClick={() => toast.info("Initializing tactical re-transmission...")}
                    className="flex items-center gap-3 px-6 py-3.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-2xl transition-all text-[11px] font-black uppercase tracking-widest border border-slate-100 hover:border-violet-100 shadow-sm"
                   >
                     <Edit3 className="size-4.5" />
                     Reform
                   </button>
                   <button 
                    onClick={() => toast.error("Intelligence purged from tactical storage.")}
                    className="flex items-center gap-3 px-6 py-3.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-2xl transition-all text-[11px] font-black uppercase tracking-widest border border-slate-100 hover:border-red-100 shadow-sm"
                   >
                     <Trash2 className="size-4.5" />
                     Purge
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </TeamLeadChrome>
  )
}
