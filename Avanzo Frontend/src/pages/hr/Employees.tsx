import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import { HRPortalChrome } from "@/components/portal/hr/HRPortalChrome"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Download, 
  RotateCw, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight,
  User,
  Edit2,
  UserX,
  Lock as LockIcon
} from "lucide-react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { EmployeeUpsertForm } from "@/components/employees/EmployeeUpsertForm"

interface EmployeeRow {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  employee_id?: string | null
  role?: string
  access_role?: string | null
  department?: string | null
  department_name?: string
  designation?: string | null
  designation_name?: string
  team_lead?: string | null
  status: string
  date_of_joining?: string | null
  avatar?: string
}

export default function HREmployees() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState<EmployeeRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRow | null>(null)
  const [modalType, setModalType] = useState<'view' | 'edit' | 'create' | null>(null)
  const [revokeEmployee, setRevokeEmployee] = useState<EmployeeRow | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6


  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await api.get("/api/auth/employees/")
      const apiUsers = extractResults<EmployeeRow>(res.data)
      setEmployees(apiUsers)
    } catch {
      setEmployees([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filteredEmployees = employees.filter(emp => 
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.role || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

    const handleExport = () => {
    if (filteredEmployees.length === 0) {
      toast.error("No employees to export.");
      return;
    }
    const headers = "Name,Email,Department,Role,Status,Joining Date\n";
    const csvContent = filteredEmployees.map(e => 
      `"${e.first_name} ${e.last_name}","${e.email}","${e.department_name || ''}","${e.role || ''}","${e.status}","${e.date_of_joining || ''}"`
    ).join("\n");
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "employees_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Employee directory exported to CSV!");
  }

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <HRPortalChrome>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Employee Directory</h1>
            <p className="text-sm font-medium text-slate-500 mt-2">View and manage all active, onboarding, and off-duty employees.</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleExport}
              variant="outline" 
              className="bg-white border-slate-200 text-slate-700 font-bold text-xs h-10 px-4 rounded-xl shadow-sm hover:bg-slate-50 flex gap-2 items-center"
            >
              <Download className="size-4" />
              Export CSV
            </Button>
            <Button
              onClick={() => navigate('/employee-registration')}
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-md shadow-violet-200 flex gap-2 items-center"
            >
              <User className="size-4" />
              New Employee
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full lg:max-w-md group font-headline">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
              <input 
                type="text"
                placeholder="Search by name, email or role..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full h-11 bg-slate-50 border-transparent rounded-xl pl-11 pr-4 text-[13px] font-black text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:bg-white focus:border-violet-100 transition-all placeholder:text-slate-300 uppercase tracking-tight"
              />
            </div>
            
            <div className="flex items-center gap-3 w-full lg:w-auto">
                <select className="h-11 bg-slate-50 border-transparent rounded-xl px-4 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-violet-600/20 outline-none w-full lg:w-48 appearance-none cursor-pointer hover:bg-slate-100 transition-colors">
                    <option>All Departments</option>
                    <option>Engineering</option>
                    <option>Design</option>
                    <option>Marketing</option>
                    <option>Sales</option>
                </select>
                <select className="h-11 bg-slate-50 border-transparent rounded-xl px-4 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-violet-600/20 outline-none w-full lg:w-40 appearance-none cursor-pointer hover:bg-slate-100 transition-colors">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Onboarding</option>
                    <option>On Leave</option>
                </select>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={load}
                    className="h-11 w-11 rounded-xl text-slate-400 hover:text-violet-600 hover:bg-violet-50"
                >
                    <RotateCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </div>
        </div>

        {/* Table Section */}
        <Card className="border-none shadow-premium rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/20 font-headline">
                    <th className="px-8 py-5">Employee</th>
                    <th className="px-8 py-5">Department</th>
                    <th className="px-8 py-5">Designation</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Joining Date</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedEmployees.map((emp, i) => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-6 font-headline">
                        <div className="flex items-center gap-4">
                          <div className={`size-11 rounded-xl flex items-center justify-center text-white font-black border-2 border-white shadow-sm ring-1 ring-slate-100 overflow-hidden uppercase italic ${['bg-orange-400', 'bg-blue-400', 'bg-emerald-400', 'bg-violet-400'][i % 4]}`}>
                            {emp.avatar ? <img src={emp.avatar} className="size-full object-cover" /> : `${emp.first_name[0]}${emp.last_name[0]}`}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-slate-900 leading-tight tracking-tight">{emp.first_name} {emp.last_name}</p>
                            <p className="text-[11px] font-black text-slate-300 mt-1 lowercase tracking-wide">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-[12px] font-black text-slate-600 uppercase tracking-tight italic font-headline">{emp.department_name || "Engineering"}</td>
                      <td className="px-8 py-6 text-[12px] font-black text-slate-500 lowercase tracking-tight font-headline">{emp.role || "Senior Dev"}</td>
                      <td className="px-8 py-6 font-headline">
                        <Badge className={`rounded-xl px-3 py-1 text-[9px] font-black border-none shadow-none uppercase tracking-widest ${
                            emp.status === 'onboarding' ? 'bg-amber-50 text-amber-600' : 
                            emp.status === 'on_leave' ? 'bg-slate-100 text-slate-500' : 
                            'bg-emerald-50 text-emerald-600'
                        }`}>
                          <div className={`size-1.5 rounded-full mr-2 ${
                              emp.status === 'onboarding' ? 'bg-amber-400' : 
                              emp.status === 'on_leave' ? 'bg-slate-400' : 
                              'bg-emerald-400'
                          }`} />
                          {emp.status === 'onboarding' ? 'Onboarding' : 
                           emp.status === 'on_leave' ? 'On Leave' : 'Active'}
                        </Badge>
                      </td>
                      <td className="px-8 py-6 text-[12px] font-black text-slate-400 tabular-nums font-headline italic uppercase tracking-tighter">{emp.date_of_joining ? new Date(emp.date_of_joining).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Feb 04, 2026'}</td>
                      <td className="px-8 py-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-9 rounded-xl text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                                <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-xl border-slate-100 font-headline">
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer focus:bg-violet-50 focus:text-violet-700 transition-colors"
                              onClick={() => {
                                setSelectedEmployee(emp)
                                setModalType('view')
                              }}
                            >
                              <User className="size-3.5" /> View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer focus:bg-violet-50 focus:text-violet-700 transition-colors"
                              onClick={() => {
                                setSelectedEmployee(emp)
                                setModalType('edit')
                              }}
                            >
                              <Edit2 className="size-3.5" /> Edit Employee
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="rounded-xl px-3 py-2.5 text-xs font-bold text-red-600 flex items-center gap-2 cursor-pointer focus:bg-red-50 focus:text-red-700 transition-colors"
                              onClick={() => setRevokeEmployee(emp)}
                            >
                              <UserX className="size-3.5" /> Disable Access
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
            <div className="p-6 border-t border-slate-50 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 group">
                    Showing <span className="text-slate-700">{Math.min(filteredEmployees.length, (currentPage - 1) * itemsPerPage + 1)}</span> to <span className="text-slate-700">{Math.min(filteredEmployees.length, currentPage * itemsPerPage)}</span> of <span className="text-slate-700">{filteredEmployees.length}</span> employees
                </p>
                <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" size="icon" 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="size-8 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-30">
                        <ChevronLeft className="size-4" />
                    </Button>
                    {[...Array(totalPages)].map((_, idx) => (
                      <Button 
                        key={idx}
                        variant="ghost"
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`size-8 rounded-lg font-bold text-xs ${currentPage === idx + 1 ? 'bg-violet-600 text-white shadow-md shadow-violet-100' : 'text-slate-400 hover:bg-slate-50'}`}
                      >
                        {idx + 1}
                      </Button>
                    ))}
                    <Button 
                      variant="ghost" size="icon" 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="size-8 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-30">
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Employee Detail/Edit Sheet */}
        <Sheet open={!!modalType} onOpenChange={(open) => !open && setModalType(null)}>
          <SheetContent side="right" className="w-full sm:max-w-xl p-0 border-l border-slate-100 font-display">
            <div className="h-full flex flex-col bg-white">
              <SheetHeader className="p-8 border-b border-slate-50 bg-[#fcfcfc] font-headline">
                <SheetTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-violet-600 text-white flex items-center justify-center">
                    {modalType === 'view' ? <User size={20} /> : <Edit2 size={20} />}
                  </div>
                  {modalType === 'view' ? 'Employee Profile' : modalType === 'edit' ? 'Edit Employee' : 'Add New Employee'}
                </SheetTitle>
                {selectedEmployee && (
                  <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest leading-none">
                    {selectedEmployee?.first_name} {selectedEmployee?.last_name} | {selectedEmployee?.email}
                  </p>
                )}
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto p-8">
                {modalType === 'view' && selectedEmployee && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <section className="space-y-4">
                      <h4 className="text-[10px] font-black text-violet-600 tracking-[0.2em] mb-4">Identification</h4>
                      <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <ProfileItem label="Full Name" value={`${selectedEmployee.first_name} ${selectedEmployee.last_name}`} />
                        <ProfileItem label="Email" value={selectedEmployee.email} />
                        <ProfileItem label="Department" value={selectedEmployee.department_name || "Engineering"} />
                        <ProfileItem label="Designation" value={selectedEmployee.role || "Senior Dev"} />
                        <ProfileItem label="Joining Date" value={selectedEmployee.date_of_joining || "Oct 12, 2021"} />
                        <ProfileItem label="Status" value={selectedEmployee.status.toUpperCase()} />
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h4 className="text-[10px] font-black text-violet-600 tracking-[0.2em] mb-4">Account Status</h4>
                      <div className="p-6 rounded-2xl border-2 border-dashed border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-400">Portal Permissions</p>
                          <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg text-[9px] font-black tracking-widest">Active Access</Badge>
                        </div>
                        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-600 w-full" />
                        </div>
                        <p className="text-[10px] font-medium text-slate-400 italic">User account is active and verified.</p>
                      </div>
                    </section>
                  </div>
                )}

                {modalType === 'edit' && selectedEmployee && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                     <EmployeeUpsertForm 
                        initialData={{
                          ...selectedEmployee,
                          access_role: selectedEmployee.access_role // Ensure this is mapped correctly
                        } as any}
                        onSuccess={() => {
                          setModalType(null)
                          load()
                        }}
                        onCancel={() => setModalType(null)}
                        submitLabel="Save Changes"
                     />
                  </div>
                )}
                

              </div>
              
              {modalType === 'view' && (
                <div className="p-8 border-t border-slate-50 bg-[#fcfcfc] flex gap-3">
                  <Button 
                    className="flex-1 h-12 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                    onClick={() => setModalType('edit')}
                  >
                    <Edit2 size={16} /> Edit Employee
                  </Button>
                  <Button 
                    variant="outline"
                    className="h-12 w-12 rounded-xl border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all active:scale-95"
                    onClick={() => {
                      setRevokeEmployee(selectedEmployee)
                      setModalType(null)
                    }}
                  >
                    <UserX size={18} />
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Access Revocation Confirmation */}
        <AlertDialog open={!!revokeEmployee} onOpenChange={(open) => !open && setRevokeEmployee(null)}>
          <AlertDialogContent className="max-w-md rounded-2xl border border-slate-100 p-0 bg-white shadow-xl overflow-hidden font-display gap-0">
            <div className="p-6">
              <AlertDialogHeader className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="size-12 shrink-0 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-inner">
                    <UserX size={20} className="stroke-[2.5px]" />
                  </div>
                  <div className="space-y-1 text-left">
                    <AlertDialogTitle className="text-xl font-bold text-slate-900 tracking-tight font-headline m-0">
                      Disable Account
                    </AlertDialogTitle>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.15em] leading-none">Account Access</p>
                  </div>
                </div>
                <AlertDialogDescription className="text-sm font-medium text-slate-500 leading-relaxed text-left">
                  You are about to disable account access for <span className="text-slate-900 font-bold">{revokeEmployee?.first_name} {revokeEmployee?.last_name}</span>. This will log them out of all devices and prevent further access.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>
            
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <AlertDialogCancel className="mt-0 h-10 px-5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-xs font-bold transition-all outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={async () => {
                  if (!revokeEmployee) return;
                  try {
                    await api.delete(`/api/auth/employees/${revokeEmployee.id}/`)
                    toast.success(`Account access disabled for ${revokeEmployee?.first_name}.`)
                    load()
                  } catch (e) {
                    toast.error("Failed to disable access.")
                  } finally {
                    setRevokeEmployee(null)
                  }
                }}
                className="h-10 px-5 rounded-xl bg-red-600 hover:bg-red-700 outline-none text-white text-xs font-bold shadow-sm shadow-red-200 transition-all border-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                Disable Access
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </HRPortalChrome>
  )
}

function ProfileItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-900 tracking-tight font-headline">{value}</p>
    </div>
  )
}
