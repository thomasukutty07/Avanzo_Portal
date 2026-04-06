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
        const res = await api.get("/api/tickets/tickets/")
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
    { label: "ACTIVE INCIDENTS", value: incidents.filter(i => i.status !== "resolved").length.toString().padStart(2, '0'), sub: "REQUIRES RESPONSE", icon: Clock, color: "text-red-500" },
    { label: "UNASSIGNED UNIT", value: incidents.filter(i => !i.assigned_to).length.toString().padStart(2, '0'), sub: "REQUIRES TRIAGE", icon: Filter, color: "text-amber-500" },
    { label: "CRITICAL BREACH", value: incidents.filter(i => i.ticket_type === 'tech').length.toString().padStart(2, '0'), sub: "ACTIVE RESPONSE", icon: ShieldAlert, color: "text-red-600" },
    { label: "DEFENSE PULSES", value: recentCount.toString().padStart(2, '0'), sub: "STREAK PROTOCOL", icon: Activity, color: "text-violet-600" },
  ]

  if (loading) return <div className="p-10 text-slate-400 font-bold font-headline animate-pulse text-[10px] uppercase tracking-widest">SYNCING INCIDENT MATRIX...</div>

  return (
    <div className="space-y-8 pb-12 font-sans bg-[#fcfcfc] min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
          <div>
              <p className="text-[10px] font-black tracking-[0.3em] text-violet-600 mb-2 leading-none uppercase">
                  TACTICAL RESPONSE
              </p>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">
                  INCIDENT MATRIX
              </h1>
              <p className="text-slate-500 mt-4 text-[10px] font-black uppercase tracking-widest leading-none opacity-60">REAL-TIME OVERVIEW AND LIFECYCLE MANAGEMENT OF ACTIVE CYBER THREATS.</p>
          </div>
          <div className="flex items-center gap-4">
              <Button variant="outline" className="h-12 rounded-xl border-slate-200 text-[10px] font-black text-slate-600 px-6 bg-white hover:bg-slate-50 uppercase tracking-widest">
                  GLOBAL FILTERS
              </Button>
              <Button 
                onClick={() => navigate("/security/incidents/create")}
                className="h-12 rounded-xl bg-violet-600 text-white text-[10px] font-black px-6 shadow-lg shadow-violet-600/20 hover:bg-violet-700 uppercase tracking-widest"
              >
                <Plus className="mr-2 size-4" /> LOG SECURITY INCIDENT
              </Button>
          </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((s, i) => (
          <div key={i} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 hover:shadow-xl hover:-translate-y-1 transition-all group">
             <div className="flex items-center justify-between mb-6">
                <p className="text-[9px] font-black tracking-[0.2em] text-slate-400 uppercase">{s.label}</p>
                <div className={`size-8 rounded-lg ${s.color.replace('text-', 'bg-').replace('-600', '-50').replace('text-red-500', 'bg-red-50 text-red-600').replace('text-violet-600', 'bg-violet-50 text-violet-600').replace('text-amber-500', 'bg-amber-50 text-amber-600')} flex items-center justify-center border border-slate-100 shadow-sm`}>
                   <s.icon className="size-4" />
                </div>
             </div>
             <p className={`text-4xl font-black tracking-tight leading-none tabular-nums ${s.color.includes('violet') ? 'text-slate-900' : s.color}`}>{s.value}</p>
             <div className="mt-6 flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">{s.sub}</span>
                <div className="size-1.5 bg-slate-50 rounded-full border border-slate-100 shadow-inner" />
             </div>
          </div>
        ))}
      </div>

      {/* Incident Management Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-12">
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/10">
          <h4 className="font-black text-slate-900 tracking-tight text-lg uppercase leading-none">ACTIVE OPERATION REGISTRY</h4>
          <button className="text-[10px] font-black tracking-[0.2em] text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-3 bg-violet-50 px-5 py-2.5 rounded-xl border border-violet-100 shadow-sm uppercase">
            ARCHIVE TELEMETRY <ExternalLink className="size-3.5" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[9px] font-black text-slate-400 tracking-[0.3em] border-b border-slate-100 uppercase">
              <tr>
                <th className="px-10 py-6">UNIT SIGNATURE</th>
                <th className="px-10 py-6">MISSION BRIEFING</th>
                <th className="px-10 py-6">SEVERITY MATRIX</th>
                <th className="px-10 py-6">TACTICAL STATUS</th>
                <th className="px-10 py-6">RESPONSE LEAD</th>
                <th className="px-10 py-6 text-right">BRIEFING</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {incidents.map((inc, i) => (
                <tr key={i} className="group hover:bg-slate-50 transition-all cursor-pointer">
                  <td className="px-10 py-8 font-black text-[13px] text-violet-700 tracking-tight uppercase leading-none">{inc.id?.slice(0, 8)}</td>
                  <td className="px-10 py-8">
                    <p className="text-[14px] font-black text-slate-900 group-hover:text-violet-700 transition-colors leading-none tracking-tight uppercase">{inc.title}</p>
                    <p className="text-[9px] text-slate-300 font-black mt-2.5 leading-none tracking-[0.2em] uppercase opacity-60 italic">{inc.ticket_type_display}</p>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-3 py-1 rounded-[10px] text-[9px] font-black tracking-widest border shadow-sm uppercase ${inc.ticket_type === 'tech' ? 'text-red-600 bg-red-50 border-red-100' : 'text-orange-600 bg-orange-50 border-orange-100'}`}>
                      {inc.ticket_type_display} IMPACT
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <span className={`size-2.5 rounded-full ${inc.status === 'open' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.2)]' : inc.status === 'in_review' ? 'bg-amber-500' : 'bg-emerald-500'} `} />
                      <span className="text-[12px] font-black text-slate-700 tracking-widest uppercase">{inc.status_display}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:scale-110 transition-transform shadow-inner">
                        {inc.assigned_to_name?.split(' ').map((n: string) => n[0]).join('') || '??'}
                      </div>
                      <span className="text-[11px] font-black tracking-widest text-slate-700 uppercase">{inc.assigned_to_name || 'UNASSIGNED'}</span>
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
