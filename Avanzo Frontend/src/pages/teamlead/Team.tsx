import { TeamLeadChrome } from "@/components/portal/teamlead/TeamLeadChrome"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { accountsService } from "@/services/accounts"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  MessageSquare, 
  MoreHorizontal,
  ChevronRight,
  Shield,
  Zap,
  Activity,
  Loader2,
  Users
} from "lucide-react"

export default function TeamPage() {
  useDesignPortalLightTheme()
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const data = await accountsService.getEmployees()
      setMembers(Array.isArray(data) ? data : (data.results || []))
    } catch (error) {
      toast.error("Unit directory synchronization failed.")
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  const filteredMembers = members.filter(m => 
    m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeUnits = members.filter(m => m.is_active !== false).length

  return (
    <TeamLeadChrome>
      <div className="p-4 md:p-8 space-y-12 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-10">
          <header>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 font-headline leading-none uppercase">Personnel Directory</h2>
            <p className="text-sm font-bold text-slate-400 mt-3 uppercase tracking-widest leading-none">Global Sector Roster Synchronization Active</p>
          </header>
          <div className="flex gap-4">
             <button 
              onClick={() => toast.info("Opening Sector Configuration...")}
              className="px-7 py-3 bg-white border border-slate-100 text-slate-900 font-black rounded-xl hover:bg-slate-50 transition-all text-[11px] uppercase tracking-widest active:scale-95 shadow-sm"
            >
              Sector Logic
            </button>
            <button 
              onClick={() => toast.info("Initializing Onboarding Sequence...")}
              className="flex items-center gap-2.5 px-7 py-3 bg-violet-600 text-white font-black rounded-xl hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-600/20 transition-all text-[11px] uppercase tracking-widest active:scale-95 shadow-md shadow-violet-600/10"
            >
              <Plus className="size-4 stroke-[3px]" />
              Onboard Member
            </button>
          </div>
        </div>

        {/* Global Registry Bar */}
        <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 hover:shadow-xl transition-all duration-500">
           <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-slate-300 group-focus-within:text-violet-600 transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Synchronize with personnel intelligence..." 
                className="w-full bg-slate-50/10 border-none rounded-3xl pl-16 pr-6 py-4.5 text-[14px] font-black text-slate-900 focus:ring-0 placeholder:text-slate-200 outline-none uppercase tracking-tight"
              />
           </div>
           <div className="flex gap-2 p-2">
              <div className="bg-emerald-50 px-6 py-2 rounded-2xl border border-emerald-100 flex items-center gap-3">
                 <Shield className="size-4 text-emerald-600 shadow-sm" />
                 <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest tabular-nums">{activeUnits} ACTIVE NODES</span>
              </div>
              <div className="bg-violet-50 px-6 py-2 rounded-2xl border border-violet-100 flex items-center gap-3">
                 <Zap className="size-4 text-violet-600 shadow-sm" />
                 <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest tabular-nums">{members.length} TOTAL UNITS</span>
              </div>
           </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
             <div className="col-span-full py-32 text-center">
                <Loader2 className="size-10 animate-spin text-violet-600 mx-auto mb-6" />
                <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">Synchronizing Personnel Registry...</p>
             </div>
          ) : filteredMembers.length === 0 ? (
             <div className="col-span-full py-32 text-center opacity-30">
                <Users className="size-16 mx-auto mb-6 text-slate-200" />
                <p className="text-[11px] font-black uppercase tracking-[0.2em]">Sector Directory Empty</p>
             </div>
          ) : filteredMembers.map((member, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative flex flex-col items-center text-center">
              <div className="absolute top-8 right-8">
                 <button onClick={() => toast.info(`Syncing unit metadata: ${member.full_name}`)} className="p-2 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all">
                   <MoreHorizontal className="size-5" />
                 </button>
              </div>
              
              <div className="relative mb-8">
                 <div className="size-28 bg-slate-50 rounded-[2.5rem] p-1.5 border border-slate-100 group-hover:border-violet-100 group-hover:rotate-6 transition-all duration-700 shadow-sm group-hover:shadow-xl">
                    <img src={member.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name)}&background=f5f3ff&color=7c3aed&bold=true`} alt={member.full_name} className="size-full rounded-[2rem] object-cover" />
                 </div>
                 <div className="absolute -bottom-2 -right-2 size-8 bg-emerald-500 border-4 border-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Activity className="size-3.5 text-white animate-pulse" />
                 </div>
              </div>

              <div className="space-y-1 mb-8 w-full px-2">
                 <h3 className="text-[18px] font-black text-slate-900 group-hover:text-violet-600 transition-colors uppercase tracking-tight truncate leading-none">{member.full_name}</h3>
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] opacity-80">{member.role_display || member.employee_id || 'Tactical Operative'}</p>
                 <div className="flex items-center justify-center gap-2 text-[10px] font-black text-violet-600 bg-violet-50 px-4 py-1 rounded-lg border border-violet-100 mt-4 mx-auto w-fit shadow-sm">
                   Sector: {member.address?.split(',').pop() || 'HQ'}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                 <button 
                  onClick={() => toast.info(`Initializing Direct Comms: ${member.user?.email}`)}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all group/btn"
                 >
                    <Mail className="size-5 text-slate-400 group-hover/btn:text-white group-hover/btn:rotate-12 transition-all" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Interface</span>
                 </button>
                 <button 
                  onClick={() => toast.info(`Inpulse Sync: ${member.full_name}`)}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all group/btn"
                 >
                    <MessageSquare className="size-5 text-slate-400 group-hover/btn:text-white group-hover/btn:-rotate-12 transition-all" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Inpulse</span>
                 </button>
              </div>

              <button 
                onClick={() => toast.info(`Synchronizing ${member.full_name} identity logs...`)}
                className="w-full py-4.5 bg-white border border-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95 group shadow-sm hover:shadow-xl"
              >
                Access Dossier
                <ChevronRight className="size-4 text-violet-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </TeamLeadChrome>
  )
}
