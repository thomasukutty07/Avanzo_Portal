import { toast } from "sonner"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { SuperAdminChrome } from "@/components/layout/SuperAdminChrome"
import { 
  Check, 
  X, 
  Search, 
  Filter, 
  Building2, 
  User, 
  Clock, 
  ShieldAlert,
  Loader2,
  Trash2
} from "lucide-react"
import { useState } from "react"

const PENDING = [
  { id: "APP-001", name: "Cyberdyne Systems", type: "Technology", date: "Oct 24, 2023", contact: "Miles Dyson" },
  { id: "APP-002", name: "Wayne Enterprises", type: "Legal", date: "Oct 22, 2023", contact: "Lucius Fox" },
  { id: "APP-003", name: "Stark Industries", type: "Energy", date: "Oct 21, 2023", contact: "Pepper Potts" },
]

export default function SuperAdminPending() {
  useDesignPortalLightTheme()
  const [processing, setProcessing] = useState<string | null>(null)

  const handleApprove = (id: string, name: string) => {
    setProcessing(`approve-${id}`)
    setTimeout(() => {
      setProcessing(null)
      toast.success(`${name} has been successfully approved.`)
    }, 1500)
  }

  const handleReject = (id: string, name: string) => {
    setProcessing(`reject-${id}`)
    setTimeout(() => {
      setProcessing(null)
      toast.error(`Registration for ${name} has been rejected.`)
    }, 1500)
  }

  return (
    <SuperAdminChrome>
      <div className="space-y-10 py-8 font-sans text-slate-600">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <ShieldAlert className="h-5 w-5 text-amber-500" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600">Approval Queue</span>
            </div>
            <h1 className="font-display text-3xl font-black tracking-tight text-slate-900 leading-tight">
              Pending Registrations
            </h1>
            <p className="text-slate-500 mt-1 font-medium italic">
               Review and authorize new organization registration requests.
            </p>
          </div>
        </header>

        <div className="bg-white rounded-[40px] border border-slate-50 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
           <div className="p-10 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50/10">
              <div className="flex items-center gap-4">
                 <div className="size-3 bg-amber-500 rounded-full shadow-lg shadow-amber-500/50 animate-pulse" />
                 <h3 className="font-display text-xl font-black text-slate-900 leading-none">Application List</h3>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                 <div className="relative flex-1 sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                       placeholder="Search by organization or ID..."
                       className="w-full bg-white border-slate-100 rounded-2xl pl-12 py-3 text-sm font-medium focus:ring-violet-700/10 focus:border-violet-700 transition-all placeholder:text-slate-300"
                       type="text"
                    />
                 </div>
                 <button onClick={() => toast.info("Filter parameters ready")} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all shadow-sm active:scale-95"><Filter className="h-5 w-5" /></button>
              </div>
           </div>

           <div className="overflow-x-auto flex-1">
             <table className="w-full text-left">
               <thead className="bg-slate-50/30 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                 <tr>
                   <th className="px-10 py-6">Reference ID</th>
                   <th className="px-10 py-6">Organization Name</th>
                   <th className="px-10 py-6">Industry</th>
                   <th className="px-10 py-6">Contact Person</th>
                   <th className="px-10 py-6 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {PENDING.map((org) => (
                   <tr key={org.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                     <td className="px-10 py-8 font-black text-xs text-slate-300 tracking-widest">{org.id}</td>
                     <td className="px-10 py-8">
                        <div>
                           <h4 className="font-display text-base font-black text-slate-900 group-hover:text-violet-700 transition-colors">{org.name}</h4>
                           <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
                             <Clock className="h-3 w-3" /> Submitted {org.date}
                           </p>
                        </div>
                     </td>
                     <td className="px-10 py-8">
                        <span className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-slate-100">
                           {org.type}
                        </span>
                     </td>
                     <td className="px-10 py-8">
                        <div className="flex items-center gap-3">
                           <div className="size-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                              <User className="h-4 w-4 text-slate-400" />
                           </div>
                           <span className="text-sm font-black text-slate-700 tracking-tight">{org.contact}</span>
                        </div>
                     </td>
                     <td className="px-10 py-8">
                        <div className="flex justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                           <button 
                             disabled={!!processing}
                             onClick={() => handleReject(org.id, org.name)}
                             className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                             title="Reject Registration"
                           >
                              {processing === `reject-${org.id}` ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                           </button>
                           <button 
                             disabled={!!processing}
                             onClick={() => handleApprove(org.id, org.name)}
                             className="p-3 rounded-2xl bg-violet-700 text-white shadow-xl shadow-violet-900/20 hover:bg-violet-800 transition-all active:scale-95 disabled:opacity-50"
                             title="Approve Registration"
                           >
                              {processing === `approve-${org.id}` ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                           </button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           
           <div className="p-8 bg-slate-50/30 border-t border-slate-50 text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">Pending Request Monitor Active</p>
           </div>
        </div>
      </div>
    </SuperAdminChrome>
  )
}
