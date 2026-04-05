import { Zap, TrendingUp, TrendingDown, Filter, Download, MoreHorizontal } from "lucide-react"
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  Tooltip, 
  BarChart, 
  Bar,
  Cell
} from "recharts"
import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import { toast } from "sonner"

const PERFORMANCE_DATA = [
  { name: "MON", value: 65 },
  { name: "TUE", value: 85 },
  { name: "WED", value: 70 },
  { name: "THU", value: 75 },
  { name: "FRI", value: 55 },
  { name: "SAT", value: 92 },
  { name: "SUN", value: 80 },
]

const EFFICIENCY_DATA = [
  { name: "HR", value: 85 },
  { name: "ENG", value: 95 },
  { name: "SALES", value: 78 },
  { name: "OPS", value: 88 },
  { name: "LEGAL", value: 82 },
  { name: "MKTG", value: 90 },
  { name: "R&D", value: 92 },
]

const NODES = [
  { id: "1", name: "Quantum-US-East-01", status: "Stable", load: "42%", availability: "99.99%", errorRate: "0.001%" },
  { id: "2", name: "Quantum-EU-West-04", status: "Stable", load: "68%", availability: "99.97%", errorRate: "0.004%" },
  { id: "3", name: "Quantum-Asia-S-02", status: "Heavy Load", load: "92%", availability: "98.42%", errorRate: "0.12%" },
]

