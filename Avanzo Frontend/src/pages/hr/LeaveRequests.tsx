import { HRPortalChrome } from "@/components/portal/hr/HRPortalChrome"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { toast } from "sonner"
import { 
  Stethoscope, 
  User as UserIcon, 
  Check, 
  Calendar, 
  Clock, 
  Download,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

import { leavesService } from "@/services/leaves"
import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"

const SUMMARY = [
  { label: "Annual Leave", value: "24 Days", sub: "Allocated", color: "blue", icon: Calendar },
  { label: "Sick Leave", value: "10 Days", sub: "Standard", color: "red", icon: Stethoscope },
  { label: "Personal Leave", value: "05 Days", sub: "Allocated", color: "amber", icon: UserIcon },
]

export default function HRLeaveRequests() {
  useDesignPortalLightTheme()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const data = await leavesService.getLeaveRequests()
      setRequests(Array.isArray(data) ? data : (data.results || []))
    } catch (error) {
      console.error("Fetch error:", error)
      toast.error("Failed to synchronize leave requests.")
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id: string, action: 'approve' | 'reject', name: string) => {
    try {
      if (action === 'approve') {
        await leavesService.hrApprove(id, { hr_comment: "System approved via HR Portal." })
        toast.success(`Leave request for ${name} has been fully approved.`)
      } else {
        await leavesService.rejectRequest(id, { hr_comment: "Declined by HR Management." })
        toast.info(`Leave request for ${name} has been declined.`)
      }
      fetchRequests()
    } catch (error) {
      console.error("Action error:", error)
      toast.error(`Operation failed: Tier 2 authentication required or network error.`)
    }
  }

  return (
    <HRPortalChrome>
      <div className="p-8 space-y-8 font-display">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="font-headline">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Leave Management</h1>
            <p className="text-sm font-medium text-slate-500 mt-2">Review personnel requests and synchronize service availability.</p>
          </div>
          <button 
            onClick={() => toast.success("Exporting leave records to CSV...")}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-95 uppercase tracking-widest font-headline"
          >
            <Download className="h-4 w-4 stroke-[2.5px]" />
            Export CSV
          </button>
        </header>

        {/* Summary Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUMMARY.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 group">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                stat.color === 'red' ? 'bg-red-50 text-red-600' :
                'bg-amber-50 text-amber-600'
              }`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="font-headline text-slate-700">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 leading-none mt-2 uppercase tracking-tight">{stat.value}</p>
                <p className="text-[10px] text-slate-300 font-black uppercase tracking-tighter mt-1">{stat.sub}</p>
              </div>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-6">
             <div className="flex items-center justify-between font-headline">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Pending Approval Queue</h3>
                {!loading && (
                   <span className="bg-violet-100 text-violet-700 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">
                      {requests.filter(r => r.status !== 'approved' && r.status !== 'rejected').length} Requests Active
                   </span>
                )}
              </div>

              {loading ? (
                 <div className="bg-white p-12 rounded-xl border border-dashed border-slate-200 flex items-center justify-center">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Leave Operations...</p>
                 </div>
              ) : requests.length === 0 ? (
                 <div className="bg-white p-12 rounded-xl border border-dashed border-slate-200 flex items-center justify-center">
                    <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">No active requests found.</p>
                 </div>
              ) : requests.map((req) => (
                <div key={req.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all font-display">
                  <div className="p-6 flex items-start gap-4">
                    <div className="h-14 w-14 rounded-xl bg-slate-100 ring-2 ring-white shadow-sm shrink-0 overflow-hidden flex items-center justify-center uppercase font-black text-slate-400">
                      {req.employee_name?.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div className="font-headline">
                          <h4 className="font-black text-slate-900 text-[15px] leading-tight tracking-tight">{req.employee_name}</h4>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Personnel ID: {req.id.split('-')[0]}</p>
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl shrink-0 font-headline border ${
                           req.status === 'tl_approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                           req.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                           'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          {req.status === 'tl_approved' ? 'Sync Level 1 Ready' : req.status === 'pending' ? 'Pending TL Review' : req.status}
                        </span>
                      </div>
                      <div className="mt-5 flex flex-wrap items-center gap-4 font-headline">
                        <div className="flex items-center gap-2 text-[11px] font-black text-slate-500 px-4 py-2 bg-slate-50 rounded-xl border border-slate-50 uppercase tracking-tight">
                          <Calendar className="h-3.5 w-3.5 text-violet-600 stroke-[2.5px]" />
                          {format(parseISO(req.start_date), 'MMM dd, yyyy')} — {format(parseISO(req.end_date), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-black text-slate-500 px-4 py-2 bg-slate-50 rounded-xl border border-slate-50 uppercase tracking-tight">
                          <Clock className="h-3.5 w-3.5 text-violet-600 stroke-[2.5px]" />
                          {req.leave_type_display || req.leave_type}
                        </div>
                      </div>
                      {req.reason && (
                        <p className="mt-4 p-4 bg-slate-50 rounded-xl text-sm text-slate-600 font-medium relative border-l-4 border-violet-600">
                          "{req.reason}"
                        </p>
                      )}
                    </div>
                  </div>
                  {(req.status === 'pending' || req.status === 'tl_approved') && (
                    <div className="bg-slate-50/30 px-6 py-5 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-50 font-headline">
                      <button 
                        onClick={() => handleAction(req.id, 'reject', req.employee_name)}
                        className="px-6 py-2.5 text-[11px] font-black text-slate-400 hover:text-red-600 transition-colors uppercase tracking-widest"
                      >
                        Decline Request
                      </button>
                      <button 
                        disabled={req.status === 'pending'}
                        onClick={() => handleAction(req.id, 'approve', req.employee_name)}
                        className={`px-10 py-3 rounded-xl text-[11px] font-black shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest ${
                           req.status === 'pending' 
                           ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                           : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/20'
                        }`}
                      >
                        <Check className="h-4 w-4 stroke-[3px]" /> 
                        {req.status === 'pending' ? 'Waiting for TL' : 'Process Approval'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6 font-headline">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Avanzo Calendar context</h3>
            
            <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <span className="font-black text-[13px] uppercase tracking-[0.2em] text-slate-900">OCTOBER 2023</span>
                <div className="flex gap-1">
                  <button onClick={() => toast.info("Last Month")} className="p-1.5 hover:bg-slate-50 rounded-lg border border-slate-100 text-slate-400 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                  <button onClick={() => toast.info("Next Month")} className="p-1.5 hover:bg-slate-50 rounded-lg border border-slate-100 text-slate-400 transition-colors"><ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-y-2 text-center mb-6">
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <div key={i} className="text-[10px] font-bold text-slate-300 uppercase">{d}</div>
                ))}
                {Array.from({length: 18}, (_, i) => (
                  <div key={i} className={`py-1.5 text-xs font-bold relative ${i + 1 === 9 ? 'text-violet-700' : 'text-slate-600'}`}>
                    {i + 1}
                    {i + 1 === 9 && <div className="absolute inset-0 bg-violet-700/10 rounded-lg -z-10" />}
                    {(i + 1 === 12 || i + 1 === 13) && <div className="absolute bottom-0 left-1/2 -distance-x-1/2 w-1 h-1 bg-red-500 rounded-full" />}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Who's Out Today</p>
                {[
                  { name: "Jordan Lee", status: "Back Wednesday", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAERV9ltSqxU9_VIHc2RXasWyRTIFzYzdDuARsNRx8U_ne7zZ_lpmQhZHfroqtVWPTe33w0Hl_3Aw3TqN2JxiQd0mi43pyRCosysC97tD4-LwD4xXsygkZOXHeb4RWE2OwN9rsfLEX1EBV7OG74VNmlYt8zV7UzEwTReOZTIGHXTL1HRdsogOdbAOYD5056yMvaQPdhB7n3Lw38hCOmeEy3vI8QUFuxg_ciwTG_OMu40LuaR4u8PTkjI5ueRKUltQws-2ZdikZfZmY" },
                  { name: "Elena Vasquez", status: "Sabbatical (Until Jan 5)", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjRK-zbPVXAm2j3Wzz356bzamXYy_JDTMjyyboYcO7QKO09kIUzEH1csNc4i7Jg0SqBircfGOJENKFTdWmDZUh7_jq2kUDTYEcFk-rAm04iy9B-vmfgFDs_i89YIBNSiWMiUmORzrl2Kn0NNj_wfubYOUHRm6cUeM9Dsuc2n8Owc-uHXtKGzmfXfrn9w_yfzDUABPkrMejD40-VfAXbb7EoYFpRjqH-Nc2GIvO_1nnSQYVaZBgIjXEMH9B7eToDYMZp-oo7qg0gJs" }
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-3 cursor-pointer group" onClick={() => toast.info(`Viewing profile for ${p.name}`)}>
                    <img className="h-9 w-9 rounded-xl object-cover shadow-sm ring-2 ring-white group-hover:scale-105 transition-transform" src={p.img} alt={p.name} />
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-slate-800 leading-tight truncate group-hover:text-violet-600 transition-colors">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold truncate">{p.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 font-display">
              <h4 className="text-xs font-bold text-slate-900 tracking-widest">Leave Distribution</h4>
              {[
                { label: "Annual", val: 64, color: "bg-blue-500" },
                { label: "Sick Leave", val: 22, color: "bg-red-500" },
                { label: "Unpaid", val: 14, color: "bg-amber-500" }
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[11px] font-bold mb-1.5">
                    <span className="text-slate-500 uppercase tracking-tighter">{item.label}</span>
                    <span className="text-slate-900">{item.val}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${item.color}`} style={{ width: `${item.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </HRPortalChrome>
  )
}
