import type { DesignNavRule } from "@/components/design/DesignHtmlView"

/** Longest matching `to` wins; same length uses earliest rule in the array (e.g. Dashboard before Support). */
export function resolveActiveNavRule(
  pathname: string,
  rules: DesignNavRule[]
): DesignNavRule | null {
  const p = pathname.replace(/\/+$/, "") || "/"
  let best: DesignNavRule | null = null
  let bestKeyLen = -1
  let bestIndex = Infinity

  rules.forEach((rule, index) => {
    const key = rule.to.replace(/\/+$/, "") || "/"
    let matches = false
    if (key === "/") matches = p === "/"
    else matches = p === key || p.startsWith(`${key}/`)
    if (!matches) return
    if (key.length > bestKeyLen) {
      bestKeyLen = key.length
      bestIndex = index
      best = rule
    } else if (key.length === bestKeyLen && index < bestIndex) {
      bestIndex = index
      best = rule
    }
  })
  return best
}

/** Map sidebar link text to a rule; longest `match` wins when multiple include the same label. */
export function resolveLinkRule(
  linkText: string,
  rules: DesignNavRule[]
): DesignNavRule | null {
  const normalized = linkText.replace(/\s+/g, " ").trim()
  let best: DesignNavRule | null = null
  let bestLen = -1
  for (const rule of rules) {
    if (!normalized.includes(rule.match)) continue
    if (rule.match.length > bestLen) {
      bestLen = rule.match.length
      best = rule
    }
  }
  return best
}

/** Same as {@link resolveLinkRule} but case-insensitive (for static HTML buttons). */
export function resolveLinkRuleInsensitive(
  linkText: string,
  rules: DesignNavRule[]
): DesignNavRule | null {
  const normalized = linkText.replace(/\s+/g, " ").trim().toLowerCase()
  let best: DesignNavRule | null = null
  let bestLen = -1
  for (const rule of rules) {
    const m = rule.match.toLowerCase()
    if (!normalized.includes(m)) continue
    if (m.length > bestLen) {
      bestLen = m.length
      best = rule
    }
  }
  return best
}

type NavVisualStyle =
  | "hr-active-link"
  | "violet"
  | "security-brand"
  | "quantum-dark"
  | "technical-primary-scale"
  | "primary-tint"

const STYLE_TEMPLATES: Record<
  NavVisualStyle,
  { active: string; inactive: string }
> = {
  "hr-active-link": {
    active:
      "flex items-center gap-3 px-3 py-2.5 rounded-lg active-link font-medium",
    inactive:
      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
  },
  violet: {
    active:
      "bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-200 rounded-lg mx-2 p-3 flex items-center gap-3 font-semibold text-xs",
    inactive:
      "text-slate-600 dark:text-slate-400 mx-2 hover:text-violet-600 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg p-3 flex items-center gap-3 font-semibold text-xs transition-all",
  },
  "security-brand": {
    active:
      "flex items-center gap-3 px-4 py-3 text-brand-purple bg-purple-50 border-l-4 border-brand-purple rounded-r-md font-semibold",
    inactive:
      "flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-brand-purple hover:bg-purple-50 transition-all rounded-md",
  },
  "quantum-dark": {
    active:
      "flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/20 text-accent font-semibold",
    inactive:
      "flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all",
  },
  "technical-primary-scale": {
    active:
      "flex items-center gap-3 px-3 py-2 text-primary-700 bg-primary-50 rounded-lg font-medium",
    inactive:
      "flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors",
  },
  "primary-tint": {
    active:
      "flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-semibold",
    inactive:
      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
  },
}

function detectNavStyle(firstNavLink: HTMLAnchorElement | null): NavVisualStyle {
  if (!firstNavLink) return "primary-tint"
  const c = firstNavLink.className
  if (c.includes("active-link")) return "hr-active-link"
  if (c.includes("bg-violet-100")) return "violet"
  if (c.includes("border-l-4") && c.includes("border-brand-purple"))
    return "security-brand"
  if (c.includes("bg-accent/20")) return "quantum-dark"
  if (c.includes("text-primary-700") && c.includes("bg-primary-50"))
    return "technical-primary-scale"
  if (c.includes("bg-primary/10")) return "primary-tint"
  return "primary-tint"
}

/**
 * After sidebar template injection, the copied aside still reflects the dashboard’s active item.
 * Re-apply active/inactive classes from the current route and `navRules`.
 */
export function applySidebarNavActiveState(
  root: HTMLElement,
  pathname: string,
  rules: DesignNavRule[]
): void {
  const aside = root.querySelector("aside")
  if (!aside || !rules.length) return

  const links = aside.querySelectorAll<HTMLAnchorElement>('a[href="#"]')
  if (!links.length) return

  const firstNavLink = aside.querySelector<HTMLAnchorElement>('nav a[href="#"]')
  const style = detectNavStyle(firstNavLink)
  const { active, inactive } = STYLE_TEMPLATES[style]
  const activeRule = resolveActiveNavRule(pathname, rules)

  links.forEach((a) => {
    const text = a.innerText.replace(/\s+/g, " ").trim()
    const linkRule = resolveLinkRule(text, rules)
    const isActive =
      activeRule != null &&
      linkRule != null &&
      linkRule.to === activeRule.to &&
      linkRule.match === activeRule.match

    a.className = isActive ? active : inactive
    if (isActive) a.setAttribute("aria-current", "page")
    else a.removeAttribute("aria-current")
  })
}
