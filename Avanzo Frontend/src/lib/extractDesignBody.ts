/** Strip HTML document wrapper and scripts; keep body markup for design portals. */
export function extractDesignBody(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  if (!bodyMatch) return ""
  let inner = bodyMatch[1]
  inner = inner.replace(/<script\b[\s\S]*?<\/script>/gi, "")
  return inner.trim()
}

/**
 * Replace first <aside>…</aside> in a page with the dashboard sidebar template,
 * so all subpages keep the same sidebar shell as their portal dashboard.
 */
export function applySidebarTemplate(html: string, sidebarTemplateHtml?: string): string {
  if (!sidebarTemplateHtml) return html
  const asideRegex = /<aside\b[^>]*>[\s\S]*?<\/aside>/i
  const templateAsideMatch = sidebarTemplateHtml.match(asideRegex)
  if (!templateAsideMatch) return html
  if (!asideRegex.test(html)) return html
  return html.replace(asideRegex, templateAsideMatch[0])
}

/** Technical dashboard: global top bar between <!-- BEGIN: MainHeader --> … <!-- END: MainHeader --> */
export function extractMainHeaderFromTechnicalDashboard(
  dashboardHtml: string
): string | null {
  const m = dashboardHtml.match(
    /<!--\s*BEGIN:\s*MainHeader\s*-->([\s\S]*?)<!--\s*END:\s*MainHeader\s*-->/i
  )
  return m ? m[1].trim() : null
}

/**
 * Extract the canonical portal top header from a dashboard HTML file so subpages
 * can reuse the same chrome as the dashboard (search, notifications, profile, etc.).
 */
export function extractPortalHeaderFromDashboard(dashboardHtml: string): string | null {
  const markerPatterns = [
    /<!--\s*BEGIN:\s*MainHeader\s*-->([\s\S]*?)<!--\s*END:\s*MainHeader\s*-->/i,
    /<!--\s*BEGIN:\s*Top Header\s*-->([\s\S]*?)<!--\s*END:\s*Top Header\s*-->/i,
    /<!--\s*BEGIN:\s*TopHeader\s*-->([\s\S]*?)<!--\s*END:\s*TopHeader\s*-->/i,
  ]
  for (const p of markerPatterns) {
    const m = dashboardHtml.match(p)
    if (m?.[1]?.trim()) return m[1].trim()
  }

  const bodyMatch = dashboardHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  if (!bodyMatch) return null
  const body = bodyMatch[1].replace(/<script\b[\s\S]*?<\/script>/gi, "")
  const trimmed = body.trim()

  const leadingHeader = trimmed.match(
    /^(?:\s|<!--[\s\S]*?-->)*<header\b[^>]*>[\s\S]*?<\/header>/i
  )
  if (leadingHeader) return leadingHeader[0].trim()

  const asideEnd = trimmed.search(/<\/aside>/i)
  if (asideEnd >= 0) {
    const rest = trimmed.slice(asideEnd + 8)
    const h = rest.match(/<header\b[^>]*>[\s\S]*?<\/header>/i)
    if (h) return h[0].trim()
  }

  return null
}

/**
 * Apply the dashboard’s top header to a subpage when `sidebarTemplateHtml` is set:
 * - Technical: prepend fixed MainHeader and remove duplicate in-main toolbars (legacy layout).
 * - Replace the leading fixed global header.
 * - Security / Quantum / HR / Team Lead / Employee: replace the first header in the main
 *   column (first `<header>` after `</aside>`) with the dashboard header.
 */
export function applyPortalChromeFromDashboard(
  html: string,
  dashboardTemplateHtml?: string
): string {
  if (!dashboardTemplateHtml) return html
  const headerFragment = extractPortalHeaderFromDashboard(dashboardTemplateHtml)
  if (!headerFragment) return html

  return html.replace(/(<body[^>]*>)([\s\S]*)(<\/body>)/i, (_m, open, inner, close) => {
    const bodyInner = inner.replace(/<script\b[\s\S]*?<\/script>/gi, "")
    const trimmed = bodyInner.trim()

    const mainHeaderFragment =
      extractMainHeaderFromTechnicalDashboard(dashboardTemplateHtml)

    // Technical dashboard file already includes the fixed MainHeader — do not double-apply.
    if (
      mainHeaderFragment &&
      /^<header\b[^>]*\bclass="[^"]*\bfixed[^"]*top-0/i.test(trimmed)
    ) {
      return open + inner + close
    }

    // 1) Technical portal: global fixed MainHeader + inner strip + pt-16 shell
    if (
      mainHeaderFragment &&
      /^<div\b/i.test(trimmed) &&
      !/^(?:\s|<!--[\s\S]*?-->)*<header\b/i.test(trimmed)
    ) {
      let newInner = trimmed

      newInner = newInner.replace(
        /<header class="h-16[^"]*border-b[^"]*"[^>]*>[\s\S]*?<\/header>/,
        ""
      )

      newInner = newInner.replace(/<main\b([^>]*)>/i, (_full: string, attrs: string) => {
        const fixed = attrs.replace(/\sml-64\b/g, "").replace(/\sml-72\b/g, "")
        return `<main${fixed}>`
      })

      newInner = mainHeaderFragment + "\n" + newInner

      newInner = newInner.replace(
        /(<\/header>)\s*(?:<!--[\s\S]*?-->\s*)*(<div\b[^>]*\bclass=")([^"]*)(")/,
        (full: string, endH: string, divStart: string, classes: string, q: string) => {
          if (classes.includes("pt-16")) return full
          if (
            !/\bflex\b/.test(classes) ||
            !/\b(h-screen|min-h-screen)\b/.test(classes)
          ) {
            return full
          }
          return endH + "\n" + divStart + classes + " pt-16" + q
        }
      )

      return open + newInner + close
    }

    // 2) Leading global header
    if (/^(?:\s|<!--[\s\S]*?-->)*<header\b/i.test(trimmed)) {
      const newInner = trimmed.replace(
        /^(?:\s|<!--[\s\S]*?-->)*<header\b[^>]*>[\s\S]*?<\/header>/i,
        headerFragment
      )
      if (newInner !== trimmed) return open + newInner + close
    }

    // 3) First header after sidebar (Quantum, HR, Security, Team Lead, Employee, …)
    const asideEnd = trimmed.search(/<\/aside>/i)
    if (asideEnd >= 0) {
      const before = trimmed.slice(0, asideEnd + 8)
      let after = trimmed.slice(asideEnd + 8)
      const headerRe = /<header\b[^>]*>[\s\S]*?<\/header>/i
      if (headerRe.test(after)) {
        after = after.replace(headerRe, headerFragment)
        return open + before + after + close
      }
    }

    return open + inner + close
  })
}

/** @deprecated Use {@link applyPortalChromeFromDashboard} */
export function applyTechnicalPortalChrome(
  html: string,
  dashboardTemplateHtml?: string
): string {
  return applyPortalChromeFromDashboard(html, dashboardTemplateHtml)
}
