import { HRPortalChrome } from "@/components/portal/hr/HRPortalChrome"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { 
  Send, 
  Image as ImageIcon, 
  Paperclip, 
  Smile, 
  X,
  ShieldCheck,
  Globe,
  Users,
  Eye,
  Settings2
} from "lucide-react"

export default function HRCreateAnnouncementPage() {
  const navigate = useNavigate()
  useDesignPortalLightTheme()

  return (
    <HRPortalChrome>
      <div className="max-w-5xl mx-auto p-10 space-y-10 font-body">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline text-3xl font-black text-slate-900 tracking-tight">Corporate Bulletin</h2>
            <p className="text-slate-500 mt-1 font-medium italic">Broadcast verified organizational updates to the entire team.</p>
          </div>
          <button 
            onClick={() => navigate("/hr-announcements")}
            className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all active:scale-95 border border-slate-100 shadow-sm"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col min-h-[600px] transition-all hover:border-violet-100">
              <div className="flex-1 p-10 space-y-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Announcement Subject</label>
                  <input 
                    type="text" 
                    placeholder="Enter Bulletin Title..."
                    className="w-full bg-transparent border-none p-0 text-3xl font-black text-slate-900 placeholder:text-slate-100 focus:ring-0 leading-tight"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Bulletin Content</label>
                  <textarea 
                    placeholder="Compose official message..."
                    className="w-full min-h-[300px] bg-transparent border-none p-0 text-lg font-medium text-slate-600 placeholder:text-slate-100 focus:ring-0 resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="px-10 py-8 bg-slate-50/30 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-2">
                  <button onClick={() => toast.info("Asset library linked")} className="p-4 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-2xl transition-all shadow-sm border border-slate-100 bg-white" title="Add Image">
                    <ImageIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => toast.info("Policy document attached")} className="p-4 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-2xl transition-all shadow-sm border border-slate-100 bg-white" title="Attach Doc">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <button onClick={() => toast.info("Emoji relay active")} className="p-4 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-2xl transition-all shadow-sm border border-slate-100 bg-white" title="Add Sentiment">
                    <Smile className="h-5 w-5" />
                  </button>
                </div>

                <button 
                  onClick={() => {
                    toast.success("Bulletin officially synchronized and broadcasted.")
                    navigate("/hr-announcements")
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-4 px-10 py-4 bg-violet-700 text-white font-black rounded-[1.5rem] hover:bg-violet-800 transition-all shadow-xl shadow-violet-900/40 active:scale-95 uppercase tracking-widest text-[11px]"
                >
                  Broadcast Bulletin
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </section>
          </div>

          {/* Sidebar / Settings */}
          <div className="space-y-8">
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 space-y-8">
               <h3 className="font-headline text-lg font-bold text-slate-900 flex items-center gap-3 border-b border-slate-50 pb-6 mb-2">
                 <Settings2 className="h-5 w-5 text-violet-600" />
                 Parameters
               </h3>
               
               <div className="space-y-6">
                 <div className="space-y-3">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Target Audience</label>
                   <div className="grid grid-cols-1 gap-2">
                     <button className="flex items-center gap-3 px-4 py-3 bg-violet-50 border border-violet-100 rounded-xl text-violet-700 text-xs font-bold transition-all w-full text-left">
                        <Globe className="h-4 w-4" />
                        Entire Organization
                     </button>
                     <button className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-50 rounded-xl text-slate-500 text-xs font-bold hover:bg-slate-100 transition-all w-full text-left">
                        <Users className="h-4 w-4" />
                        Specific Departments
                     </button>
                   </div>
                 </div>

                 <div className="space-y-3">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Bulletin Verification</label>
                   <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                      <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-tight">Verified Pulse</p>
                        <p className="text-[9px] text-emerald-600/80 font-medium leading-relaxed mt-1">This announcement will include the HR Verification badge for authenticity.</p>
                      </div>
                   </div>
                 </div>

                 <div className="pt-4 space-y-4">
                    <button 
                      onClick={() => toast.info("Generating preview data...")}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
                    >
                      <Eye className="h-4 w-4" />
                      Preview Mode
                    </button>
                    <p className="text-[9px] text-slate-400 font-medium text-center italic">Drafts are automatically synchronized every 60 seconds.</p>
                 </div>
               </div>
            </div>

            <div className="bg-violet-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
               <div className="relative z-10">
                  <h4 className="text-xl font-black italic tracking-tighter mb-4 opacity-100 text-white">HR Mission Control</h4>
                  <p className="text-xs font-medium text-white/70 leading-relaxed mb-6">Ensure all bulletins adhere to the corporate communication standards and legal privacy requirements.</p>
                  <div className="flex gap-2">
                     <div className="h-1 w-8 bg-white/40 rounded-full" />
                     <div className="h-1 w-2 bg-white/40 rounded-full" />
                     <div className="h-1 w-2 bg-white/40 rounded-full" />
                  </div>
               </div>
               <div className="absolute -right-12 -bottom-12 size-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
            </div>
          </div>
        </div>
      </div>
    </HRPortalChrome>
  )
}
