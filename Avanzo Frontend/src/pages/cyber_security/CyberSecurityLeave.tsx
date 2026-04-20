import { useState, useEffect } from "react"
import { leavesService } from "@/services/leaves"
import { toast } from "sonner"
import { format, parseISO } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  Umbrella,
  Stethoscope,
  User,
} from "lucide-react"

// Live data will be fetched via useEffect

export default function CyberSecurityLeavePage() {
  const [requests, setRequests] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: ""
  })

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const data = await leavesService.getLeaveRequests()
      setRequests(Array.isArray(data) ? data : (data.results || []))
    } catch (e) {
      console.error(e)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.leave_type || !formData.start_date || !formData.end_date) {
      toast.error("Please fill all required operational fields.")
      return
    }
    setSubmitting(true)
    try {
      await leavesService.createLeaveRequest(formData)
      toast.success("Absence protocol initiated. Awaiting command approval.")
      setFormData({ leave_type: "", start_date: "", end_date: "", reason: "" })
      fetchRequests()
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Strategic failure: Connection error.")
    } finally {
      setSubmitting(false)
    }
  }

  const myStats = [
    { label: "Annual leave", used: requests.filter(r => r.leave_type === 'annual' && r.status === 'approved').length, total: 20, color: "bg-violet-600", icon: Umbrella, iconBg: "bg-violet-50 text-violet-600" },
    { label: "Sick leave", used: requests.filter(r => r.leave_type === 'sick' && r.status === 'approved').length, total: 10, color: "bg-red-500", icon: Stethoscope, iconBg: "bg-red-50 text-red-500" },
    { label: "Personal leave", used: requests.filter(r => r.leave_type === 'personal' && r.status === 'approved').length, total: 5, color: "bg-blue-500", icon: User, iconBg: "bg-blue-50 text-blue-500" }
  ]
  return (
    <div className="space-y-8 pt-4 pb-12 font-headline bg-[#fcfcfc] min-h-screen">
      <div className="sticky top-[64px] z-30 -mx-6 md:-mx-10 px-6 md:px-10 py-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fcfcfc]/80 backdrop-blur-md border-b border-slate-100 transition-all">
        <div>
          <p className="text-[14px] font-black text-violet-600 leading-none mb-1">
            Personnel • Absence protocol
          </p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Leave registry</h1>
          <p className="text-slate-500 mt-2 text-[15px] font-medium leading-normal italic">Manage personnel absence and track operational leave balance.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {myStats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm shadow-slate-100 rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-5">
                <span className="text-[14px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                <div className={`size-10 rounded-xl ${stat.iconBg} flex items-center justify-center shadow-sm`}>
                  <stat.icon className="size-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-black text-slate-900 leading-none">{stat.used.toString().padStart(2, '0')}</span>
                <span className="text-slate-300 font-black text-[15px]">/ {stat.total} days</span>
              </div>
              <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${stat.color} transition-all duration-1000`} 
                  style={{ width: `${(stat.used / stat.total) * 100}%` }} 
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Apply Form */}
        <div className="lg:col-span-4">
          <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-4.5 text-violet-600">
                  <Plus className="size-full" />
                </div>
                <h4 className="font-black text-[14px] text-slate-900 uppercase tracking-widest">Apply for leave</h4>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Leave type</label>
                  <select 
                    value={formData.leave_type}
                    onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                    className="w-full h-12 bg-slate-50 border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-violet-600/10 appearance-none cursor-pointer"
                  >
                    <option value="">Select type...</option>
                    <option value="annual">Annual leave</option>
                    <option value="sick">Sick leave</option>
                    <option value="personal">Personal leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Start date</label>
                    <input 
                      type="date" 
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full h-12 bg-slate-50 border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">End date</label>
                    <input 
                      type="date" 
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full h-12 bg-slate-50 border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Reason</label>
                  <textarea 
                    placeholder="Describe the reason for your leave..."
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full h-32 bg-slate-50 border-slate-100 rounded-xl p-4 text-sm font-medium text-slate-600 outline-none focus:bg-white focus:ring-2 focus:ring-violet-600/10 resize-none"
                  />
                </div>

                 <Button 
                   disabled={submitting}
                   className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-violet-600/20 active:scale-95 transition-all mt-3"
                 >
                  {submitting ? "Processing..." : "Submit application"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Requests Table */}
        <div className="lg:col-span-8">
          <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white h-full">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white sm:sticky sm:top-0 z-10">
              <h4 className="font-black text-[14px] text-slate-900 uppercase tracking-widest italic">Recent requests</h4>
              <button className="text-[12px] font-black text-violet-600 hover:text-violet-800 transition-colors uppercase tracking-widest">View all</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-[11px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50">
                  <tr>
                    <th className="px-6 py-5">Type</th>
                    <th className="px-6 py-5">Duration</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5 text-right">Applied on</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {requests.map((req, i) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                      <td className="px-6 py-7">
                        <p className="text-[15px] font-black text-slate-900 group-hover:text-violet-700 transition-colors tracking-tight leading-none">{req.leave_type_display || req.leave_type}</p>
                        <p className="text-[12px] font-black text-slate-400 mt-2 leading-none italic">{req.reason ? `Auth-Note: ${req.reason}` : "General leave protocol"}</p>
                      </td>
                      <td className="px-6 py-7">
                        <p className="text-[15px] font-black text-slate-600 leading-none">
                          {format(parseISO(req.start_date), 'MMM dd')} - {format(parseISO(req.end_date), 'MMM dd')}
                        </p>
                        <p className="text-[12px] font-black text-slate-300 mt-2 leading-none italic tracking-tight">MISSION DURATION</p>
                      </td>
                      <td className="px-6 py-7">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[11px] font-black uppercase tracking-widest ${
                          req.status === 'approved' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                          req.status === 'rejected' ? 'text-red-600 bg-red-50 border-red-100' :
                          'text-amber-600 bg-amber-50 border-amber-100'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-7 text-right font-bold text-[14px] text-slate-400 tabular-nums">
                        {format(parseISO(req.created_at), 'MMM dd, yyyy')}
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-300 font-bold text-xs uppercase tracking-widest animate-pulse">NO RECORDED ABSENCES IN REGISTRY</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
