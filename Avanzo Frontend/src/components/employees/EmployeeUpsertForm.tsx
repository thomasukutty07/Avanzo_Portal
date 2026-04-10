import { useState, useEffect, type FormEvent } from "react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Department, Designation, Role, UserRole } from "@/types"

export type EmployeeRow = {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  employee_id?: string | null
  role?: UserRole | string
  access_role: string
  department?: string | null
  designation?: string | null
  gender?: string | null
  date_of_birth?: string | null
  status: string
  date_of_joining?: string | null
}

type Props = {
  onSuccess: () => void
  onCancel?: () => void
  submitLabel?: string
  initialData?: any | null
}

export function EmployeeUpsertForm({
  onSuccess,
  onCancel,
  submitLabel = "Create employee",
  initialData,
}: Props) {
  const { user } = useAuth()
  const isHr = user?.role === "HR"

  const [roles, setRoles] = useState<Role[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [designations, setDesignations] = useState<Designation[]>([])
  const [teamLeadOptions, setTeamLeadOptions] = useState<any[]>([])
  const [loadingMeta, setLoadingMeta] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [accessRoleId, setAccessRoleId] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [designationId, setDesignationId] = useState("")
  const [gender, setGender] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [dateOfJoining, setDateOfJoining] = useState("")

  useEffect(() => {
    if (initialData) {
      setEmail(initialData.email || "")
      setFirstName(initialData.first_name || "")
      setLastName(initialData.last_name || "")
      setPhone(initialData.phone || "")
      setEmployeeId(initialData.employee_id || "")
      setAccessRoleId(initialData.access_role || "")
      setDepartmentId(initialData.department || "")
      setDesignationId(initialData.designation || "")
      setGender(initialData.gender || "")
      setDateOfBirth(initialData.date_of_birth || "")
      setDateOfJoining(initialData.date_of_joining || "")
    }
  }, [initialData])

  useEffect(() => {
    const load = async () => {
      setLoadingMeta(true)
      try {
        const [r, d, g] = await Promise.all([
          api.get("/api/auth/roles/"),
          api.get("/api/organization/departments/"),
          api.get("/api/organization/designations/"),
        ])
        setRoles(extractResults<Role>(r.data))
        setDepartments(extractResults<Department>(d.data))
        setDesignations(extractResults<Designation>(g.data))
      } catch {
        toast.error("Failed to load form data (check API / login).")
      } finally {
        setLoadingMeta(false)
      }
    }
    load()
  }, [])

  const roleChoices = isHr
    ? roles.filter((r) => r.name !== "Admin" && r.name !== "HR")
    : roles

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !firstName.trim() || !lastName.trim()) {
      toast.error("Email, first and last name are required.")
      return
    }
    if (!accessRoleId) {
      toast.error("Select an access role.")
      return
    }
    if (!initialData && !password) {
      toast.error("Password is required for new accounts.")
      return
    }

    setSubmitting(true)
    try {
      const isEdit = !!initialData?.id

      const payload: any = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || null,
        employee_id: employeeId.trim() || null,
        department: departmentId || null,
        designation: designationId || null,
        gender: gender || null,
        date_of_birth: dateOfBirth || null,
        date_of_joining: dateOfJoining || null,
      }

      // Only include access_role on create — PATCH never changes role
      // (backend validate_access_role rejects non-admin/HR callers)
      if (!isEdit) {
        payload.access_role = accessRoleId
        payload.email = email.trim()
        payload.status = "active"
      }

      if (password) payload.password = password

      if (isEdit) {
        console.log("[EmployeeUpsertForm] PATCH payload:", payload)
        await api.patch(`/api/auth/employees/${initialData.id}/`, payload)
        toast.success(`Updated ${firstName} ${lastName}`)
      } else {
        await api.post("/api/auth/employees/", payload)
        toast.success(`Registered ${firstName} ${lastName}`)
      }
      onSuccess()

    } catch (err: unknown) {
      const data = (err as any)?.response?.data
      console.error("[EmployeeUpsertForm] 400 error response:", data)
      const msg = data ? JSON.stringify(data) : "Could not save employee"
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingMeta) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
      <div className="grid gap-6 sm:grid-cols-2">
        <EliteFormField 
           label="Email address" 
           type="email" 
           placeholder="john@example.com"
           value={email}
           onChange={setEmail}
        />
        <EliteFormField 
           label={`Password ${initialData ? "(leave blank to keep current)" : ""}`} 
           type="password" 
           placeholder="••••••••"
           value={password}
           onChange={setPassword}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2 text-left">
           <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Gender</label>
           <select
             className="w-full h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-violet-600/10 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
             value={gender}
             onChange={(e) => setGender(e.target.value)}
           >
             <option value="">Select Gender</option>
             <option value="male">Male</option>
             <option value="female">Female</option>
             <option value="other">Other</option>
             <option value="prefer_not_to_say">Prefer not to say</option>
           </select>
        </div>
        <EliteFormField 
           label="Date of Birth" 
           type="date" 
           value={dateOfBirth}
           onChange={setDateOfBirth}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <EliteFormField 
           label="Employee ID (optional)" 
           placeholder="EMP-0000"
           value={employeeId}
           onChange={setEmployeeId}
        />
        <EliteFormField 
           label="Phone number" 
           placeholder="+91 00000 00000"
           value={phone}
           onChange={setPhone}
        />
      </div>

      <div className="space-y-2 text-left">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Access Role</label>
        <div className="relative">
          <select
            className="w-full h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-violet-600/10 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
            value={accessRoleId}
            onChange={(e) => setAccessRoleId(e.target.value)}
          >
            <option value="">Select a role</option>
            {roleChoices.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2 text-left">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Department</label>
          <div className="relative">
            <select
              className="w-full h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-violet-600/10 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
        <div className="space-y-2 text-left">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Designation</label>
          <div className="relative">
            <select
              className="w-full h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-violet-600/10 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
              value={designationId}
              onChange={(e) => setDesignationId(e.target.value)}
            >
              <option value="">Select designation</option>
              {designations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <EliteFormField 
           label="First name" 
           placeholder="e.g. John"
           value={firstName}
           onChange={setFirstName}
        />
        <EliteFormField 
           label="Last name" 
           placeholder="e.g. Doe"
           value={lastName}
           onChange={setLastName}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <EliteFormField 
           label="Date of joining" 
           type="date" 
           value={dateOfJoining}
           onChange={setDateOfJoining}
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-6">
        <button 
          type="submit" 
          disabled={submitting}
          className="h-12 px-10 bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-violet-900/10 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-3"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin stroke-[3px]" />}
          {submitLabel}
        </button>
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            className="h-12 px-10 bg-white border border-slate-100 text-slate-500 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

function EliteFormField({ label, placeholder, type = "text", value, onChange }: { label: string, placeholder?: string, type?: string, value: string, onChange: (val: string) => void }) {
  return (
    <div className="space-y-2 text-left animate-in fade-in slide-in-from-bottom-2 duration-500">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-violet-600/10 focus:bg-white transition-all outline-none shadow-sm shadow-slate-900/5 group-hover:scale-[1.01]"
      />
    </div>
  )
}
