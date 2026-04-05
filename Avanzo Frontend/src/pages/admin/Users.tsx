import { useState, useEffect } from "react"
import { toast } from "sonner"
import { 
  UserPlus, 
  Download, 
  Search, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  Zap,
  TriangleAlert,
  Mail,
  Loader2
} from "lucide-react"
import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import { api } from "@/lib/axios"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"


export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const PAGE_SIZE = 50 // Matches backend
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);


  useEffect(() => {
    async function loadUsers() {
      try {
        setIsLoading(true)
        const res = await api.get(`/api/auth/employees/?page=${page}`)
        const data = res.data
        const apiUsers = Array.isArray(data) ? data : (data.results || [])
        const count = Array.isArray(data) ? data.length : (data.count || 0)
        setTotalCount(count)

        const mappedUsers = apiUsers.map((u: any, idx: number) => {
           const colors = [
             "bg-indigo-50 text-indigo-600",
             "bg-orange-50 text-orange-600",
             "bg-emerald-50 text-emerald-600",
             "bg-violet-50 text-violet-600"
           ];
           return {
             id: u.id,
             name: `${u.first_name} ${u.last_name || ''}`,
             email: u.email,
             role: u.role || 'USER',
             dept: u.department_name || 'Unassigned',
             status: (u.status || 'ACTIVE').toUpperCase(),
             lastLogin: u.last_login ? new Date(u.last_login).toLocaleDateString() : 'N/A',
             initial: `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`,
             color: colors[idx % colors.length]
           }
        })
        setUsers(mappedUsers)
      } catch (e) {
        console.error(e)
        // Fallback to empty if api fails
        setUsers([])
      } finally {
        setIsLoading(false)
      }
    }
    loadUsers()
  }, [page])

  const handleExport = () => {
    toast.success("User directory exported to CSV.")
  }

  const handleAddUser = () => {
    toast.info("User registration terminal active.")
  }

  return (
    <OrganizationAdminChrome>
      <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 min-h-screen font-display bg-[#fcfcfc] text-slate-900">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="">
            <h1 className="text-[32px] font-black tracking-tight text-slate-900 leading-tight">
              Avanzo Personnel
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">
               Manage system access and monitor user activity across the network.
            </p>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={handleExport}
               className="flex items-center gap-3 px-8 py-3 bg-white border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all active:scale-95"
             >
                <Download className="h-4 w-4 text-slate-400 stroke-[3px]" />
                Export
             </button>
             <button 
               onClick={handleAddUser}
               className="flex items-center gap-3 px-10 py-3 bg-violet-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-violet-900/20 hover:bg-violet-700 transition-all active:scale-95"
             >
                <UserPlus className="h-4 w-4 stroke-[3px]" />
                New Access
             </button>
          </div>
        </header>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-[32px] border border-slate-50 shadow-sm flex flex-col md:flex-row items-center gap-4">
           <div className="relative flex-1 w-full md:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                placeholder="Search users by name, email, or ID..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50/50 border-none rounded-2xl pl-12 py-3 text-sm font-medium focus:ring-violet-600/10 transition-all placeholder:text-slate-300"
                type="text"
              />
           </div>
           <div className="flex items-center gap-3 w-full md:w-auto">
              <Select defaultValue="all">
                 <SelectTrigger className="w-full md:w-40 rounded-2xl border-slate-100 bg-white font-black text-[10px] uppercase tracking-widest text-slate-400">
                    <SelectValue placeholder="Status" />
                 </SelectTrigger>
                 <SelectContent className="rounded-2xl border-slate-50 shadow-2xl">
                    <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest p-4">Status: All</SelectItem>
                    <SelectItem value="active" className="text-[10px] font-black uppercase tracking-widest p-4">Active Only</SelectItem>
                    <SelectItem value="inactive" className="text-[10px] font-black uppercase tracking-widest p-4">Inactive</SelectItem>
                 </SelectContent>
              </Select>
              
              <Select defaultValue="admins">
                 <SelectTrigger className="w-full md:w-44 rounded-2xl border-slate-100 bg-white font-black text-[10px] uppercase tracking-widest text-slate-400">
                    <SelectValue placeholder="Role" />
                 </SelectTrigger>
                 <SelectContent className="rounded-2xl border-slate-50 shadow-2xl">
                    <SelectItem value="admins" className="text-[10px] font-black uppercase tracking-widest p-4">Role: Admins</SelectItem>
                    <SelectItem value="employees" className="text-[10px] font-black uppercase tracking-widest p-4">Employees</SelectItem>
                    <SelectItem value="leads" className="text-[10px] font-black uppercase tracking-widest p-4">Team Leads</SelectItem>
                 </SelectContent>
              </Select>

              <Select defaultValue="dept">
                 <SelectTrigger className="w-full md:w-44 rounded-2xl border-slate-100 bg-white font-black text-[10px] uppercase tracking-widest text-slate-400">
                    <SelectValue placeholder="Department" />
                 </SelectTrigger>
                 <SelectContent className="rounded-2xl border-slate-50 shadow-2xl">
                    <SelectItem value="dept" className="text-[10px] font-black uppercase tracking-widest p-4">Department</SelectItem>
                 </SelectContent>
              </Select>
           </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-[40px] border border-slate-50 shadow-sm overflow-hidden flex flex-col min-h-[500px] relative">
           {isLoading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center">
                 <Loader2 className="h-10 w-10 text-violet-600 animate-spin" />
              </div>
           )}
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-slate-50/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                 <tr>
                   <th className="px-10 py-6">User Details</th>
                   <th className="px-10 py-6">Role</th>
                   <th className="px-10 py-6">Department</th>
                   <th className="px-10 py-6">Status</th>
                   <th className="px-10 py-6">Last Login</th>
                   <th className="px-10 py-6 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {users.map((user) => (
                   <tr key={user.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                     <td className="px-10 py-8">
                        <div className="flex items-center gap-5">
                           <div className={`size-12 rounded-xl flex items-center justify-center font-black text-xs ${user.color} shadow-sm group-hover:scale-110 transition-transform`}>
                              {user.initial}
                           </div>
                           <div className="">
                              <p className="font-black text-slate-900 group-hover:text-violet-600 transition-colors tracking-tight">{user.name}</p>
                              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-2 uppercase tracking-widest">
                                 <Mail className="h-3 w-3 stroke-[2.5px]" />
                                 {user.email}
                              </p>
                           </div>
                        </div>
                     </td>
                     <td className="px-10 py-8 text-center sm:text-left">
                        <span className="bg-slate-100/50 text-slate-500 text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-lg border border-slate-100">
                           {user.role}
                        </span>
                     </td>
                     <td className="px-10 py-8">
                        <span className="text-sm font-black text-slate-900">{user.dept}</span>
                     </td>
                     <td className="px-10 py-8">
                        <span className={`text-[10px] font-black flex items-center gap-2 ${user.status === 'ACTIVE' ? 'text-emerald-500' : 'text-slate-400'}`}>
                           <div className={`size-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                           {user.status}
                        </span>
                     </td>
                     <td className="px-10 py-8">
                        <span className="text-xs font-medium text-slate-400 font-medium">{user.lastLogin}</span>
                     </td>
                     <td className="px-10 py-8 text-right">
                        <button className="p-3 text-slate-300 hover:text-slate-900 transition-colors">
                           <MoreVertical className="h-5 w-5" />
                        </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           
           {/* Pagination */}
           <div className="p-8 border-t border-slate-50 flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} Entities
              </p>
              <div className="flex items-center gap-2">
                 <button 
                   disabled={page === 1}
                   onClick={() => setPage(p => Math.max(1, p - 1))}
                   className="p-2 text-slate-300 hover:text-slate-900 disabled:opacity-30 transition-colors"
                 >
                    <ChevronLeft className="h-4 w-4" />
                 </button>
                 
                 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    const isActive = page === pageNum;
                    return (
                      <button 
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`size-8 rounded-lg text-[10px] font-black flex items-center justify-center transition-all ${
                          isActive ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" : "hover:bg-slate-50 text-slate-400"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                 })}

                 <button 
                   disabled={page >= totalPages}
                   onClick={() => setPage(p => p + 1)}
                   className="p-2 text-slate-300 hover:text-slate-900 disabled:opacity-30 transition-colors"
                 >
                    <ChevronRight className="h-4 w-4" />
                 </button>
              </div>
           </div>
        </div>

        {/* Analytics Grid */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { label: "Total Users", value: users.length.toLocaleString(), icon: Shield, color: "text-violet-600 bg-violet-50" },
            { label: "Active Registry", value: users.filter(u => u.status === 'ACTIVE').length.toLocaleString(), icon: Zap, color: "text-emerald-600 bg-emerald-50" },
            { label: "Restricted Units", value: users.filter(u => u.status !== 'ACTIVE').length.toLocaleString(), icon: TriangleAlert, color: "text-orange-600 bg-orange-50" },
          ].map((stat, i) => (
            <div key={i} className="group flex items-center gap-6 p-8 bg-white border border-slate-50 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-violet-900/5 transition-all">
               <div className={`p-6 rounded-2xl ${stat.color} shadow-inner group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-6 w-6 stroke-[2.5px]" />
               </div>
               <div>
                  <p className="text-3xl font-black text-slate-900 leading-none tracking-tight mb-2">{stat.value}</p>
                  <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em] leading-none">{stat.label}</p>
               </div>
            </div>
          ))}
        </section>
      </div>
    </OrganizationAdminChrome>
  )
}
