import { 
  BarChart, 
  Bar, 
  XAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid
} from 'recharts'
import { 
  FileDown,
  Calendar,
  Download,
  FileText
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const STATS = [
  { label: "System uptime", value: "99.98%", sub: "+0.02%", color: "text-emerald-500", barColor: "bg-emerald-500", val: 99 },
  { label: "Avg. response time", value: "42m", sub: "12.5%", color: "text-emerald-500", barColor: "bg-violet-600", val: 45, isDown: true },
  { label: "Threats blocked", value: "14.2k", sub: "vs last month", color: "text-slate-400", barColor: "bg-blue-500", val: 60 },
  { label: "Compliance score", value: "92/100", sub: "Excellent", color: "text-violet-600", barColor: "bg-violet-700", val: 92, thick: true },
]

const CHART_DATA = [
  { name: 'W1', resolved: 400, new: 240 },
  { name: 'W2', resolved: 300, new: 139 },
  { name: 'W3', resolved: 200, new: 980 },
  { name: 'W4', resolved: 278, new: 390 },
  { name: 'W5', resolved: 189, new: 480 },
  { name: 'W6', resolved: 239, new: 380 },
]

const HISTORY = [
  { 
    name: "Monthly_CyberSecurity_Audit_Jan_2024.pdf", 
    by: "John Doe", 
    initial: "JD", 
    time: "Feb 01, 2024 09:15 AM", 
    status: "Completed",
    type: "pdf"
  },
  { 
    name: "Quarterly_Vulnerability_Scan_Q4.csv", 
    by: "M. Lopez", 
    initial: "ML", 
    time: "Jan 15, 2024 04:30 PM", 
    status: "Completed",
    type: "csv"
  },
]

export default function CyberSecurityReportsPage() {
  return (
    <div className="space-y-6 pt-4 min-h-screen pb-12 font-headline bg-[#fcfcfc]">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Performance reports</h1>
          <p className="text-slate-500 mt-2 text-xs font-medium">Detailed analysis of threat trends and infrastructure health.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="h-10 bg-white border-slate-100 rounded-xl px-4 text-[10px] font-black text-slate-600">
             <Calendar className="size-3.5 mr-2" />
             Jan 01 - Jan 31, 2024
           </Button>
           <Button className="bg-violet-600 hover:bg-violet-700 text-white font-bold h-10 px-5 rounded-xl shadow-lg shadow-violet-600/20 active:scale-95 transition-all text-[10px] tracking-widest">
             <FileDown className="size-3.5 mr-2" />
             Export report
           </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((s, i) => (
          <Card key={i} className="border-none shadow-sm shadow-slate-100 rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-5 relative">
              <p className="text-[9px] font-black text-slate-400 tracking-widest mb-5 leading-none">{s.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{s.value}</h3>
                <span className={`text-[9px] font-black ${s.color} tracking-tighter flex items-center`}>
                  {s.isDown && <span className="mr-0.5">↓</span>}
                  {s.sub}
                </span>
              </div>
              
              <div className={`mt-6 ${s.thick ? 'h-1.5' : 'h-1'} w-full bg-slate-50 rounded-full overflow-hidden`}>
                <div className={`h-full ${s.barColor} transition-all duration-1000`} style={{ width: `${s.val}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Threats Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-[420px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="font-black text-md text-slate-900 tracking-tight italic">Threats resolved vs incoming</h4>
              <p className="text-[9px] font-black text-slate-400 tracking-widest mt-1">Monitoring remediation efficiency.</p>
            </div>
            <div className="flex items-center gap-5 text-[8px] font-black tracking-widest leading-none">
               <div className="flex items-center gap-1.5 text-violet-600">
                 <div className="size-2 rounded-full bg-violet-600" />
                 Resolved
               </div>
               <div className="flex items-center gap-1.5 text-red-400">
                 <div className="size-2 rounded-full bg-red-400 opacity-70" />
                 New threats
               </div>
            </div>
          </div>

          <div className="flex-1 w-full mt-4">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CHART_DATA} barGap={6}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 700, fill: '#cbd5e1' }} dy={10} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px' }}
                  />
                  <Bar dataKey="resolved" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={10} />
                  <Bar dataKey="new" fill="#f87171" opacity={0.7} radius={[4, 4, 0, 0]} barSize={10} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Uptime */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-[420px]">
          <h4 className="font-black text-md text-slate-900 tracking-tight mb-7 italic">Regional node status</h4>
          
          <div className="flex-1 space-y-5 overflow-y-auto no-scrollbar">
            {[
              { id: "North America (NA-1)", sub: "Silicon Valley DC", val: "99.99%", tone: "text-emerald-500", status: "Active" },
              { id: "Europe (EU-WEST)", sub: "Frankfurt DC", val: "99.97%", tone: "text-emerald-500", status: "Active" },
              { id: "Asia Pacific (AP-1)", sub: "Tokyo DC", val: "97.40%", tone: "text-amber-500", status: "Degraded" },
              { id: "Latin America (LATAM)", sub: "Sao Paulo DC", val: "100.0%", tone: "text-emerald-500", status: "Active" },
            ].map((node, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="flex justify-between items-start mb-1.5">
                  <div>
                    <h5 className="text-[12px] font-black text-slate-900 group-hover:text-violet-700 transition-colors tracking-tight font-headline">{node.id}</h5>
                    <p className="text-[9px] font-black text-slate-400 tracking-widest">{node.sub}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[12px] font-black ${node.tone}`}>{node.val}</p>
                    <p className="text-[7px] font-black tracking-widest text-slate-300 mt-1">{node.status}</p>
                  </div>
                </div>
                <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden mt-2.5">
                   <div className={`h-full ${node.tone.replace('text', 'bg')} opacity-40`} style={{ width: node.val }} />
                </div>
              </div>
            ))}
          </div>

          <button className="mt-8 w-full py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-[9px] font-black text-violet-700 tracking-widest transition-colors shadow-sm">
            View infrastructure map
          </button>
        </div>
      </div>

      {/* Report History */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h4 className="font-black text-sm text-slate-900 tracking-tight italic">Historical intel registry</h4>
          <div className="flex gap-1.5">
             {['PDF', 'CSV', 'JSON'].map(type => (
               <button key={type} className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-400 hover:text-violet-700 hover:bg-white hover:border-violet-100 transition-all tracking-widest">
                 {type}
               </button>
             ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[8px] font-black text-slate-300 tracking-[0.2em] border-b border-slate-50">
              <tr>
                <th className="px-6 py-4">Report unit</th>
                <th className="px-6 py-4">Generated by</th>
                <th className="px-6 py-4">Intel timestamp</th>
                <th className="px-6 py-4">State</th>
                <th className="px-6 py-4 text-right">Unit actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {HISTORY.map((item, i) => (
                <tr key={i} className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                  <td className="px-6 py-5 flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 shadow-sm border border-violet-100">
                       <FileText className="size-4" />
                    </div>
                    <span className="text-[12px] font-bold text-slate-900 group-hover:text-violet-700 transition-colors">{item.name}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-lg bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-400 border border-slate-200/50">
                        {item.initial}
                      </div>
                      <span className="text-[11px] font-bold text-slate-600">{item.by}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[11px] font-bold text-slate-400 tabular-nums">{item.time}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black tracking-widest rounded-lg border border-emerald-100 leading-none">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="text-[10px] font-black text-violet-700 hover:underline tracking-widest flex items-center gap-2 ml-auto group/btn">
                      Intelligence download
                      <Download className="size-2.5 group-hover/btn:translate-y-0.5 transition-transform" />
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
