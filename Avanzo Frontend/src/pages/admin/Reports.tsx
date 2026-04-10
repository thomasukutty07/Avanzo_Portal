import { TrendingUp, TrendingDown, Filter, Download } from "lucide-react"

import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import { api } from "@/lib/axios"
import { useEffect, useState } from "react"
import { toast } from "sonner"

function extractResults(data: any) {
  return data?.results || data || []
}

export default function ReportsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [deptCount, setDeptCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  
  useEffect(() => {
    async function loadMetrics() {
      try {
        const [dRes, pRes, tRes] = await Promise.all([
          api.get("/api/organization/departments/"),
          api.get("/api/projects/projects/"),
          api.get("/api/projects/tasks/"),
        ]);
        const depts = extractResults(dRes.data);
        setDepartments(depts);
        setDeptCount(depts.length);
        setProjectCount(extractResults(pRes.data).length);
        setTaskCount(extractResults(tRes.data).length);
      } catch (e) {
        console.error(e);
      }
    }
    loadMetrics();
  }, []);

  const dynamicKpis = [
    { label: "Total Departments", value: deptCount.toString(), trend: "Organization", up: true },
    { label: "Active Projects", value: projectCount.toString(), trend: "In Progress", up: true },
    { label: "Pending Tasks", value: taskCount.toString(), trend: "Ongoing", up: taskCount < 50 },
    { label: "System Status", value: "Normal", trend: "Working", up: true },
  ];

  return (
    <OrganizationAdminChrome>
      <div className="p-0 space-y-10 animate-in fade-in duration-500 min-h-screen font-display bg-[#fcfcfc] text-slate-900">
        <div className="sticky top-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#fcfcfc]/80 backdrop-blur-md border-b border-transparent transition-all">
           <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight font-headline">
                Company Reports
              </h1>
              <p className="text-slate-500 mt-2 text-sm font-medium">
                Overview of departments, projects, and overall progress.
              </p>
           </div>
           <div className="flex items-center gap-3">
              <button 
                onClick={() => toast.success("Downloading audit report...")}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[11px] font-black shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest text-slate-600"
              >
                <Download className="h-4 w-4" />
                Download Audit
              </button>
           </div>
        </div>

        <div className="px-6 md:px-10 space-y-10 pb-12">
          <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
             {dynamicKpis.map((kpi, i) => (
                <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all group">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 leading-none">{kpi.label}</p>
                   <div className="flex items-end justify-between">
                      <h3 className="text-4xl font-black text-slate-900 leading-none tracking-tight font-headline">{kpi.value}</h3>
                      <span className={`text-[10px] font-black flex items-center gap-1.5 uppercase tracking-widest ${kpi.up ? 'text-emerald-500' : 'text-orange-500'}`}>
                         {kpi.trend} {kpi.up ? <TrendingUp className="h-3.5 w-3.5 stroke-[2.5px]" /> : <TrendingDown className="h-3.5 w-3.5 stroke-[2.5px]" />}
                      </span>
                   </div>
                </div>
             ))}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Workforce Allocation Visualization */}
            <section className="lg:col-span-1 bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 flex flex-col space-y-8">
                <header>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight font-headline">Team Distribution</h4>
                  <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">Team members by department</p>
                </header>
                <div className="space-y-8 py-4">
                  {departments.length > 0 ? departments.slice(0, 5).map((dept, i) => (
                     <div key={i} className="space-y-3 group cursor-pointer">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.15em]">
                           <span className="text-slate-500 group-hover:text-violet-600 transition-colors">{dept.name}</span>
                           <span className="text-slate-900 tabular-nums">Active</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                           <div 
                             className="h-full bg-violet-600 rounded-full shadow-[0_0_8px_rgba(124,58,237,0.3)] transition-all duration-1000"
                             style={{ width: `${80 - (i * 15)}%` }}
                           />
                        </div>
                     </div>
                  )) : (
                    <div className="py-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">No data available</div>
                  )}
                </div>
                <div className="pt-6 border-t border-slate-50">
                   <p className="text-[10px] font-bold text-slate-400 italic leading-relaxed">Most team members are currently assigned to priority departments.</p>
                </div>
            </section>

            {/* Department Performance Table */}
            <section className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
               <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/10">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight font-headline">Department Performance</h3>
                  <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-violet-600 transition-all shadow-sm">
                     <Filter className="size-4" />
                  </button>
               </div>
               
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50/30 text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                     <tr>
                       <th className="px-10 py-6">Department Name</th>
                       <th className="px-10 py-6 text-center">Status</th>
                       <th className="px-10 py-6 text-right">Efficiency</th>
                     </tr>
                   </thead>
                    <tbody className="divide-y divide-slate-50">
                      {departments.length > 0 ? departments.map((dept) => (
                        <tr key={dept.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                          <td className="px-10 py-7">
                             <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-black group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm">
                                    {dept.name[0]}
                                </div>
                                <div>
                                   <p className="font-black text-slate-900 group-hover:text-violet-700 transition-colors tracking-tight text-sm uppercase">{dept.name}</p>
                                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1 opacity-70">Main Unit</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-10 py-7 text-center">
                             <span className="px-4 py-1.5 rounded-xl text-[9px] font-black tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 inline-flex items-center gap-2">
                                <div className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                Working
                             </span>
                          </td>
                          <td className="px-10 py-7 text-right">
                            <p className="text-sm font-black text-slate-900 tracking-tight tabular-nums">98.2%</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Success Rate</p>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={3} className="px-10 py-24 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Loading department data...</td>
                        </tr>
                      )}
                    </tbody>
                 </table>
               </div>
            </section>
          </div>
        </div>
      </div>
    </OrganizationAdminChrome>
  )
}
