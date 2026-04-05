import type { FormEvent } from "react"
import { Link } from "react-router-dom"
import { RegisterOrgWizardLayout } from "@/components/onboarding/RegisterOrgWizardLayout"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"

const industries = [
  "Select Industry",
  "Cybersecurity",
  "Fintech",
  "Healthcare",
  "Manufacturing",
  "Sales & Retail",
  "Accounts & Finance",
] as const

const sizes = [
  "Select Range",
  "1-50 employees",
  "51-250 employees",
  "251-1000 employees",
  "1000+ employees",
] as const

const inputClass =
  "w-full border-t-0 border-l-0 border-r-0 border-b border-[#cbc3d9]/50 bg-transparent py-3 text-[#191c1d] outline-none transition-all placeholder:text-[#7a7488]/50 focus:border-[#4800b2] focus:ring-0"

const labelClass =
  "mb-1 block text-[11px] font-semibold uppercase tracking-widest text-[#494456]"

export default function OrganizationRegistrationPage() {
  useDesignPortalLightTheme()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
  }

  return (
    <RegisterOrgWizardLayout
      step={1}
      asideTitle={
        <>
          Secure your digital <br />
          <span className="text-[#d0beff]">bastion today.</span>
        </>
      }
      asideLead={
        <>
          <p>
            Register your company, then await platform approval. Hierarchy:
            Super Admin → Organization → Admin → HR → Team Lead → Employee.
          </p>
          <p className="mt-4 border-l-2 border-white/30 pl-4 text-sm leading-relaxed text-[#e8ddff]/90">
            After you submit, your organization status is{" "}
            <strong className="text-white">PENDING</strong> until a Super Admin
            approves (<strong className="text-white">ACTIVE</strong>) or
            declines (<strong className="text-white">REJECTED</strong>). Tenants
            may also be <strong className="text-white">SUSPENDED</strong> for
            platform control.
          </p>
        </>
      }
    >
      <header className="mb-10">
        <h2 className="font-['Manrope',sans-serif] text-3xl font-bold tracking-tight text-[#191c1d]">
          Register your organization
        </h2>
        <p className="mt-2 text-[#494456]">
          Company profile: name, business email, website, industry, size,
          location. Steps 2–3 cover contact details and admin account access.
        </p>
      </header>
      <div className="mb-10">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-3 rounded-xl border-b-2 border-[#e7e8e9] bg-white py-3.5 px-6 font-semibold text-[#191c1d] transition-all hover:bg-[#f8f9fa] active:scale-[0.98]"
        >
          <img
            alt=""
            className="h-5 w-5"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnikUva7PGFWdtqFHISMcSNYxuhDgiyKV22WTX0OUO943kVA52QRz5qbio5jN9u7NL4VER4NOo_JwEXiW_tDckONazdkZ__sdP4KPmm27mj3NEVKZK61SckgwRTcCVL-uqnpe7u4qD9As5hMhnk_OGUjTktHhcqIknaD_50PPHThgHIDwlYtaoo0fcO2kYjNu5i0mb7Vg_SdOb-YrjywEgwmr5xsWvymQ25LHykaD_SdDPevGQLudb7d47lFMxfDVCveRC8WNdnfg"
          />
          Sign up with Google
        </button>
        <div className="relative my-8 text-center">
          <span className="relative z-10 bg-white px-4 text-xs font-semibold uppercase tracking-widest text-[#7a7488]">
            Or use business email
          </span>
          <div className="absolute top-1/2 left-0 h-px w-full bg-[#cbc3d9]/30" />
        </div>
      </div>
      <form className="space-y-8" onSubmit={onSubmit}>
        <div className="space-y-6">
          <div>
            <label className={labelClass}>Organization Name</label>
            <input
              className={inputClass}
              placeholder="e.g. Acme Corp"
              type="text"
              name="name"
            />
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <label className={labelClass}>Business Email</label>
              <input
                className={inputClass}
                placeholder="name@company.com"
                type="email"
                name="email"
              />
            </div>
            <div>
              <label className={labelClass}>Website</label>
              <input
                className={inputClass}
                placeholder="https://..."
                type="url"
                name="website"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <label className={labelClass}>Industry</label>
              <select
                className={inputClass}
                name="industry"
                defaultValue=""
              >
                {industries.map((opt) => (
                  <option key={opt} value={opt === "Select Industry" ? "" : opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Company Size</label>
              <select
                className={inputClass}
                name="size"
                defaultValue=""
              >
                {sizes.map((opt) => (
                  <option key={opt} value={opt === "Select Range" ? "" : opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>HQ Location</label>
            <div className="flex items-center">
              <span className="material-symbols-outlined mr-2 text-[#7a7488]">
                location_on
              </span>
              <input
                className={inputClass}
                placeholder="City, Country"
                type="text"
                name="location"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 pt-8">
          <button
            type="button"
            className="px-6 py-3.5 font-semibold text-[#494456] transition-colors hover:text-[#4800b2]"
          >
            Save for later
          </button>
          <Link
            to="/register-org/contact"
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#4800b2] to-[#6200ee] px-10 py-3.5 font-bold text-white shadow-lg shadow-[#4800b2]/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            Next: Contact Info
            <span className="material-symbols-outlined text-sm">
              arrow_forward
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
          Workflow: submit registration → status <strong>PENDING</strong> → Super
          Admin approves → <strong>ACTIVE</strong> → Admin creates departments
          (Technical, Cybersecurity, HR, Accounts, Sales, etc.) → HR onboards
          users → projects, tasks, and incidents.
        </p>
      </footer>
    </RegisterOrgWizardLayout>
  )
}
