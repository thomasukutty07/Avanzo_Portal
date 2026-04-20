import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import { 
  Plus,
  Filter,
  MoreVertical,
  Clock,
  Activity,
  ExternalLink,
  ShieldAlert
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CyberSecurityIncidentsPage() {
  const navigate = useNavigate()
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/api/tickets/")
        setIncidents(extractResults(res.data).filter((t: any) => t.ticket_type === "tech" || t.ticket_type === "compliance"))
        setLoading(false)
      } catch (e) {
        console.error(e)
        setLoading(false)
      }
    }
    load()
  }, [])

  const recentCount = incidents.filter(i => {
    const d = new Date(i.created_at)
    const now = new Date()
    return (now.getTime() - d.getTime()) < 86400000 // Last 24h
  }).length

  const STATS = [
    { label: "Active incidents", value: incidents.filter(i => i.status !== "resolved").length.toString().padStart(2, '0'), sub: "Requires response", icon: Clock, color: "text-red-500" },
    { label: "Unassigned unit", value: incidents.filter(i => !i.assigned_to).length.toString().padStart(2, '0'), sub: "Requires triage", icon: Filter, color: "text-amber-500" },
    { label: "Critical breach", value: incidents.filter(i => i.ticket_type === 'tech').length.toString().padStart(2, '0'), sub: "Active response", icon: ShieldAlert, color: "text-red-600" },
    { label: "Defense pulses", value: recentCount.toString().padStart(2, '0'), sub: "Streak protocol", icon: Activity, color: "text-violet-600" },
  ]

  if (loading) return <div className="p-10 text-slate-400 font-bold font-headline animate-pulse text-[10px] uppercase tracking-widest">SYNCING INCIDENT MATRIX...</div>

  return (
    <div className="space-y-8 pb-12 font-sans bg-[#fcfcfc] min-h-screen">
      {/* Page Header */}
      <div className="sticky top-[64px] z-30 -mx-6 md:-mx-10 px-6 md:px-10 py-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#fcfcfc]/80 backdrop-blur-md border-b border-slate-100 transition-all">
          <div>
              <p className="text-[14px] font-semibold text-violet-600 mb-1 leading-none">
                  Response
              </p>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">
                  Incident Matrix
              </h1>
              <p className="text-slate-500 mt-2 text-[15px] font-normal leading-normal opacity-60">Real-time overview of active cyber vulnerabilities.</p>
          </div>
          <div className="flex items-center gap-4">
              <Button variant="outline" className="h-11 rounded-xl border-slate-200 text-xs font-semibold text-slate-600 px-6 bg-white hover:bg-slate-50">
                  Global filters
              </Button>
              <Button 
                onClick={() => navigate("/security/incidents/create")}
                className="h-11 rounded-xl bg-violet-600 text-white text-xs font-black px-6 shadow-lg shadow-violet-600/20 hover:bg-violet-700"
              >
                <Plus className="mr-2 size-4.5" /> Log Incident
              </Button>
          </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((s, i) => (
          <div key={i} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="flex items-center justify-between mb-4">
                 <p className="text-[13px] font-semibold text-slate-400">{s.label}</p>
                 <div className={`size-8 rounded-xl ${s.color.replace('text-', 'bg-').replace('-600', '-50').replace('text-red-500', 'bg-red-50 text-red-600').replace('text-violet-600', 'bg-violet-50 text-violet-600').replace('text-amber-500', 'bg-amber-50 text-amber-600')} flex items-center justify-center border border-slate-100 shadow-sm`}>
                    <s.icon className="size-4" />
                 </div>
              </div>
              <p className={`text-5xl font-bold tracking-tight leading-none tabular-nums ${s.color.includes('violet') ? 'text-slate-900' : s.color}`}>{s.value}</p>
              <div className="mt-4 flex items-center justify-between">
                 <span className="text-[11px] font-black text-slate-400">{s.sub}</span>
                 <div className="size-1.5 bg-slate-50 rounded-full border border-slate-100 shadow-inner" />
              </div>
          </div>
        ))}
      </div>

      {/* Incident Management Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-12">
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/10">
          <h4 className="font-black text-slate-900 tracking-tight text-[16px] leading-none">Active operation registry</h4>
          <button className="text-[11px] font-semibold text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-2.5 bg-violet-50 px-5 py-2.5 rounded-xl border border-violet-100 shadow-sm">
            Archive Telemetry <ExternalLink className="size-3.5" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[11px] font-semibold text-slate-400 border-b border-slate-50 uppercase tracking-wider">
              <tr>
                <th className="px-8 py-5">Unit signature</th>
                <th className="px-8 py-5">Mission briefing</th>
                <th className="px-8 py-5">Severity matrix</th>
                <th className="px-8 py-5">Tactical status</th>
                <th className="px-8 py-5">Response lead</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {incidents.map((inc, i) => (
                <tr key={i} className="group hover:bg-slate-50 transition-all cursor-pointer">
                  <td className="px-8 py-6 font-semibold text-[13px] text-violet-700 tracking-tight leading-none">{inc.id?.slice(0, 8)}</td>
                  <td className="px-8 py-6">
                    <p className="text-[17px] font-bold text-slate-900 group-hover:text-violet-700 transition-colors leading-none tracking-tight">{inc.title}</p>
                    <p className="text-[11px] text-slate-300 font-black mt-2 leading-none opacity-60 italic">{inc.ticket_type_display}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2.5 py-1 rounded-[8px] text-[10px] font-black border shadow-sm ${inc.ticket_type === 'tech' ? 'text-red-600 bg-red-50 border-red-100' : 'text-orange-600 bg-orange-50 border-orange-100'}`}>
                      {inc.ticket_type_display} impact
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <span className={`size-2.5 rounded-full ${inc.status === 'open' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.2)]' : inc.status === 'in_review' ? 'bg-amber-500' : 'bg-emerald-500'} `} />
                      <span className="text-[13px] font-semibold text-slate-700">{inc.status_display}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="size-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:scale-110 transition-transform shadow-inner">
                        {inc.assigned_to_name?.split(' ').map((n: string) => n[0]).join('') || '??'}
                      </div>
                      <span className="text-[13px] font-semibold text-slate-700">{inc.assigned_to_name || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button className="p-3 text-slate-200 hover:text-slate-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 shadow-sm">
                      <MoreVertical className="size-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {incidents.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-10 py-24 text-center">
                        <ShieldAlert className="size-12 mx-auto mb-6 text-slate-100" />
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">REGISTRY SYNCED. NO ANOMALIES DETECTED.</p>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
