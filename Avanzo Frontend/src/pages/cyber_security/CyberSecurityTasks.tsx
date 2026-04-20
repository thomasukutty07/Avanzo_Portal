import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MoreVertical,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"

import { useState, useEffect } from "react"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"

// Tasks are derived from API dynamically

export default function CyberSecurityTasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/api/tickets/")
        const raw = extractResults(res.data)
        // Show all tech/compliance tasks that are NOT resolved
        setTasks(raw.filter((t: any) => (t.ticket_type === "tech" || t.ticket_type === "compliance") && t.status !== "resolved"))
        setLoading(false)
      } catch (e) {
        console.error(e)
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = [
    { label: "Active assignments", value: tasks.length.toString().padStart(2, '0'), sub: "Real-time queue", color: "text-violet-600", icon: Clock },
    { label: "In-progress ops", value: tasks.filter(t => t.status === 'in_review' || t.status === 'open').length.toString().padStart(2, '0'), sub: "TDR Active", color: "text-emerald-500", icon: CheckCircle2 },
    { label: "Pending triage", value: tasks.filter(t => !t.assigned_to).length.toString().padStart(2, '0'), sub: "New alerts", color: "text-amber-500", icon: AlertCircle },
  ]

  if (loading) return <div className="p-10 text-slate-400 font-bold font-headline animate-pulse text-[10px] uppercase tracking-widest">SYNCING MISSION REGISTRY...</div>
  return (
    <div className="space-y-6 pb-12 font-headline bg-[#fcfcfc] min-h-screen">
      {/* Page Header */}
      <div className="sticky top-[64px] z-30 -mx-6 md:-mx-10 px-6 md:px-10 py-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fcfcfc]/80 backdrop-blur-md border-b border-slate-100 transition-all">
          <div>
              <p className="text-[14px] font-black text-violet-600 mb-1 leading-none">
                  Tactical operations
              </p>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">
                  Task Registry
              </h1>
              <p className="text-slate-500 mt-2 text-[15px] font-normal leading-relaxed text-slate-400">Coordinate and track active security assignments.</p>
          </div>
          <div className="flex items-center gap-4">
              <Button variant="outline" className="h-11 rounded-xl border-slate-200 text-xs font-bold text-slate-600 px-6 bg-white hover:bg-slate-50">
                  Mission filters
              </Button>
          </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                 <p className="text-[14px] font-semibold text-slate-400">{s.label}</p>
                 <div className={`size-8 rounded-xl ${s.color.replace('text-', 'bg-').replace('-600', '-50').replace('text-red-500', 'bg-red-50 text-red-600').replace('text-violet-600', 'bg-violet-50 text-violet-600').replace('text-emerald-500', 'bg-emerald-50 text-emerald-600').replace('text-amber-500', 'bg-amber-50 text-amber-600')} flex items-center justify-center border border-slate-100 shadow-sm`}>
                    <s.icon className="size-4" />
                 </div>
              </div>
              <p className={`text-5xl font-bold tracking-tight leading-none ${s.color.includes('violet') ? 'text-slate-900' : s.color}`}>{s.value}</p>
              <div className="mt-4 flex items-center justify-between">
                 <span className="text-[12px] font-bold text-slate-400">{s.sub}</span>
                 <div className="size-1.5 bg-slate-50 rounded-full border border-slate-100 shadow-inner" />
              </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input 
                  placeholder="Search tactics..." 
                  className="w-full h-10 bg-slate-50 border-slate-100 rounded-xl pl-10 pr-4 text-xs font-bold text-slate-600 outline-none focus:bg-white focus:ring-4 focus:ring-violet-600/5 transition-all"
              />
          </div>
          <div className="flex items-center gap-3">
              <span className="text-[12px] font-semibold text-slate-300 mr-2">Sort by:</span>
              <button className="px-4 py-2 rounded-lg bg-violet-50 text-violet-600 text-[12px] font-semibold">Recent</button>
              <button className="px-4 py-2 rounded-lg hover:bg-slate-50 text-slate-400 text-[12px] font-semibold transition-colors">Priority</button>
          </div>
      </div>

      {/* Task Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-12">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <h4 className="font-black text-slate-900 tracking-tight text-[16px] leading-none">Active mission registry</h4>
          <span className="text-[11px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl italic">Operational feed</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[11px] font-semibold text-slate-400 border-b border-slate-50 uppercase tracking-wider">
              <tr>
                <th className="px-8 py-5">Intel-ID</th>
                <th className="px-8 py-5">Tactical assignment</th>
                <th className="px-8 py-5">Triage</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Assigned to</th>
                <th className="px-6 py-5 text-right">Matrix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.map((task, i) => (
                <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-8 py-6 font-semibold text-[13px] text-violet-700 tracking-tight leading-none">{task.id?.slice(0, 8)}</td>
                  <td className="px-8 py-6">
                    <p className="text-[17px] font-bold text-slate-900 group-hover:text-violet-700 transition-colors leading-none tracking-tight">{task.title}</p>
                    <p className="text-[11px] text-slate-400 font-black mt-2 leading-none italic">Created {new Date(task.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border shadow-sm ${task.ticket_type === 'tech' ? 'text-red-600 bg-red-50 border-red-100' : 'text-orange-600 bg-orange-50 border-orange-100'}`}>
                      {task.ticket_type_display}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className={`size-2.5 rounded-full ${task.status === 'open' ? 'bg-red-500 animate-pulse' : task.status === 'in_review' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <span className="text-[13px] font-semibold text-slate-700 tracking-tight">{task.status_display}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center text-[11px] font-black text-slate-400 border border-slate-100 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-md">
                        {task.assigned_to_name?.split(' ').map((n: string) => n[0]).join('') || '??'}
                      </div>
                      <span className="text-[14px] font-semibold tracking-tight text-slate-700">{task.assigned_to_name || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <button className="p-2.5 text-slate-200 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all">
                      <MoreVertical className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
