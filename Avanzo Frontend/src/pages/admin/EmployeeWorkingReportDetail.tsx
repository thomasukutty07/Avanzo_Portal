import { ArrowLeft, Clock, Download, HardDriveDownload, Search, TrendingUp, Users } from "lucide-react"
import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useState, useEffect } from "react"

interface ReportRecord {
  id: string;
  employee_name: string;
  department: string;
  current_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  total_working_hours: number;
  progress_status: "Completed" | "In Progress" | "Pending" | "Idle";
  time_analysis: string;
  remaining_workload: string;
}

// Mock snapshot grouped data
const MOCK_RECORDS: ReportRecord[] = [
  { id: "e1", employee_name: "Alice Smith", department: "Cyber Security", current_tasks: 2, completed_tasks: 5, pending_tasks: 1, total_working_hours: 38, progress_status: "In Progress", time_analysis: "40h Est / 38h Act", remaining_workload: "2 hrs" },
  { id: "e2", employee_name: "John Doe", department: "Cyber Security", current_tasks: 0, completed_tasks: 3, pending_tasks: 0, total_working_hours: 12, progress_status: "Idle", time_analysis: "15h Est / 12h Act", remaining_workload: "0 hrs" },
  { id: "e3", employee_name: "Michael Chen", department: "Development", current_tasks: 3, completed_tasks: 12, pending_tasks: 3, total_working_hours: 45, progress_status: "In Progress", time_analysis: "50h Est / 45h Act", remaining_workload: "15 hrs" },
  { id: "e4", employee_name: "Emma Wilson", department: "Development", current_tasks: 0, completed_tasks: 8, pending_tasks: 0, total_working_hours: 40, progress_status: "Completed", time_analysis: "40h Est / 40h Act", remaining_workload: "0 hrs" },
  { id: "e5", employee_name: "Sarah Jones", department: "Human Resources", current_tasks: 1, completed_tasks: 5, pending_tasks: 2, total_working_hours: 36, progress_status: "Pending", time_analysis: "45h Est / 36h Act", remaining_workload: "9 hrs" },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed": return "bg-emerald-50 text-emerald-600 border-emerald-100"
    case "In Progress": return "bg-blue-50 text-blue-600 border-blue-100"
    case "Pending": return "bg-orange-50 text-orange-600 border-orange-100"
    case "Idle": return "bg-slate-100 text-slate-500 border-slate-200"
    default: return "bg-slate-50 text-slate-600 border-slate-100"
  }
}

