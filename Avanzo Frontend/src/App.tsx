import { Suspense, lazy } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { RequirePortalAccess } from "@/components/auth/RequirePortalAccess"
import { RequireRole } from "@/components/auth/RequireRole"
import {
  isCyberSecurityEmployeeTrack,
  isTechnicalEmployeeTrack,
} from "@/lib/employeeTrack"
import { FullPageLayout } from "@/components/layout/FullPageLayout"
import { PublicDesignLayout } from "@/components/layout/PublicDesignLayout"
import { TechnicalPortalLayout } from "@/components/portal/technical/TechnicalPortalLayout"
import { CyberSecurityPortalLayout } from "@/components/portal/cyber_security/CyberSecurityPortalLayout"
import { Loader2 } from "lucide-react"

const Login = lazy(() => import("@/pages/Login"))
const OrgLogin = lazy(() => import("@/pages/OrgLogin"))
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"))
const UsersPage = lazy(() => import("@/pages/admin/Users"))
const DepartmentsPage = lazy(() => import("@/pages/admin/Departments"))
const ReportsPage = lazy(() => import("@/pages/admin/Reports"))
const AdminNotificationsPage = lazy(() => import("@/pages/admin/AdminNotifications"))
const AdminAnnouncementsPage = lazy(() => import("@/pages/admin/AdminAnnouncements"))
const AdminEmployeeRegistrationPage = lazy(() => import("@/pages/admin/AdminEmployeeRegistration"))
const SettingsPage = lazy(() => import("@/pages/shared/Settings"))
const AdminProjectDetailsPage = lazy(() => import("@/pages/admin/ProjectDetails"))
const HROverview = lazy(() => import("@/pages/hr/HROverview"))
const HREmployees = lazy(() => import("@/pages/hr/Employees"))
const HRLeaveRequests = lazy(() => import("@/pages/hr/LeaveRequests"))
const HRReports = lazy(() => import("@/pages/hr/HRReports"))
const HRAttendanceOverview = lazy(() => import("@/pages/hr/AttendanceOverview"))
const EmployeeRegistrationPage = lazy(() =>
  import("@/pages/hr/EmployeeRegistration")
)
const HRAnnouncementsPage = lazy(() => import("@/pages/hr/HRAnnouncements"))
const SettingsLegacyPage = lazy(() => import("@/pages/shared/SettingsLegacy"))
const HRCreateAnnouncementPage = lazy(() =>
  import("@/pages/hr/CreateAnnouncement")
)

const LeadOverview = lazy(() => import("@/pages/teamlead/LeadOverview"))
const TaskManagement = lazy(() => import("@/pages/teamlead/Tasks"))
const ProjectProgress = lazy(() => import("@/pages/teamlead/Projects"))
const TeamPage = lazy(() => import("@/pages/teamlead/Team"))
const TeamAnnouncementsPage = lazy(() =>
  import("@/pages/teamlead/TeamAnnouncements")
)
const TeamLeadCreateAnnouncementPage = lazy(() =>
  import("@/pages/teamlead/CreateAnnouncement")
)
const LeadProjectDetailsPage = lazy(() => import("@/pages/teamlead/ProjectDetails"))

const TechnicalDashboardPage = lazy(() =>
  import("@/pages/technical/TechnicalDashboard")
)
const TechnicalTasksPage = lazy(() => import("@/pages/technical/TechnicalTasks"))
const TechnicalLeavePage = lazy(() => import("@/pages/technical/TechnicalLeave"))
const TechnicalAnnouncementsPage = lazy(() =>
  import("@/pages/technical/TechnicalAnnouncements")
)

const CyberSecurityDashboardPage = lazy(() =>
  import("@/pages/cyber_security/CyberSecurityDashboard")
)
const CyberSecurityTasksPage = lazy(() =>
  import("@/pages/cyber_security/CyberSecurityTasks")
)
const CyberSecurityIncidentsPage = lazy(() =>
  import("@/pages/cyber_security/CyberSecurityIncidents")
)
const CyberSecurityAnnouncementsPage = lazy(() =>
  import("@/pages/cyber_security/CyberSecurityAnnouncements")
)
const CyberSecurityLeavePage = lazy(() =>
  import("@/pages/cyber_security/CyberSecurityLeave")
)
const CyberSecurityCreateAnnouncementPage = lazy(() =>
  import("@/pages/cyber_security/CyberSecurityCreateAnnouncement")
)
const CyberSecurityCreateIncidentPage = lazy(() =>
  import("@/pages/cyber_security/CyberSecurityCreateIncident")
)

const ContactInformationPage = lazy(() =>
  import("@/pages/onboarding/ContactInformation")
)
const OrganizationRegistrationPage = lazy(() =>
  import("@/pages/onboarding/OrganizationRegistration")
)
const RoleSelectionPage = lazy(() => import("@/pages/onboarding/RoleSelection"))
const GeneratedScreenPage = lazy(() =>
  import("@/pages/onboarding/GeneratedScreen")
)

