import { HRPortalChrome } from "@/components/portal/hr/HRPortalChrome"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import { 
  Users, 
  Briefcase, 
  Target, 
  ArrowUpRight,
  TrendingDown,
  Search,
  Loader2,
  Zap,
  Activity
} from "lucide-react"


export default function HRReports() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true)
        const [eRes] = await Promise.all([
          api.get("/api/auth/employees/")
        ])
        setEmployees(extractResults(eRes.data))
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



  if (loading) {
    return (
      <HRPortalChrome>
        <div className="flex h-[80vh] items-center justify-center bg-[#fcfcfc]">
          <div className="flex flex-col items-center gap-6">
            <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
            <p className="text-[11px] font-black text-slate-400 tracking-[0.2em] font-headline">Generating workforce analytics...</p>
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
            <p className="text-[10px] font-bold tracking-widest text-violet-600 leading-none uppercase">
              HR Performance Center
            </p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Reports</h1>
            <p className="text-sm font-medium text-slate-500 mt-4 leading-relaxed opacity-80 tracking-tight">Real-time metrics across department distribution, performance levels, and operational headcount.</p>
          </div>
          <div className="flex items-center gap-4">
             {/* Action set decommissioned for minimalist focus */}
          </div>
        </div>

        {/* Top KPIs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <KPICard 
            label="Total Personnel" 
            value={totalEmployees.toString().padStart(2, '0')} 
            change="+2.1%" 
            isPositive={true} 
            icon={<Users className="size-5 stroke-[2.5px]" />} 
            sub="Global Employee Registry"
          />
          <KPICard 
            label="Active Accounts" 
            value={activeEmployees.toString().padStart(2, '0')} 
            change="+1.4%" 
            isPositive={true} 
            icon={<Briefcase className="size-5 stroke-[2.5px]" />} 
            sub="Active operational units"
          />
          <KPICard 
            label="Retention Index" 
            value={`${Math.round(retentionRate)}%`} 
            change="+0.8%" 
            isPositive={true} 
            icon={<Target className="size-5 stroke-[2.5px]" />} 
            sub="Personnel stability hub"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="rounded-[2.5rem] border-slate-100 shadow-sm bg-white overflow-hidden group hover:shadow-2xl transition-all duration-700 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-violet-600/10" />
            <CardContent className="p-10 space-y-10">
              <div className="space-y-1.5 text-left uppercase font-headline">
                 <h3 className="text-sm font-bold text-slate-900 tracking-tight">Performance Distribution</h3>
                 <p className="text-[10px] font-bold text-slate-300 tracking-[0.2em] opacity-60">Employee engagement overview</p>
              </div>
              <div className="space-y-8">
                <PerformanceItem label="Exceeds Expectations" percent={15} color="bg-violet-600 shadow-[0_0_10px_rgba(124,58,237,0.4)]" />
                <PerformanceItem label="Fully Compliant" percent={72} color="bg-violet-400" />
                <PerformanceItem label="Under Review" percent={13} color="bg-slate-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-[2.5rem] border-slate-100 shadow-sm bg-white overflow-hidden group hover:shadow-2xl transition-all duration-700 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-violet-600/10" />
            <CardContent className="p-10 flex flex-col items-center justify-center text-center space-y-6">
                <Activity className="size-12 text-slate-100" />
                <div className="space-y-2 font-headline uppercase">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight border-b border-slate-100 pb-4">Workforce Insights</h3>
                    <p className="text-[10px] font-bold text-slate-300 tracking-widest leading-relaxed">Advanced analytics including turnover trends and growth projections will populate as more historical data becomes available.</p>
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Recruitment Table Section placeholder for dummy removal */}
        <Card className="rounded-[3rem] border-slate-100 shadow-sm bg-white overflow-hidden hover:shadow-2xl transition-all duration-700">
          <CardContent className="p-0 font-headline">
            <div className="p-12 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-50/10 uppercase">
              <div className="space-y-1.5 text-left">
                <h3 className="font-bold text-xl text-slate-900 tracking-tight">Personnel Roster</h3>
                <p className="text-[10px] font-bold text-slate-400 tracking-widest opacity-60">Global employee unit distribution</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-violet-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search personnel..." 
                    className="h-11 pl-12 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-medium focus:ring-4 focus:ring-violet-600/5 focus:bg-white outline-none w-[260px] transition-all uppercase tracking-widest placeholder:text-slate-200 shadow-inner"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/20 uppercase">
                    <th className="px-12 py-5 text-[10px] font-bold text-slate-300 tracking-widest">Department</th>
                    <th className="px-12 py-5 text-[10px] font-bold text-slate-300 tracking-widest">Designation</th>
                    <th className="px-12 py-5 text-[10px] font-bold text-slate-300 tracking-widest">Email Address</th>
                    <th className="px-12 py-5 text-[10px] font-bold text-slate-300 tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 uppercase">
                   {employees.length > 0 ? (
                      employees.slice(0, 8).map((emp, i) => (
                        <tr key={i} className="group hover:bg-slate-50/50 transition-all cursor-pointer font-headline">
                           <td className="px-12 py-6 font-bold text-slate-900 text-sm tracking-tight group-hover:text-violet-600 transition-colors">{emp.department_name || 'General'}</td>
                           <td className="px-12 py-6 font-medium text-slate-400 text-xs tracking-widest opacity-60">{emp.designation_name || 'Standard Unit'}</td>
                           <td className="px-12 py-6 font-medium text-slate-400 text-[10px] tracking-widest opacity-60 lowercase">{emp.email}</td>
                           <td className="px-12 py-6 text-right">
                              <span className={`px-4 py-1.5 rounded-xl text-[9px] font-bold tracking-widest border transition-all ${emp.is_active !== false ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                 {emp.is_active !== false ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                           </td>
                        </tr>
                      ))
                   ) : (
                      <tr>
                        <td colSpan={5} className="px-12 py-20 text-center opacity-30 uppercase">
                           <Zap className="size-12 mx-auto mb-4 text-slate-200" />
                           <p className="text-[10px] font-bold tracking-widest">Employee Registry Synchronization Pending</p>
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
      <CardContent className="p-10 text-left uppercase font-headline">
        <div className="flex items-center justify-between mb-8">
          <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-violet-600 transition-all group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white border border-slate-100 shadow-sm">
            {icon}
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold border transition-all shadow-sm ${isPositive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
            {isPositive ? <ArrowUpRight className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {change}
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-slate-400 tracking-widest opacity-60 leading-none">{label}</p>
          <p className="text-4xl font-bold text-slate-900 tracking-tight leading-none tabular-nums">{value}</p>
          <p className="text-[9px] font-bold text-slate-300 lowercase italic tracking-tight opacity-40 pt-2 leading-none">{sub}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function PerformanceItem({ label, percent, color }: { label: string, percent: number, color: string }) {
  return (
    <div className="space-y-3 group/item">
      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest transition-all">
        <span className="text-slate-400 group-hover/item:text-violet-600 transition-colors uppercase leading-none">{label}</span>
        <span className="text-slate-900 tabular-nums leading-none">{percent}%</span>
      </div>
      <div className="h-3.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner group-hover/item:border-violet-100 transition-colors">
        <div className={`h-full ${color} rounded-full transition-all duration-[2000ms] ease-out shadow-sm`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