export default function EmployeeWorkingReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Group records by department
  const filteredRecords = MOCK_RECORDS.filter(r => r.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) || r.department.toLowerCase().includes(searchTerm.toLowerCase()))
  const departments = Array.from(new Set(filteredRecords.map(r => r.department)))

  const handleExportExcel = () => {
    toast.success(`Exporting ${id} to Excel format...`)
    // Mock API call to /api/reports/working/{id}/export/excel/
  }

  const handleExportPDF = () => {
    toast.success(`Generating PDF for ${id}...`)
  }

  return (
    <OrganizationAdminChrome>
      <div className="p-6 md:p-10 space-y-10 animate-in fade-in duration-500 min-h-screen font-display bg-[#fcfcfc] text-slate-900">
        
        {/* Header Section */}
        <div className="sticky top-0 z-30 -mx-6 md:-mx-10 px-6 md:px-10 py-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#fcfcfc]/80 backdrop-blur-md border-b border-transparent transition-all">
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => navigate("/reports/working")}
              className="flex w-fit items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-violet-600 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Back to Snapshot List
            </button>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight font-headline flex items-center gap-3 mt-2">
              Report Snapshot
              <span className="text-xl text-slate-300 font-bold tracking-normal italic select-all">#{id}</span>
              <span className="ml-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black tracking-widest uppercase border border-slate-200/50">
                Shift: 09:30 AM - 05:30 PM
              </span>
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             <div className="relative group mr-4 hidden sm:block">
               <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
               <input
                 className="w-full sm:w-64 bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-[13px] font-bold text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:border-violet-200 transition-all placeholder:text-slate-400 shadow-sm"
                 placeholder="Search records..."
                 type="text"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 border border-emerald-400 rounded-xl text-[11px] font-black shadow-sm shadow-emerald-500/20 hover:bg-emerald-600 transition-all uppercase tracking-widest text-white"
            >
              <HardDriveDownload className="h-4 w-4" />
              Export .XLSX
            </button>
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest text-slate-600"
            >
              <Download className="h-4 w-4" />
              PDF
            </button>
          </div>
        </div>

        {/* Global Overview Metrics */}
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
           {[
             { label: "Total Tracked Employees", value: filteredRecords.length, icon: Users, alertStatus: false, metric: "Headcount" },
             { label: "High Workload Detected", value: filteredRecords.filter(r => parseInt(r.remaining_workload) > 10).length, icon: TrendingUp, alertStatus: true, metric: "Requires Review" },
             { label: "Idle Employees", value: filteredRecords.filter(r => r.progress_status === "Idle").length, icon: Clock, alertStatus: true, metric: "No Active Tasks" },
           ].map((stat, i) => (
             <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                <div>
                   <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 mb-2">{stat.label}</p>
                   <div className="flex items-baseline gap-3">
                     <h3 className="text-4xl font-black text-slate-900 leading-none">{stat.value}</h3>
                     <span className={`text-[11px] font-bold uppercase tracking-wider ${stat.alertStatus && stat.value > 0 ? "text-orange-500" : "text-slate-500"}`}>
                       {stat.metric}
                     </span>
                   </div>
                </div>
                <div className={`p-4 rounded-2xl ${stat.alertStatus && stat.value > 0 ? "bg-orange-50 text-orange-500" : "bg-slate-50 text-slate-400"}`}>
                   <stat.icon className="h-6 w-6" />
                </div>
             </div>
           ))}
        </section>

        {/* Department-wise Reports */}
        <div className="space-y-12">
          {departments.map((deptName) => (
            <section key={deptName} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-violet-50/30">
                 <h3 className="text-xl font-black text-violet-950 tracking-tight font-headline flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-sm shadow-violet-600/20 text-sm">
                       {deptName[0]}
                    </div>
                    {deptName} Department
                 </h3>
                 <span className="text-[11px] font-black uppercase tracking-widest text-violet-600 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-violet-100">
                    {filteredRecords.filter(r => r.department === deptName).length} Members
                 </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5">Employee</th>
                      <th className="px-8 py-5 text-center">Tasks (C / P / D)</th>
                      <th className="px-8 py-5 text-center">Working Hours</th>
                      <th className="px-8 py-5">Time Analysis</th>
                      <th className="px-8 py-5 text-right">Remaining Workload</th>
                      <th className="px-8 py-5 text-right">Progress Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredRecords.filter(r => r.department === deptName).map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                           <div className="font-bold text-slate-900 tracking-tight text-sm">
                              {record.employee_name}
                           </div>
                           <div className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                              ID: {record.id.toUpperCase()}
                           </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                           <div className="inline-flex gap-2">
                             <span className="text-slate-700 font-bold" title="Current Tasks">{record.current_tasks}</span>
                             <span className="text-slate-400">/</span>
                             <span className="text-slate-700 font-bold" title="Completed Tasks">{record.completed_tasks}</span>
                             <span className="text-slate-400">/</span>
                             <span className="text-slate-700 font-bold" title="Pending Tasks">{record.pending_tasks}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                           <span className="text-base font-black text-slate-800">{record.total_working_hours}</span>
                           <span className="text-[11px] uppercase font-bold text-slate-500 ml-1">hrs</span>
                        </td>
                        <td className="px-8 py-6">
                           <span className="text-sm font-semibold text-slate-600">{record.time_analysis}</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <span className={`text-sm font-black ${parseInt(record.remaining_workload) > 10 ? 'text-orange-500' : 'text-slate-700'}`}>
                             {record.remaining_workload}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <span className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest uppercase border ${getStatusColor(record.progress_status)}`}>
                              {record.progress_status}
                           </span>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
          {departments.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100">
               <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">No records found.</p>
            </div>
          )}
        </div>
      </div>
    </OrganizationAdminChrome>
  )
}
