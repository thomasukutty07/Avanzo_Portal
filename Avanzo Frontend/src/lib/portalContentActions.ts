import type { DesignNavRule } from "@/components/design/DesignHtmlView"
import { resolveLinkRuleInsensitive } from "@/lib/designPortalSidebarNav"

/** Static HTML portals: only in-app navigation — no Sonner “demo” toasts (avoids false matches). */
export type PortalNavigateAction = { to: string }

type Rule = { match: string; to: string }

function resolveLongestNavMatch(normalizedLabel: string, rules: Rule[]): string | null {
  let best: Rule | null = null
  let bestLen = -1
  for (const rule of rules) {
    const m = rule.match.toLowerCase()
    if (!normalizedLabel.includes(m)) continue
    if (m.length > bestLen) {
      bestLen = m.length
      best = rule
    }
  }
  return best?.to ?? null
}

/** Label from button / [role=button]: visible text, then aria-label, then title. */
export function getPortalControlLabel(el: HTMLElement): string {
  const t = el.innerText.replace(/\s+/g, " ").trim()
  if (t) return t
  return (
    el.getAttribute("aria-label")?.replace(/\s+/g, " ").trim() ||
    el.getAttribute("title")?.replace(/\s+/g, " ").trim() ||
    ""
  )
}

/**
 * Only use specific multi-word matches. Short words like "project" or "priority" match
 * KPI labels ("Active Projects") and caused the same toast on every page.
 */
const GLOBAL_RULES: Rule[] = [
  { match: "view all activity", to: "/tasks" },
  { match: "view all 12 sprint items", to: "/technical/sprints" },
  { match: "view all sprint items", to: "/technical/sprints" },
  { match: "view all tasks", to: "/technical/tasks" },
  { match: "view all members", to: "/team" },
  { match: "view all reports", to: "/technical/reports" },
  { match: "detailed performance report", to: "/technical/reports" },
  { match: "generate report", to: "/reports" },
  { match: "export report", to: "/reports" },
  { match: "export csv", to: "/reports" },
  { match: "post announcement", to: "/team/create-announcement" },
  { match: "create announcement", to: "/hr/create-announcement" },
  { match: "new announcement", to: "/team/create-announcement" },
  { match: "register employee", to: "/employee-registration" },
  { match: "new employee", to: "/employee-registration" },
  { match: "add user", to: "/users" },
  { match: "add department", to: "/departments" },
  { match: "+ new task", to: "/tasks" },
  { match: "new task", to: "/tasks" },
  { match: "sprint planning", to: "/technical/sprints" },
  { match: "manage tasks", to: "/tasks" },
  { match: "view all", to: "/reports" },
]

function pathScopedRules(pathname: string): Rule[] {
  const p = pathname.replace(/\/+$/, "") || "/"
  const rules: Rule[] = []

  if (
    p === "/employees" ||
    p.startsWith("/employees/") ||
    p === "/attendance" ||
    p.startsWith("/attendance/") ||
    p === "/leave" ||
    p.startsWith("/leave/") ||
    p === "/hrreports" ||
    p.startsWith("/hrreports/") ||
    p === "/hr-announcements" ||
    p.startsWith("/hr-announcements/") ||
    p === "/employee-registration" ||
    p.startsWith("/employee-registration/")
  ) {
    rules.push(
      { match: "generate report", to: "/hrreports" },
      { match: "view all", to: "/employees" },
      { match: "new task", to: "/my-tasks" }
    )
  }

  if (
    p === "/my-tasks" ||
    p.startsWith("/my-tasks/") ||
    p === "/work-schedule" ||
    p.startsWith("/work-schedule/") ||
    p === "/announcements" ||
    p.startsWith("/announcements/") ||
    p === "/employee-leave" ||
    p.startsWith("/employee-leave/")
  ) {
    rules.push(
      { match: "new task", to: "/my-tasks" },
      { match: "generate report", to: "/hrreports" },
      { match: "view all", to: "/my-tasks" }
    )
  }

  if (
    p === "/tasks" ||
    p.startsWith("/tasks/") ||
    p === "/projects" ||
    p.startsWith("/projects/") ||
    p === "/team" ||
    p.startsWith("/team/") ||
    p === "/team-reports" ||
    p.startsWith("/team-reports/") ||
    p === "/team-announcements" ||
    p.startsWith("/team-announcements/")
  ) {
    rules.push(
      { match: "new task", to: "/tasks" },
      { match: "generate report", to: "/team-reports" },
      { match: "view all", to: "/tasks" }
    )
  }


  if (p.startsWith("/technical")) {
    rules.push(
      { match: "generate report", to: "/technical/reports" },
      { match: "+ new task", to: "/technical/tasks" },
      { match: "new task", to: "/technical/tasks" },
      { match: "export report", to: "/technical/reports" }
    )
  }

  if (p.startsWith("/security")) {
    rules.push(
      { match: "generate report", to: "/security/reports" },
      { match: "view all", to: "/security/incidents" }
    )
  }

  return rules
}

export function resolvePortalInteractiveAction(
  label: string,
  pathname: string,
  navRules?: DesignNavRule[]
): PortalNavigateAction | null {
  const normalized = label.replace(/\s+/g, " ").trim()
  if (!normalized) return null

  if (navRules?.length) {
    const navHit = resolveLinkRuleInsensitive(normalized, navRules)
    if (navHit) return { to: navHit.to }
  }

  const lower = normalized.toLowerCase()
  const merged = [...pathScopedRules(pathname), ...GLOBAL_RULES]
  const to = resolveLongestNavMatch(lower, merged)
  return to ? { to } : null
}

export function isHeaderNotificationButton(btn: HTMLElement, root: HTMLElement): boolean {
  if (!btn.closest("header") || !root.contains(btn)) return false
  const icon = btn.querySelector(".material-symbols-outlined")
  if (!icon) return false
  const glyph = (icon.textContent || "").trim().toLowerCase()
  if (glyph === "notifications" || glyph.includes("notification")) return true
  const label = getPortalControlLabel(btn).toLowerCase()
  return label.includes("notification")
}
