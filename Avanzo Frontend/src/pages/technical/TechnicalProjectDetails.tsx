import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { 
  ChevronLeft, 
  Users, 
  Target, 
  Calendar,
  Mail,
  Briefcase,
  Loader2,
} from "lucide-react"

import { api } from "@/lib/axios"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { getAvatarUrl } from "@/lib/utils/avatar"

export default function TechnicalProjectDetailsPage() {
  useDesignPortalLightTheme()
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchProject = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/api/projects/projects/${id}/`)
      setProject(res.data)
    } catch (e) {
      console.error(e)
      toast.error("Project not found.")
      navigate("/technical")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProject()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    )
  }

  return (
    <div className="p-2 md:p-8 space-y-10 animate-in fade-in duration-700 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-slate-100">
        <div className="space-y-6">
          <button 
            onClick={() => navigate("/technical")}
            className="group flex items-center gap-2.5 text-xs font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest"
          >
            <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none capitalize">
              {project?.title}
            </h1>
            <div className="px-5 py-2.5 bg-violet-50 text-violet-700 text-[10px] font-black rounded-2xl border border-violet-100 tracking-widest shadow-sm">
               TEAM LEAD: <span className="text-violet-900 ml-1">
                 {project?.manager_name || project?.manager?.full_name || project?.manager?.email || 'Assigned Lead'}
               </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
             <span className="flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-700 text-[10px] font-black rounded-xl border border-violet-100 uppercase tracking-widest">
               <Target className="size-3.5" />
               {project?.department_name}
             </span>
             <span className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-xl border border-emerald-100 uppercase tracking-widest">
               {project?.status === 'active' ? 'Active' : project?.status}
             </span>
             <span className="text-slate-400 text-xs font-bold opacity-60">
               Created: {project?.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
             </span>
          </div>
          
          <div className="max-w-3xl mt-6">
             <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
                {project?.description || "No description provided for this project."}
             </p>
          </div>
        </div>
      </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column - Team & Activity */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Project Stats Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
               <div className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm space-y-4 hover:shadow-xl transition-all group">
                  <p className="text-[10px] font-black text-slate-300 tracking-widest uppercase">Completion</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-slate-900 tracking-tight">{project?.progress || 0}%</span>
                  </div>
                  <Progress value={project?.progress || 0} className="h-2 bg-slate-50 border border-slate-100 shadow-inner overflow-hidden" />
               </div>
               <div className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm space-y-4 hover:shadow-xl transition-all">
                  <p className="text-[10px] font-black text-slate-300 tracking-widest uppercase">Resources</p>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-black text-slate-900 tracking-tight">{project?.team_members?.length || 0}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Members</span>
                  </div>
                  <div className="flex -space-x-3">
                    {project?.team_members?.slice(0, 5).map((m: any, i: number) => (
                      <div key={m.id || `team-avatar-${i}`} className="size-8 rounded-xl border-[3px] border-white bg-slate-100 overflow-hidden ring-1 ring-slate-100 shadow-sm">
                        <img src={getAvatarUrl(m.full_name, m.gender, m.avatar)} alt="" className="size-full object-cover" />
                      </div>
                    ))}
                  </div>
               </div>
               <div className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm space-y-4 hover:shadow-xl transition-all">
                  <p className="text-[10px] font-black text-slate-300 tracking-widest uppercase">Milestone</p>
                  <p className="text-xl font-black text-slate-900 truncate">
                    {project?.target_end_date ? new Date(project.target_end_date).toLocaleDateString() : 'Active Phase'}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-violet-600 font-black uppercase tracking-widest">
                    <Calendar className="size-3.5" /> On Track
                  </div>
               </div>
            </div>

            {/* Team Roster */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[500px] hover:shadow-2xl transition-all duration-700">
               <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/10">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Team Members</h3>
                  <div className="flex items-center gap-3">
                     <span className="px-4 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-widest">
                       {project?.team_members?.filter((m: any) => m.id !== (project.manager?.id || project.manager)).length} Members
                     </span>
                  </div>
               </div>
               
               <div className="divide-y divide-slate-50">
                  {project?.team_members?.filter((m: any) => m.id !== (project.manager?.id || project.manager)).length > 0 ? 
                    project.team_members.filter((m: any) => m.id !== (project.manager?.id || project.manager)).map((member: any, idx: number) => (
                    <div key={member.id || `team-member-${idx}`} className="p-8 hover:bg-slate-50/30 transition-all flex items-center justify-between group cursor-pointer">
                       <div className="flex items-center gap-6">
                          <div className="size-16 rounded-[1.5rem] bg-white border border-slate-100 overflow-hidden shadow-sm group-hover:scale-105 group-hover:shadow-xl transition-all duration-500">
                             <img 
                              src={getAvatarUrl(member.full_name, member.gender, member.avatar)} 
                              alt={member.full_name}
                              className="size-full object-cover"
                             />
                          </div>
                          <div>
                             <p className="font-black text-slate-900 text-lg group-hover:text-violet-600 transition-colors tracking-tight">{member.full_name}</p>
                             <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-xs font-bold text-slate-400">{member.email}</span>
                                <div className="size-1 rounded-full bg-slate-200" />
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-emerald-100">Ready</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <a 
                            href={`mailto:${member.email || ''}`}
                            className="p-3.5 text-slate-400 hover:text-violet-600 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100 active:scale-95"
                          >
                             <Mail className="size-5" />
                          </a>
                       </div>
                    </div>
                  )) : (
                     <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 opacity-30">
                        <Users className="size-16 text-slate-200" />
                        <div className="space-y-2">
                           <p className="text-xl font-black text-slate-900 uppercase tracking-widest font-headline">No members assigned</p>
                           <p className="text-xs font-bold text-slate-400">Team members added to this project will appear here.</p>
                        </div>
                     </div>
                  )}
               </div>
            </div>
          </div>

          {/* Right Column - Secondary Info */}
          <div className="space-y-10">
             
             {/* Project Info Card */}
             <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-10 hover:shadow-2xl transition-all duration-700">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Metadata</h3>
                
                <div className="space-y-8">
                   <div className="flex items-start gap-5">
                      <div className="p-3.5 bg-slate-50 rounded-2xl text-slate-400 border border-slate-100">
                         <Briefcase className="size-5" />
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-slate-300 tracking-widest uppercase leading-none">Sector</p>
                         <p className="text-base font-black text-slate-900 truncate tracking-tight">{project?.department_name || "N/A"}</p>
                      </div>
                   </div>

                   <div className="flex items-start gap-5">
                      <div className="p-3.5 bg-slate-50 rounded-2xl text-slate-400 border border-slate-100">
                         <Target className="size-5" />
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-slate-300 tracking-widest uppercase leading-none">Service</p>
                         <p className="text-base font-black text-slate-900 truncate tracking-tight">{project?.service_name || 'General Operations'}</p>
                      </div>
                   </div>

                   <div className="flex items-start gap-5">
                      <div className="p-3.5 bg-slate-50 rounded-2xl text-slate-400 border border-slate-100">
                         <Calendar className="size-5" />
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-slate-300 tracking-widest uppercase leading-none">Target Deadline</p>
                         <p className="text-base font-black text-slate-900 truncate tracking-tight">{project?.target_end_date || 'TBD'}</p>
                      </div>
                   </div>
                </div>
             </div>

          </div>

        </div>
    </div>
  )
}
