import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import {
  canAccessCyberSecurityPortal,
  canAccessTechnicalPortal,
} from "@/lib/employeeTrack"

type Portal = "cyber_security" | "technical"

export function RequirePortalAccess({ portal }: { portal: Portal }) {
  const { user } = useAuth()
  const ok =
    portal === "cyber_security"
      ? canAccessCyberSecurityPortal(user)
      : canAccessTechnicalPortal(user)
  if (!ok) return <Navigate to="/" replace />
  return <Outlet />
}
