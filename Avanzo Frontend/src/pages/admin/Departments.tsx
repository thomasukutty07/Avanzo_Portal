import { useState } from "react"
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

const DEPTS_DATA = [
  { 
    id: "DEPT-01", 
    name: "Technical", 
    badge: "ENGINEERING", 
    employees: 450, 
    projects: 18, 
    utilization: 92,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400",
    color: "bg-indigo-600" 
  },
  { 
    id: "DEPT-02", 
    name: "Cybersecurity", 
    badge: "SECURITY", 
    employees: 120, 
    projects: 12, 
    utilization: 78,
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400",
    color: "bg-blue-600" 
  },
  { 
    id: "DEPT-03", 
    name: "Human Resources", 
    badge: "CULTURE", 
    employees: 45, 
    projects: 4, 
    utilization: 65,
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400",
    color: "bg-rose-500" 
  },
  { 
    id: "DEPT-04", 
    name: "Research & Dev", 
    badge: "INNOVATION", 
    employees: 320, 
    projects: 14, 
    utilization: 88,
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400",
    color: "bg-emerald-500" 
  },
]

const UPDATES = [
  { id: "UP-1", dept: "Technical", head: "Dr. Sarah Chen", status: "OPTIMAL", time: "2 hours ago", color: "bg-violet-50 text-violet-600" },
  { id: "UP-2", dept: "Cybersecurity", head: "Marcus Thorne", status: "MAINTENANCE", time: "5 hours ago", color: "bg-amber-50 text-amber-600" },
]

export default function DepartmentsPage() {
  const [adding, setAdding] = useState(false)

  const handleAddDept = () => {
    setAdding(true)
    setTimeout(() => {
      setAdding(false)
      toast.info("Department configuration terminal active.")
    }, 800)
  }

  return (
    <OrganizationAdminChrome>
      <div className="p-8 lg:p-12 space-y-10 min-h-screen bg-[#fcfcfd] font-sans">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-[32px] font-black tracking-tight text-slate-900 leading-tight font-display">
              Departments
            </h1>
            <p className="text-slate-500 mt-1 font-medium italic">
               Manage and monitor your organizational infrastructure units.
            </p>
          </div>
          <button 
            onClick={handleAddDept}
            disabled={adding}
            className="flex items-center gap-3 px-10 py-4 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-violet-900/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add Department
          </button>
        </header>

        {/* Overview KPIs */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { label: "Total Departments", value: "12", trend: "+2%", icon: Building2, color: "text-violet-600 bg-violet-50" },
            { label: "Active Projects", value: "48", trend: "+5%", icon: Rocket, color: "text-orange-600 bg-orange-50" },
            { label: "Total Employees", value: "1,240", trend: "+1.5%", icon: Users, color: "text-emerald-600 bg-emerald-50" },
          ].map((kpi, i) => (
             <div key={i} className="group flex items-center justify-between p-8 bg-white border border-slate-50 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-violet-900/5 transition-all">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{kpi.label}</p>
                   <div className="flex items-center gap-3">
                      <h3 className="text-3xl font-black text-slate-900 font-display">{kpi.value}</h3>
                      <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1">
                         {kpi.trend} <TrendingUp className="h-3 w-3" />
                      </span>
                   </div>
                </div>
                <div className={`p-5 rounded-2xl ${kpi.color} shadow-inner group-hover:scale-110 transition-transform`}>
                   <kpi.icon className="h-6 w-6" />
                </div>
             </div>
          ))}
        </section>

        {/* Department Grid */}
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DEPTS_DATA.map((dept) => (
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
                     <h4 className="text-xl font-black text-slate-900 font-display">{dept.name}</h4>
                     <button className="text-slate-300 hover:text-slate-900 transition-colors"><MoreVertical className="h-5 w-5" /></button>
                  </div>
                  
                  <div className="flex items-center justify-between gap-4">
                     <div>
                        <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest mb-1">Employees</p>
                        <p className="text-lg font-black text-slate-900">{dept.employees}</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest mb-1">Projects</p>
                        <p className="text-lg font-black text-slate-900">{dept.projects}</p>
                     </div>
                  </div>
                  
                  <div className="space-y-3">
                     <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Utilization: {dept.utilization}%</span>
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
              <h3 className="text-xl font-black text-slate-900 font-display">Recent Department Updates</h3>
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
                   <th className="px-10 py-6">Department</th>
                   <th className="px-10 py-6">Head of Department</th>
                   <th className="px-10 py-6 text-center">Status</th>
                   <th className="px-10 py-6 text-right">Last Modified</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {UPDATES.map((up) => (
                   <tr key={up.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                     <td className="px-10 py-8">
                        <div className="flex items-center gap-5">
                           <div className={`size-10 rounded-2xl flex items-center justify-center font-black text-xs ${up.color} shadow-sm group-hover:scale-110 transition-transform`}>
                              <Building2 className="h-4 w-4" />
                           </div>
                           <span className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors uppercase tracking-tight">{up.dept}</span>
                        </div>
                     </td>
                     <td className="px-10 py-8">
                        <span className="text-sm font-bold text-slate-900">{up.head}</span>
                     </td>
                     <td className="px-10 py-8 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          up.status === 'OPTIMAL' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                           {up.status}
                        </span>
                     </td>
                     <td className="px-10 py-8 text-right">
                        <span className="text-xs font-medium text-slate-400 italic">{up.time}</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </section>
      </div>
    </OrganizationAdminChrome>
  )
}
