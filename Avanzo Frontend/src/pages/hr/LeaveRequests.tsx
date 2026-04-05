import { HRPortalChrome } from "@/components/portal/hr/HRPortalChrome"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { toast } from "sonner"
import { 
  Plane, 
  Stethoscope, 
  User, 
  Check, 
  Calendar, 
  Clock, 
  Download,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

const SUMMARY = [
  { label: "Annual Leave", value: "12 Days", sub: "Available", color: "blue", icon: Plane },
  { label: "Sick Leave", value: "5 Days", sub: "Remaining", color: "red", icon: Stethoscope },
  { label: "Personal Leave", value: "3 Days", sub: "Allocated", color: "amber", icon: User },
]

const REQUESTS = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "Product Designer • Engineering",
    type: "Annual Leave",
    dates: "Oct 24 - Oct 28, 2023",
    days: "5 Days",
    message: "Going on a family hiking trip to the Rockies.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-PsJYK8Oa96i1Kpwv6TAlOhBwXtUzj3HjzJzI2sQMMJD9ZtZ7fs61XkUQuT72vMvEh3Oon1t09BOKpaMThA4AF9mLpk3_VtzoT-DrpYPamcKEB60nVDmJz-H6tpd6rUBC0JdZLr8iuubZNrLCkvsKLaxqD43kskstPGTCO0zMLebubXz0f5QI1VUg4ftT_6m-LhvAZsgwwEBh92dXWZRsINKexyZQdUVx2H9wrEOt2egoBr4E_pePvBOewqbinK-h5wzCc7BbWhY"
  },
  {
    id: 2,
    name: "Marcus Thorne",
    role: "Backend Dev • Engineering",
    type: "Sick Leave",
    dates: "Oct 12 - Oct 13, 2023",
    days: "2 Days",
    message: null,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjscnA0LqvLt1DU3QAx6YTMGanV8abm68EUemunFige4d21GrgOqJMGPkyjbh8ScdbCswylI3ki5MfRPZLd9seMZ8FfLeP2IrNY3tVEjAf8-LfbjY4kKns8d4PdbvdcZO7jXdGrPwIFieLCFV7PcJIVbuwjtbiAr8gvxoyV5kiuCV-bWlNmeVrU9iwCJtPQTjec6QMOqn9zkMtpf0XI2VqeckxOOjTlJsSeYX7oPJdIoeSMKcHEgyFjsREJUYgSihUF3CDLvS6JTs"
  }
]

export default function HRLeaveRequests() {
  useDesignPortalLightTheme()

  return (
    <HRPortalChrome>
      <div className="p-8 space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-headline text-[1.75rem] font-bold tracking-[-0.02em] text-[#191c1d]">Leave Management</h1>
            <p className="font-body text-[#494456] mt-1 text-sm font-medium">Review team requests and manage upcoming availability.</p>
          </div>
          <button 
            onClick={() => toast.success("Exporting leave records to CSV...")}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <Download className="h-4 w-4" />
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
              <div className="font-body text-slate-700">
                <p className="text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 leading-none mt-0.5">{stat.value}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">{stat.sub}</p>
              </div>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="font-headline text-lg font-bold text-slate-900 leading-none">Pending Requests</h3>
                <span className="bg-violet-100 text-violet-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase">4 New</span>
              </div>

              {REQUESTS.map((req) => (
                <div key={req.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all font-body">
                  <div className="p-6 flex items-start gap-4">
                    <div className="h-14 w-14 rounded-xl bg-slate-100 ring-2 ring-white shadow-sm shrink-0 overflow-hidden">
                      <img className="h-full w-full object-cover" src={req.img} alt={req.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg leading-tight">{req.name}</h4>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{req.role}</p>
                        </div>
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg shrink-0">
                          {req.type}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 px-3 py-1.5 bg-slate-50 rounded-lg">
                          <Calendar className="h-3.5 w-3.5 text-violet-600" />
                          {req.dates}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 px-3 py-1.5 bg-slate-50 rounded-lg">
                          <Clock className="h-3.5 w-3.5 text-violet-600" />
                          {req.days}
                        </div>
                      </div>
                      {req.message && (
                        <p className="mt-4 p-4 bg-slate-50 rounded-xl text-sm text-slate-600 font-medium relative border-l-4 border-violet-600">
                          "{req.message}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="bg-slate-50/50 px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-50">
                    <button 
                      onClick={() => toast.error(`Declined leave request for ${req.name}`)}
                      className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-red-600 transition-colors uppercase tracking-widest"
                    >
                      Decline
                    </button>
                    <button 
                      onClick={() => toast.success(`Approved leave request for ${req.name} successfully!`)}
                      className="bg-violet-700 hover:bg-violet-800 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-violet-900/10 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Check className="h-4 w-4" /> 
                      Approve
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <h3 className="font-headline text-lg font-bold text-slate-900 leading-none">Team Context</h3>
            
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm font-body">
              <div className="flex items-center justify-between mb-6">
                <span className="font-bold text-xs uppercase tracking-widest text-slate-900">October 2023</span>
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

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 font-body">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Leave Distribution</h4>
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
