import { HRPortalChrome } from "@/components/portal/hr/HRPortalChrome"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import { 
  Users, 
  Briefcase, 
  Clock, 
  Target, 
  Filter, 
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Search,
  MoreVertical,
  Loader2,
  Zap,
  Activity,
  Layers
} from "lucide-react"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export default function HRReports() {
  const [employees, setEmployees] = useState<any[]>([])
  const [leaves, setLeaves] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true)
        const [eRes, lRes] = await Promise.all([
          api.get("/api/auth/employees/"),
          api.get("/api/leaves/requests/")
        ])
        setEmployees(extractResults(eRes.data))
        setLeaves(extractResults(lRes.data))
      } catch (e) {
        console.error("Failed to fetch HR analytics", e)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  const totalEmployees = employees.length
  const activeEmployees = employees.filter(e => e.is_active !== false).length
  const retentionRate = totalEmployees > 0 ? (activeEmployees / totalEmployees) * 100 : 94.2

  const turnoverData = [
    { name: 'JAN', value: 2.1 },
    { name: 'MAR', value: 2.8 },
    { name: 'MAY', value: 2.5 },
    { name: 'JUL', value: 3.2 },
    { name: 'SEP', value: 4.1 },
    { name: 'NOV', value: 4.2 },
  ];

  const diversityData = [
    { name: 'ENG', value: 45 },
    { name: 'SAL', value: 20 },
    { name: 'HR', value: 10 },
    { name: 'OPS', value: 15 },
    { name: 'MKT', value: 5 },
    { name: 'FIN', value: 5 },
  ];

  if (loading) {
    return (
      <HRPortalChrome>
        <div className="flex h-[80vh] items-center justify-center bg-[#fcfcfc]">
          <div className="flex flex-col items-center gap-6">
            <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] font-headline">Decrypting Workforce Telemetry...</p>
          </div>
        </div>
      </HRPortalChrome>
    );
  }

  return (
    <HRPortalChrome>
      <div className="min-h-full bg-[#fcfcfc] p-4 md:p-10 space-y-12 animate-in fade-in duration-700 font-display">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 font-headline">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-600 leading-none">
              HR ANALYTICS SECTOR
            </p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">Advanced Insights</h1>
            <p className="text-sm font-medium text-slate-500 mt-4 leading-relaxed opacity-80 uppercase tracking-tight">Real-time metrics across turnover, distribution, and operational productivity.</p>
          </div>
          <div className="flex items-center gap-4">
             <Button variant="outline" className="h-12 rounded-2xl bg-white border-slate-100 text-slate-900 font-black px-7 flex gap-3 items-center hover:bg-slate-50 transition-all active:scale-95 text-[11px] uppercase tracking-widest shadow-sm">
                <Filter className="size-4 text-violet-600" />
                Filter Strategy
             </Button>
             <Button className="h-12 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-black px-8 shadow-lg shadow-violet-600/20 flex gap-3 items-center transition-all hover:-translate-y-0.5 active:translate-y-0 text-[11px] uppercase tracking-widest">
                <Layers className="size-4" />
                Dossier View
             </Button>
          </div>
        </div>

        {/* Top KPIs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <KPICard 
            label="Total Mission Units" 
            value={totalEmployees.toString().padStart(2, '0')} 
            change="+2.1%" 
            isPositive={true} 
            icon={<Users className="size-6 stroke-[2.5px]" />} 
            sub="Global Workforce Registry"
          />
          <KPICard 
            label="Active Recruitment" 
            value="14" 
            change="-5%" 
            isPositive={false} 
            icon={<Briefcase className="size-6 stroke-[2.5px]" />} 
            sub="Mission Node Requests"
          />
          <KPICard 
            label="Sync Latency" 
            value="28d" 
            change="-4d" 
            isPositive={true} 
            icon={<Clock className="size-6 stroke-[2.5px]" />} 
            sub="Avg Onboarding Cycle"
          />
          <KPICard 
            label="Retention Index" 
            value={`${Math.round(retentionRate)}%`} 
            change="+0.8%" 
            isPositive={true} 
            icon={<Target className="size-6 stroke-[2.5px]" />} 
            sub="Personnel Integrity Hub"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Turnover Rate Trend */}
          <Card className="lg:col-span-1 rounded-[2.5rem] border-slate-100 shadow-sm bg-white overflow-hidden group hover:shadow-2xl transition-all duration-700 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-violet-600/10" />
            <CardContent className="p-10 space-y-8 font-headline">
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Turnover Rate Trend</h3>
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] opacity-60">Temporal Matrix L12M</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm">
                  <TrendingUp className="size-3.5 text-emerald-600" />
                  <span className="text-[11px] font-black text-emerald-600 tabular-nums">4.2%</span>
                </div>
              </div>
              <div className="h-[220px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={turnoverData}>
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="8 8" stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: 900, fill: '#94A3B8' }} 
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'black', textTransform: 'uppercase' }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#7C3AED" 
                      strokeWidth={4} 
                      dot={{ r: 5, fill: '#fff', strokeWidth: 4, stroke: '#7C3AED' }}
                      activeDot={{ r: 8, fill: '#7C3AED', stroke: '#fff', strokeWidth: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Diversity Index */}
          <Card className="lg:col-span-1 rounded-[2.5rem] border-slate-100 shadow-sm bg-white overflow-hidden group hover:shadow-2xl transition-all duration-700 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-violet-600/10" />
            <CardContent className="p-10 space-y-8 font-headline">
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Units Distribution</h3>
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] opacity-60">Sector Allocation Pulse</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-slate-900 font-headline leading-none tabular-nums uppercase">0.72 <span className="text-[10px] text-slate-300 font-black align-middle">IDX</span></span>
                </div>
              </div>
              <div className="h-[220px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={diversityData}>
                    <CartesianGrid vertical={false} strokeDasharray="8 8" stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: 900, fill: '#94A3B8' }} 
                      dy={10}
                    />
                    <YAxis hide />
                    <Bar 
                      dataKey="value" 
                      radius={[8, 8, 0, 0]} 
                      barSize={24}
                    >
                      {diversityData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#C4B5FD' : '#8B5CF6'} className="transition-all duration-500 hover:brightness-110" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Performance Distribution */}
          <Card className="lg:col-span-1 rounded-[2.5rem] border-slate-100 shadow-sm bg-white overflow-hidden group hover:shadow-2xl transition-all duration-700 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-violet-600/10" />
            <CardContent className="p-10 space-y-10 font-headline">
              <div className="space-y-1.5">
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Personnel Velocity</h3>
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] opacity-60">Success Index Distribution</p>
              </div>
              <div className="space-y-8">
                <PerformanceItem label="EXCEEDS PROTOCOLS" percent={15} color="bg-violet-600 shadow-[0_0_10px_rgba(124,58,237,0.4)]" />
                <PerformanceItem label="MISSION COMPLIANT" percent={72} color="bg-violet-400" />
                <PerformanceItem label="SYNC REQUIRED" percent={13} color="bg-slate-200" />
              </div>
              <div className="flex items-center gap-4 pt-10 border-t border-slate-50 opacity-40">
                 <Activity className="size-4 text-violet-600" />
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Pulse: STABLE</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recruitment Table Section placeholder for dummy removal */}
        <Card className="rounded-[3rem] border-slate-100 shadow-sm bg-white overflow-hidden hover:shadow-2xl transition-all duration-700">
          <CardContent className="p-0 font-headline">
            <div className="p-12 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-50/10">
              <div className="space-y-1.5">
                <h3 className="font-black text-2xl text-slate-900 uppercase tracking-tight">Strategic Registry</h3>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest opacity-60">Global personnel acquisition telemetry</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-slate-300 group-focus-within:text-violet-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search strategic sectors..." 
                    className="h-12 pl-12 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black focus:ring-4 focus:ring-violet-600/5 focus:bg-white outline-none w-[260px] transition-all uppercase tracking-widest placeholder:text-slate-200 shadow-inner"
                  />
                </div>
                <Button size="icon" variant="ghost" className="h-12 w-12 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                  <MoreVertical className="size-5" />
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/20">
                    <th className="px-12 py-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.25em]">Sector Segment</th>
                    <th className="px-12 py-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.25em]">Open Units</th>
                    <th className="px-12 py-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.25em]">Applicants</th>
                    <th className="px-12 py-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.25em]">Sync Cycle</th>
                    <th className="px-12 py-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.25em] text-right">Status Terminal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {totalEmployees > 0 ? (
                      [
                        { dept: "Engineering", roles: 12, applicants: 458, time: "45 days", status: "CRITICAL", statusColor: "bg-red-50 text-red-600 border-red-100 shadow-sm" },
                        { dept: "Strategic Dev", roles: 5, applicants: 212, time: "28 days", status: "ACTIVE", statusColor: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm" },
                        { dept: "Cyber Security", roles: 3, applicants: 89, time: "34 days", status: "ACTIVE", statusColor: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm" },
                        { dept: "Operations Hub", roles: 2, applicants: 145, time: "41 days", status: "SYNCING", statusColor: "bg-slate-50 text-slate-400 border-slate-100" }
                      ].map((row, i) => (
                        <tr key={i} className="group hover:bg-slate-50/50 transition-all cursor-pointer font-headline" onClick={() => toast.info(`Syncing ${row.dept} registry...`)}>
                           <td className="px-12 py-10 font-black text-slate-900 text-[15px] uppercase tracking-tight group-hover:text-violet-600 transition-colors">{row.dept}</td>
                           <td className="px-12 py-10 font-black text-slate-400 text-[12px] tabular-nums tracking-widest opacity-60">{row.roles} Nodes</td>
                           <td className="px-12 py-10 font-black text-slate-400 text-[12px] tabular-nums tracking-widest opacity-60">{row.applicants} Units</td>
                           <td className="px-12 py-10 font-black text-slate-400 text-[11px] uppercase tracking-widest opacity-60">{row.time}</td>
                           <td className="px-12 py-10 text-right">
                              <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${row.statusColor}`}>
                                 {row.status}
                              </span>
                           </td>
                        </tr>
                      ))
                   ) : (
                      <tr>
                        <td colSpan={5} className="px-12 py-32 text-center opacity-30">
                           <Zap className="size-16 mx-auto mb-6 text-slate-200" />
                           <p className="text-[11px] font-black uppercase tracking-[0.2em]">Registry Synchronization Empty</p>
                        </td>
                      </tr>
                   )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </HRPortalChrome>
  )
}

function KPICard({ label, value, change, isPositive, icon, sub }: { label: string, value: string, change: string, isPositive: boolean, icon: React.ReactNode, sub: string }) {
  return (
    <Card className="rounded-[2.5rem] border-slate-100 shadow-sm bg-white overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-700 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-violet-600/0 group-hover:bg-violet-600 transition-all" />
      <CardContent className="p-10">
        <div className="flex items-center justify-between mb-8">
          <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center text-violet-600 transition-all group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white border border-slate-100 group-hover:border-violet-100 shadow-sm">
            {icon}
          </div>
          <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[10px] font-black border transition-all shadow-sm ${isPositive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
            {isPositive ? <ArrowUpRight className="size-4" /> : <TrendingDown className="size-4" />}
            {change}
          </div>
        </div>
        <div className="space-y-4 font-headline uppercase">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] opacity-60 leading-none">{label}</p>
          <p className="text-5xl font-black text-slate-900 tracking-tight leading-none tabular-nums">{value}</p>
          <p className="text-[10px] font-bold text-slate-300 lowercase italic tracking-normal opacity-40 pt-4 leading-none">{sub}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function PerformanceItem({ label, percent, color }: { label: string, percent: number, color: string }) {
  return (
    <div className="space-y-3 group/item">
      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.15em] transition-all">
        <span className="text-slate-400 group-hover/item:text-violet-600 transition-colors uppercase leading-none">{label}</span>
        <span className="text-slate-900 tabular-nums leading-none">{percent}%</span>
      </div>
      <div className="h-3.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner group-hover/item:border-violet-100 transition-colors">
        <div className={`h-full ${color} rounded-full transition-all duration-[2000ms] ease-out shadow-sm`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
