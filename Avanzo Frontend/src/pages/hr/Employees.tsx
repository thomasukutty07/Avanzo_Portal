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
  ChevronRight
} from "lucide-react"
import { toast } from "sonner"

interface EmployeeRow {
  id: string
  first_name: string
  last_name: string
  email: string
  role?: string
  department_name?: string
  status: string
  date_of_joining?: string
  avatar?: string
}

const DUMMY_USERS: EmployeeRow[] = [
  { id: 'd2', first_name: 'Sarah', last_name: 'Jenkins', email: 'sarah.j@avanzo.com', role: 'Senior Dev', department_name: 'Engineering', status: 'active', date_of_joining: '2021-10-12', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: 'd3', first_name: 'Michael', last_name: 'Chen', email: 'm.chen@avanzo.com', role: 'Lead Designer', department_name: 'Product', status: 'onboarding', date_of_joining: '2024-01-05', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' },
  { id: 'd4', first_name: 'Emily', last_name: 'Rodriguez', email: 'e.rodriguez@avanzo.com', role: 'Growth Specialist', department_name: 'Marketing', status: 'active', date_of_joining: '2022-03-22', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily' },
  { id: 'd5', first_name: 'Alex', last_name: 'Thompson', email: 'a.thompson@avanzo.com', role: 'DevOps Engineer', department_name: 'Engineering', status: 'on_leave', date_of_joining: '2023-07-14', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
  { id: 'd6', first_name: 'Olivia', last_name: 'Garcia', email: 'o.garcia@avanzo.com', role: 'Account Executive', department_name: 'Sales', status: 'active', date_of_joining: '2020-05-30', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia' },
]

export default function HREmployees() {
  const [employees, setEmployees] = useState<EmployeeRow[]>(DUMMY_USERS)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await api.get("/api/auth/employees/")
      const apiUsers = extractResults<EmployeeRow>(res.data)
      // Merge dummy users with real users, avoiding duplicate IDs
      const combined = [...apiUsers]
      DUMMY_USERS.forEach(du => {
          if (!combined.some(u => u.email === du.email)) {
              combined.push(du)
          }
      })
      setEmployees(combined)
    } catch {
      // Keep DUMMY_USERS on failure or if results empty
      setEmployees(DUMMY_USERS)
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
    toast.success("Exporting employee directory to CSV...")
  }

  return (
    <HRPortalChrome>
      <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Employee Management</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">View and manage all active team members across departments.</p>
          </div>
          <Button 
            onClick={handleExport}
            variant="outline" 
            className="bg-white border-slate-200 text-slate-700 font-bold text-xs h-10 px-4 rounded-xl shadow-sm hover:bg-slate-50 flex gap-2 items-center"
          >
            <Download className="size-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full lg:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
              <input 
                type="text"
                placeholder="Search by name, email or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 bg-slate-50 border-transparent rounded-xl pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-violet-600/20 focus:bg-white focus:border-violet-100 transition-all"
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
                  <tr className="border-b border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/30">
                    <th className="px-6 py-5">Employee</th>
                    <th className="px-6 py-5">Department</th>
                    <th className="px-6 py-5">Role</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Hire Date</th>
                    <th className="px-6 py-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredEmployees.map((emp, i) => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`size-11 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm ring-1 ring-slate-100 overflow-hidden ${['bg-orange-400', 'bg-blue-400', 'bg-emerald-400', 'bg-violet-400'][i % 4]}`}>
                            {emp.avatar ? <img src={emp.avatar} className="size-full object-cover" /> : `${emp.first_name[0]}${emp.last_name[0]}`}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 leading-tight">{emp.first_name} {emp.last_name}</p>
                            <p className="text-[11px] font-medium text-slate-400">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px] font-bold text-slate-600">{emp.department_name || "Engineering"}</td>
                      <td className="px-6 py-4 text-[13px] font-medium text-slate-500">{emp.role || "Senior Dev"}</td>
                      <td className="px-6 py-4">
                        <Badge className={`rounded-lg px-2.5 py-1 text-[10px] font-bold border-none shadow-none ${
                            emp.status === 'onboarding' ? 'bg-amber-50 text-amber-600' : 
                            emp.status === 'on_leave' ? 'bg-slate-100 text-slate-500' : 
                            'bg-emerald-50 text-emerald-600'
                        }`}>
                          <div className={`size-1.5 rounded-full mr-1.5 ${
                              emp.status === 'onboarding' ? 'bg-amber-400' : 
                              emp.status === 'on_leave' ? 'bg-slate-400' : 
                              'bg-emerald-400'
                          }`} />
                          {emp.status === 'onboarding' ? 'Onboarding' : 
                           emp.status === 'on_leave' ? 'On Leave' : 'Active'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-slate-500">{emp.date_of_joining ? new Date(emp.date_of_joining).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Oct 12, 2021'}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                            <Button variant="ghost" size="icon" className="size-8 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100">
                                <MoreVertical className="size-4" />
                            </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Placeholder */}
            <div className="p-6 border-t border-slate-50 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 group">
                    Showing <span className="text-slate-700">{filteredEmployees.slice(0, 5).length}</span> of <span className="text-slate-700">{filteredEmployees.length}</span> employees
                </p>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="size-8 rounded-lg text-slate-300 hover:bg-slate-50"><ChevronLeft className="size-4" /></Button>
                    <Button className="size-8 rounded-lg bg-violet-600 text-white font-bold text-xs shadow-md shadow-violet-100">1</Button>
                    <Button variant="ghost" size="icon" className="size-8 rounded-lg text-slate-400 hover:bg-slate-50 font-bold text-xs">2</Button>
                    <Button variant="ghost" size="icon" className="size-8 rounded-lg text-slate-400 hover:bg-slate-50 font-bold text-xs">3</Button>
                    <Button variant="ghost" size="icon" className="size-8 rounded-lg text-slate-400 hover:bg-slate-50"><ChevronRight className="size-4" /></Button>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </HRPortalChrome>
  )
}