function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

function RoleBasedHome() {
  const { user } = useAuth()
  if (user?.role === "Admin") return <AdminDashboard />
  if (user?.role === "HR") return <HROverview />
  if (user?.role === "Team Lead") return <LeadOverview />
  if (user?.role === "Employee") {
    if (isCyberSecurityEmployeeTrack(user))
      return <Navigate to="/security" replace />
    if (isTechnicalEmployeeTrack(user))
      return <Navigate to="/technical" replace />
    // No specialised portal assigned — show a neutral message
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
        <p className="text-lg font-semibold">No portal assigned</p>
        <p className="text-sm">Your account has not been linked to a department portal yet. Please contact your administrator.</p>
      </div>
    )
  }
  return <Navigate to="/login" replace />
}

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/org-login"
          element={!isAuthenticated ? <OrgLogin /> : <Navigate to="/" replace />}
        />

        <Route element={<PublicDesignLayout />}>
          <Route
            path="/register-org"
            element={<OrganizationRegistrationPage />}
          />
          <Route
            path="/register-org/contact"
            element={<ContactInformationPage />}
          />
          <Route
            path="/register-org/status"
            element={<GeneratedScreenPage />}
          />
          <Route
            path="/contact"
            element={<Navigate to="/register-org/contact" replace />}
          />
          <Route
            path="/onboarding/generated"
            element={<Navigate to="/register-org/status" replace />}
          />
          <Route path="/role-select" element={<RoleSelectionPage />} />
        </Route>



        <Route
          element={
            isAuthenticated ? (
              <FullPageLayout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="/" element={<RoleBasedHome />} />

          <Route element={<RequireRole roles={["Admin"]} />}>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route
              path="/admin-notifications"
              element={<AdminNotificationsPage />}
            />
            <Route
              path="/admin-announcements"
              element={<AdminAnnouncementsPage />}
            />
            <Route 
              path="/admin/register-employee" 
              element={<AdminEmployeeRegistrationPage />} 
            />
            <Route path="/admin/projects/:id" element={<AdminProjectDetailsPage />} />
          </Route>

          <Route path="/settings" element={<SettingsPage />} />

          <Route element={<RequireRole roles={["HR", "Admin"]} />}>
            <Route path="/employees" element={<HREmployees />} />
            <Route path="/attendance" element={<HRAttendanceOverview />} />
            <Route path="/leave" element={<HRLeaveRequests />} />
            <Route path="/hrreports" element={<HRReports />} />
            <Route
              path="/employee-registration"
              element={<EmployeeRegistrationPage />}
            />
            <Route path="/hr-announcements" element={<HRAnnouncementsPage />} />
            <Route
              path="/hr/create-announcement"
              element={<HRCreateAnnouncementPage />}
            />
          </Route>

          <Route element={<RequireRole roles={["Team Lead", "Admin"]} />}>
            <Route path="/tasks" element={<TaskManagement />} />
            <Route path="/projects" element={<ProjectProgress />} />
            <Route path="/projects/:id" element={<LeadProjectDetailsPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route
              path="/team-announcements"
              element={<TeamAnnouncementsPage />}
            />
            <Route
              path="/team-announcements/create"
              element={<TeamLeadCreateAnnouncementPage />}
            />
          </Route>



          <Route element={<RequirePortalAccess portal="technical" />}>
            <Route path="/technical" element={<TechnicalPortalLayout />}>
              <Route index element={<TechnicalDashboardPage />} />
              <Route path="tasks" element={<TechnicalTasksPage />} />
              <Route path="leave" element={<TechnicalLeavePage />} />
              <Route path="announcements" element={<TechnicalAnnouncementsPage />} />
              <Route path="profile" element={<SettingsLegacyPage />} />
            </Route>
          </Route>

          <Route element={<RequirePortalAccess portal="cyber_security" />}>
            <Route path="/security" element={<CyberSecurityPortalLayout />}>
              <Route index element={<CyberSecurityDashboardPage />} />
              <Route path="tasks" element={<CyberSecurityTasksPage />} />
              <Route path="incidents" element={<CyberSecurityIncidentsPage />} />
              <Route path="leave" element={<CyberSecurityLeavePage />} />
              <Route path="announcements" element={<CyberSecurityAnnouncementsPage />} />
              <Route
                path="create-announcement"
                element={<CyberSecurityCreateAnnouncementPage />}
              />
              <Route
                path="incidents/create"
                element={<CyberSecurityCreateIncidentPage />}
              />
              <Route path="profile" element={<SettingsLegacyPage />} />
            </Route>
          </Route>



          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
