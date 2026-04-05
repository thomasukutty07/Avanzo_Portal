import { HRPortalChrome } from "@/components/portal/hr/HRPortalChrome"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  MoreVertical
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

const turnoverData = [
  { name: 'JAN', value: 2.1 },
  { name: 'MAR', value: 2.8 },
  { name: 'MAY', value: 2.5 },
  { name: 'JUL', value: 3.2 },
  { name: 'SEP', value: 4.1 },
  { name: 'NOV', value: 4.2 },
];

const diversityData = [
  { name: 'ENG', value: 0.8 },
  { name: 'SAL', value: 0.6 },
  { name: 'HR', value: 0.4 },
  { name: 'OPS', value: 0.7 },
  { name: 'MKT', value: 0.5 },
  { name: 'FIN', value: 0.65 },
];

export default function HRReports() {
  return (
    <HRPortalChrome>
      <div className="min-h-full bg-[#F8FAFC] p-6 md:p-10 space-y-8 animate-in fade-in duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Advanced HR Analytics</h1>
            <p className="text-sm font-bold text-slate-400">Real-time insights across turnover, diversity, and performance metrics.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="h-11 rounded-xl bg-white border-slate-200 text-slate-600 font-bold px-5 flex gap-2 items-center hover:bg-slate-50 transition-all active:scale-95">
                <Filter className="size-4" />
                Filter
             </Button>
             <Button className="h-11 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black px-6 shadow-lg shadow-violet-100 flex gap-2 items-center transition-all hover:-translate-y-0.5 active:translate-y-0">
                View All
             </Button>
          </div>
        </div>

        {/* Top KPIs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard 
            label="Total Employees" 
            value="1,248" 
            change="+2.1%" 
            isPositive={true} 
            icon={<Users className="size-5 text-violet-600" />} 
          />
          <KPICard 
            label="Active Requisitions" 
            value="24" 
            change="-5%" 
            isPositive={false} 
            icon={<Briefcase className="size-5 text-violet-600" />} 
          />
          <KPICard 
            label="Avg. Time to Hire" 
            value="32d" 
            change="-2d" 
            isPositive={true} 
            icon={<Clock className="size-5 text-violet-600" />} 
          />
          <KPICard 
            label="Retention Rate" 
            value="94.2%" 
            change="+0.8%" 
            isPositive={true} 
            icon={<Target className="size-5 text-violet-600" />} 
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Turnover Rate Trend */}
          <Card className="lg:col-span-1 rounded-[32px] border-slate-100 shadow-xl shadow-slate-200/40 bg-white overflow-hidden group">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-800">Turnover Rate Trend</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Last 12 months</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 rounded-full border border-violet-100/50">
                  <TrendingUp className="size-3 text-violet-600" />
                  <span className="text-[11px] font-black text-violet-600">4.2%</span>
                </div>
              </div>
              <div className="h-[180px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={turnoverData}>
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} 
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '11px', fontWeight: 'bold' }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#7C3AED" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#7C3AED', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Diversity Index */}
          <Card className="lg:col-span-1 rounded-[32px] border-slate-100 shadow-xl shadow-slate-200/40 bg-white overflow-hidden group">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-800">Diversity Index</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Current Quarter</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-green-600">0.72</span>
                </div>
              </div>
              <div className="h-[180px] w-full pt-4 text-left">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={diversityData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} 
                    />
                    <YAxis hide />
                    <Bar 
                      dataKey="value" 
                      radius={[6, 6, 0, 0]} 
                      barSize={20}
                    >
                      {diversityData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#C4B5FD' : '#8B5CF6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Performance Distribution */}
          <Card className="lg:col-span-1 rounded-[32px] border-slate-100 shadow-xl shadow-slate-200/40 bg-white overflow-hidden group">
            <CardContent className="p-8 space-y-6">
              <div>
                <h3 className="text-sm font-black text-slate-800">Performance Distribution</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Annual Review Cycle</p>
              </div>
              <div className="space-y-5">
                <PerformanceItem label="Exceeds Expectations" percent={15} color="bg-violet-600" />
                <PerformanceItem label="Meets Expectations" percent={72} color="bg-violet-400" />
                <PerformanceItem label="Needs Improvement" percent={13} color="bg-slate-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recruitment Table Section */}
        <Card className="rounded-[40px] border-slate-100 shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-black text-lg text-slate-900">Recruitment Metrics Summary</h3>
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search by dept..." 
                    className="h-10 pl-9 pr-4 bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-violet-600/10 focus:bg-white outline-none w-[180px] transition-all"
                  />
                </div>
                <Button variant="outline" className="h-10 border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50">
                  <Filter className="size-3.5" />
                  Filter
                </Button>
                <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-400 hover:bg-slate-50 rounded-xl">
                  <MoreVertical className="size-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Department</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Open Roles</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Applicants</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Time to Hire</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Cost per Hire</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <RecruitmentRow dept="Engineering" roles={12} applicants={458} time="45 days" cost="$4,200" status="Urgent" statusColor="bg-orange-100 text-orange-600" />
                  <RecruitmentRow dept="Sales" roles={5} applicants={212} time="28 days" cost="$2,800" status="On Track" statusColor="bg-green-100 text-green-600" />
                  <RecruitmentRow dept="Marketing" roles={3} applicants={89} time="34 days" cost="$3,100" status="On Track" statusColor="bg-green-100 text-green-600" />
                  <RecruitmentRow dept="Finance" roles={2} applicants={145} time="41 days" cost="$3,800" status="Inactive" statusColor="bg-slate-100 text-slate-500" />
                  <RecruitmentRow dept="Customer Success" roles={2} applicants={321} time="19 days" cost="$1,900" status="On Track" statusColor="bg-green-100 text-green-600" />
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </HRPortalChrome>
  )
}

function KPICard({ label, value, change, isPositive, icon }: { label: string, value: string, change: string, isPositive: boolean, icon: React.ReactNode }) {
  return (
    <Card className="rounded-[32px] border-slate-100 shadow-xl shadow-slate-200/40 bg-white overflow-hidden group hover:shadow-2xl hover:shadow-violet-200/20 transition-all duration-500 hover:-translate-y-1">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="size-10 rounded-2xl bg-violet-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            {icon}
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border ${isPositive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
            {isPositive ? <ArrowUpRight className="size-3" /> : <TrendingDown className="size-3" />}
            {change}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-black text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function PerformanceItem({ label, percent, color }: { label: string, percent: number, color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] font-black">
        <span className="text-slate-500 uppercase tracking-tight">{label}</span>
        <span className="text-slate-900">{percent}%</span>
      </div>
      <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
        <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function RecruitmentRow({ dept, roles, applicants, time, cost, status, statusColor }: { dept: string, roles: number, applicants: number, time: string, cost: string, status: string, statusColor: string }) {
  return (
    <tr className="group hover:bg-slate-50/80 transition-colors">
      <td className="px-8 py-6 font-black text-slate-800 text-sm">{dept}</td>
      <td className="px-8 py-6 font-bold text-slate-500 text-xs">{roles}</td>
      <td className="px-8 py-6 font-bold text-slate-500 text-xs">{applicants}</td>
      <td className="px-8 py-6 font-bold text-slate-500 text-xs">{time}</td>
      <td className="px-8 py-6 font-bold text-slate-500 text-xs">{cost}</td>
      <td className="px-8 py-6">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${statusColor}`}>
          {status}
        </span>
      </td>
    </tr>
  )
}
