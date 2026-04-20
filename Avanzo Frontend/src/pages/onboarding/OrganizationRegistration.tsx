import type { FormEvent } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
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
  "w-full border-t-0 border-l-0 border-r-0 border-b border-[#cbc3d9]/50 bg-transparent py-2 text-[#191c1d] outline-none transition-all placeholder:text-[#7a7488]/50 focus:border-[#4800b2] focus:ring-0"

const labelClass =
  "mb-1 block text-[11px] font-semibold uppercase tracking-widest text-[#494456]"

export default function OrganizationRegistrationPage() {
  useDesignPortalLightTheme()

  const { state } = useLocation()
  const navigate = useNavigate()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    navigate("/register-org/contact", {
      state: { ...state, ...Object.fromEntries(formData.entries()) },
    })
  }

  return (
    <RegisterOrgWizardLayout
      step={1}
    >
      <header className="mb-3">
        <h2 className="font-headline text-xl font-bold tracking-tight text-[#191c1d]">
          Register your organization
        </h2>
        <p className="mt-0.5 text-xs text-[#494456]">
          Company profile: name, business email, industry, size, location.
        </p>
      </header>
      <div className="mb-3">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-3 rounded-xl border-b-2 border-[#e7e8e9] bg-white py-2.5 px-6 font-semibold text-[#191c1d] transition-all hover:bg-[#f8f9fa] active:scale-[0.98]"
        >
          <img
            alt=""
            className="h-5 w-5"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnikUva7PGFWdtqFHISMcSNYxuhDgiyKV22WTX0OUO943kVA52QRz5qbio5jN9u7NL4VER4NOo_JwEXiW_tDckONazdkZ__sdP4KPmm27mj3NEVKZK61SckgwRTcCVL-uqnpe7u4qD9As5hMhnk_OGUjTktHhcqIknaD_50PPHThgHIDwlYtaoo0fcO2kYjNu5i0mb7Vg_SdOb-YrjywEgwmr5xsWvymQ25LHykaD_SdDPevGQLudb7d47lFMxfDVCveRC8WNdnfg"
          />
          Sign up with Google
        </button>
        <div className="relative my-3 text-center">
          <span className="relative z-10 bg-white px-4 text-xs font-semibold uppercase tracking-widest text-[#7a7488]">
            Or use business email
          </span>
          <div className="absolute top-1/2 left-0 h-px w-full bg-[#cbc3d9]/30" />
        </div>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Organization Name</label>
            <input
              className={inputClass}
              placeholder="e.g. Acme Corp"
              type="text"
              name="name"
              defaultValue={state?.name || ""}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Subdomain</label>
            <div className="flex items-center">
              <input
                className={inputClass}
                placeholder="e.g. acme"
                type="text"
                name="subdomain"
                defaultValue={state?.subdomain || ""}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Industry</label>
              <select
                className={inputClass}
                name="industry"
                defaultValue={state?.industry || ""}
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
                defaultValue={state?.size || ""}
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
                defaultValue={state?.location || ""}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 pt-6">
          <button
            type="button"
            className="px-6 py-3.5 font-semibold text-[#494456] transition-colors hover:text-[#4800b2]"
          >
            Save for later
          </button>
          <button
            type="submit"
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#4800b2] to-[#6200ee] px-10 py-3.5 font-bold text-white shadow-lg shadow-[#4800b2]/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            Next: Contact Info
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </button>
        </div>
      </form>
      <footer className="mt-4 border-t border-[#edeeef] pt-4 text-center space-y-2">
        <p className="text-sm text-[#494456]">
          Already have an account?{" "}
          <Link
            to="/org-login"
            className="font-semibold text-[#4800b2] underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
        <p className="text-xs leading-relaxed text-[#191c1d]">
          By proceeding, you agree to AVANZO CYBER SECURITY&apos;s{" "}
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
            Privacy Policy
          </a>
          .
        </p>
      </footer>
    </RegisterOrgWizardLayout>
  )
}
