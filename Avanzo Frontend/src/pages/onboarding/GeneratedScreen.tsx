import { Link } from "react-router-dom"
import { RegisterOrgWizardLayout } from "@/components/onboarding/RegisterOrgWizardLayout"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"

export default function GeneratedScreenPage() {
  useDesignPortalLightTheme()

  return (
    <RegisterOrgWizardLayout step={1} allStepsComplete>
      <div className="text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-8">
          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>
        
        <header className="mb-10">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-[#191c1d]">
            Registration Successful
          </h2>
          <p className="mt-3 text-[#494456] max-w-md mx-auto">
            Your application for <strong>AVANZO CYBER SECURITY</strong> has been received and is now in the review queue.
          </p>
        </header>

        <div className="mb-10 max-w-sm mx-auto overflow-hidden rounded-2xl border border-amber-100 bg-amber-50/30 p-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="material-symbols-outlined text-amber-600">
              pending_actions
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-800">
              Current Status
            </span>
          </div>
          <p className="text-2xl font-black text-amber-900 tracking-tight">PENDING APPROVAL</p>
          <p className="mt-3 text-xs leading-relaxed text-amber-800/70">
            A Super Admin is currently reviewing your organization profile. You will be notified via email once your account is activated.
          </p>
        </div>

        <div className="mb-12 text-left bg-slate-50/50 rounded-2xl p-8 border border-slate-100">
          <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-[#191c1d] flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4800b2]"></span>
            Next Steps
          </h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm border border-slate-100 text-[#4800b2] font-bold text-sm">1</div>
              <div>
                <p className="font-bold text-[#191c1d] text-sm">Admin Verification</p>
                <p className="text-xs text-[#494456] mt-1">Our team verifies your business details and security compliance.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm border border-slate-100 text-[#4800b2] font-bold text-sm">2</div>
              <div>
                <p className="font-bold text-[#191c1d] text-sm">Account Activation</p>
                <p className="text-xs text-[#494456] mt-1">Once approved, your status changes to <span className="text-emerald-600 font-bold">ACTIVE</span> and you can sign in.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm border border-slate-100 text-[#4800b2] font-bold text-sm">3</div>
              <div>
                <p className="font-bold text-[#191c1d] text-sm">Onboarding</p>
                <p className="text-xs text-[#494456] mt-1">Set up your departments, invite your HR team, and start managing your workspace.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <Link
            to="/login"
            className="group flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-[#4800b2] px-8 py-4 font-bold text-white shadow-xl shadow-[#4800b2]/20 transition-all hover:bg-[#39008d] active:scale-[0.98]"
          >
            Go to Login
            <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </Link>
          
          <p className="text-xs text-[#7a7488]">
            Need help? Contact <a href="mailto:support@avanzo.com" className="text-[#4800b2] font-semibold hover:underline">Support Team</a>
          </p>
        </div>
      </div>
    </RegisterOrgWizardLayout>
  )
}
