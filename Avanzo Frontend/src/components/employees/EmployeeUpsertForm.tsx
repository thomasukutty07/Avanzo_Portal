import { useState, useEffect, type FormEvent } from "react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Department, Designation, Role, UserRole, User } from "@/types"

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
  team_lead?: string | null
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
  const [teamLeadId, setTeamLeadId] = useState("")
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
      setTeamLeadId(initialData.team_lead || "")
      setDateOfJoining(initialData.date_of_joining || "")
    }
  }, [initialData])

  useEffect(() => {
    const load = async () => {
      setLoadingMeta(true)
      try {
        const [r, d, g, empRes] = await Promise.all([
          api.get("/api/auth/roles/"),
          api.get("/api/organization/departments/"),
          api.get("/api/organization/designations/"),
          api.get("/api/auth/employees/"),
        ])
        setRoles(extractResults<Role>(r.data))
        setDepartments(extractResults<Department>(d.data))
        setDesignations(extractResults<Designation>(g.data))
        const emps = extractResults<any>(empRes.data)
        setTeamLeadOptions(
          emps.filter((e: any) => e.role === "Team Lead" || String(e.role).includes("Lead"))
        )
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
      const payload: any = {
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || undefined,
        employee_id: employeeId.trim() || undefined,
        access_role: accessRoleId,
        department: departmentId || null,
        designation: designationId || null,
        team_lead: teamLeadId || null,
        status: "active",
        date_of_joining: dateOfJoining || null,
      }
      if (password) payload.password = password

      if (initialData?.id) {
        await api.patch(`/api/auth/employees/${initialData.id}/`, payload)
        toast.success(`Updated ${firstName} ${lastName}`)
      } else {
        await api.post("/api/auth/employees/", payload)
        toast.success(`Registered ${firstName} ${lastName}`)
      }
      onSuccess()
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response
          ? JSON.stringify((err.response as { data: unknown }).data)
          : "Could not save employee"
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="emp-email">Email address</Label>
          <Input
            id="emp-email"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emp-password">Password {initialData ? "(leave blank to keep current)" : ""}</Label>
          <Input
            id="emp-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="emp-fname">First name</Label>
          <Input
            id="emp-fname"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emp-lname">Last name</Label>
          <Input
            id="emp-lname"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="emp-id">Employee ID (Optional)</Label>
          <Input
            id="emp-id"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emp-phone">Phone number</Label>
          <Input
            id="emp-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="emp-role">Access role</Label>
        <select
          id="emp-role"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="emp-dept">Department</Label>
          <select
            id="emp-dept"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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
        </div>
        <div className="space-y-2">
          <Label htmlFor="emp-desig">Designation</Label>
          <select
            id="emp-desig"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="emp-tl">Team lead (optional)</Label>
          <select
            id="emp-tl"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={teamLeadId}
            onChange={(e) => setTeamLeadId(e.target.value)}
          >
            <option value="">None</option>
            {teamLeadOptions.map((tl) => (
              <option key={tl.id} value={tl.id}>
                {tl.first_name} {tl.last_name} ({tl.email})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="emp-doj">Date of joining</Label>
          <Input
            id="emp-doj"
            type="date"
            value={dateOfJoining}
            onChange={(e) => setDateOfJoining(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
