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
  Globe,
  Lock,
  Plus,
  Users,
  Zap,
  Loader2
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
      toast.success(`${type === 'media' ? 'Media' : 'Document'} attached: ${file.name}`)
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
      toast.error("Subject and content are required for transmission.")
      return
    }
    
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success("Broadcast successfully synchronized!")
      navigate("/team-announcements")
    }, 1500)
  }

  return (
    <TeamLeadChrome>
      <div className="max-w-4xl mx-auto p-8 space-y-8 font-body">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline text-3xl font-black text-slate-900 tracking-tight">Draft Transmission</h2>
            <p className="text-slate-500 mt-1 font-medium italic">Compose a critical update for your team units.</p>
          </div>
          <button 
            onClick={() => navigate("/team-announcements")}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <section className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col min-h-[500px]">
          {/* Form Area */}
          <div className="flex-1 p-8 space-y-8">
            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'document')} />
            <input type="file" accept="image/*" ref={mediaInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'media')} />
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Subject Heading</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter a compelling title..."
                className="w-full bg-transparent border-none p-0 text-2xl font-bold text-slate-900 placeholder:text-slate-200 focus:ring-0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Update Content</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Broadcast your message here..."
                className="w-full min-h-[200px] bg-transparent border-none p-0 text-lg font-medium text-slate-600 placeholder:text-slate-200 focus:ring-0 resize-none leading-relaxed"
              />
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-100">
                {attachments.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl group animate-in fade-in slide-in-from-bottom-2">
                    {file.type === 'media' ? <Plus className="h-4 w-4 text-violet-600" /> : <Users className="h-4 w-4 text-blue-600" />}
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{file.name}</span>
                    <button type="button" onClick={() => removeAttachment(i)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tools & Actions */}
          <div className="px-8 py-6 bg-slate-50/30 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => mediaInputRef.current?.click()} 
                className="p-3 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all group" title="Add Visuals"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="p-3 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all group" title="Attach Dossier"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-3 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all group" title="Insert Sentiment">
                    <Smile className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-2 grid grid-cols-4 gap-1 w-fit rounded-2xl border-slate-100 shadow-2xl bg-white">
                  {['👍', '🚀', '🔥', '✅', '⚠️', '📈', '💡', '🗓️'].map(emoji => (
                    <button 
                      key={emoji} 
                      type="button" 
                      onClick={() => addEmoji(emoji)} 
                      className="size-10 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-colors text-xl"
                    >
                      {emoji}
                    </button>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="h-6 w-[1px] bg-slate-200 mx-2" />
              <button onClick={() => toast.info("Advanced formatting enabled")} className="p-3 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all group" title="Rich Text">
                <Type className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-sm">
                <Globe className="h-3 w-3 text-emerald-500" />
                Everyone
              </div>
              <button 
                disabled={loading}
                onClick={handleTransmit}
                className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-3 bg-violet-600 text-white font-bold rounded-2xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-900/20 active:scale-95 group disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    Transmit Update
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Hints */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex gap-4">
             <div className="size-10 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600 shrink-0"><Layout className="h-5 w-5" /></div>
             <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight">Global Visibility</h4>
                <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">This update will be visible to all members of the Corporate Team across their unified dashboards.</p>
             </div>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex gap-4">
             <div className="size-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0"><Lock className="h-5 w-5" /></div>
             <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight">Immutable Record</h4>
                <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">Once transmitted, a cryptographically signed copy is stored in the departmental audit logs for transparency.</p>
             </div>
          </div>
        </div>
      </div>
    </TeamLeadChrome>
  )
}
