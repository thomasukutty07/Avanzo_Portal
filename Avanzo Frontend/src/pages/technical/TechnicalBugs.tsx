import { useNavigate } from "react-router-dom"
import { Bug, Filter, Plus, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const STATS = [
  { label: "OPEN BUGS", value: "24", sub: "12 require triage", color: "text-amber-500", barColor: "bg-amber-500", val: 45 },
  { label: "CRITICAL SEVERITY", value: "3", sub: "SLA < 4 hours", color: "text-red-500", barColor: "bg-red-500", val: 80, isUrgent: true },
  { label: "AVG RESOLUTION", value: "1.2", sub: "Days per bug", color: "text-emerald-500", barColor: "bg-violet-600", val: 65 },
]

export default function TechnicalBugsPage() {
  const navigate = useNavigate()
  const rows = [
    { id: "BUG-1042", title: "Intermittent 502 on /auth/refresh", sev: "P1", status: "Open", age: "2 hours", component: "Auth Service" },
    { id: "BUG-1038", title: "Mobile layout overflow on tasks board", sev: "P2", status: "In progress", age: "1 day", component: "Frontend UI" },
    { id: "BUG-1021", title: "Export CSV encoding on Windows", sev: "P3", status: "Resolved", age: "3 days", component: "Export Worker" },
    { id: "BUG-1019", title: "Missing default image for user profile", sev: "P3", status: "Open", age: "4 days", component: "Profile API" },
    { id: "BUG-1008", title: "Memory leak in log aggregation", sev: "P1", status: "In progress", age: "1 week", component: "Logger Node" },
  ]

  return (
    <div className="space-y-6 pb-12 font-display bg-[#fcfcfc] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 mb-1">
            TECHNICAL MANAGEMENT
          </p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-headline">
            Bug Tracking
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Triage and resolution status for reported defects.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
            onClick={() => navigate("/technical/reports")}
          >
            View All Reports
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-[13px] font-bold text-white hover:bg-violet-700 shadow-lg shadow-violet-600/20 transition-all"
            title="Wire to your bug tracker API"
          >
            <Plus className="size-4" />
            Report Bug
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {STATS.map((s, i) => (
          <Card key={i} className={`border-none shadow-sm rounded-2xl overflow-hidden bg-white ${s.isUrgent ? 'ring-2 ring-red-500 shadow-red-500/10' : 'shadow-slate-100'}`}>
            <CardContent className="p-7 relative">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 leading-none">{s.label}</p>
              <div className="flex items-center gap-3">
                <h3 className="text-3xl font-bold text-slate-900 font-headline">{s.value}</h3>
                <span className={`text-[10px] font-bold ${s.color} uppercase tracking-tight`}>{s.sub}</span>
              </div>
              <div className="mt-8 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                <div className={`h-full ${s.barColor} transition-all duration-1000`} style={{ width: `${s.val}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 bg-white transition-colors">
            <Filter className="size-3.5" />
            Filters
          </button>
          <div className="h-6 w-px bg-slate-200 hidden md:block" />
          <select className="h-9 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 border-transparent focus:ring-2 focus:ring-violet-600/20 outline-none">
            <option>Severity: All</option>
            <option>P1 Critical</option>
            <option>P2 High</option>
          </select>
          <select className="h-9 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 border-transparent focus:ring-2 focus:ring-violet-600/20 outline-none">
            <option>Status: Open</option>
            <option>Status: All</option>
          </select>
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Showing 5 results
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-100 bg-[#f8f9fa]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Bug Description</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Component</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Severity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Age</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1.5 shrink-0">
                        <Bug className="size-3.5 text-slate-400 group-hover:text-violet-600 transition-colors" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-[13px]">{r.title}</p>
                        <p className="text-[11px] font-semibold text-violet-600 mt-1 cursor-pointer hover:underline">{r.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded bg-slate-100 text-slate-600">
                      {r.component}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {r.status === "In progress" ? (
                        <>
                          <div className="size-2.5 rounded-full border-2 border-amber-500 overflow-hidden" />
                          <span className="text-[11px] font-bold text-amber-500">{r.status}</span>
                        </>
                      ) : r.status === "Open" ? (
                        <>
                          <div className="size-2.5 rounded-full bg-violet-500" />
                          <span className="text-[11px] font-bold text-violet-600">{r.status}</span>
                        </>
                      ) : (
                        <>
                          <div className="size-2.5 rounded-full bg-emerald-500" />
                          <span className="text-[11px] font-bold text-emerald-600">{r.status}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest ${r.sev === 'P1' ? 'border-red-500 text-red-600' : r.sev === 'P2' ? 'border-amber-500 text-amber-600' : 'border-slate-300 text-slate-500'}`}>
                      {r.sev}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[11px] font-bold text-slate-500">
                    {r.age}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-300 hover:text-slate-600 p-1.5 rounded transition-colors">
                      <MoreVertical className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-white">
          <span className="text-[11px] font-bold text-slate-500">
            Page 1 of 1
          </span>
          <div className="flex items-center gap-1">
            <button className="p-1 text-slate-400 hover:text-slate-700">
              <ChevronLeft className="size-4" />
            </button>
            <button className="size-6 rounded text-[11px] font-bold flex items-center justify-center bg-violet-700 text-white">1</button>
            <button className="p-1 text-slate-400 hover:text-slate-700">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
