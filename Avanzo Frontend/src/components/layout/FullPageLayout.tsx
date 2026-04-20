import { Outlet } from "react-router-dom"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"

/** Full-viewport shell for design HTML portals (each page includes its own chrome). */
export function FullPageLayout() {
  useDesignPortalLightTheme()
  return (
    <div className="min-h-screen w-full">
      <Outlet />
    </div>
  )
}
