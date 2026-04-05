import { Link } from "react-router-dom"
import { RegisterOrgWizardLayout } from "@/components/onboarding/RegisterOrgWizardLayout"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"

export default function GeneratedScreenPage() {
  useDesignPortalLightTheme()

  return (
    <RegisterOrgWizardLayout
      step={3}
      allStepsComplete
      asideTitle={
        <>
          Application <br />
          <span className="text-[#d0beff]">received.</span>
        </>
      }
      asideLead={
        <>
          <p>
            Your organization is now in the approval queue with status{" "}
            <strong className="text-white">PENDING</strong>. A Super Admin will
            review and set the tenant to{" "}
            <strong className="text-white">ACTIVE</strong> or{" "}
            <strong className="text-white">REJECTED</strong>.
          </p>
          <p className="mt-4 border-l-2 border-white/30 pl-4 text-sm leading-relaxed text-[#e8ddff]/90">
            You will receive email notification when the decision is made.
            Platform operators may also set tenants to{" "}
            <strong className="text-white">SUSPENDED</strong> when required.
          </p>
        </>
      }
    >
      <header className="mb-10">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#4800b2]">
          Company registration · Step 3 of 3
        </p>
        <h2 className="font-['Manrope',sans-serif] text-3xl font-bold tracking-tight text-[#191c1d]">
          Application received
        </h2>
        <p className="mt-2 text-[#494456]">
          Thank you for registering your organization. Your submission is in the
          approval queue.
        </p>
      </header>

      <div className="mb-8 flex flex-col gap-4 rounded-2xl border-2 border-amber-200 bg-amber-50/80 px-6 py-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl text-amber-600">
            schedule
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-800">
              Organization status
            </p>
            <p className="text-lg font-black text-amber-900">PENDING</p>
          </div>
        </div>
        <p className="text-sm text-amber-900/90 sm:flex-1 sm:border-l sm:border-amber-200 sm:pl-6">
          Awaiting Super Admin review. You will be notified when your tenant is{" "}
          <strong>ACTIVE</strong> or if the request is <strong>REJECTED</strong>
          .
        </p>
      </div>

      <div className="mb-10 rounded-2xl border border-[#edeeef] bg-[#f8f9fa]/80 p-8">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#191c1d]">
          <span className="material-symbols-outlined text-[#4800b2]">
            account_tree
          </span>
          What happens next
        </h3>
        <ol className="list-inside list-decimal space-y-4 text-sm leading-relaxed text-[#494456]">
          <li>
            <strong className="text-[#191c1d]">Super Admin</strong> reviews
            pending organizations in <em>Pending Approvals</em>.
          </li>
          <li>
            On <strong>approve</strong>, status becomes{" "}
            <span className="font-semibold text-emerald-700">ACTIVE</span> —
            your company admin can sign in and complete setup.
          </li>
          <li>
            On <strong>reject</strong>, status becomes{" "}
            <span className="font-semibold text-red-700">REJECTED</span>.
          </li>
          <li>
            After go-live, your <strong>Admin</strong> creates departments
            (e.g. Technical, Cybersecurity, HR, Accounts, Sales),{" "}
            <strong>HR</strong> onboards employees, and{" "}
            <strong>Team Leads</strong> run projects and tasks.
          </li>
        </ol>
      </div>

      <div className="mb-10 rounded-xl border border-[#cbc3d9]/30 bg-white px-5 py-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#494456]">
          Data model (overview)
        </p>
        <p className="font-mono text-sm leading-relaxed text-[#494456]">
          Organization → Departments → Users → Projects → Tasks → Incidents
        </p>
      </div>

      <div className="flex flex-col items-stretch justify-between gap-4 pt-2 sm:flex-row sm:items-center">
        <Link
          to="/login"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#4800b2] to-[#6200ee] px-10 py-3.5 font-bold text-white shadow-lg shadow-[#4800b2]/20 transition-all hover:scale-[1.02] active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">login</span>
          Return to login
        </Link>
        <Link
          to="/register-org"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 font-semibold text-[#494456] transition-colors hover:text-[#4800b2]"
        >
          Edit registration (demo)
        </Link>
      </div>

      <footer className="mt-16 border-t border-[#edeeef] pt-8 text-center">
        <p className="text-xs text-[#494456]">
          © Avanzo Enterprise. Organization statuses: PENDING · ACTIVE · REJECTED
          · SUSPENDED.
        </p>
      </footer>
    </RegisterOrgWizardLayout>
  )
}
