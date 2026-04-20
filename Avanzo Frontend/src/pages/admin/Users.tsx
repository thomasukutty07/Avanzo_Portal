import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
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
  Mail,
  Loader2,
  Eye,
  Edit2,
  UserX,
  User
} from "lucide-react"
import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import { api } from "@/lib/axios"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogHeader
} from "@/components/ui/alert-dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [userToRevoke, setUserToRevoke] = useState<any | null>(null)
  
  const navigate = useNavigate()
  const PAGE_SIZE = 50 
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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
           "bg-indigo-500",
           "bg-orange-500",
           "bg-emerald-500",
           "bg-violet-500"
         ];
         return {
           id: u.id,
           name: `${u.first_name} ${u.last_name || ''}`,
           email: u.email,
           role: u.role || 'Personnel',
           dept: u.department_name || 'General',
           status: (u.status || 'ACTIVE').toUpperCase(),
           lastLogin: u.last_login ? new Date(u.last_login).toLocaleDateString() : 'N/A',
           initial: `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`,
           color: colors[idx % colors.length]
         }
      })
      setUsers(mappedUsers)
    } catch (e) {
      toast.error("Process interrupted while fetching data.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [page])

  const handleExport = () => {
    if (users.length === 0) {
      toast.error("No records found for export.");
      return;
    }
    const headers = "Name,Email,Role,Department,Status\n";
    const csvContent = users.map(u => 
      `"${u.name}","${u.email}","${u.role}","${u.dept}","${u.status}"`
    ).join("\n");
    const blob = new Blob([headers + csvContent], { type: 'text/csv' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `corporate_users_list.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Personnel directory exported");
  }

  return (
    <OrganizationAdminChrome>
      <div className="p-8 space-y-8 animate-in fade-in duration-500 min-h-screen bg-[#fcfcfc]">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Personnel</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Administrate user access and organizational roles.</p>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={handleExport}
               className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
             >
                <Download size={14} /> Export CSV
             </button>
             <button 
               onClick={() => navigate('/admin/register-employee')}
               className="flex items-center gap-2 px-8 py-2.5 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-700 transition-all shadow-sm shadow-violet-200"
             >
                <UserPlus size={14} /> Add User
             </button>
          </div>
        </header>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
           <div className="relative flex-1 w-full md:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input 
                placeholder="Search staff by name or email..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50/50 border border-transparent rounded-xl pl-11 py-2.5 text-sm font-medium focus:bg-white focus:border-violet-200 transition-all outline-none"
                type="text"
              />
           </div>
           <div className="flex items-center gap-2 w-full md:w-auto">
              <Select defaultValue="all">
                 <SelectTrigger className="w-full md:w-40 rounded-xl border-slate-200 bg-white font-semibold text-xs text-slate-500">
                    <SelectValue placeholder="Status" />
                 </SelectTrigger>
                 <SelectContent className="rounded-xl shadow-xl">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                 </SelectContent>
              </Select>
              <Select defaultValue="all">
                 <SelectTrigger className="w-full md:w-44 rounded-xl border-slate-200 bg-white font-semibold text-xs text-slate-500">
                    <SelectValue placeholder="Access Role" />
                 </SelectTrigger>
                 <SelectContent className="rounded-xl shadow-xl">
                    <SelectItem value="all">All Roles</SelectItem>
                 </SelectContent>
              </Select>
           </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
           {isLoading && (
              <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center backdrop-blur-[1px]">
                 <Loader2 className="size-8 text-violet-600 animate-spin" />
              </div>
           )}
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100 font-semibold text-slate-500 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="px-8 py-5">Personnel Detail</th>
                    <th className="px-8 py-5">Assigned Role</th>
                    <th className="px-8 py-5">Department</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map((user) => (
                    <tr 
                      key={user.id} 
                      onClick={() => navigate(`/employees/${user.id}`)}
                      className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                    >
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-4">
                            <div className={`size-10 rounded-xl flex items-center justify-center font-bold text-white text-xs ${user.color} shadow-sm transition-transform group-hover:scale-105`}>
                               {user.initial}
                            </div>
                            <div>
                               <p className="font-bold text-slate-900 text-sm group-hover:text-violet-600 transition-colors">{user.name}</p>
                               <div className="flex items-center gap-1.5 mt-0.5">
                                  <Mail size={12} className="text-slate-300" />
                                  <p className="text-[11px] text-slate-500 font-medium">{user.email}</p>
                               </div>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg">
                            {user.role}
                         </span>
                      </td>
                      <td className="px-8 py-6 text-xs font-bold text-slate-900">{user.dept}</td>
                      <td className="px-8 py-6">
                         <Badge className={`rounded-xl px-3 py-1 text-[9px] font-bold border-none shadow-none uppercase tracking-wide ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                            {user.status}
                         </Badge>
                      </td>
                      <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                               <MoreVertical size={18} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 rounded-xl p-2 shadow-xl border-slate-100">
                             <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 py-2">Account Actions</DropdownMenuLabel>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem 
                                onClick={() => navigate(`/employees/${user.id}`)}
                                className="rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                             >
                                <Eye size={14} className="text-slate-400" /> View Entry
                             </DropdownMenuItem>
                             <DropdownMenuItem 
                                onClick={() => navigate(`/employees/${user.id}`)}
                                className="rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                             >
                                <Edit2 size={14} className="text-slate-400" /> Edit Permissions
                             </DropdownMenuItem>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem 
                                onClick={() => setUserToRevoke(user)}
                                className="rounded-xl px-3 py-2 text-xs font-semibold text-red-600 flex items-center gap-2 cursor-pointer hover:bg-red-50 transition-colors"
                             >
                                <UserX size={14} className="text-red-600" /> Terminate Access
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>

           {/* Pagination */}
           <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
              <p className="text-xs font-medium text-slate-400">
                Displaying {((page - 1) * PAGE_SIZE) + 1}-{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} Records
              </p>
              <div className="flex items-center gap-1">
                 <button 
                   disabled={page === 1}
                   onClick={() => setPage(p => Math.max(1, p - 1))}
                   className="p-2 text-slate-300 hover:text-slate-600 disabled:opacity-30 transition-colors"
                 >
                    <ChevronLeft size={16} />
                 </button>
                 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                    <button 
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`size-8 rounded-lg font-bold text-xs transition-all ${page === i + 1 ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                      {i + 1}
                    </button>
                 ))}
                 <button 
                   disabled={page === totalPages}
                   onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                   className="p-2 text-slate-300 hover:text-slate-600 disabled:opacity-30 transition-colors"
                 >
                    <ChevronRight size={16} />
                 </button>
              </div>
           </div>
        </div>

        {/* Access Revocation Confirmation */}
        <AlertDialog open={!!userToRevoke} onOpenChange={(open) => !open && setUserToRevoke(null)}>
          <AlertDialogContent className="max-w-md rounded-2xl border-none p-0 bg-white shadow-2xl overflow-hidden">
            <div className="p-8">
              <AlertDialogHeader className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                    <UserX size={20} />
                  </div>
                  <div>
                    <AlertDialogTitle className="text-xl font-bold text-slate-900 tracking-tight">Revoke Access</AlertDialogTitle>
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mt-0.5">Action Required</p>
                  </div>
                </div>
                <AlertDialogDescription className="text-sm font-medium text-slate-500 leading-relaxed">
                  Confirm deactivation for <span className="text-slate-900 font-bold">{userToRevoke?.name}</span>? Access to all organizational systems will be terminated immediately.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>
            
            <div className="bg-slate-50 px-8 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <AlertDialogCancel className="h-10 px-6 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-all outline-none">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={async () => {
                   if (!userToRevoke) return;
                   try {
                     await api.delete(`/api/auth/employees/${userToRevoke.id}/`)
                     toast.success("User access revoked successfully")
                     loadUsers()
                   } catch (e) {
                     toast.error("Process failed.")
                   } finally {
                     setUserToRevoke(null)
                   }
                }}
                className="h-10 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-sm transition-all outline-none border-none ring-0"
              >
                Revoke Access
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </OrganizationAdminChrome>
  )
}
