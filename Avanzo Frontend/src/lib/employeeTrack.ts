import type { User } from "@/types"

/**
 * Split mock dashboards (technical vs cybersecurity). Seeded employees often have no
 * department; we use designation + department names from /api/auth/me/.
 */
export function isTechnicalEmployeeTrack(user: User | null | undefined): boolean {
  if (!user) return false
  const dept = (user.department_name ?? "").toLowerCase()
  const des = (user.designation_name ?? "").toLowerCase()

  if (dept.includes("cyber")) return false

  const looksCyber =
    des.includes("cyber") ||
    /\bcyber\s*security\b/.test(des) ||
    /\bsecurity analyst\b/.test(des)

  const looksTech =
    dept.includes("engineering") ||
    dept.includes("technical") ||
    dept.includes("software") ||
    /\bdeveloper\b/.test(des) ||
    /\b(backend|frontend|full[\s-]?stack)\b/.test(des) ||
    (des.includes("engineer") && !des.includes("security")) ||
    des.includes("technical assistant") ||
    des.includes("devops")

  if (looksCyber && !looksTech) return false
  if (looksTech) return true
  return false
}

/**
 * Cybersecurity / SOC / security operations — use the security portal.
 * Technical track wins when both could apply (e.g. security-focused engineer in engineering).
 */
export function isCyberSecurityEmployeeTrack(
  user: User | null | undefined
): boolean {
  if (!user) return false
  if (isTechnicalEmployeeTrack(user)) return false

  const dept = (user.department_name ?? "").toLowerCase()
  const des = (user.designation_name ?? "").toLowerCase()

  if (dept.includes("cyber")) return true
  if (/\b(soc|security operations)\b/.test(dept)) return true
  if (/(infosec|information security)/.test(dept)) return true

  const looksCyber =
    des.includes("cyber") ||
    /\bcyber\s*security\b/.test(des) ||
    /\bsecurity analyst\b/.test(des) ||
    des.includes("soc analyst") ||
    des.includes("threat") ||
    des.includes("penetration") ||
    des.includes("incident response") ||
    des.includes("blue team") ||
    des.includes("red team")

  return looksCyber
}

function isPreviewRole(user: User | null | undefined): boolean {
  const r = user?.role
  return (
    r === "Super Admin" ||
    r === "Admin" ||
    r === "HR" ||
    r === "Organization"
  )
}

/** Cybersecurity portal: cyber employees; preview for org/HR/admin roles. */
export function canAccessCyberSecurityPortal(user: User | null | undefined): boolean {
  if (!user) return false
  if (isPreviewRole(user)) return true
  if (user.role === "Employee") return isCyberSecurityEmployeeTrack(user)
  if (user.role === "Team Lead") return isCyberSecurityEmployeeTrack(user)
  return false
}

/** Technical portal: technical employees; preview for org/HR/admin roles. */
export function canAccessTechnicalPortal(user: User | null | undefined): boolean {
  if (!user) return false
  if (isPreviewRole(user)) return true
  if (user.role === "Employee") return isTechnicalEmployeeTrack(user)
  if (user.role === "Team Lead") return isTechnicalEmployeeTrack(user)
  return false
}
