import TeamLeadChrome from "@/components/portal/teamlead/TeamLeadChrome"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { useNavigate } from "react-router-dom"
import { accountsService } from "@/services/accounts"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  ChevronRight,
  Shield,
  Zap,
  Activity,
  Loader2,
  Users,
  Award,
  CheckCircle2,
  Calendar,
  FileSearch,
  ClipboardList,
  AlertCircle,
  CheckCircle,
  Circle
} from "lucide-react"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import { Badge } from "@/components/ui/badge"

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"


export default function TeamPage() {
  useDesignPortalLightTheme()
  const navigate = useNavigate()
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [talentTags, setTalentTags] = useState<any[]>([])
  const [isEvalOpen, setIsEvalOpen] = useState(false)
  const [isWorkOpen, setIsWorkOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [memberTasks, setMemberTasks] = useState<any[]>([])
  const [taskLoading, setTaskLoading] = useState(false)
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

  // Backend already scopes the list to the team lead's department
  const filteredMembers = members.filter(m =>
    m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeUnits = members.filter(m => m.is_active !== false).length

  const openWorkDialog = async (member: any) => {
    setSelectedMember(member)
    setIsWorkOpen(true)
    setTaskLoading(true)
    try {
      const res = await api.get(`/api/projects/tasks/?assignee=${member.id}`)
      const data = res.data
      setMemberTasks(Array.isArray(data) ? data : (data.results || []))
    } catch (e) {
      console.error(e)
      setMemberTasks([])
    } finally {
      setTaskLoading(false)
    }
  }

  return (
    <TeamLeadChrome>
      <div className="p-4 space-y-10 animate-in fade-in duration-700 font-sans">
        {/* Header */}
        <div className="sticky top-[80px] z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 bg-[#fcfcfc]/80 backdrop-blur-md border-b border-slate-100 transition-all">
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
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <button className="p-1.5 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all outline-none">
                          <MoreHorizontal className="size-4" />
                       </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-2xl border border-slate-100 shadow-2xl font-sans p-2">
                       <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 py-2.5">Unit Operations</DropdownMenuLabel>
                       <DropdownMenuItem 
                        onClick={() => navigate(`/tasks`)} 
                        className="text-xs font-bold gap-3 px-3 py-3 cursor-pointer rounded-xl hover:bg-violet-50 hover:text-violet-600 transition-colors"
                       >
                          <FileSearch className="size-4 text-emerald-500" />
                          View Active Tasks
                       </DropdownMenuItem>

                       <DropdownMenuItem 
                        onClick={() => openWorkDialog(member)} 
                        className="text-xs font-bold gap-3 px-3 py-3 cursor-pointer rounded-xl hover:bg-violet-50 hover:text-violet-600 transition-colors"
                       >
                          <ClipboardList className="size-4 text-violet-500" />
                          View Assigned Work
                       </DropdownMenuItem>
                       
                       <DropdownMenuSeparator className="bg-slate-50 my-1" />
                       <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 py-2.5">Personnel Data</DropdownMenuLabel>
                       
                       <DropdownMenuItem 
                        onClick={() => {
                          setSelectedMember(member);
                          setIsEvalOpen(true);
                        }} 
                        className="text-xs font-bold gap-3 px-3 py-3 cursor-pointer rounded-xl hover:bg-violet-50 hover:text-violet-600 transition-colors"
                       >
                          <Award className="size-4 text-amber-500" />
                          Skills Evaluation
                       </DropdownMenuItem>

                       <DropdownMenuItem 
                        onClick={() => toast.info(`Initializing attendance log for ${member.full_name}`)} 
                        className="text-xs font-bold gap-3 px-3 py-3 cursor-pointer rounded-xl hover:bg-violet-50 hover:text-violet-600 transition-colors"
                       >
                          <Calendar className="size-4 text-blue-500" />
                          Attendance History
                       </DropdownMenuItem>
                    </DropdownMenuContent>
                 </DropdownMenu>
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


              <button
                onClick={() => navigate(`/team/${member.id}`)}
                className="w-full py-3.5 bg-violet-600 text-white text-[10px] font-bold rounded-[1.2rem] hover:bg-violet-700 transition-all flex items-center justify-center gap-2.5 active:scale-95 group shadow-lg shadow-violet-600/20"
              >
                View Full Profile
                <ChevronRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
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
      
      {/* Member Assigned Work Dialog */}
      <Dialog open={isWorkOpen} onOpenChange={setIsWorkOpen}>
        <DialogContent className="sm:max-w-[680px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl font-sans bg-white">
          <div className="bg-slate-50/50 p-8 pb-6 flex items-center gap-5 border-b border-slate-100/50">
            <div className="size-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <ClipboardList className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-slate-900 tracking-tight leading-none">
                Assigned Work
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-400 mt-1">
                Tasks currently assigned to <span className="text-slate-900 font-bold">{selectedMember?.full_name}</span>
              </DialogDescription>
            </div>
          </div>

          <div className="p-8 max-h-[500px] overflow-y-auto">
            {taskLoading ? (
              <div className="py-16 flex flex-col items-center gap-4">
                <Loader2 className="size-6 animate-spin text-violet-500" />
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loading tasks...</p>
              </div>
            ) : memberTasks.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <ClipboardList className="size-10 text-slate-200" />
                <p className="text-sm font-bold text-slate-400">No tasks assigned</p>
                <p className="text-xs text-slate-300">{selectedMember?.full_name} has no current work assignments.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {memberTasks.map((task: any) => (
                  <div key={task.id} className="bg-white border border-slate-100 rounded-2xl p-5 flex items-start gap-4 hover:shadow-sm transition-all">
                    <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      task.status === 'completed' ? 'bg-emerald-50 text-emerald-500' :
                      task.status === 'in_progress' ? 'bg-blue-50 text-blue-500' :
                      'bg-orange-50 text-orange-400'
                    }`}>
                      {task.status === 'completed' ? <CheckCircle className="size-4" /> :
                       task.status === 'in_progress' ? <Circle className="size-4 fill-blue-100" /> :
                       <AlertCircle className="size-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900">{task.title}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {task.project_name && (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">{task.project_name}</span>
                        )}
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                          task.priority === 'urgent' || task.priority === 'high' ? 'bg-red-50 text-red-500 border-red-100' :
                          task.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>{task.priority || 'normal'}</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                          task.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          task.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          'bg-orange-50 text-orange-600 border-orange-100'
                        }`}>{(task.status || 'pending').replace('_', ' ')}</span>
                      </div>
                      {task.due_date && (
                        <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">
                          Due: {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <Badge className={`shrink-0 text-[9px] font-black rounded-lg border ${
                      task.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      task.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>
                      {(task.status || 'pending').replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TeamLeadChrome>
  )
}
