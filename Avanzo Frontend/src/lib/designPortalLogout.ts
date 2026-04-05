const WRAP_ATTR = "data-portal-logout-wrap"
const BTN_ATTR = "data-portal-logout-button"

/**
 * Sidebar chrome for design HTML portals: an `<aside>` that contains a `<nav>` with
 * in-app links (`href="#"`). Skips decorative asides (e.g. marketing columns without nav).
 */
export function findPortalSidebarAside(root: HTMLElement): HTMLElement | null {
  for (const aside of root.querySelectorAll("aside")) {
    if (!aside.querySelector("nav")) continue
    if (!aside.querySelector('a[href="#"]')) continue
    return aside
  }
  return null
}

/** Append a logout block at the bottom of the portal sidebar (idempotent). */
export function ensureDesignPortalLogoutButton(root: HTMLElement): void {
  const aside = findPortalSidebarAside(root)
  if (!aside) return

  aside.querySelector(`[${WRAP_ATTR}]`)?.remove()

  const wrap = document.createElement("div")
  wrap.setAttribute(WRAP_ATTR, "true")
  wrap.className =
    "mt-auto border-t border-black/10 pt-3 px-2 pb-2 dark:border-white/10"

  const btn = document.createElement("button")
  btn.type = "button"
  btn.setAttribute(BTN_ATTR, "true")
  btn.setAttribute("aria-label", "Log out")
  btn.className =
    "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
  btn.textContent = "Log out"

  wrap.appendChild(btn)
  aside.appendChild(wrap)
}

export function isPortalLogoutButtonTarget(target: EventTarget | null): boolean {
  return Boolean(
    target instanceof Element &&
      target.closest(`[${BTN_ATTR}]`)
  )
}
