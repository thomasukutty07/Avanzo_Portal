import { useAuth } from "@/context/AuthContext"
import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import { HRPortalChrome } from "@/components/portal/hr/HRPortalChrome"
import { TeamLeadChrome } from "@/components/portal/teamlead/TeamLeadChrome"
import { TechnicalPortalLayout } from "@/components/portal/technical/TechnicalPortalLayout"
import { CyberSecurityPortalLayout } from "@/components/portal/cyber_security/CyberSecurityPortalLayout"
import { 
  isTechnicalEmployeeTrack, 
  isCyberSecurityEmployeeTrack 
} from "@/lib/employeeTrack"
import SettingsLegacyPage from "./SettingsLegacy"

export default function SettingsPage() {
  const { user } = useAuth()

  if (isTechnicalEmployeeTrack(user)) {
    return (
      <TechnicalPortalLayout>
        <SettingsLegacyPage />
      </TechnicalPortalLayout>
    )
  }

  if (isCyberSecurityEmployeeTrack(user)) {
    return (
      <CyberSecurityPortalLayout>
        <SettingsLegacyPage />
      </CyberSecurityPortalLayout>
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

  return (
    <OrganizationAdminChrome>
      <SettingsLegacyPage />
    </OrganizationAdminChrome>
  )
}
