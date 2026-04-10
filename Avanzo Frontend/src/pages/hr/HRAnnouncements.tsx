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
  ArrowRight
} from "lucide-react"

export default function HRAnnouncementsPage() {
  useDesignPortalLightTheme()
  const [announcements, setAnnouncements] = useState<any[]>([])
  
  // Composer State
  const [showComposer, setShowComposer] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [isCritical, setIsCritical] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [expiryDate, setExpiryDate] = useState("")

  const loadAnnouncements = async () => {
    try {
      const res = await api.get("/api/notifications/broadcasts/")
      const apiAnns = extractResults(res.data)
      const mapped = apiAnns.map((a: any) => ({
        id: a.id,
        title: a.title,
        content: a.message || "Please read the full announcement details.",
        pinned: a.severity === "critical",
        date: new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        expiryDate: a.expiry_date,
        isExpired: a.expiry_date ? new Date(a.expiry_date) < new Date(new Date().setHours(0,0,0,0)) : false,
        type: a.target_scope === "org_wide" ? "Internal Operations" : "Department Specific",
        category: a.target_scope === "org_wide" ? "Announcement" : "Team Update",
        priority: a.severity === "critical" ? "High" : "Normal",
      }))
      setAnnouncements(mapped)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const handlePost = async () => {
    if (!newTitle || !newContent) {
      toast.error("Format Error: Title and content cannot be empty.")
      return
    }
    setSubmitting(true)
    try {
      await api.post("/api/notifications/broadcasts/", {
        title: newTitle,
        message: newContent,
        target_scope: "org_wide",
        severity: isCritical ? "critical" : "info",
        expiry_date: expiryDate || null
      })
      toast.success("Broadcast successfully dispatched to the personnel feed.")
      setShowComposer(false)
      setNewTitle("")
      setNewContent("")
      setIsCritical(false)
      setExpiryDate("")
      loadAnnouncements()
    } catch(e) {
      toast.error("Transmission Failed: Check network or permissions.")
    } finally {
      setSubmitting(false)
    }
  }

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
            onClick={() => setShowComposer(!showComposer)}
            className="flex items-center gap-3 px-10 py-4 bg-violet-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-violet-900/20 hover:bg-violet-700 transition-all active:scale-95 shrink-0 font-headline italic"
          >
            <Plus className={`h-4 w-4 stroke-[3px] transition-transform ${showComposer ? 'rotate-45' : ''}`} />
            {showComposer ? 'Cancel Dispatch' : 'Create Announcement'}
          </button>
        </header>

        {showComposer && (
          <div className="bg-white rounded-3xl border border-violet-100 shadow-xl shadow-violet-900/5 p-8 animate-in slide-in-from-top-4 duration-500 font-display">
             <div className="space-y-6 max-w-3xl">
                <div>
                   <h3 className="font-headline text-xl font-black text-slate-900 tracking-tight">Broadcast Composer</h3>
                   <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Global personnel feed</p>
                </div>
                
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transmission Title</label>
                      <input 
                         type="text" 
                         className="w-full bg-slate-50 border-transparent rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-violet-600/20 focus:bg-white focus:border-violet-100 transition-all outline-none"
                         placeholder="e.g. End of Year HR Update"
                         value={newTitle}
                         onChange={(e) => setNewTitle(e.target.value)}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payload / Content</label>
                      <textarea 
                         rows={4}
                         className="w-full bg-slate-50 border-transparent rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-violet-600/20 focus:bg-white focus:border-violet-100 transition-all outline-none resize-none"
                         placeholder="Enter the full operational update here..."
                         value={newContent}
                         onChange={(e) => setNewContent(e.target.value)}
                      />
                   </div>
                   <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date (Optional)</label>
                       <input 
                          type="date" 
                          className="w-full bg-slate-50 border-transparent rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-violet-600/20 focus:bg-white focus:border-violet-100 transition-all outline-none"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                       />
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-50">
                   <div className="flex items-center gap-3">
                      <input 
                         type="checkbox" 
                         className="size-4 accent-red-500 cursor-pointer" 
                         id="critical-flag" 
                         checked={isCritical}
                         onChange={(e) => setIsCritical(e.target.checked)}
                      />
                      <label htmlFor="critical-flag" className="text-xs font-black text-slate-600 cursor-pointer uppercase tracking-widest flex items-center gap-1.5 hover:text-slate-900">
                         <Pin className="h-3 w-3 text-red-500" /> Pin Critical Priority
                      </label>
                   </div>
                   <button 
                      disabled={submitting}
                      onClick={handlePost}
                      className="w-full sm:w-auto px-10 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-violet-600/20 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                   >
                      {submitting ? 'Transmitting...' : 'Dispatch to Feed'} <ArrowRight className="h-4 w-4 stroke-[3px]" />
                   </button>
                </div>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          {/* Main Feed */}
          <div className="space-y-6">
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
                                 {post.isExpired && (
                                   <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-lg text-[9px] font-bold uppercase tracking-widest">
                                      Expired
                                   </span>
                                 )}
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
        </div>
      </div>
    </HRPortalChrome>
  )
}
