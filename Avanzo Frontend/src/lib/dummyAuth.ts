import type { User, UserRole } from "@/types"

/** Sentinel tokens stored when mock auth is used (not valid JWTs). */
export const DUMMY_ACCESS_TOKEN = "dummy-dev-access-token"
export const DUMMY_REFRESH_TOKEN = "dummy-dev-refresh-token"
export const DUMMY_USER_STORAGE_KEY = "avanzo_dummy_user_json"

/** Single password for all demo accounts (local / demo only). */
export const DUMMY_SHARED_PASSWORD = "AvanzoPortal2026!"

export type DummyAccount = {
  email: string
  role: UserRole
  label: string
  firstName: string
  lastName: string
  /** Shown on /me; drives security vs technical portal routing for Employee. */
  department_name?: string
  designation_name?: string
}

/**
 * Demo logins — use with VITE_DUMMY_AUTH=true (see .env.example).
 * Email match is case-insensitive.
 */
export const DUMMY_ACCOUNTS: DummyAccount[] = [
  {
    email: "superadmin@demo.avanzo",
    role: "Super Admin",
    label: "Super Admin",
    firstName: "Sage",
    lastName: "SuperAdmin",
  },
  {
    email: "organization@demo.avanzo",
    role: "Organization",
    label: "Organization (tenant owner)",
    firstName: "Morgan",
    lastName: "OrgOwner",
  },
  {
    email: "hr@demo.avanzo",
    role: "HR",
    label: "HR",
    firstName: "Jordan",
    lastName: "Patel",
  },
  {
    email: "teamlead@demo.avanzo",
    role: "Team Lead",
    label: "Team Lead",
    firstName: "Casey",
    lastName: "Nguyen",
  },

  {
    email: "cybersecurity@demo.avanzo",
    role: "Employee",
    label: "Employee (cybersecurity)",
    firstName: "Skye",
    lastName: "Malik",
    department_name: "Cybersecurity",
    designation_name: "Security Analyst",
  },
  {
    email: "technical@demo.avanzo",
    role: "Employee",
    label: "Employee (technical)",
    firstName: "Devon",
    lastName: "Park",
    department_name: "Technical Engineering",
    designation_name: "Software Engineer",
  },
]

export function isDummyAuthEnabled(): boolean {
  return import.meta.env.VITE_DUMMY_AUTH === "true"
}

export function findDummyAccount(
  emailNormalized: string
): DummyAccount | undefined {
  return DUMMY_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === emailNormalized.toLowerCase()
  )
}

export function tryDummyLogin(
  email: string,
  password: string
): User | null {
  if (!isDummyAuthEnabled()) return null
  const trimmed = email.trim()
  if (!trimmed) return null
  if (password !== DUMMY_SHARED_PASSWORD) return null
  const account = findDummyAccount(trimmed.toLowerCase())
  if (!account) return null
  return buildDummyUser(account)
}

export function buildDummyUser(account: DummyAccount): User {
  const id = `dummy-${account.role.replace(/\s+/g, "-").toLowerCase()}-${account.email}`
  return {
    id,
    email: account.email,
    first_name: account.firstName,
    last_name: account.lastName,
    status: "active",
    role: account.role,
    department_name: account.department_name ?? "Demo Department",
    designation_name: account.designation_name ?? account.label,
  }
}
