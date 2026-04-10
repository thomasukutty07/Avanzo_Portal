import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { 
  ChevronLeft, 
  Users, 
  Target, 
  Calendar,
  Mail,
  Phone,
  MoreVertical,
  Briefcase,
  Loader2,
  ExternalLink
} from "lucide-react"
import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"

export default function AdminProjectDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/api/projects/projects/${id}/`)
        setProject(res.data)
      } catch (e) {
        console.error(e)
        toast.error("Project not found.")
        navigate("/departments")
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [id])

  if (loading) {
    return (
      <OrganizationAdminChrome>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      </OrganizationAdminChrome>
    )
  }

  return (
    <OrganizationAdminChrome>
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 font-sans">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
           <button onClick={() => navigate("/departments")} className="hover:text-violet-600 transition-colors">Departments</button>
           <ChevronLeft className="size-4 rotate-180" />
           <span className="text-slate-900 font-medium">{project?.department_name}</span>
           <ChevronLeft className="size-4 rotate-180" />
           <span className="text-violet-600 font-semibold">{project?.title}</span>
        </nav>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100">
          <div className="space-y-4">
            <button 
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-all"
            >
              <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
              Back to list
            </button>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none capitalize">
              {project?.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4">
               <span className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 text-xs font-bold rounded-full border border-violet-100">
                 <Target className="size-3.5" />
                 {project?.department_name}
               </span>
               <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                 {project?.status === 'active' ? 'Active' : 'On Track'}
               </span>
               <span className="text-slate-400 text-xs font-medium">
                 Created on {project?.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
               </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all shadow-sm">
                Edit Details
             </button>
             <button className="px-6 py-2.5 bg-violet-600 text-white font-bold rounded-xl text-sm hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20">
                Generate Report
             </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Team & Activity */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Project Stats Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2">
                  <p className="text-[11px] font-bold text-slate-400 tracking-tight">Overall Progress</p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">{project?.progress || 0}%</span>
                  </div>
                  <Progress value={project?.progress || 0} className="h-1.5 bg-slate-50" />
               </div>
               <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2">
                  <p className="text-[11px] font-bold text-slate-400 tracking-tight">Team Size</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">{project?.team?.length || 0}</span>
                    <span className="text-xs font-medium text-slate-400">Assigned members</span>
                  </div>
                  <div className="flex -space-x-2">
                    {project?.team?.slice(0, 4).map((m: any, i: number) => (
                      <div key={i} className="size-6 rounded-full border-2 border-white bg-slate-100 overflow-hidden ring-1 ring-slate-100">
                        <img src={m.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${m.full_name}`} alt="" />
                      </div>
                    ))}
                  </div>
               </div>
               <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2">
                  <p className="text-[11px] font-bold text-slate-400 tracking-tight">Client</p>
                  <p className="text-xl font-bold text-slate-900 truncate">
                    {project?.client_name || 'Internal Project'}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-violet-600 font-bold">
                    View profile <ExternalLink className="size-3" />
                  </div>
               </div>
            </div>

            {/* Team Roster */}
            <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden min-h-[400px]">
               <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Working Persons</h3>
                  <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-slate-400">{project?.team?.length} Personnel</span>
                  </div>
               </div>
               
               <div className="divide-y divide-slate-50">
                  {project?.team?.length > 0 ? project.team.map((member: any) => (
                    <div key={member.id} className="p-6 hover:bg-slate-50/50 transition-all flex items-center justify-between group">
                       <div className="flex items-center gap-5">
                          <div className="size-14 rounded-2xl bg-slate-100 overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-300">
                             <img 
                              src={member.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${member.full_name}&backgroundColor=f8fafc`} 
                              alt={member.full_name}
                              className="w-full h-full object-cover"
                             />
                          </div>
                          <div>
                             <p className="font-bold text-slate-900 text-[15px] group-hover:text-violet-600 transition-colors">{member.full_name}</p>
                             <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs font-medium text-slate-400">Software Engineer</span>
                                <div className="size-1 rounded-full bg-slate-200" />
                                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Available</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <button className="p-3 text-slate-400 hover:text-violet-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                             <Mail className="size-4" />
                          </button>
                          <button className="p-3 text-slate-400 hover:text-violet-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100">
                             <Phone className="size-4" />
                          </button>
                          <button className="p-3 text-slate-400 hover:text-slate-900 transition-all">
                             <MoreVertical className="size-4" />
                          </button>
                       </div>
                    </div>
                  )) : (
                     <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <Users className="size-12 text-slate-200" />
                        <div className="space-y-1">
                           <p className="text-lg font-bold text-slate-900">No team members assigned</p>
                           <p className="text-sm text-slate-400">Start by adding personnel to this project node.</p>
                        </div>
                        <button className="px-6 py-2 bg-violet-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-600/20">
                          Assign Personnel
                        </button>
                     </div>
                  )}
               </div>
            </div>
          </div>

          {/* Right Column - Secondary Info */}
          <div className="space-y-8">
             
             {/* Project Info Card */}
             <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-8">
                <h3 className="text-lg font-bold text-slate-900">Project Info</h3>
                
                <div className="space-y-6">
                   <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400">
                         <Briefcase className="size-4" />
                      </div>
                      <div className="space-y-0.5">
                         <p className="text-[11px] font-bold text-slate-400 tracking-tight">Owning Department</p>
                         <p className="text-sm font-bold text-slate-900">{project?.department_name}</p>
                      </div>
                   </div>

                   <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400">
                         <Target className="size-4" />
                      </div>
                      <div className="space-y-0.5">
                         <p className="text-[11px] font-bold text-slate-400 tracking-tight">Service Type</p>
                         <p className="text-sm font-bold text-slate-900">{project?.service_name || 'General Management'}</p>
                      </div>
                   </div>

                   <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400">
                         <Calendar className="size-4" />
                      </div>
                      <div className="space-y-0.5">
                         <p className="text-[11px] font-bold text-slate-400 tracking-tight">Target Completion</p>
                         <p className="text-sm font-bold text-slate-900">{project?.target_end_date || 'Q4 2026'}</p>
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-50 space-y-4">
                   <p className="text-[11px] font-bold text-slate-400 tracking-tight">Project Description</p>
                   <p className="text-sm text-slate-500 leading-relaxed italic">
                     No description provided for this operational mission node. Strategic objectives are synchronized via department leads.
                   </p>
                </div>
             </div>

          </div>

        </div>
      </div>
    </OrganizationAdminChrome>
  )
}
