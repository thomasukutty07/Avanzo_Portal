import { HRPortalChrome } from "@/components/portal/hr/HRPortalChrome"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { toast } from "sonner"
import { 
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
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns"

export default function HRLeaveRequests() {
  useDesignPortalLightTheme()
  const [requests, setRequests] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [whoIsOut, setWhoIsOut] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const calendarDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    await Promise.all([
      fetchRequests(),
      fetchStats(),
      fetchWhoIsOut()
    ])
    setLoading(false)
  }

  const fetchRequests = async () => {
    try {
      const data = await leavesService.getLeaveRequests()
      setRequests(Array.isArray(data) ? data : (data.results || []))
    } catch (error) {
      console.error("Fetch error:", error)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await leavesService.getStats()
      setStats(data)
    } catch (error) {
      console.error("Stats error:", error)
    }
  }

  const fetchWhoIsOut = async () => {
    try {
      const data = await leavesService.getWhoIsOut()
      setWhoIsOut(data)
    } catch (error) {
      console.error("WhoIsOut error:", error)
    }
  }

  const handleAction = async (id: string, action: 'approve' | 'reject', name: string) => {
    try {
      if (action === 'approve') {
        await leavesService.hrApprove(id, { comment: "System approved via HR Portal." })
        toast.success(`Leave request for ${name} has been fully approved.`)
      } else {
        await leavesService.rejectRequest(id, { comment: "Declined by HR Management." })
        toast.info(`Leave request for ${name} has been declined.`)
      }
      fetchData()
    } catch (error) {
      console.error("Action error:", error)
      toast.error(`Operation failed: Tier 2 authentication required or network error.`)
    }
  }

  const SUMMARY_CARDS = [
    { label: "Approved by TL", value: stats?.tl_approved?.toString().padStart(2, "0") || "00", sub: "Ready for HR", color: "blue", icon: Check },
    { label: "Pending TL", value: stats?.total_pending?.toString().padStart(2, "0") || "00", sub: "Waiting review", color: "amber", icon: Clock },
    { label: "Out Today", value: stats?.out_today?.toString().padStart(2, "0") || "00", sub: "Currently absent", color: "red", icon: UserIcon },
  ]

  return (
    <HRPortalChrome>
      <div className="p-8 space-y-8 font-display">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="font-headline">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Leave Management</h1>
            <p className="text-sm font-medium text-slate-500 mt-2">Review employee requests and manage staff availability.</p>
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
          {SUMMARY_CARDS.map((stat, i) => (
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
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Pending Requests</h3>
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
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Employee ID: {req.id.split('-')[0]}</p>
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
                        onClick={() => handleAction(req.id, 'approve', req.employee_name)}
                        className={`px-10 py-3 rounded-xl text-[11px] font-black shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest ${
                           req.status === 'pending' 
                           ? 'bg-amber-100/50 hover:bg-amber-100 text-amber-700 shadow-none border border-amber-200' 
                           : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/20'
                        }`}
                      >
                        <Check className="h-4 w-4 stroke-[3px]" /> 
                        {req.status === 'pending' ? 'Force Approve' : 'Approve Request'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6 font-headline">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Calendar</h3>
            
            <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <span className="font-black text-[13px] uppercase tracking-[0.2em] text-slate-900">{format(currentMonth, 'MMMM yyyy')}</span>
                <div className="flex gap-1">
                  <button onClick={prevMonth} className="p-1.5 hover:bg-slate-50 rounded-lg border border-slate-100 text-slate-400 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                  <button onClick={nextMonth} className="p-1.5 hover:bg-slate-50 rounded-lg border border-slate-100 text-slate-400 transition-colors"><ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-y-2 text-center mb-6">
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <div key={i} className="text-[10px] font-bold text-slate-300 uppercase">{d}</div>
                ))}
                {calendarDays.map((day, i) => {
                  const isCurrentMonth = isSameMonth(day, currentMonth)
                  const isToday = isSameDay(day, new Date())
                  // Simple logic to show a red dot if someone is out on this day
                  // We'll leave the red dot out for now, to fully remove dummy dots
                  return (
                    <div key={i} className={`py-1.5 text-xs font-bold relative ${!isCurrentMonth ? 'text-slate-300' : isToday ? 'text-violet-700' : 'text-slate-600'}`}>
                      {format(day, 'd')}
                      {isToday && <div className="absolute inset-0 bg-violet-700/10 rounded-lg -z-10" />}
                    </div>
                  )
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Who's Out Today</p>
                {whoIsOut.length > 0 ? whoIsOut.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 cursor-pointer group" onClick={() => toast.info(`Viewing status: ${p.leave_type}`)}>
                    <div className="h-9 w-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-[11px] font-black text-violet-700 shadow-sm ring-2 ring-white group-hover:scale-105 transition-transform">
                      {p.employee_name?.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-slate-800 leading-tight truncate group-hover:text-violet-600 transition-colors uppercase tracking-tight">{p.employee_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold truncate uppercase">{p.leave_type} (Until {format(parseISO(p.end_date), 'MMM dd')})</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-[10px] font-bold text-slate-300 italic uppercase">All personnel reporting active.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 font-display">
              <h4 className="text-xs font-bold text-slate-900 tracking-widest">Leave Distribution</h4>
              {stats?.type_distribution?.length > 0 ? stats.type_distribution.map((item: any, i: number) => {
                const total = stats.type_distribution.reduce((acc: number, cur: any) => acc + cur.count, 0);
                const percent = Math.round((item.count / total) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between text-[11px] font-bold mb-1.5">
                      <span className="text-slate-500 uppercase tracking-tighter">{item.leave_type}</span>
                      <span className="text-slate-900">{percent}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-[10px] font-bold text-slate-300 italic uppercase">No distribution matrix data.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </HRPortalChrome>
  )
}
