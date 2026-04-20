import { useState, useEffect, type FormEvent } from "react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import { Loader2, User, Building2, Briefcase, Phone, Mail, Lock, Calendar, Shield, CreditCard } from "lucide-react"
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
  submitLabel = "Create Employee",
  initialData,
}: Props) {
  const { user } = useAuth()
  const isHr = user?.role === "HR"

  const [roles, setRoles] = useState<Role[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [designations, setDesignations] = useState<Designation[]>([])
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

      if (!isEdit) {
        payload.access_role = accessRoleId
        payload.email = email.trim()
        payload.status = "active"
      }

      if (password) payload.password = password

      if (isEdit) {
        await api.patch(`/api/auth/employees/${initialData.id}/`, payload)
        toast.success(`Updated ${firstName} ${lastName}`)
      } else {
        await api.post("/api/auth/employees/", payload)
        toast.success(`Registered ${firstName} ${lastName}`)
      }
      onSuccess()

    } catch (err: unknown) {
      const data = (err as any)?.response?.data
      const msg = data ? JSON.stringify(data) : "Could not save employee"
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingMeta) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Loading Registry...</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="animate-in fade-in duration-500">
      {/* Form Header */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          {initialData ? "Edit Personnel Record" : "Register New Employee"}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {initialData ? "Update the employee's details below." : "Fill in the details to onboard a new team member."}
        </p>
      </div>

      <div className="space-y-6">
        {/* ── All fields in a dense 3-column layout ── */}
        <Section label="Personal Information" icon={User}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field icon={User} label="First Name" placeholder="John" value={firstName} onChange={setFirstName} />
            <Field icon={User} label="Last Name" placeholder="Doe" value={lastName} onChange={setLastName} />
            <Field icon={Mail} label="Work Email" type="email" placeholder="john@company.com" value={email} onChange={setEmail} disabled={!!initialData} />
            <Field icon={Lock} label={initialData ? "New Password (optional)" : "Password"} type="password" placeholder="••••••••" value={password} onChange={setPassword} />
          </div>
        </Section>

        <Section label="Organizational Details" icon={Building2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SelectField icon={Building2} label="Department" value={departmentId} onChange={setDepartmentId} options={departments.map(d => ({ value: d.id, label: d.name }))} placeholder="Select department" />
            <SelectField icon={Briefcase} label="Designation" value={designationId} onChange={setDesignationId} options={designations.map(d => ({ value: d.id, label: d.name }))} placeholder="Select designation" />
            <SelectField icon={Shield} label="Access Role" value={accessRoleId} onChange={setAccessRoleId} options={roleChoices.map(r => ({ value: r.id, label: r.name }))} placeholder="Select role" />
            <Field icon={CreditCard} label="Employee ID" placeholder="AVZ-001" value={employeeId} onChange={setEmployeeId} />
          </div>
        </Section>

        <Section label="Personal Details" icon={Calendar}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SelectField icon={User} label="Gender" value={gender} onChange={setGender} options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
              { value: 'prefer_not_to_say', label: 'Prefer not to say' },
            ]} placeholder="Select gender" />
            <Field icon={Phone} label="Mobile Number" placeholder="+91 00000 00000" value={phone} onChange={setPhone} />
            <Field icon={Calendar} label="Date of Birth" type="date" value={dateOfBirth} onChange={setDateOfBirth} />
            <Field icon={Calendar} label="Joining Date" type="date" value={dateOfJoining} onChange={setDateOfJoining} />
          </div>
        </Section>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-6 border-t border-slate-100 mt-6">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all disabled:opacity-60 shadow-lg shadow-slate-900/10"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-8 py-3 bg-white border border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

/* ── Sub-components ──────────────────────────────────────── */

function Section({ label, icon: Icon, children }: { label: string, icon: any, children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
          <Icon size={14} className="text-slate-400" />
        </div>
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">{label}</h3>
        <div className="flex-1 h-px bg-slate-100" />
      </div>
      {children}
    </div>
  )
}

function Field({ label, placeholder, type = "text", value, onChange, icon: Icon, disabled }: {
  label: string, placeholder?: string, type?: string, value: string,
  onChange: (val: string) => void, icon?: any, disabled?: boolean
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
            <Icon size={14} />
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-slate-300 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  )
}

function SelectField({ label, value, onChange, options, placeholder, icon: Icon }: {
  label: string, value: string, onChange: (val: string) => void,
  options: { value: string, label: string }[], placeholder: string, icon?: any
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
            <Icon size={14} />
          </div>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-10 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-300 focus:outline-none transition-all appearance-none cursor-pointer"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-4">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>
  )
}
