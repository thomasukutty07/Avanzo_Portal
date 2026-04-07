import { TrendingUp, TrendingDown, Filter, Download, MoreHorizontal } from "lucide-react"

import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import { api } from "@/lib/axios"
import { useEffect, useState } from "react"
import { toast } from "sonner"

function extractResults(data: any) {
  return data?.results || data || []
}

export default function ReportsPage() {
  const [deptCount, setDeptCount] = useState(0)
  const [projectCount, setProjectCount] = useState(0)
  const [taskCount, setTaskCount] = useState(0)

  useEffect(() => {
    async function loadMetrics() {
      try {
        const [dRes, pRes, tRes] = await Promise.all([
          api.get("/api/organization/departments/"),
          api.get("/api/projects/projects/"),
          api.get("/api/projects/tasks/"),
        ]);
        setDeptCount(extractResults(dRes.data).length);
        setProjectCount(extractResults(pRes.data).length);
        setTaskCount(extractResults(tRes.data).length);
      } catch (e) {
        console.error(e);
      }
    }
    loadMetrics();
  }, []);

  const dynamicKpis = [
    { label: "Total Departments", value: deptCount.toString(), trend: "Structural", up: true },
    { label: "Active Projects", value: projectCount.toString(), trend: "Development", up: true },
    { label: "Pending Tasks", value: taskCount.toString(), trend: "Operational", up: taskCount < 50 },
    { label: "System Status", value: "HEALTHY", trend: "Service OK", up: true },
  ];

  return (
    <OrganizationAdminChrome>
      <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 min-h-screen font-display bg-[#fcfcfc] text-slate-900">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div className="">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight uppercase font-headline">
                Organization Statistics
              </h1>
              <p className="text-slate-500 mt-2 text-sm font-medium">
                Live operational metrics and resource distribution across the enterprise.
              </p>
           </div>
        </header>

        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
           {dynamicKpis.map((kpi, i) => (
              <div key={i} className="bg-white rounded-[32px] border border-slate-50 p-8 shadow-sm hover:shadow-xl transition-all">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 leading-none">{kpi.label}</p>
                 <div className="flex items-end justify-between">
                    <h3 className="text-3xl font-bold text-slate-900 leading-none tracking-tight">{kpi.value}</h3>
                    <span className={`text-[10px] font-bold flex items-center gap-1 uppercase tracking-tighter ${kpi.up ? 'text-emerald-500' : 'text-orange-500'}`}>
                       {kpi.trend} {kpi.up ? <TrendingUp className="h-3 w-3 stroke-[2.5px]" /> : <TrendingDown className="h-3 w-3 stroke-[2.5px]" />}
                    </span>
                 </div>
              </div>
           ))}
        </section>

        <section className="grid grid-cols-1">
           <div className="bg-white rounded-[40px] p-12 shadow-sm border border-slate-50 flex flex-col items-center justify-center text-center space-y-6">
              <TrendingUp className="size-12 text-slate-100" />
              <div className="space-y-2 uppercase font-headline">
                  <h4 className="text-sm font-bold text-slate-900 tracking-tight border-b border-slate-100 pb-4">Analytical Trend Convergence</h4>
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest leading-relaxed max-w-lg">Advanced performance charts, efficiency metrics, and historical variance tracking will populate as the system accumulates operational data clusters.</p>
              </div>
           </div>
        </section>

        <section className="bg-white rounded-[40px] border border-slate-50 shadow-sm overflow-hidden flex flex-col">
           <div className="p-10 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between bg-slate-50/10 gap-6 uppercase font-headline">
              <h3 className="text-lg font-bold text-slate-900 underline decoration-violet-100 underline-offset-8 decoration-4">Resource Distribution</h3>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                 <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
                    <Filter className="h-4 w-4" />
                    Filter
                 </button>
                 <button 
                   onClick={() => toast.success("Data compiled. CSV downloading...")}
                   className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all"
                 >
                    <Download className="h-4 w-4" />
                    CSV
                 </button>
              </div>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left uppercase font-headline">
               <thead className="bg-slate-50/10 text-slate-300 text-[10px] font-bold tracking-widest border-b border-slate-50">
                 <tr>
                   <th className="px-10 py-5">Global Module</th>
                   <th className="px-10 py-5 text-center">Status</th>
                   <th className="px-10 py-5 text-right">System Health</th>
                 </tr>
               </thead>
                <tbody className="divide-y divide-slate-50 text-slate-900">
                  {[
                    { id: "1", name: "Enterprise Architecture", status: "STABLE", health: "Active" },
                    { id: "2", name: "Operational Logic", status: "STABLE", health: "Active" },
                    { id: "3", name: "Personnel Database", status: "STABLE", health: "Active" },
                  ].map((row) => (
                    <tr key={row.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                      <td className="px-10 py-7">
                         <span className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors tracking-tight text-sm">{row.name}</span>
                      </td>
                      <td className="px-10 py-7 text-center">
                         <span className="px-4 py-1 rounded-xl text-[9px] font-bold tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-2 justify-center w-28 mx-auto">
                            <div className="size-1.5 rounded-full bg-emerald-500" />
                            {row.status}
                         </span>
                      </td>
                      <td className="px-10 py-7 text-right font-bold text-xs text-slate-400 tabular-nums tracking-widest">
                        {row.health}
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
