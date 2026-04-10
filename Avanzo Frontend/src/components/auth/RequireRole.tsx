import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

type Role = "Admin" | "HR" | "Team Lead" | "Employee" | "Super Admin" | "Organization"

export function RequireRole({ roles }: { roles: Role[] }) {
  const { user } = useAuth()
  
  if (!user) return <Navigate to="/login" replace />
  
  if (!roles.includes(user.role as Role)) {
    return <Navigate to="/" replace />
  }
  
  return <Outlet />
}
