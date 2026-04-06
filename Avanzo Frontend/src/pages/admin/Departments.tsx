import { useState, useEffect } from "react"
import { toast } from "sonner"
import { 
  Plus, 
  Building2, 
  Rocket, 
  Users, 
  TrendingUp, 
  MoreVertical,
  ChevronRight
} from "lucide-react"
import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"



export default function DepartmentsPage() {
  const [adding, setAdding] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [newDeptName, setNewDeptName] = useState("")

  useEffect(() => {
    async function loadDepts() {
      try {
        const res = await api.get("/api/organization/departments/")
        const apiDepts = extractResults(res.data)
        const mappedDepts = apiDepts.map((d: any, idx: number) => {
           const images = [
             "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400",
             "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400",
             "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400",
             "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400"
           ];
           const colors = [
             "bg-indigo-600",
             "bg-blue-600",
             "bg-rose-500",
             "bg-emerald-500"
           ]
           return {
             id: d.id,
             name: d.name,
             badge: "UNIT " + (idx+1),
             employees: d.employee_count ?? 0,
             projects: d.project_count ?? 0,
             utilization: 0,
             image: images[idx % images.length],
             color: colors[idx % colors.length]
           }
        })
        setDepartments(mappedDepts)
      } catch (e) {
        console.error(e)
      }
    }
    loadDepts()
  }, [])

  const handleAddDept = async () => {
    if (!newDeptName.trim()) {
      toast.error("Please enter a department name.");
      return;
    }
    
    try {
      setAdding(true)
      await api.post("/api/organization/departments/", { name: newDeptName });
      toast.success(`Unit "${newDeptName}" initialized successfully.`);
      setNewDeptName("");
      setAdding(false);
      setIsDialogOpen(false);
      // Refresh list
      const updated = await api.get("/api/organization/departments/");
      const apiDepts = extractResults(updated.data);
      const mapped = apiDepts.map((d: any, idx: number) => ({
        id: d.id,
        name: d.name,
        badge: "UNIT " + (idx+1),
        employees: d.employee_count ?? 0,
        projects: d.project_count ?? 0,
        utilization: 0,
        image: [
          "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400",
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400",
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=400"
        ][idx % 3],
        color: ["bg-violet-500", "bg-rose-500", "bg-emerald-500"][idx % 3]
      }));
      setDepartments(mapped);
    } catch (e: any) {
      toast.error(e?.response?.data?.name?.[0] || "Failed to create department.");
      setAdding(false);
      setIsDialogOpen(false);
    }
  }

  return (
    <OrganizationAdminChrome>
      <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 min-h-screen font-display bg-[#fcfcfc] text-slate-900">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="">
            <h1 className="text-[32px] font-black tracking-tight text-slate-900 leading-tight">
              Departments
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">
               Manage and monitor your organizational infrastructure units.
            </p>
          </div>
          <button 
            onClick={() => setIsDialogOpen(true)}
            disabled={adding}
            className="flex items-center gap-3 px-10 py-4 bg-violet-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-violet-900/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
          >
            <Plus className="h-4 w-4 stroke-[3px]" />
            New Unit
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
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">{kpi.label}</p>
                   <div className="flex items-center gap-3">
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight">{kpi.value}</h3>
                      <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1 uppercase tracking-tighter">
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

        {/* Department Grid */}
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {departments.map((dept) => (
            <div key={dept.id} className="group bg-white rounded-[40px] border border-slate-50 shadow-sm overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-violet-900/10 transition-all hover:border-violet-100">
               <div className="relative h-48 overflow-hidden">
                  <img src={dept.image} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt={dept.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  <span className="absolute top-6 left-6 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/20">
                     {dept.badge}
                  </span>
               </div>
               
               <div className="p-8 flex-1 space-y-8">
                  <div className="flex items-center justify-between">
                     <h4 className="text-xl font-black text-slate-900 tracking-tight">{dept.name}</h4>
                     <button className="text-slate-300 hover:text-slate-900 transition-colors"><MoreVertical className="h-5 w-5 stroke-[2.5px]" /></button>
                  </div>
                  
                  <div className="flex items-center justify-between gap-4">
                     <div>
                        <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest mb-1">Staffing</p>
                        <p className="text-lg font-black text-slate-900 tracking-tight">{dept.employees}</p>
                     </div>
                     <div>
                        <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest mb-1">Operatives</p>
                        <p className="text-lg font-black text-slate-900 tracking-tight">{dept.projects}</p>
                     </div>
                  </div>
                  
                  <div className="space-y-3">
                     <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-300">UTILIZATION: {dept.utilization}%</span>
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

        {/* Recent Updates Table */}
        <section className="bg-white rounded-[40px] border border-slate-50 shadow-sm overflow-hidden flex flex-col">
           <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/10">
              <h3 className="text-xl font-black text-slate-900 font-display">Organizational Infrastructure Summary</h3>
              <button 
                className="text-[10px] font-black text-violet-700 uppercase tracking-widest hover:text-violet-900 transition-colors flex items-center gap-2"
                onClick={() => toast.info("Deep audit log coming soon.")}
              >
                View All <ChevronRight className="h-3 w-3" />
              </button>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-slate-50/20 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                 <tr>
                   <th className="px-10 py-6">Department Unit</th>
                   <th className="px-10 py-6">Operational Code</th>
                   <th className="px-10 py-6 text-center">Status</th>
                   <th className="px-10 py-6 text-right">Latency</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {departments.slice(0, 5).map((dept) => (
                   <tr key={dept.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                     <td className="px-10 py-8">
                        <div className="flex items-center gap-5">
                           <div className={`size-10 rounded-2xl flex items-center justify-center font-black text-xs bg-violet-50 text-violet-600 shadow-sm group-hover:scale-110 transition-transform`}>
                              <Building2 className="h-4 w-4" />
                           </div>
                           <span className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors uppercase tracking-tight">{dept.name}</span>
                        </div>
                     </td>
                     <td className="px-10 py-8">
                        <span className="text-sm font-bold text-slate-900">{dept.badge}</span>
                     </td>
                     <td className="px-10 py-8 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100`}>
                           ACTIVE
                        </span>
                     </td>
                     <td className="px-10 py-8 text-right">
                        <span className="text-xs font-medium text-slate-400">System Ready</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </section>
      </div>

        {/* New Unit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px] rounded-[32px] border-none p-10 bg-white font-display">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Create New Unit</DialogTitle>
              <DialogDescription className="text-sm font-medium text-slate-500">
                Initialize a new organizational infrastructure unit.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Unit Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Research & Development"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-violet-100 transition-all font-bold text-slate-900"
              />
            </div>
            <DialogFooter>
              <button 
                onClick={handleAddDept}
                disabled={adding}
                className="w-full h-14 bg-violet-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-violet-900/20 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50"
              >
                {adding ? "Initializing..." : "Confirm Initialization"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </OrganizationAdminChrome>
  )
}
