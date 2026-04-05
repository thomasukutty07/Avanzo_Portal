import { useAuth } from "@/context/AuthContext"
import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import { HRPortalChrome } from "@/components/portal/hr/HRPortalChrome"
import { TeamLeadChrome } from "@/components/portal/teamlead/TeamLeadChrome"
import SettingsLegacyPage from "./SettingsLegacy"

export default function SettingsPage() {
  const { user } = useAuth()

  if (user?.role === "Admin" || user?.role === "Organization") {
    return (
      <OrganizationAdminChrome>
        <SettingsLegacyPage />
      </OrganizationAdminChrome>
    )
  }

  if (user?.role === "HR") {
    return (
      <HRPortalChrome>
        <SettingsLegacyPage />
      </HRPortalChrome>
    )
  }

  if (user?.role === "Team Lead") {
    return (
      <TeamLeadChrome>
        <SettingsLegacyPage />
      </TeamLeadChrome>
    )
  }

  return <SettingsLegacyPage />
}
