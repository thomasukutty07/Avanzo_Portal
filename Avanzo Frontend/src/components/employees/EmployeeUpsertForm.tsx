import { useState, useEffect, type FormEvent } from "react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  team_lead?: string | null
  status: string
  date_of_joining?: string | null
}

type Props = {
  onSuccess: () => void
  onCancel?: () => void
  submitLabel?: string
}

export function EmployeeUpsertForm({
  onSuccess,
  onCancel,
  submitLabel = "Create employee",
}: Props) {
  const { user } = useAuth()
  const isHr = user?.role === "HR"

  const [roles, setRoles] = useState<Role[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [designations, setDesignations] = useState<Designation[]>([])
  const [teamLeadOptions, setTeamLeadOptions] = useState<EmployeeRow[]>([])
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
        const emps = extractResults<EmployeeRow>(empRes.data)
        setTeamLeadOptions(
          emps.filter((e) => e.role === "Team Lead" || String(e.role).includes("Lead"))
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
    if (!email.trim() || !password || !firstName.trim() || !lastName.trim()) {
      toast.error("Email, password, first and last name are required.")
      return
    }
    if (!accessRoleId) {
      toast.error("Select an access role.")
      return
    }
    setSubmitting(true)
    try {
      await api.post("/api/auth/employees/", {
        email: email.trim(),
        password,
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
      })
      toast.success(`Registered ${firstName} ${lastName}`)
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
          : "Could not create employee"
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingMeta) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="emp-email">Work email</Label>
          <Input
            id="emp-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emp-password">Temporary password</Label>
          <Input
            id="emp-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emp-fn">First name</Label>
          <Input
            id="emp-fn"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emp-ln">Last name</Label>
          <Input
            id="emp-ln"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emp-phone">Phone</Label>
          <Input
            id="emp-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emp-eid">Employee ID (optional)</Label>
          <Input
            id="emp-eid"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="Leave blank to auto-assign"
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
          required
        >
          <option value="">Select role…</option>
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
            <option value="">None</option>
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
            <option value="">None</option>
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
