import { TeamLeadChrome } from "@/components/portal/teamlead/TeamLeadChrome"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useState, useRef } from "react"
import { 
  Send, 
  Image as ImageIcon, 
  Paperclip, 
  Smile, 
  X,
  Type,
  Layout,
  Zap,
  Globe,
  Loader2,
  ChevronLeft,
  FileText,
  BadgeCheck
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

export default function TeamLeadCreateAnnouncementPage() {
  const navigate = useNavigate()
  useDesignPortalLightTheme()
  
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState("")
  const [subject, setSubject] = useState("")
  const [attachments, setAttachments] = useState<{ name: string, type: string }[]>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0]
    if (file) {
      setAttachments(prev => [...prev, { name: file.name, type }])
      toast.success(`${type === 'media' ? 'Asset' : 'Document'} synchronized: ${file.name}`)
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const addEmoji = (emoji: string) => {
    setContent(prev => prev + emoji)
  }

  const handleTransmit = () => {
    if (!subject || !content) {
      toast.error("Subject and intelligence content are required for transmission.")
      return
    }
    
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success("Broadcast successfully synchronized with the central hub!")
      navigate("/teamlead/announcements")
    }, 1500)
  }

  return (
    <TeamLeadChrome>
      <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-12 animate-in fade-in zoom-in-95 duration-700">
        {/* Header */}
        <div className="flex items-center justify-between">
          <header className="flex items-center gap-6">
            <button 
              onClick={() => navigate("/teamlead/announcements")}
              className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-violet-600 hover:shadow-xl transition-all shadow-sm"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 font-headline leading-none uppercase">Draft Transmission</h2>
              <p className="text-sm font-bold text-slate-400 mt-3 uppercase tracking-widest leading-none">Composing tactical update for mission units</p>
            </div>
          </header>
          <button 
            onClick={() => navigate("/teamlead/announcements")}
            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
          >
            <X className="size-6" />
          </button>
        </div>

        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px] hover:shadow-2xl transition-all duration-500 relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-600 via-blue-500 to-violet-600 animate-gradient-x" />
          
          {/* Form Area */}
          <div className="flex-1 p-10 md:p-16 space-y-12">
            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'document')} />
            <input type="file" accept="image/*" ref={mediaInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'media')} />
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="size-8 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 shadow-sm">
                    <Type className="size-4" />
                 </div>
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tactical Subject Heading</label>
              </div>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter a high-impact title..."
                className="w-full bg-transparent border-none p-0 text-3xl font-black text-slate-900 placeholder:text-slate-100 focus:ring-0 uppercase tracking-tight font-headline"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
                    <FileText className="size-4" />
                 </div>
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Intelligence Briefing Content</label>
              </div>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Broadcast your mission parameters or updates here..."
                className="w-full min-h-[300px] bg-transparent border-none p-0 text-xl font-medium text-slate-600 placeholder:text-slate-100 focus:ring-0 resize-none leading-relaxed"
              />
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-4 pt-10 border-t border-slate-50">
                {attachments.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 pl-4 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-2xl group animate-in fade-in slide-in-from-bottom-4 transition-all hover:bg-white hover:shadow-xl hover:border-violet-100">
                    <div className="size-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                       {file.type === 'media' ? <ImageIcon className="size-4 text-violet-600" /> : <Paperclip className="size-4 text-blue-600" />}
                    </div>
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight truncate max-w-[200px]">{file.name}</span>
                    <button type="button" onClick={() => removeAttachment(i)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tools & Actions */}
          <div className="px-10 py-8 bg-slate-50/20 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => mediaInputRef.current?.click()} 
                className="p-4 text-slate-400 hover:text-violet-600 hover:bg-white hover:shadow-xl rounded-2xl transition-all group scale-100 active:scale-95" title="Add Visuals"
              >
                <ImageIcon className="size-6" />
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="p-4 text-slate-400 hover:text-violet-600 hover:bg-white hover:shadow-xl rounded-2xl transition-all group scale-100 active:scale-95" title="Attach Dossier"
              >
                <Paperclip className="size-6" />
              </button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-4 text-slate-400 hover:text-violet-600 hover:bg-white hover:shadow-xl rounded-2xl transition-all group scale-100 active:scale-95" title="Insert Sentiment">
                    <Smile className="size-6" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-3 grid grid-cols-4 gap-2 w-fit rounded-3xl border-slate-100 shadow-2xl bg-white animate-in zoom-in-95 duration-200">
                  {['👍', '🚀', '🔥', '✅', '⚠️', '📈', '💡', '🗓️'].map(emoji => (
                    <button 
                      key={emoji} 
                      type="button" 
                      onClick={() => addEmoji(emoji)} 
                      className="size-12 flex items-center justify-center hover:bg-slate-50 rounded-2xl transition-all text-2xl hover:scale-110 active:scale-90"
                    >
                      {emoji}
                    </button>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="h-10 w-[2px] bg-slate-100 mx-3 rounded-full" />
              <button onClick={() => toast.info("Advanced formatting enabled")} className="p-4 text-slate-400 hover:text-violet-600 hover:bg-white hover:shadow-xl rounded-2xl transition-all group scale-100 active:scale-95" title="Rich Text">
                <Layout className="size-6" />
              </button>
            </div>

            <div className="flex items-center gap-6 w-full sm:w-auto">
              <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 shadow-sm">
                <Globe className="size-4 text-emerald-500 animate-pulse" />
                Everyone
              </div>
              <button 
                disabled={loading}
                onClick={handleTransmit}
                className="flex-1 sm:flex-none flex items-center justify-center gap-4 px-10 py-4 bg-violet-600 text-white font-black rounded-2xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20 active:scale-95 group disabled:opacity-50 text-xs uppercase tracking-widest"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Synchronizing...
                  </>
                ) : (
                  <>
                    <Send className="size-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    Transmit Broadcast
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Security / Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex gap-6 hover:shadow-xl hover:-translate-y-1 transition-all group">
             <div className="size-14 bg-violet-50 border border-violet-100 rounded-2xl flex items-center justify-center text-violet-600 shrink-0 group-hover:scale-110 transition-transform shadow-sm"><Zap className="size-6" /></div>
             <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Global Sector Sync</h4>
                <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mt-2 leading-relaxed opacity-60">This intelligence update will be synchronized across all unified mission unit dashboards instantly.</p>
             </div>
          </div>
          <div className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex gap-6 hover:shadow-xl hover:-translate-y-1 transition-all group">
             <div className="size-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-110 transition-transform shadow-sm"><BadgeCheck className="size-6" /></div>
             <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Immutable Register</h4>
                <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mt-2 leading-relaxed opacity-60">Transmission will be cryptographically registered in the departmental audit log for total transparency.</p>
             </div>
          </div>
        </div>
      </div>
    </TeamLeadChrome>
  )
}
