import { CalendarDays, Download, FileText, Lock, Plus, Search, ShieldCheck } from "lucide-react"
import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { toast } from "sonner"

interface WorkingReportSnapshot {
  id: string;
  generated_at: string;
  generated_by: string;
  status: "Locked";
}

const MOCK_SNAPSHOTS: WorkingReportSnapshot[] = [
  { id: "WR-2024-004", generated_at: "2024-04-18T16:00:00Z", generated_by: "Admin User", status: "Locked" },
  { id: "WR-2024-003", generated_at: "2024-04-11T16:00:00Z", generated_by: "Admin User", status: "Locked" },
  { id: "WR-2024-002", generated_at: "2024-04-04T16:00:00Z", generated_by: "System Scheduled", status: "Locked" },
  { id: "WR-2024-001", generated_at: "2024-03-28T16:00:00Z", generated_by: "Admin User", status: "Locked" },
]

export default function EmployeeWorkingReportList() {
  const navigate = useNavigate()
  const [snapshots, setSnapshots] = useState<WorkingReportSnapshot[]>(MOCK_SNAPSHOTS)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    toast.loading("Capturing real-time activity snapshot...", { id: "generate_report" })
    
    // Simulate API delay
    setTimeout(() => {
      const now = new Date()
      const newId = `WR-${now.getFullYear()}-00${snapshots.length + 1}`
      const newSnapshot: WorkingReportSnapshot = {
        id: newId,
        generated_at: new Date().toISOString(),
        generated_by: "Admin User",
        status: "Locked"
      }
      
      setSnapshots([newSnapshot, ...snapshots])
      setIsGenerating(false)
      toast.success("Snapshot generated and locked successfully", { id: "generate_report" })
    }, 2000)
  }

  return (
    <OrganizationAdminChrome>
      <div className="p-6 md:p-10 space-y-10 animate-in fade-in duration-500 min-h-screen font-display bg-[#fcfcfc] text-slate-900">
        
        {/* Header */}
        <div className="sticky top-0 z-30 -mx-6 md:-mx-10 px-6 md:px-10 py-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#fcfcfc]/80 backdrop-blur-md border-b border-transparent transition-all">
           <div>
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="h-6 w-6 text-violet-600" />
                <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight font-headline">
                  Employee Working Reports
                </h1>
              </div>
              <p className="text-slate-500 text-sm font-medium">
                Immutable snapshots of organizational activity and productivity.
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
                    Generating Snapshot...
                  </span>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Generate Report
                  </>
                )}
              </button>
           </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col mt-8">
           <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
              <h3 className="text-xl font-black text-slate-900 tracking-tight font-headline flex items-center gap-2">
                 <FileText className="h-5 w-5 text-slate-400" />
                 Historical Snapshots
              </h3>
              <div className="relative group">
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
                   <th className="px-10 py-6">Generated By</th>
                   <th className="px-10 py-6">Record Status</th>
                   <th className="px-10 py-6 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {snapshots.length > 0 ? snapshots.map((snapshot) => (
                   <tr key={snapshot.id} className="group hover:bg-slate-50/50 transition-all cursor-default">
                     <td className="px-10 py-7">
                        <div className="font-black text-slate-900 tracking-tight text-sm">
                           {snapshot.id}
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
                        <span className="text-sm font-bold text-slate-600">{snapshot.generated_by}</span>
                     </td>
                     <td className="px-10 py-7">
                        <span className="px-4 py-1.5 rounded-xl text-[9px] font-black tracking-widest bg-violet-50 text-violet-600 border border-violet-100 inline-flex items-center gap-2">
                           <Lock className="h-3 w-3" />
                           {snapshot.status}
                        </span>
                     </td>
                     <td className="px-10 py-7 text-right">
                        <button 
                           onClick={() => navigate(`/reports/working/${snapshot.id}`)}
                           className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black text-slate-600 hover:text-violet-700 hover:border-violet-200 hover:bg-violet-50 transition-all shadow-sm tracking-widest uppercase"
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
        </div>

      </div>
    </OrganizationAdminChrome>
  )
}
