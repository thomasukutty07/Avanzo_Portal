import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { 
  Plus, 
  Building2, 
  Rocket, 
  Users, 
  TrendingUp, 
  MoreVertical,
  ChevronRight,
  Trash2
} from "lucide-react"
import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"



export default function DepartmentsPage() {
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [newDeptName, setNewDeptName] = useState("")
  const [selectedDept, setSelectedDept] = useState<any>(null)
  const [deptProjects, setDeptProjects] = useState<any[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deptToDelete, setDeptToDelete] = useState<{id: string, name: string} | null>(null)
  const [isDecommissioning, setIsDecommissioning] = useState(false)

  const refreshDepts = async () => {
    try {
      const res = await api.get("/api/organization/departments/");
      const apiDepts = extractResults(res.data);
      const mapped = apiDepts.map((d: any, idx: number) => {
         const colors = [
           "bg-indigo-600",
           "bg-blue-600",
           "bg-rose-500",
           "bg-emerald-500"
         ]
         return {
           id: d.id,
           name: d.name,
           badge: "DEPT " + (idx+1),
           employees: d.employee_count ?? 0,
           projects: d.project_count ?? 0,
           utilization: 0,
           color: colors[idx % colors.length]
         }
      })
      setDepartments(mapped);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    refreshDepts();
  }, [])

  useEffect(() => {
    if (selectedDept) {
      fetchDeptProjects(selectedDept.id);
    }
  }, [selectedDept]);

  const fetchDeptProjects = async (deptId: string) => {
    try {
      const res = await api.get(`/api/projects/projects/?owning_department=${deptId}`);
      const raw = extractResults(res.data);
      // Backend filters by user dept usually, but Admin can see all.
      // If the backend doesn't support query param filtering, we filter here.
      const filtered = raw.filter((p: any) => p.owning_department === deptId || p.department_name === selectedDept.name);
      setDeptProjects(filtered);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load department projects.");
    }
  }

  const handleAddDept = async () => {
    if (!newDeptName.trim()) {
      toast.error("Please enter a department name.");
      return;
    }
    
    try {
      setAdding(true)
      await api.post("/api/organization/departments/", { name: newDeptName });
      toast.success(`Department "${newDeptName}" initialized successfully.`);
      setNewDeptName("");
      setAdding(false);
      setIsDialogOpen(false);
      refreshDepts();
    } catch (e: any) {
      toast.error(e?.response?.data?.name?.[0] || "Failed to create department.");
      setAdding(false);
      setIsDialogOpen(false);
    }
  }

  const handleDeleteDept = (id: string, name: string) => {
    setDeptToDelete({ id, name });
    setIsDeleteDialogOpen(true);
  }

  const handleConfirmDelete = async () => {
    if (!deptToDelete) return;
    
    try {
      setIsDecommissioning(true)
      await api.delete(`/api/organization/departments/${deptToDelete.id}/`);
      toast.success(`Department "${deptToDelete.name}" decommissioned successfully.`);
      setIsDeleteDialogOpen(false);
      setDeptToDelete(null);
      refreshDepts();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to decommission department. Ensure it has no active dependencies.");
    } finally {
      setIsDecommissioning(false);
    }
  }

  return (
    <OrganizationAdminChrome>
      <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 min-h-screen font-display bg-[#fcfcfc] text-slate-900">
        {/* Top Header */}
        <header className="sticky top-0 z-30 -mx-6 md:-mx-10 px-6 md:px-10 py-8 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-[#fcfcfc]/80 backdrop-blur-md border-b border-transparent transition-all">
          <div className="">
            <h1 className="text-[32px] font-black tracking-tight text-slate-900 leading-tight">
              Departments
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">
               Manage and monitor your organizational infrastructure departments.
            </p>
          </div>
          <button 
            onClick={() => setIsDialogOpen(true)}
            disabled={adding}
            className="flex items-center gap-3 px-10 py-4 bg-violet-600 text-white rounded-2xl text-[11px] font-black shadow-xl shadow-violet-900/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
          >
            <Plus className="h-4 w-4 stroke-[3px]" />
            New Department
          </button>
        </header>

        {/* Overview KPIs */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { label: "Total Departments", value: departments.length.toString(), trend: "Active Registry", icon: Building2, color: "text-violet-600 bg-violet-50" },
            { label: "Active Projects", value: departments.reduce((acc, d) => acc + (d.projects || 0), 0).toLocaleString(), trend: "Org wide", icon: Rocket, color: "text-orange-600 bg-orange-50" },
            { label: "Total Employees", value: departments.reduce((acc, d) => acc + (d.employees || 0), 0).toLocaleString(), trend: "+0.0%", icon: Users, color: "text-emerald-600 bg-emerald-50" },
          ].map((kpi, i) => (
             <div key={i} className="group flex items-center justify-between p-8 bg-white border border-slate-50 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-violet-900/5 transition-all">
                <div>
                   <p className="text-[10px] font-black text-slate-300 mb-2">{kpi.label}</p>
                   <div className="flex items-center gap-3">
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight">{kpi.value}</h3>
                      <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1 tracking-tighter">
                         {kpi.trend} <TrendingUp className="h-3 w-3 stroke-[2.5px]" />
                      </span>
                   </div>
                </div>
                <div className={`p-6 rounded-2xl ${kpi.color} shadow-inner group-hover:scale-110 transition-transform`}>
                   <kpi.icon className="h-6 w-6 stroke-[2.5px]" />
                </div>
             </div>
          ))}
        </section>

        {/* Department Grid or Project List */}
        {!selectedDept ? (
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {departments.map((dept) => (
              <div 
                key={dept.id} 
                className="group bg-white rounded-[40px] border border-slate-50 shadow-sm overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-violet-900/10 transition-all hover:border-violet-100 cursor-pointer"
                onClick={() => setSelectedDept(dept)}
              >
                <div className={`h-32 ${dept.color} relative flex items-center justify-center`}>
                    <Building2 className="size-12 text-white/20 absolute" />
                    <span className="absolute top-6 left-6 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-black text-white border border-white/20">
                      {dept.badge}
                    </span>
                </div>
                
                <div className="p-8 flex-1 space-y-8">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-black text-slate-900 tracking-tight">{dept.name}</h4>
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 -mr-2 text-slate-300 hover:text-slate-900 transition-colors focus:outline-none" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical className="h-5 w-5 stroke-[2.5px]" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-slate-100 font-display">
                            <DropdownMenuItem 
                                onClick={(e) => { e.stopPropagation(); handleDeleteDept(dept.id, dept.name); }}
                                className="rounded-xl px-3 py-3 cursor-pointer group flex items-center gap-2 text-red-600 hover:bg-red-50 focus:bg-red-50"
                            >
                                <Trash2 className="size-4" />
                                <span className="text-[11px] font-black uppercase tracking-wider">Decommission Department</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="flex items-center justify-between gap-4">
                      <div>
                          <p className="text-[9px] font-black text-slate-300 mb-1">Staffing</p>
                          <p className="text-lg font-black text-slate-900 tracking-tight">{dept.employees}</p>
                      </div>
                      <div>
                          <p className="text-[9px] font-black text-slate-300 mb-1">Operatives</p>
                          <p className="text-lg font-black text-slate-900 tracking-tight">{dept.projects}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-black">
                          <span className="text-slate-300">Utilization: {dept.utilization}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                          <div 
                            className="h-full bg-violet-600 rounded-full shadow-lg shadow-violet-600/30 transition-all duration-1000"
                            style={{ width: `${dept.utilization}%` }}
                          />
                      </div>
                    </div>
                </div>
              </div>
            ))}
          </section>
        ) : (
          <section className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between bg-white p-8 rounded-[32px] border border-slate-50 shadow-sm">
               <div className="flex items-center gap-6">
                  <button 
                    onClick={() => setSelectedDept(null)}
                    className="p-4 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
                  >
                    <ChevronRight className="h-5 w-5 rotate-180" />
                  </button>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedDept.name} Projects</h2>
                    <p className="text-slate-400 text-xs font-bold mt-1">Operational Nodes within Department</p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {deptProjects.length > 0 ? deptProjects.map((project: any) => (
                <div 
                  key={project.id} 
                  onClick={() => navigate(`/admin/projects/${project.id}`)}
                  className="bg-white p-10 rounded-[48px] border border-slate-50 shadow-md hover:shadow-2xl hover:shadow-violet-900/10 transition-all group relative overflow-hidden cursor-pointer"
                >
                   <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 transition-opacity group-hover:opacity-100" />
                   
                   <div className="flex justify-between items-start mb-10 relative z-10">
                      <div className="size-16 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-2xl shadow-slate-900/20 group-hover:bg-violet-600 group-hover:rotate-3 transition-all duration-500">
                         {project.title[0]}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black border ${
                          project.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                        }`}>
                          {project.status || 'Stable'}
                        </span>
                        <p className="text-[9px] font-black text-slate-300">Node ID: {project.id.slice(0, 8)}</p>
                      </div>
                   </div>
                   
                   <div className="space-y-2 mb-10 relative z-10">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight group-hover:text-violet-600 transition-colors">{project.title}</h3>
                      <p className="text-[10px] font-medium text-slate-400 italic">Targeting strategic milestones in {selectedDept.name}</p>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mb-10 relative z-10">
                      <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-50 group-hover:bg-white group-hover:border-violet-100 transition-all">
                         <div className="flex items-center gap-2 mb-2">
                            <Users className="size-3 text-slate-400" />
                            <p className="text-[9px] font-black text-slate-300">Personnel</p>
                         </div>
                         <p className="text-xl font-black text-slate-900">{project.team?.length || 0}</p>
                         <p className="text-[8px] font-bold text-slate-400 mt-1">Authorized Staff</p>
                      </div>
                      <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-50 group-hover:bg-white group-hover:border-violet-100 transition-all">
                         <div className="flex items-center gap-2 mb-2">
                            <Rocket className="size-3 text-slate-400" />
                            <p className="text-[9px] font-black text-slate-300">Stage</p>
                         </div>
                         <p className="text-xl font-black text-slate-900">{project.status || 'Active'}</p>
                         <p className="text-[8px] font-bold text-slate-400 mt-1">Current Sector</p>
                      </div>
                   </div>

                   <div className="space-y-4 relative z-10">
                      <div className="flex items-center justify-between text-[10px] font-black">
                         <div className="flex items-center gap-2">
                            <span className="text-slate-900">Completion: {project.progress || 0}%</span>
                            <div className="size-1 rounded-full bg-slate-200" />
                            <span className="text-violet-600">Sync: OK</span>
                         </div>
                         <span className="text-slate-300">Target: 100%</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                         <div 
                           className="h-full bg-violet-600 rounded-full shadow-lg shadow-violet-600/30 transition-all duration-1000 relative"
                           style={{ width: `${project.progress || 0}%` }}
                         >
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
                         </div>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <p className="text-[9px] font-bold text-slate-400">
                          Remaining work: <span className="text-slate-900 font-black">{100 - (project.progress || 0)}%</span>
                        </p>
                        <button className="text-[9px] font-black text-violet-600 hover:text-slate-900 transition-colors">
                          Access Node
                        </button>
                      </div>
                   </div>
                </div>
              )) : (
                 <div className="col-span-full py-20 text-center bg-white rounded-[48px] border border-dashed border-slate-200 flex flex-col items-center justify-center gap-4">
                    <div className="size-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200">
                      <Rocket className="size-8" />
                    </div>
                    <p className="text-xs font-black text-slate-300">No operational nodes initialized in this sector.</p>
                 </div>
              )}
            </div>
          </section>
        )}


      </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px] rounded-[32px] border-none p-10 bg-white font-display">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Create New Department</DialogTitle>
              <DialogDescription className="text-sm font-medium text-slate-500">
                Initialize a new organizational infrastructure department.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black text-slate-400 ml-1">Department Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Research & Development"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-violet-100 transition-all font-bold text-slate-900"
              />
            </div>
            <DialogFooter className="bg-transparent border-none p-0 flex items-center justify-center pt-2">
              <button 
                onClick={handleAddDept}
                disabled={adding}
                className="w-full h-14 bg-violet-600 text-white rounded-2xl text-[11px] font-black shadow-xl shadow-violet-900/20 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50"
              >
                {adding ? "Initializing..." : "Confirm Initialization"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px] rounded-[32px] border-none p-10 bg-white font-display text-center">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Delete Department</DialogTitle>
              <DialogDescription className="text-sm font-medium text-slate-500">
                Are you sure you want to delete <span className="text-slate-900 font-bold">"{deptToDelete?.name}"</span>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col gap-3 sm:flex-col mt-8 -mx-10 -mb-10 p-10 bg-slate-50/50 rounded-b-[32px] border-t border-slate-100">
              <button 
                onClick={handleConfirmDelete}
                disabled={isDecommissioning}
                className="w-full h-14 bg-red-600 text-white rounded-2xl text-xs font-black shadow-xl shadow-red-900/20 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50"
              >
                {isDecommissioning ? "Deleting..." : "Delete Department"}
              </button>
              <button 
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDecommissioning}
                className="w-full h-14 bg-white text-slate-500 hover:text-slate-900 border border-slate-100 rounded-2xl text-xs font-black transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </OrganizationAdminChrome>
  )
}
