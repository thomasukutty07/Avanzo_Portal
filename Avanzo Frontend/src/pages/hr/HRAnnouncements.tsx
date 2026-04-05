import { HRPortalChrome } from "@/components/portal/hr/HRPortalChrome"
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

const ANNOUNCEMENTS = [
  { id: 1, title: "Q3 Benefits Package Update", type: "Health & Wellness", category: "Benefit", date: "Oct 14, 2023", priority: "High", pinned: true, content: "We've updated the employee insurance coverage options to include remote mental health support effective next month." },
  { id: 2, title: "Upcoming HR Compliance Training", type: "Internal Operations", category: "Training", date: "Oct 12, 2023", priority: "Medium", pinned: false, content: "All HR personnel must complete the mandatory data privacy workshop by the end of this week." },
  { id: 3, title: "New Employee Onboarding Session", type: "Growth", category: "Event", date: "Oct 10, 2023", priority: "Normal", pinned: false, content: "Join us in welcoming 5 new team members across engineering and marketing sectors this Monday." },
]

export default function HRAnnouncementsPage() {
  useDesignPortalLightTheme()

  return (
    <HRPortalChrome>
      <div className="p-8 space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
             <h1 className="font-headline text-[1.75rem] font-bold tracking-[-0.02em] text-[#191c1d]">Communications Feed</h1>
             <p className="font-body text-[#494456] mt-1 text-sm font-medium">Dispatch organizational updates and manage announcements.</p>
          </div>
          <button 
            onClick={() => toast.success("Opening announcement composer...")}
            className="flex items-center gap-2 px-6 py-2.5 bg-violet-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-900/10 hover:bg-violet-800 transition-all active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Create Announcement
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-6">
             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col font-body">
                <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/20">
                   <h3 className="font-headline text-lg font-bold text-slate-900 leading-none">Active Dispatches</h3>
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
                   {ANNOUNCEMENTS.map((post) => (
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
                              
                              <h4 className="font-headline text-xl font-bold text-slate-900 group-hover:text-violet-700 transition-colors tracking-tight">{post.title}</h4>
                              <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2">{post.content}</p>
                              
                              <div className="mt-6 flex items-center gap-4">
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); toast.info(`Viewing full dispatch: ${post.title}`); }}
                                   className="text-[11px] font-bold text-violet-700 uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform"
                                 >
                                    Read Full Analysis <ArrowRight className="h-3 w-3" />
                                 </button>
                                 <div className="h-3 w-px bg-slate-200" />
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); toast.error(`Permanently deleting: ${post.title}`); }}
                                   className="text-[11px] font-bold text-slate-300 hover:text-red-600 uppercase tracking-widest transition-colors flex items-center gap-1.5"
                                 >
                                    <Trash2 className="h-3 w-3" /> Delete
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
                <h3 className="font-headline text-lg font-bold uppercase tracking-tight relative z-10 leading-tight mb-2">Broadcast Updates</h3>
                <p className="font-body text-xs font-bold text-violet-200 leading-relaxed relative z-10">Impact 100% of the workforce instantly. Dispatches are permanently logged in the regimental archive.</p>
                <div className="mt-6 relative z-10">
                   <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-violet-100">
                      <Layers className="h-4 w-4" /> Global Delivery Active
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 font-body">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-l-4 border-violet-700 pl-4">System Stats</h4>
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
