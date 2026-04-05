import { useLayoutEffect } from "react"
import { useTheme, reapplyHtmlThemeFromStorage } from "@/components/theme-provider"

/**
 * Design HTML mocks use `dark:` Tailwind variants; they match `&:is(.dark *)` from the
 * global `<html class="dark">`. Force light on the document while a design portal is shown,
 * then restore the user's theme when leaving.
 */
let designPortalLightLockCount = 0

function forceDocumentLight() {
  const root = document.documentElement
  root.classList.remove("dark")
  root.classList.add("light")
  root.style.colorScheme = "light"
}

export function useDesignPortalLightTheme() {
  const { theme } = useTheme()

  useLayoutEffect(() => {
    designPortalLightLockCount++
    forceDocumentLight()
    return () => {
      designPortalLightLockCount--
      if (designPortalLightLockCount <= 0) {
        designPortalLightLockCount = 0
        reapplyHtmlThemeFromStorage()
      }
    }
  }, [])

  useLayoutEffect(() => {
    if (designPortalLightLockCount <= 0) return
    forceDocumentLight()
  }, [theme])
}
