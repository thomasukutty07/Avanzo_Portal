import { TeamLeadChrome } from "@/components/portal/teamlead/TeamLeadChrome"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { useState } from "react"
import { toast } from "sonner"
import { AddMemberModal, CreateDepartmentModal } from "@/components/portal/teamlead/TeamLeadActionForms"
import { Building2 } from "lucide-react"
import { 
  Users, 
  UserPlus, 
  MoreVertical, 
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react"

const TEAM_MEMBERS = [
  { id: 1, name: "Sarah Miller", role: "UI/UX Designer", email: "sarah.m@avanzo.com", status: "Available", color: "bg-green-500", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHKGI4TKnniQXUa6O_I2UiTEBPOSnzJWzfL3YZetsRTBCHSs1iOzf3O7eVZCCKp8MdBtA95rO1d3CiP86nseP7h3lNanxUdtCur6LxBMb_nDiKgSUQSbkx_hnqfGjnsNa9QfNq2RkiRFVkPkb-tUtKNq1-MOu02iQuc8IrK-04ZUVCXEgVv2UWo5nCy1A4gFftfVqLDwlamNVryFcEE_AzDt1b3APrNzc41XmDgpWVPZfyMhlBpODVQH3xXCAN0BCW3Z47Z6-igmE" },
  { id: 2, name: "James Chen", role: "Lead Developer", email: "james.c@avanzo.com", status: "In Meeting", color: "bg-amber-500", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTM-hZ-TaGxo4agsgbQt33_kGRmdMl-t5bbaWSTroBPQ6zP0VfHBGsLaLB3zlGizeBFHoMJlVEGc22qx2I-mtlsmwKybqVvXUOKhmFFii3o1qscQmyMnNZwH90PetxFTpi7SBCPZcL6boNvopI4CCxpLJdNVxSUU8vIBXUD13x-56vltnqWXh-8FIi5tijXwAe5Fg4qUqqmagRAwsHQhWDa3wrjYIbfyo_B2ESYN4NhsDP-x-98UpMNQxillkkzfG2ZLDxeBRIZbA" },
  { id: 3, name: "Mike Ross", role: "Cloud Architect", email: "mike.r@avanzo.com", status: "Away", color: "bg-slate-400", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDojy_q_3sli6wsyTGnyhDCYPVFpSjiP5AAY_IatQ5YAcfLO7vu83Rqor5azzhHmRtGRFPGFoYjdq7xcyzrgd7ZYiAJ7Eg5P2_naTitmyebIA29DvgPfvsEH0tj8bOYOy4egnFI-FXxlO-GTVR2bEL_RcYAZGo2nNi6xLQR9qH4WZLmWAxNO0-QoP2acWrpD1QTUnyZj89TgDSOHlB-8bDZKWXa7w-1UZPWgL-OMc_hU8QTq8j3QDpaZCB6gOHTUvTYvCNJkCLsBUA" },
  { id: 4, name: "Harvey Specter", role: "DevOps Engineer", email: "harvey.s@avanzo.com", status: "Available", color: "bg-green-500", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHGI4TKnniQXUa6O_I2UiTEBPOSnzJWzfL3YZetsRTBCHSs1iOzf3O7eVZCCKp8MdBtA95rO1d3CiP86nseP7h3lNanxUdtCur6LxBMb_nDiKgSUQSbkx_hnqfGjnsNa9QfNq2RkiRFVkPkb-tUtKNq1-MOu02iQuc8IrK-04ZUVCXEgVv2UWo5nCy1A4gFftfVqLDwlamNVryFcEE_AzDt1b3APrNzc41XmDgpWVPZfyMhlBpODVQH3xXCAN0BCW3Z47Z6-igmE" },
]

export default function TeamPage() {
  useDesignPortalLightTheme()
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isCreateDeptOpen, setIsCreateDeptOpen] = useState(false)

  return (
    <TeamLeadChrome>
      <div className="p-8 space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-headline text-[1.75rem] font-bold tracking-[-0.02em] text-[#191c1d]">Team Members</h1>
            <p className="font-body text-[#494456] mt-1 text-sm font-medium">Manage your team members and operational availability.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsCreateDeptOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              <Building2 className="h-4 w-4 text-violet-600" />
              New Department
            </button>
            <button 
              onClick={() => setIsAddMemberOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-violet-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-900/10 hover:bg-violet-800 transition-all active:scale-95"
            >
              <UserPlus className="h-4 w-4" />
              Add Member
            </button>
          </div>
        </header>

        {/* Team Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Active Members", value: "12", icon: Users, color: "text-blue-600 bg-blue-50" },
            { label: "On Duty", value: "9", icon: CheckCircle2, color: "text-green-600 bg-green-50" },
            { label: "Critical Support", value: "2", icon: AlertCircle, color: "text-red-600 bg-red-50" },
            { label: "Upcoming Leave", value: "3", icon: Clock, color: "text-amber-600 bg-amber-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Member List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/20">
            <h3 className="font-headline text-lg font-bold text-slate-900 leading-none">Team Roster</h3>
            <div className="flex items-center gap-3 w-full sm:w-auto">
               <div className="relative flex-1 sm:w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <input 
                   placeholder="Search members..."
                   className="w-full bg-white border-slate-200 rounded-xl pl-10 py-2.5 text-xs font-medium focus:ring-violet-700/10 focus:border-violet-700 transition-all"
                   type="text"
                 />
               </div>
               <button onClick={() => toast.info("Filters operational")} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors shadow-sm"><Filter className="h-5 w-5" /></button>
            </div>
          </div>
          
          <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            {TEAM_MEMBERS.map((member) => (
              <div key={member.id} className="p-4 rounded-xl border border-transparent hover:border-violet-100 hover:bg-violet-50/20 transition-all group relative flex items-center gap-4 cursor-pointer" onClick={() => toast.info(`Viewing ${member.name} profile...`)}>
                 <div className="relative shrink-0">
                    <img className="size-14 rounded-2xl object-cover ring-2 ring-white shadow-sm" src={member.img} alt={member.name} />
                    <div className={`absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-white ${member.color}`} />
                 </div>
                 
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                       <div>
                          <h4 className="font-headline font-bold text-slate-900 leading-tight group-hover:text-violet-700 transition-colors">{member.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{member.role}</p>
                       </div>
                       <button onClick={(e) => { e.stopPropagation(); toast.info(`Action menu for ${member.name}`); }} className="text-slate-300 hover:text-slate-600 transition-colors"><MoreVertical className="h-4 w-4" /></button>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{member.status}</p>
                       </div>
                       
                       <button 
                        onClick={(e) => { e.stopPropagation(); toast.info(`Drafting performance review for ${member.name}`); }}
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 px-2 py-1 rounded shadow-sm"
                       >
                         Review
                       </button>
                    </div>
                 </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-slate-50 bg-slate-50/5 text-center">
             <button onClick={() => toast.info("No more employees in this view")} className="text-[10px] font-bold text-slate-400 hover:text-violet-700 transition-colors uppercase tracking-widest">View Full Roster</button>
          </div>
        </div>
      </div>
      <AddMemberModal open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen} />
      <CreateDepartmentModal open={isCreateDeptOpen} onOpenChange={setIsCreateDeptOpen} />
    </TeamLeadChrome>
  )
}