export default function ReportsPage() {
  const handleGenerateInsights = () => {
    toast.success("Intelligence engine analyzing enterprise nodes...")
  }

  return (
    <OrganizationAdminChrome>
      <div className="p-8 lg:p-12 space-y-10 min-h-screen bg-[#fcfcfd] font-sans">
        
        {/* Main Title & Global Actions */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div>
              <h1 className="text-[32px] font-black tracking-tight text-slate-900 leading-tight font-display">
                System Performance & Efficiency
              </h1>
              <p className="text-slate-500 mt-1 font-medium italic">
                Real-time data visualization and KPI monitoring across enterprise nodes.
              </p>
           </div>
           <div className="flex items-center gap-4 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-8 py-3.5 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                 Custom Date
              </button>
              <button 
                onClick={handleGenerateInsights}
                className="flex-1 md:flex-none flex items-center justify-center gap-3 px-10 py-3.5 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-violet-900/20 hover:bg-violet-700 transition-all active:scale-95"
              >
                 <Zap className="h-4 w-4 fill-white" />
                 Generate Insights
              </button>
           </div>
        </header>

        {/* Executive KPI Grid */}
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
           {[
             { label: "System Uptime", value: "99.98%", trend: "+0.02%", up: true },
             { label: "Avg Response Time", value: "124ms", trend: "-12%", up: false },
             { label: "Resource Usage", value: "64.2%", trend: "-5%", up: false },
             { label: "Active Nodes", value: "1,248", trend: "+42", up: true },
           ].map((kpi, i) => (
             <div key={i} className="bg-white rounded-[32px] border border-slate-50 p-8 shadow-sm hover:shadow-xl hover:shadow-violet-900/5 transition-all">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 leading-none">{kpi.label}</p>
                <div className="flex items-end justify-between">
                   <h3 className="text-4xl font-black text-slate-900 leading-none tracking-tighter font-display">{kpi.value}</h3>
                   <span className={`text-[10px] font-black flex items-center gap-1 ${kpi.up ? 'text-emerald-500' : 'text-orange-500'}`}>
                      {kpi.trend} {kpi.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                   </span>
                </div>
             </div>
           ))}
        </section>

        {/* Visual Analytics Section */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
           {/* System Performance Over Time */}
           <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-50 space-y-8">
              <div className="flex items-start justify-between">
                 <div>
                    <h4 className="text-xl font-black text-slate-900 font-display">System Performance Over Time</h4>
                    <div className="flex items-end gap-3 mt-4">
                       <h5 className="text-4xl font-black text-slate-900 leading-none tracking-tighter">94.2/100</h5>
                       <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">+2.4% vs last week</span>
                    </div>
                 </div>
                 <select className="bg-slate-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 outline-none focus:ring-2 focus:ring-violet-600/10 cursor-pointer">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                 </select>
              </div>
              
              <div className="h-72 w-full mt-6">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                       <defs>
                          <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis 
                         dataKey="name" 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
                       />
                       <Tooltip 
                         contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }}
                       />
                       <Area 
                         type="monotone" 
                         dataKey="value" 
                         stroke="#8b5cf6" 
                         strokeWidth={4} 
                         fillOpacity={1} 
                         fill="url(#colorPerf)" 
                       />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Department Efficiency */}
           <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-50 space-y-8">
              <div className="flex items-start justify-between">
                 <div>
                    <h4 className="text-xl font-black text-slate-900 font-display">Department Efficiency</h4>
                    <div className="flex items-end gap-3 mt-4">
                       <h5 className="text-4xl font-black text-slate-900 leading-none tracking-tighter">88.5%</h5>
                       <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1 italic">-1.2% vs prev. quarter</span>
                    </div>
                 </div>
                 <button className="p-3 text-slate-300 hover:text-slate-900 transition-colors">
                    <MoreHorizontal className="h-6 w-6" />
                 </button>
              </div>
              
              <div className="h-72 w-full mt-10">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={EFFICIENCY_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                       <XAxis 
                         dataKey="name" 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }} 
                       />
                       <Tooltip 
                         cursor={{ fill: '#f1f5f9', radius: 12 }}
                         contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontSize: '10px' }}
                       />
                       <Bar 
                         dataKey="value" 
                         fill="#8b5cf6" 
                         radius={[12, 12, 0, 0]} 
                         barSize={32}
                       >
                         {EFFICIENCY_DATA.map((_, index) => (
                           <Cell key={`cell-${index}`} fill={index === 1 ? '#7c3aed' : '#8b5cf6'} />
                         ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </section>

        {/* Key Performance Indicators Table */}
        <section className="bg-white rounded-[40px] border border-slate-50 shadow-sm overflow-hidden flex flex-col">
           <div className="p-10 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between bg-slate-50/10 gap-6">
              <h3 className="text-xl font-black text-slate-900 font-display">Key Performance Indicators</h3>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                 <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
                    <Filter className="h-4 w-4" />
                    Filter
                 </button>
                 <button 
                   onClick={() => toast.success("Data compiled. CSV downloading...")}
                   className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all"
                 >
                    <Download className="h-4 w-4" />
                    CSV
                 </button>
              </div>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-slate-50/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                 <tr>
                   <th className="px-10 py-6">Node Name</th>
                   <th className="px-10 py-6">Status</th>
                   <th className="px-10 py-6">Load</th>
                   <th className="px-10 py-6">Availability</th>
                   <th className="px-10 py-6">Error Rate</th>
                   <th className="px-10 py-6 text-right">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {NODES.map((node) => (
                   <tr key={node.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                     <td className="px-10 py-8">
                        <span className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors">{node.name}</span>
                     </td>
                     <td className="px-10 py-8">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit ${
                          node.status === 'Stable' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                           <div className={`size-1.5 rounded-full ${node.status === 'Stable' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                           {node.status}
                        </span>
                     </td>
                     <td className="px-10 py-8 text-sm font-black text-slate-900">{node.load}</td>
                     <td className="px-10 py-8 text-sm font-black text-slate-900">{node.availability}</td>
                     <td className="px-10 py-8 text-sm font-black text-slate-900">{node.errorRate}</td>
                     <td className="px-10 py-8 text-right">
                        <button className="text-[10px] font-black text-violet-600 uppercase tracking-widest hover:text-violet-900 transition-colors">
                           View Details
                        </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </section>
      </div>
    </OrganizationAdminChrome>
  )
}
