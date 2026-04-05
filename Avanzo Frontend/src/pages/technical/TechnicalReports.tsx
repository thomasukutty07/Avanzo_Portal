import { BarChart3, Download, TrendingUp, TrendingDown, Clock, Activity, Zap } from "lucide-react"

export default function TechnicalReportsPage() {
  return (
    <div className="space-y-6 pb-12 font-display bg-[#fcfcfc] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 mb-1">
            TECHNICAL MANAGEMENT
          </p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-headline">
            Reports & Analytics
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Throughput, quality, and cycle-time metrics for the engineering org.</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
        >
          <Download className="size-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 mb-8">
        {[
          { title: "Lead Time", val: "4.2", unit: "days", icon: Clock, trend: "-12%", bad: false, desc: "Rolling 30-day median" },
          { title: "Deploy Frequency", val: "12", unit: "/week", icon: Zap, trend: "+4%", bad: false, desc: "Production releases" },
          { title: "Change Failure", val: "2.8", unit: "%", icon: Activity, trend: "+0.5%", bad: true, desc: "Reverted deployments" },
          { title: "Code Coverage", val: "84", unit: "%", icon: BarChart3, trend: "+2%", bad: false, desc: "System-wide automated tests" }
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="size-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <stat.icon className="size-5" />
              </div>
              <span className={`flex items-center gap-1 text-[11px] font-black uppercase tracking-wider ${stat.bad ? 'text-red-500' : 'text-emerald-500'}`}>
                {stat.bad ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3 text-emerald-500 transform rotate-180" />}
                {stat.trend}
              </span>
            </div>
            <h2 className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              {stat.title}
            </h2>
            <div className="flex items-baseline gap-1">
              <p className="text-4xl font-black text-slate-900 font-headline">{stat.val}</p>
              <span className="text-sm font-bold text-slate-400">{stat.unit}</span>
            </div>
            <div className="mt-4 border-t border-slate-50 pt-4">
              <p className="text-xs font-semibold text-slate-500">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-8 shadow-sm h-96 flex flex-col justify-center items-center text-center">
            <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-300">
                <BarChart3 className="size-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Throughput Visualization</h3>
            <p className="text-sm font-medium text-slate-500 max-w-sm mt-2">
                Chart visualizations plug in here (e.g. Recharts) when connected to analytics APIs mapping to live engineering data.
            </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm h-96 flex flex-col">
            <h3 className="text-sm font-bold text-slate-900 mb-6">Recent Automated Reports</h3>
            <div className="space-y-4 flex-1">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50 cursor-pointer transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="size-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-violet-600 transition-colors">
                                <Download className="size-4" />
                            </div>
                            <div>
                                <p className="text-[12px] font-bold text-slate-900 group-hover:text-violet-700">Q{i} Release Cycle Analysis</p>
                                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">PDF • 2.4 MB</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  )
}
