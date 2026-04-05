import { TeamLeadChrome } from "@/components/portal/teamlead/TeamLeadChrome"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { toast } from "sonner"
import { Link } from "react-router-dom"
import { 
  Megaphone, 
  Plus, 
  Clock, 
  User, 
  Trash2, 
  Edit3,
  Search,
  Pin
} from "lucide-react"

const ANNOUNCEMENTS = [
  { 
    id: 1, 
    title: "Q4 Performance Reviews Scheduled", 
    content: "Team, please ensure all your self-assessments are completed by Friday. We will begin individual 1:1 sessions starting Monday morning.",
    author: "Alex Rivera",
    date: "2 hours ago",
    pinned: true,
    category: "Operations"
  },
  { 
    id: 2, 
    title: "New Security Protocols for Remote Access", 
    content: "Effective immediately, all VPN connections require hardware token verification. Please update your client to the latest version by EOD.",
    author: "Security Team",
    date: "Yesterday",
    pinned: false,
    category: "Security"
  },
  { 
    id: 3, 
    title: "Mobile App Beta Feedback Required", 
    content: "The v2.1 beta is now live in the test environment. Please pull the latest build and report any crashing issues in the #mobile-beta channel.",
    author: "James Chen",
    date: "2 days ago",
    pinned: false,
    category: "Development"
  }
]

export default function TeamAnnouncementsPage() {
  useDesignPortalLightTheme()

  return (
    <TeamLeadChrome>
      <div className="p-8 space-y-8 font-body">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-headline text-3xl font-black text-slate-900 tracking-tight">Team Comms</h2>
            <p className="text-slate-500 mt-1 font-medium">Broadcast critical tactical updates and mission parameters</p>
          </div>
          <div className="flex gap-4">
             <Link 
              to="/team/create-announcement"
              className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-900/20 text-sm active:scale-95"
            >
              <Plus className="h-4 w-4" />
              New Update
            </Link>
          </div>
        </div>

        {/* Filters/Search */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search communications..." 
              className="w-full bg-white border border-slate-100 rounded-2xl pl-12 py-3 text-sm font-medium focus:ring-2 focus:ring-violet-600/10 focus:border-violet-600 transition-all"
            />
          </div>
          <select className="bg-white border border-slate-100 rounded-2xl px-6 py-3 text-sm font-bold text-slate-700 min-w-[160px] shadow-sm">
            <option>All Categories</option>
            <option>Security</option>
            <option>Operations</option>
            <option>Development</option>
          </select>
        </div>

        {/* Announcements List */}
        <div className="space-y-6">
          {ANNOUNCEMENTS.map((item) => (
            <div key={item.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-violet-200 group relative">
              {item.pinned && (
                <div className="absolute top-8 right-8 text-violet-600 bg-violet-50 p-2 rounded-xl">
                  <Pin className="h-4 w-4" />
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-6">
                 <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
                   item.category === 'Security' ? 'bg-red-50 text-red-700' :
                   item.category === 'Operations' ? 'bg-violet-50 text-violet-700' :
                   'bg-emerald-50 text-emerald-700'
                 }`}>
                   {item.category}
                 </span>
                 <div className="h-1 w-1 bg-slate-200 rounded-full" />
                 <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">{item.date}</span>
                 </div>
              </div>

              <h3 className="font-headline text-xl font-bold text-slate-900 group-hover:text-violet-700 transition-colors mb-4">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed font-medium mb-8 max-w-4xl">{item.content}</p>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-violet-50 rounded-full flex items-center justify-center text-violet-700 font-bold text-xs shadow-inner">
                    {item.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{item.author}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">Tactical Command</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                   <button 
                    onClick={() => toast.info("Opening editor...")}
                    className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-violet-700 hover:bg-violet-50 rounded-xl transition-all text-xs font-bold uppercase tracking-widest"
                   >
                     <Edit3 className="h-4 w-4" />
                     Edit
                   </button>
                   <button 
                    onClick={() => toast.error("Update purged from registry")}
                    className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all text-xs font-bold uppercase tracking-widest"
                   >
                     <Trash2 className="h-4 w-4" />
                     Delete
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
