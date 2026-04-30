import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { FolderGit2, Loader2, Shield } from "lucide-react"

import { projectsService } from "@/services/projects";
import { useAuth } from "@/context/AuthContext";
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"

export default function TechnicalProjectsPage() {
  useDesignPortalLightTheme()
  const navigate = useNavigate()
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchProjectsData = async () => {
      try {
        setLoading(true);
        const projectsRes = await projectsService.getProjects();
        const projectsList = Array.isArray(projectsRes) ? projectsRes : (projectsRes.results || []);
        setProjects(projectsList);
      } catch (error) {
        console.error("Projects load failed:", error);
        toast.error("Failed to load active projects.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
        fetchProjectsData();
    }
  }, [user]);

  if (loading) {
    return (
        <div className="flex h-[80vh] items-center justify-center bg-[#fcfcfc]">
            <div className="flex flex-col items-center gap-6">
                <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
                <p className="text-sm font-black text-slate-400 font-headline">Loading projects...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-10 pb-12 font-sans bg-[#fcfcfc] min-h-screen animate-in fade-in duration-700 p-4 md:p-8">
      {/* Page Header */}
      <div className="sticky top-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[#fcfcfc]/80 backdrop-blur-md border-b border-transparent transition-all">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-violet-100 rounded-2xl text-violet-600 shadow-sm">
            <FolderGit2 className="size-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Active Projects</h1>
            <p className="text-slate-500 mt-2 text-xs font-medium">View and track all projects you are currently assigned to.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.length > 0 ? (
          projects.map((p: any, i: number) => {
            const percentage = p.completion_percentage || p.progress || 0;
            return (
              <div 
                key={i} 
                onClick={() => navigate(`/technical/projects/${p.id}`)} 
                className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                    <div className="flex items-center justify-between mb-6">
                       <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg border border-violet-100 uppercase tracking-widest">
                         {p.status === 'active' ? 'Active' : p.status}
                       </span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {p.department_name || "General"}
                       </span>
                    </div>
                    
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-violet-700 transition-colors tracking-tight mb-2 line-clamp-2">
                      {p.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mb-6">
                      Client: {p.client_name || "Internal"}
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold">
                       <span className="text-slate-500">Progress</span>
                       <span className="text-slate-900 font-black">{percentage}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner group-hover:border-violet-100 transition-colors">
                      <div 
                        className="bg-violet-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(124,58,237,0.3)]" 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>
                    
                    <div className="pt-6 mt-6 border-t border-slate-50 flex items-center justify-between text-[11px] font-bold text-slate-400">
                       <div className="flex items-center gap-2">
                         <span>Due: {p.target_end_date ? new Date(p.target_end_date).toLocaleDateString() : "TBD"}</span>
                       </div>
                       <span className="text-violet-600 group-hover:underline">View Details →</span>
                    </div>
                </div>
              </div>
            );
          })
        ) : (
            <div className="col-span-full py-32 text-center opacity-40">
               <Shield className="size-16 mx-auto mb-6 text-slate-300" />
               <p className="text-lg font-black tracking-[0.1em] text-slate-400 uppercase font-headline">No active projects</p>
               <p className="text-xs font-bold text-slate-400 mt-2">You are currently not assigned to any active projects.</p>
            </div>
        )}
      </div>
    </div>
  )
}
