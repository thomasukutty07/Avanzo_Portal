import type { FormEvent } from "react"
import { Link } from "react-router-dom"
import { RegisterOrgWizardLayout } from "@/components/onboarding/RegisterOrgWizardLayout"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"

const departments = [
  "Select Department",
  "Information Technology",
  "Cybersecurity Operations",
  "Executive Leadership",
  "Legal & Compliance",
  "Human Resources",
  "Finance & Procurement",
] as const

const inputClass =
  "w-full border-t-0 border-l-0 border-r-0 border-b border-[#cbc3d9]/50 bg-transparent py-3 text-[#191c1d] outline-none transition-all placeholder:text-[#7a7488]/50 focus:border-[#4800b2] focus:ring-0"

const labelClass =
  "mb-1 block text-[11px] font-semibold uppercase tracking-widest text-[#494456]"

export default function ContactInformationPage() {
  useDesignPortalLightTheme()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
  }

  return (
    <RegisterOrgWizardLayout
      step={2}
      asideTitle={
        <>
          Personalize your <br />
          <span className="text-[#d0beff]">administrative contact.</span>
        </>
      }
      asideLead={
        <>
          <p>
            Provide the primary contact we will use for account management and
            approval notices. This is step 2 of 3 — after this you will see your
            registration status (<strong className="text-white">PENDING</strong>{" "}
            until a Super Admin acts).
          </p>
          <p className="mt-4 border-l-2 border-white/30 pl-4 text-sm leading-relaxed text-[#e8ddff]/90">
            Use a professional email on your organization domain where possible.
            Encrypted in transit; access follows the same hierarchy as company
            registration.
          </p>
        </>
      }
    >
      <header className="mb-10">
        <h2 className="font-['Manrope',sans-serif] text-3xl font-bold tracking-tight text-[#191c1d]">
          Primary contact information
        </h2>
        <p className="mt-2 text-[#494456]">
          Who should we reach out to for account management and verification?
        </p>
      </header>
      <form className="space-y-8" onSubmit={onSubmit}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <label className={labelClass}>Full Legal Name</label>
              <input
                className={inputClass}
                placeholder="e.g., Alexander Sterling"
                type="text"
                name="legalName"
              />
            </div>
            <div>
              <label className={labelClass}>Professional Email</label>
              <input
                className={inputClass}
                placeholder="e.g., alexander@organization.com"
                type="email"
                name="professionalEmail"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <label className={labelClass}>Department</label>
              <select
                className={inputClass}
                name="department"
                defaultValue=""
              >
                {departments.map((d) => (
                  <option key={d} value={d === "Select Department" ? "" : d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Direct Line</label>
              <input
                className={inputClass}
                placeholder="e.g., +1 (555) 000-0000"
                type="tel"
                name="phone"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Job Title / Designation</label>
            <input
              className={inputClass}
              placeholder="e.g., Chief Information Security Officer"
              type="text"
              name="title"
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 pt-8">
          <Link
            to="/register-org"
            className="flex items-center gap-2 px-6 py-3.5 font-semibold text-[#494456] transition-colors hover:text-[#4800b2]"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back
          </Link>
          <Link
            to="/register-org/status"
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#4800b2] to-[#6200ee] px-10 py-3.5 font-bold text-white shadow-lg shadow-[#4800b2]/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            Confirm identity
            <span className="material-symbols-outlined text-sm">
              check_circle
            </span>
          </Link>
        </div>
      </form>
      <footer className="mt-16 space-y-3 border-t border-[#edeeef] pt-8 text-center">
        <p className="text-xs leading-relaxed text-[#494456]">
          By proceeding, you agree to Avanzo&apos;s{" "}
          <a
            className="font-semibold text-[#4800b2] underline underline-offset-4"
            href="#"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            className="font-semibold text-[#4800b2] underline underline-offset-4"
            href="#"
          >
            Data Processing Addendum
          </a>
          .
        </p>
        <p className="mx-auto max-w-lg text-[11px] leading-relaxed text-[#494456]/90">
          Next: step 3 shows your submission status. A Super Admin will set your
          organization to <strong>ACTIVE</strong> or <strong>REJECTED</strong>;
          you will be notified by email.
        </p>
      </footer>
    </RegisterOrgWizardLayout>
  )
}
