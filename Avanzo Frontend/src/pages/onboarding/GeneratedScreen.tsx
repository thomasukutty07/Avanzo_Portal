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

        <div className="mt-12 mb-12 flex justify-center">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-amber-100 bg-amber-50/30 p-10 text-center shadow-lg shadow-amber-600/5">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="material-symbols-outlined text-amber-600 size-5">pending_actions</span>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-800">Current Status</span>
            </div>
            
            <p className="text-3xl font-black text-amber-900 tracking-tight mb-4">PENDING APPROVAL</p>
            
            <p className="text-[13px] leading-relaxed text-amber-800/70 mb-10">
              An Admin is currently reviewing your organization profile. You will be notified via email once your account is activated.
            </p>

            <Link
              to="/login"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 py-4 font-bold text-white shadow-xl shadow-amber-600/20 transition-all hover:bg-amber-700 active:scale-[0.98]"
            >
              Return to Login
              <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-0.5">arrow_forward</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 text-center mt-8">
          <p className="text-xs text-[#7a7488]">
            Need help? Contact <a href="mailto:support@avanzo.com" className="text-[#4800b2] font-semibold hover:underline">Support Team</a>
          </p>
        </div>
      </div>
    </RegisterOrgWizardLayout>
  )
}
