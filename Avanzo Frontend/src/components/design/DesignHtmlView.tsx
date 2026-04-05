import { useMemo, useRef, useEffect, useLayoutEffect, type CSSProperties } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import {
  applyPortalChromeFromDashboard,
  applySidebarTemplate,
  extractDesignBody,
} from "@/lib/extractDesignBody"
import {
  applySidebarNavActiveState,
  resolveLinkRule,
} from "@/lib/designPortalSidebarNav"
import {
  ensureDesignPortalLogoutButton,
  isPortalLogoutButtonTarget,
} from "@/lib/designPortalLogout"
import {
  getPortalControlLabel,
  isHeaderNotificationButton,
  resolvePortalInteractiveAction,
} from "@/lib/portalContentActions"

export type DesignNavRule = { match: string; to: string }

type DesignHtmlViewProps = {
  html: string
  /** Optional dashboard HTML used to enforce a consistent portal sidebar on subpages. */
  sidebarTemplateHtml?: string
  /** CSS variables (e.g. --color-primary) applied on the portal root for Tailwind theme colors */
  palette?: Record<string, string>
  /** Match anchor innerText (normalized) to route for href="#" sidebar links */
  navRules?: DesignNavRule[]
  className?: string
}

export function DesignHtmlView({
  html,
  sidebarTemplateHtml,
  palette,
  navRules,
  className,
}: DesignHtmlViewProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const ref = useRef<HTMLDivElement>(null)

  const inner = useMemo(() => {
    const merged = applySidebarTemplate(html, sidebarTemplateHtml)
    const withChrome = applyPortalChromeFromDashboard(merged, sidebarTemplateHtml)
    return extractDesignBody(withChrome)
  }, [html, sidebarTemplateHtml])

  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    if (navRules?.length) {
      applySidebarNavActiveState(root, location.pathname, navRules)
    }
    ensureDesignPortalLogoutButton(root)
  }, [inner, location.pathname, navRules])

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!root.contains(target)) return

      if (isPortalLogoutButtonTarget(target)) {
        e.preventDefault()
        logout()
        navigate("/login", { replace: true })
        return
      }

      const anchor = target.closest("a")
      if (anchor && root.contains(anchor)) {
        const href = anchor.getAttribute("href")
        if (
          href &&
          href.startsWith("/") &&
          !href.startsWith("//") &&
          !href.includes("://")
        ) {
          e.preventDefault()
          navigate(href)
          return
        }
      }

      const submitEl = target.closest(
        'button[type="submit"], input[type="submit"]'
      )
      if (submitEl && root.contains(submitEl)) {
        e.preventDefault()
        e.stopPropagation()
        return
      }

      if (anchor && root.contains(anchor) && navRules?.length) {
        const href = anchor.getAttribute("href")
        if (href && href.startsWith("http")) return
        if (href && href.startsWith("/")) return
        if (href && href !== "#" && href !== "") return
        const text = anchor.innerText.replace(/\s+/g, " ").trim()
        const rule = resolveLinkRule(text, navRules)
        if (rule) {
          e.preventDefault()
          navigate(rule.to)
          return
        }
      }

      const btn = target.closest("button, [role='button']")
      if (
        btn instanceof HTMLElement &&
        root.contains(btn) &&
        !isPortalLogoutButtonTarget(target)
      ) {
        if (isHeaderNotificationButton(btn, root)) {
          e.preventDefault()
          e.stopPropagation()
          return
        }

        const label = getPortalControlLabel(btn)
        const trimmed = label.replace(/\s+/g, " ").trim()
        if (!trimmed) {
          return
        }

        const action = resolvePortalInteractiveAction(
          trimmed,
          location.pathname,
          navRules
        )
        if (action) {
          e.preventDefault()
          e.stopPropagation()
          navigate(action.to)
        }
      }
    }
    root.addEventListener("click", onClick)
    return () => root.removeEventListener("click", onClick)
  }, [inner, navigate, navRules, logout, location.pathname])

  const style = palette as CSSProperties | undefined

  return (
    <div
      ref={ref}
      className={className ?? "design-portal design-portal-light min-h-screen w-full"}
      style={style}
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  )
}
