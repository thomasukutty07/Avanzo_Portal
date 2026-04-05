import { Outlet } from "react-router-dom"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"

/** Public routes that render `DesignHtmlView` — keep white/purple mocks from inheriting global dark mode. */
export function PublicDesignLayout() {
  useDesignPortalLightTheme()
  return <Outlet />
}
