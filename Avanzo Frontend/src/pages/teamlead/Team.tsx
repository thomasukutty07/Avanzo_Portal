import TeamLeadChrome from "@/components/portal/teamlead/TeamLeadChrome"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { accountsService } from "@/services/accounts"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { 
  Plus, 
  Search, 
  Mail, 
  MessageSquare, 
  MoreHorizontal,
  ChevronRight,
  Shield,
  Zap,
  Activity,
  Loader2,
  Users,
  Award,
  CheckCircle2
} from "lucide-react"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


export default function TeamPage() {
  useDesignPortalLightTheme()
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [talentTags, setTalentTags] = useState<any[]>([])
  const [isEvalOpen, setIsEvalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [updating, setUpdating] = useState(false)
  const [customTagName, setCustomTagName] = useState("")

  useEffect(() => {
    fetchMembers()
    fetchTalentTags()
  }, [])

  const fetchTalentTags = async () => {
    try {
      const res = await api.get("/api/auth/talent-tags/");
      setTalentTags(extractResults(res.data));
    } catch (e) {
      console.error(e);
    }
  }

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const data = await accountsService.getEmployees()
      const rawMembers = Array.isArray(data) ? data : (data.results || [])
      setMembers(rawMembers.map((m: any) => ({
        ...m,
        full_name: `${m.first_name} ${m.last_name}`,
        email: m.email || m.user?.email || ""
      })))
    } catch (error) {
      toast.error("Unit directory synchronization failed.")
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddCustomTag = async () => {
    if (!customTagName.trim()) return;
    try {
      const res = await api.post("/api/auth/talent-tags/", { name: customTagName, category: "Custom" });
      const newTag = { ...res.data, is_custom: true };
      setTalentTags(prev => [...prev, newTag]);
      // Auto-select for current member
      const current = selectedMember?.evaluated_talents || [];
      setSelectedMember({...selectedMember, evaluated_talents: [...current, newTag.id]});
      setCustomTagName("");
      toast.success("New competency sector identified.");
    } catch (e) {
      toast.error("Failed to register custom sector.");
    }
  }

  const filteredMembers = members.filter(m => 
    m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeUnits = members.filter(m => m.is_active !== false).length

  return (
    <TeamLeadChrome>
      <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700 font-sans">
        {/* Header */}
        <div className="sticky top-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 bg-[#fcfcfc]/80 backdrop-blur-md border-b border-transparent transition-all">
          <header>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 font-headline leading-none">Team Members</h2>
            <p className="text-xs font-bold text-slate-400 mt-2 font-headline leading-none opacity-60">Manage your team and their skill sets</p>
          </header>
          <div className="flex gap-3.5">
          </div>
        </div>

        {/* Global Registry Bar */}
        <div className="bg-white p-2 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 hover:shadow-xl transition-all duration-500">
           <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-violet-600 transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team members..." 
                className="w-full bg-slate-50/10 border-none rounded-2xl pl-14 pr-4 py-3.5 text-sm font-bold text-slate-900 focus:ring-0 placeholder:text-slate-200 outline-none tracking-tight"
              />
           </div>
           <div className="flex gap-2 p-1.5 px-2">
              <div className="bg-emerald-50 px-5 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-2.5">
                 <Shield className="size-3.5 text-emerald-600 shadow-sm" />
                 <span className="text-[10px] font-bold text-emerald-600 tabular-nums">{activeUnits} Active</span>
              </div>
              <div className="bg-violet-50 px-5 py-1.5 rounded-xl border border-violet-100 flex items-center gap-2.5">
                 <Zap className="size-3.5 text-violet-600 shadow-sm" />
                 <span className="text-[10px] font-bold text-violet-600 tabular-nums">{members.length} Total</span>
              </div>
           </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
             <div className="col-span-full py-24 text-center text-[11px] font-bold text-slate-300">
                <Loader2 className="size-8 animate-spin text-violet-600 mx-auto mb-4" />
                Loading team members...
             </div>
          ) : filteredMembers.length === 0 ? (
             <div className="col-span-full py-24 text-center opacity-30 text-[11px] font-bold text-slate-300">
                <Users className="size-12 mx-auto mb-4 text-slate-200" />
                No results found
             </div>
          ) : filteredMembers.map((member, i) => (
            <div key={i} className="bg-white rounded-[1.8rem] border border-slate-100 p-6 shadow-sm group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative flex flex-col items-center text-center">
              <div className="absolute top-6 right-6">
                 <button onClick={() => toast.info(`Syncing unit metadata: ${member.full_name}`)} className="p-1.5 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all">
                   <MoreHorizontal className="size-4" />
                 </button>
              </div>
              
              <div className="relative mb-6">
                 <div className="size-24 bg-slate-50 rounded-[1.8rem] p-1 border border-slate-100 group-hover:border-violet-100 group-hover:rotate-6 transition-all duration-700 shadow-sm group-hover:shadow-lg">
                    <img src={member.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name)}&background=f5f3ff&color=7c3aed&bold=true`} alt={member.full_name} className="size-full rounded-[1.6rem] object-cover" />
                 </div>
                 <div className="absolute -bottom-1 -right-1 size-7 bg-emerald-500 border-4 border-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Activity className="size-3 text-white animate-pulse" />
                 </div>
              </div>

              <div className="space-y-1 mb-6 w-full px-1">
                 <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-600 transition-colors tracking-tight truncate leading-none capitalize">{member.full_name}</h3>
                 <p className="text-[9px] text-slate-400 font-bold opacity-80">{member.role_display || member.employee_id || 'Team Member'}</p>
                 <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-violet-600 bg-violet-50 px-3 py-1 rounded-lg border border-violet-100 mt-3 mx-auto w-fit shadow-sm">
                   Location: {member.address?.split(',').pop()?.trim() || 'Headquarters'}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full mb-6">
                 <button 
                  onClick={() => toast.info(`Initializing Direct Comms: ${member.email}`)}
                  className="flex flex-col items-center gap-1.5 p-3.5 bg-slate-50 border border-slate-100 rounded-[1.2rem] hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all group/btn"
                 >
                    <Mail className="size-4 text-slate-400 group-hover/btn:text-white group-hover/btn:rotate-12 transition-all" />
                    <span className="text-[10px] font-bold">Interface</span>
                 </button>
                 <button 
                  onClick={() => toast.info(`Inpulse Sync: ${member.full_name}`)}
                  className="flex flex-col items-center gap-1.5 p-3.5 bg-slate-50 border border-slate-100 rounded-[1.2rem] hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all group/btn"
                 >
                    <MessageSquare className="size-4 text-slate-400 group-hover/btn:text-white group-hover/btn:-rotate-12 transition-all" />
                    <span className="text-[10px] font-bold">Inpulse</span>
                 </button>
              </div>

              <button 
                onClick={() => {
                   setSelectedMember(member);
                   setIsEvalOpen(true);
                }}
                className="w-full py-3.5 bg-white border border-slate-100 text-slate-900 text-[10px] font-bold rounded-[1.2rem] hover:bg-slate-50 transition-all flex items-center justify-center gap-2.5 active:scale-95 group shadow-sm hover:shadow-lg"
              >
                View Skills & Rating
                <ChevronRight className="size-3.5 text-violet-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Talent Evaluation - Refined Corporate Dialog (Standard Topology) */}
      <Dialog open={isEvalOpen} onOpenChange={setIsEvalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] font-sans bg-white">
          {/* Refined Header */}
          <div className="bg-slate-50/50 p-10 pb-8 flex items-center gap-6 border-b border-slate-100/50">
             <div className="size-14 rounded-2xl bg-[#FFF8E6] text-[#FFB800] flex items-center justify-center shadow-lg shadow-amber-900/5 transition-transform hover:scale-105 duration-300">
                <Award className="size-7 stroke-[2.2]" />
             </div>
             <div className="space-y-0.5 pt-0.5">
                <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                   Member Skills
                </DialogTitle>
                <DialogDescription className="text-xs font-medium text-slate-400">
                   Update background and skills for <span className="text-slate-900 font-bold">{selectedMember?.full_name}</span>
                </DialogDescription>
             </div>
          </div>

          <div className="p-10 space-y-8">
             {/* Identification Section */}
             <div className="space-y-3">
                <Label className="px-1 text-[11px] font-bold text-slate-400">Add New Skill</Label>
                <div className="relative group">
                   <Input 
                      placeholder="Type a new skill name..."
                      value={customTagName}
                      onChange={(e) => setCustomTagName(e.target.value)}
                      className="h-14 rounded-xl bg-slate-50 border-transparent px-5 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all shadow-inner"
                   />
                   <button 
                      onClick={handleAddCustomTag}
                      disabled={!customTagName.trim()}
                      className="absolute right-2 top-2 size-10 bg-slate-900 text-white rounded-lg flex items-center justify-center hover:bg-violet-600 transition-all active:scale-95 shadow-lg disabled:opacity-0"
                   >
                      <Plus className="size-4" />
                   </button>
                </div>
             </div>

             {/* Registry Section */}
             <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                   <Label className="text-[11px] font-bold text-slate-400">Skill List</Label>
                   <div className="flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-violet-600 animate-pulse" />
                      <span className="text-[10px] font-bold text-violet-600">Active</span>
                   </div>
                </div>
                
                <div className="flex flex-wrap gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                   {talentTags.map((tag: any) => {
                     const isSelected = selectedMember?.evaluated_talents?.includes(tag.id);
                     return (
                       <button 
                         key={tag.id}
                         onClick={() => {
                           const current = selectedMember?.evaluated_talents || [];
                           const updated = isSelected 
                             ? current.filter((id: any) => id !== tag.id)
                             : [...current, tag.id];
                           setSelectedMember({...selectedMember, evaluated_talents: updated});
                         }}
                         className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                           isSelected 
                             ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-900/10' 
                             : 'bg-white text-slate-400 border-slate-100 hover:border-violet-100 hover:text-slate-900'
                         }`}
                       >
                         {isSelected && <CheckCircle2 className="size-3 mr-2 inline-block -mt-0.5" />}
                         {tag.name}
                       </button>
                     );
                   })}
                </div>
             </div>
          </div>

          {/* Action Footer */}
          <div className="p-10 pt-0">
             <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsEvalOpen(false)}
                  className="flex-1 h-12 rounded-xl bg-slate-50 text-slate-400 text-xs font-bold hover:bg-slate-100 hover:text-slate-900 transition-all"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      setUpdating(true);
                      await api.post(`/api/auth/employees/${selectedMember.id}/update-skills/`, { talent_ids: selectedMember.evaluated_talents });
                      toast.success("Skills updated.");
                      setIsEvalOpen(false);
                      fetchMembers();
                    } catch (e) {
                      toast.error("Failed to update skills.");
                    } finally {
                      setUpdating(false);
                    }
                  }}
                  disabled={updating}
                  className="flex-[2] h-12 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xl shadow-slate-900/20 hover:bg-violet-600 transition-all active:scale-95 disabled:opacity-50 flex gap-2 items-center justify-center"
                >
                  {updating ? <Loader2 className="size-4 animate-spin" /> : <Shield className="size-4" />}
                  Save Changes
                </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </TeamLeadChrome>
  )
}
