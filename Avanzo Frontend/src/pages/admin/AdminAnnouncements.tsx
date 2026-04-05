import { useState } from "react"
import { toast } from "sonner"
import { 
  Megaphone, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Users, 
  UserSquare2, 
  Loader2,
  Calendar,
  Send,
  X
} from "lucide-react"
import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

const MOCK_ANNOUNCEMENTS = [
  { 
    id: "ANN-001", 
    title: "Quarterly Performance Review Schedule", 
    content: "All departments are requested to complete their self-evaluations by Friday. Team leads will schedule 1-on-1 sessions starting next Monday.", 
    target: "All Staff", 
    author: "Organization Admin", 
    date: "Oct 24, 2023",
    type: "All"
  },
  { 
    id: "ANN-002", 
    title: "Updated HR Benefits Policy", 
    content: "We have updated the health insurance coverage policy. Please review the document in the HR portal for details on new wellness benefits.", 
    target: "HR Team", 
    author: "Admin Console", 
    date: "Oct 22, 2023",
    type: "HR"
  },
]

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState(MOCK_ANNOUNCEMENTS)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [newAnn, setNewAnn] = useState({
    title: "",
    content: "",
    target: "All"
  })

  const handleSend = () => {
    if (!newAnn.title || !newAnn.content) {
      toast.error("Please fill in all fields.")
      return
    }

    setSending(true)
    setTimeout(() => {
      const addedAnn = {
        id: `ANN-00${announcements.length + 1}`,
        title: newAnn.title,
        content: newAnn.content,
        target: newAnn.target === "All" ? "All Staff" : `${newAnn.target} Team`,
        author: "Organization Admin",
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        type: newAnn.target
      }
      setAnnouncements([addedAnn, ...announcements])
      setSending(false)
      setIsCreateOpen(false)
      setNewAnn({ title: "", content: "", target: "All" })
      toast.success("Announcement broadcasted successfully.")
    }, 1200)
  }

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter(a => a.id !== id))
    toast.success("Announcement removed from archive.")
  }

  const filteredAnnouncements = announcements.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <OrganizationAdminChrome>
      <div className="p-8 lg:p-12 space-y-10 min-h-screen bg-[#fcfcfd] font-sans">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <Megaphone className="h-5 w-5 text-violet-600" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-600">Company Communications</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
              Announcements
            </h1>
            <p className="text-slate-500 mt-1 font-medium italic">
               Broadcast organization-wide updates and critical messages.
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <button 
                className="flex items-center gap-3 px-8 py-3 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-violet-900/20 hover:bg-violet-700 transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" />
                New Announcement
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[24px] border-none shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] p-0 overflow-hidden font-sans gap-0 [&>button]:hidden">
              {/* Custom Close Button */}
              <DialogTrigger asChild>
                <button className="absolute top-5 right-5 text-slate-900/60 hover:text-slate-900 transition-colors z-10 p-1">
                  <X className="h-4 w-4 stroke-[2.5]" />
                </button>
              </DialogTrigger>

              <div className="bg-[#8b3dff] px-8 pt-10 pb-8 text-white relative">
                 <DialogHeader>
                   <DialogTitle className="text-[26px] font-black tracking-tight flex items-center gap-2.5">
                      <Megaphone className="h-6 w-6" />
                      Create Broadcast
                   </DialogTitle>
                 </DialogHeader>
                 <p className="text-white/90 text-[13px] font-medium mt-2">Send an official update to selected organization teams.</p>
              </div>

              <div className="p-8 space-y-6 bg-white shrink-0">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Message Title</label>
                   <Input 
                      placeholder="e.g. Annual Office Closing Schedule" 
                      value={newAnn.title}
                      onChange={e => setNewAnn({...newAnn, title: e.target.value})}
                      className="rounded-xl border-2 border-[#8b3dff] bg-white py-6 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-700 font-medium"
                   />
                </div>
                
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Target Audience</label>
                   <Select value={newAnn.target} onValueChange={(val) => setNewAnn({...newAnn, target: val})}>
                     <SelectTrigger className="rounded-xl border border-slate-100 bg-slate-50/50 py-6 px-4 focus:ring-0 focus:ring-offset-0 text-slate-700 font-medium w-[240px]">
                       <SelectValue placeholder="Select target group" />
                     </SelectTrigger>
                     <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                       <SelectItem value="All" className="rounded-lg p-3 cursor-pointer">Whole Company (All Staff)</SelectItem>
                       <SelectItem value="HR" className="rounded-lg p-3 cursor-pointer">HR Department Only</SelectItem>
                       <SelectItem value="Team Lead" className="rounded-lg p-3 cursor-pointer">Team Leads & Managers</SelectItem>
                     </SelectContent>
                   </Select>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Detailed Content</label>
                   <Textarea 
                      placeholder="Write your announcement details here..." 
                      value={newAnn.content}
                      onChange={e => setNewAnn({...newAnn, content: e.target.value})}
                      className="rounded-2xl border border-slate-100 bg-white min-h-[160px] focus-visible:ring-0 focus-visible:ring-offset-0 resize-none font-medium p-4 text-slate-700 shadow-sm"
                   />
                </div>
              </div>

              <div className="px-8 pb-8 bg-white mt-auto">
                <button 
                  onClick={handleSend}
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-[#8b3dff] text-white rounded-[16px] text-[11px] font-black uppercase tracking-widest hover:bg-[#7b36e3] transition-all shadow-md shadow-[#8b3dff]/20 active:scale-95 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sending ? "Broadcasting..." : "Confirm & Send"}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        <div className="bg-white rounded-[40px] border border-slate-50 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
           <div className="p-10 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50/10">
              <div className="flex items-center gap-4">
                 <div className="size-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50" />
                 <h3 className="text-xl font-black text-slate-900 leading-none">Broadcast Archive</h3>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                 <div className="relative flex-1 sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                       placeholder="Filter announcements..."
                       value={searchQuery}
                       onChange={e => setSearchQuery(e.target.value)}
                       className="w-full bg-white border-slate-100 rounded-2xl pl-12 py-3 text-sm font-medium focus:ring-violet-600 transition-all placeholder:text-slate-300"
                       type="text"
                    />
                 </div>
                 <button onClick={() => toast.info("Filter parameters ready")} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all shadow-sm active:scale-95"><Filter className="h-5 w-5" /></button>
              </div>
           </div>

           <div className="p-8 lg:p-12">
             {filteredAnnouncements.length > 0 ? (
               <div className="grid grid-cols-1 gap-6">
                 {filteredAnnouncements.map((ann) => (
                   <div key={ann.id} className="group relative bg-white rounded-3xl border border-slate-100 p-8 hover:border-violet-100 transition-all hover:shadow-xl hover:shadow-violet-900/5 overflow-hidden">
                      <div className={`absolute top-0 right-0 w-1.5 h-full ${
                        ann.type === 'All' ? 'bg-violet-600' :
                        ann.type === 'HR' ? 'bg-rose-500' :
                        'bg-amber-500'
                      }`} />
                      
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                         <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                               <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                 ann.type === 'All' ? 'bg-violet-50 text-violet-700 border-violet-100' :
                                 ann.type === 'HR' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                 'bg-amber-50 text-amber-700 border-amber-100'
                               }`}>
                                  Target: {ann.target}
                               </span>
                               <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                  <Calendar className="h-3 w-3" />
                                  {ann.date}
                               </div>
                            </div>
                            <h4 className="text-xl font-black text-slate-900 group-hover:text-violet-600 transition-colors tracking-tight">{ann.title}</h4>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-3 italic">"{ann.content}"</p>
                         </div>
                         
                         <div className="flex flex-row md:flex-col justify-between items-end gap-4 min-w-[150px]">
                            <div className="flex flex-col items-end gap-1">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Author Identity</p>
                               <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900">{ann.author}</span>
                                  <div className="size-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                     <UserSquare2 className="h-3 w-3 text-slate-400" />
                                  </div>
                               </div>
                            </div>
                            <button 
                               onClick={() => handleDelete(ann.id)}
                               className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                            >
                               <Trash2 className="h-5 w-5" />
                            </button>
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="size-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200">
                      <Megaphone className="h-10 w-10" />
                  </div>
                  <div className="space-y-1">
                     <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No broadcasts transmitted</p>
                     <p className="text-xs text-slate-300 font-medium italic">Create your first org-wide announcement to reach your team.</p>
                  </div>
               </div>
             )}
           </div>

           <div className="mt-auto p-10 bg-slate-50/30 border-t border-slate-50">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                 <p className="flex items-center gap-3 italic">
                    <Users className="h-4 w-4 text-violet-500" />
                    Broadcasting active across {announcements.length} stored messages
                 </p>
                 <span className="flex items-center gap-2">
                    System Hub
                    <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                 </span>
              </div>
           </div>
        </div>
      </div>
    </OrganizationAdminChrome>
  )
}
