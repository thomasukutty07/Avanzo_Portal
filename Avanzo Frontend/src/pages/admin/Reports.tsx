import { TrendingUp, TrendingDown, Filter, Download, FileText, ArrowRight, CalendarDays, Lock, Plus, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import { api } from "@/lib/axios"
import { useEffect, useState } from "react"
import { toast } from "sonner"

function extractResults(data: any) {
  return data?.results || data || []
}

interface WorkingReportSnapshot {
  id: string;
  report_id: string;
  generated_at: string;
  data: any[];
}

export default function ReportsPage() {
  const navigate = useNavigate();
  const [snapshots, setSnapshots] = useState<WorkingReportSnapshot[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deptCount, setDeptCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const loadSnapshots = async () => {
    try {
      const res = await api.get("/api/reports/working/");
      setSnapshots(extractResults(res.data));
    } catch (e) {
      console.error("Failed to load snapshots", e);
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [dRes, pRes, tRes, sRes] = await Promise.all([
          api.get("/api/organization/departments/"),
          api.get("/api/projects/projects/"),
          api.get("/api/projects/tasks/"),
          api.get("/api/reports/working/"),
        ]);
        
        const depts = extractResults(dRes.data);
        setDeptCount(depts.length);
        setProjectCount(extractResults(pRes.data).length);
        setTaskCount(extractResults(tRes.data).length);
        setSnapshots(extractResults(sRes.data));
      } catch (e) {
        console.error(e);
        toast.error("Error loading report data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    const toastId = toast.loading("Capturing real-time activity snapshot...")
    
    try {
      const res = await api.post("/api/reports/working/");
      setSnapshots([res.data, ...snapshots]);
      toast.success("Snapshot generated and locked successfully", { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate snapshot", { id: toastId });
    } finally {
      setIsGenerating(false)
    }
  }

  const dynamicKpis = [
    { label: "Total Departments", value: deptCount.toString(), trend: "Organization", up: true },
    { label: "Active Projects", value: projectCount.toString(), trend: "In Progress", up: true },
    { label: "Pending Tasks", value: taskCount.toString(), trend: "Ongoing", up: taskCount < 50 },
  ];

  if (loading) {
    return (
      <OrganizationAdminChrome>
        <div className="flex h-screen w-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
             <div className="size-10 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
             <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Accessing Reporting Engine...</p>
          </div>
        </div>
      </OrganizationAdminChrome>
    )
  }

  return (
    <OrganizationAdminChrome>
      <div className="p-6 md:p-10 space-y-10 animate-in fade-in duration-500 min-h-screen font-display bg-[#fcfcfc] text-slate-900">
        <div className="sticky top-0 z-30 -mx-6 md:-mx-10 px-6 md:px-10 py-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#fcfcfc]/80 backdrop-blur-md border-b border-transparent transition-all">
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
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-3 bg-violet-600 border border-violet-500 rounded-2xl text-[11px] font-black shadow-lg shadow-violet-600/20 hover:bg-violet-700 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </span>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Generate Snapshot
                  </>
                )}
              </button>
              <button 
                onClick={() => toast.success("Downloading audit report...")}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[11px] font-black shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest text-slate-600"
              >
                <Download className="h-4 w-4" />
                Download Audit
              </button>
           </div>
        </div>

        <div className="space-y-10 pb-12">
          <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
             {dynamicKpis.map((kpi, i) => (
                <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all group text-center">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 leading-none">{kpi.label}</p>
                   <div className="flex flex-col items-center justify-center gap-4">
                      <h3 className="text-5xl font-black text-slate-900 leading-none tracking-tight font-headline">{kpi.value}</h3>
                      <span className={`text-[10px] font-black flex items-center gap-1.5 uppercase tracking-widest ${kpi.up ? 'text-emerald-500' : 'text-orange-500'}`}>
                         {kpi.trend} {kpi.up ? <TrendingUp className="h-3.5 w-3.5 stroke-[2.5px]" /> : <TrendingDown className="h-3.5 w-3.5 stroke-[2.5px]" />}
                      </span>
                   </div>
                </div>
             ))}
          </section>

          <div className="grid grid-cols-1 gap-10">
            
            {/* Working Report Snapshots Table */}
            <section className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col mt-8">
               <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight font-headline flex items-center gap-2">
                     <FileText className="h-5 w-5 text-slate-400" />
                     Historical Snapshots
                  </h3>
                  <div className="relative group hidden sm:block">
                     <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                     <input
                       className="w-full sm:w-64 bg-[#F1F5F9] border-transparent rounded-xl pl-11 pr-4 py-3 text-[12px] font-bold text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:bg-white focus:border-violet-200 transition-all placeholder:text-slate-400 tracking-tight"
                       placeholder="Search ID or Date..."
                       type="text"
                     />
                  </div>
               </div>
               
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50/30 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                     <tr>
                       <th className="px-10 py-6">Report ID</th>
                       <th className="px-10 py-6">Generated At</th>
                       <th className="px-10 py-6">Status</th>
                       <th className="px-10 py-6">Records</th>
                       <th className="px-10 py-6 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {snapshots.length > 0 ? snapshots.map((snapshot) => (
                       <tr 
                          key={snapshot.id} 
                          onClick={() => navigate(`/reports/working/${snapshot.id}`)}
                          className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                       >
                         <td className="px-10 py-7">
                            <div className="font-black text-slate-900 tracking-tight text-sm">
                               {snapshot.report_id}
                            </div>
                         </td>
                         <td className="px-10 py-7">
                            <div className="flex items-center gap-3">
                               <CalendarDays className="h-4 w-4 text-slate-300" />
                               <div>
                                  <p className="font-bold text-slate-700 text-sm tracking-tight">
                                    {new Date(snapshot.generated_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-0.5">
                                    {new Date(snapshot.generated_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                               </div>
                            </div>
                         </td>
                         <td className="px-10 py-7">
                            <span className="px-4 py-1.5 rounded-xl text-[9px] font-black tracking-widest bg-violet-50 text-violet-600 border border-violet-100 inline-flex items-center gap-2">
                               <Lock className="h-3 w-3" />
                               LOCKED
                            </span>
                         </td>
                         <td className="px-10 py-7">
                            <span className="text-sm font-bold text-slate-600">{snapshot.data?.length || 0} Employees</span>
                         </td>
                         <td className="px-10 py-7 text-right">
                            <button 
                               className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black text-slate-600 group-hover:text-violet-700 group-hover:border-violet-200 group-hover:bg-violet-50 transition-all shadow-sm tracking-widest uppercase"
                            >
                               View Details
                            </button>
                         </td>
                       </tr>
                     )) : (
                       <tr>
                         <td colSpan={5} className="px-10 py-24 text-center">
                            <div className="flex flex-col items-center justify-center">
                               <FileText className="h-12 w-12 text-slate-200 mb-4" />
                               <p className="text-slate-400 font-bold">No generated reports found.</p>
                            </div>
                         </td>
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
