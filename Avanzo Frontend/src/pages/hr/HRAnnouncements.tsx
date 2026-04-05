import { HRPortalChrome } from "@/components/portal/hr/HRPortalChrome"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import { useEffect, useState } from "react"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { toast } from "sonner"
import { 
  Megaphone, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Pin,
  Trash2,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react"


export default function HRAnnouncementsPage() {
  useDesignPortalLightTheme()
  const [announcements, setAnnouncements] = useState<any[]>([])

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const res = await api.get("/api/notifications/broadcasts/")
        const apiAnns = extractResults(res.data)
        const mapped = apiAnns.map((a: any) => ({
          id: a.id,
          title: a.title,
          content: a.content || "Please read the full announcement details.",
          pinned: a.is_critical,
          date: new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          type: a.target_scope === "org_wide" ? "Internal Operations" : "Department Specific",
          category: a.target_scope === "org_wide" ? "Announcement" : "Team Update",
          priority: a.is_critical ? "High" : "Normal",
        }))
        setAnnouncements(mapped)
      } catch (e) {
        console.error(e)
      }
    }
    loadAnnouncements()
  }, [])

  return (
    <HRPortalChrome>
      <div className="p-8 space-y-10 bg-[#fcfcfc] min-h-screen font-display">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="font-headline space-y-1">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 italic">
               COMMUNICATION NODE • HR UNIT
             </p>
             <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Personnel Feed</h1>
             <p className="text-sm font-medium text-slate-500 italic mt-2">Dispatch organizational updates and manage personnel announcements.</p>
          </div>
          <button 
            onClick={() => toast.success("Opening announcement composer...")}
            className="flex items-center gap-3 px-10 py-4 bg-violet-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-violet-900/20 hover:bg-violet-700 transition-all active:scale-95 shrink-0 font-headline italic"
          >
            <Plus className="h-4 w-4 stroke-[3px]" />
            New Broadcast
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-6">
             <div className="bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden flex flex-col font-display">
                <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50/10">
                   <h3 className="font-headline text-xl font-black text-slate-900 leading-none tracking-tight">Active Dispatches</h3>
                   <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-64">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                         <input 
                            placeholder="Search updates..."
                            className="w-full bg-white border-slate-200 rounded-xl pl-10 py-2 text-xs font-medium focus:ring-violet-700/10 focus:border-violet-700 transition-all"
                            type="text"
                         />
                      </div>
                      <button onClick={() => toast.info("Filters operational")} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors shadow-sm"><Filter className="h-5 w-5" /></button>
                   </div>
                </div>

                <div className="divide-y divide-slate-50">
                   {announcements.map((post) => (
                     <div key={post.id} className="p-8 hover:bg-violet-50/10 transition-all group relative cursor-pointer" onClick={() => toast.info(`Viewing ${post.title}...`)}>
                        <div className="absolute top-8 right-8 p-1">
                           <button className="text-slate-300 hover:text-slate-600"><MoreVertical className="h-5 w-5" /></button>
                        </div>
                        
                        <div className="flex items-start gap-6">
                           <div className={`mt-1 p-3 rounded-2xl shrink-0 ${post.pinned ? 'bg-violet-700 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                              {post.pinned ? <Pin className="h-5 w-5" /> : <Megaphone className="h-5 w-5" />}
                           </div>
                           
                           <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                 <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
                                   post.category === 'Benefit' ? 'bg-emerald-100 text-emerald-700' :
                                   post.category === 'Training' ? 'bg-blue-100 text-blue-700' :
                                   'bg-amber-100 text-amber-700'
                                 }`}>
                                    {post.category}
                                 </span>
                                 <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> {post.date}
                                 </span>
                              </div>
                              
                              <h4 className="font-headline text-xl font-black text-slate-900 group-hover:text-violet-700 transition-colors tracking-tight leading-none">{post.title}</h4>
                              <p className="text-sm text-slate-500 mt-4 leading-relaxed line-clamp-2 italic font-medium">"{post.content}"</p>
                              
                              <div className="mt-8 flex items-center gap-6 font-headline">
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); toast.info(`Viewing full dispatch: ${post.title}`); }}
                                   className="text-[11px] font-black text-violet-700 uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform italic"
                                 >
                                    Read Analysis <ArrowRight className="h-3 w-3 stroke-[2.5px]" />
                                 </button>
                                 <div className="h-3 w-px bg-slate-100" />
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); toast.error(`Permanently deleting: ${post.title}`); }}
                                   className="text-[11px] font-black text-slate-300 hover:text-red-600 uppercase tracking-widest transition-colors flex items-center gap-1.5 italic"
                                 >
                                    <Trash2 className="h-3 w-3 strike-[2.5px]" /> Purge
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
                
                <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
                   <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em] select-none">Internal Registry Archives</p>
                </div>
             </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
             <div className="bg-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-violet-900/10 relative overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 size-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <h3 className="font-headline text-lg font-bold tracking-tight relative z-10 leading-tight mb-2">Broadcast Updates</h3>
                <p className="font-display text-xs font-bold text-violet-200 leading-relaxed relative z-10">Impact 100% of the workforce instantly. Dispatches are permanently logged in the regimental archive.</p>
                <div className="mt-6 relative z-10">
                   <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-violet-100">
                      <Layers className="h-4 w-4" /> Global Delivery Active
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 font-display">
                <h4 className="text-xs font-bold text-slate-900 tracking-widest border-l-4 border-violet-700 pl-4">System Stats</h4>
                <div className="space-y-4">
                   {[
                      { label: "Reach", val: "94%" },
                      { label: "Engagement", val: "72%" },
                      { label: "Uptime", val: "99.9%" }
                   ].map((stat, i) => ( stat &&
                      <div key={i}>
                         <div className="flex justify-between text-[11px] font-bold mb-1.5">
                            <span className="text-slate-500 uppercase tracking-tighter">{stat.label}</span>
                            <span className="text-slate-900">{stat.val}</span>
                         </div>
                         <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-600 transition-all duration-1000" style={{ width: stat.val }}></div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </HRPortalChrome>
  )
}
