import { useState } from "react"
import type { FormEvent } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { RegisterOrgWizardLayout } from "@/components/onboarding/RegisterOrgWizardLayout"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { accountsService } from "@/services/accounts"


const inputClass =
  "w-full border-t-0 border-l-0 border-r-0 border-b border-[#cbc3d9]/50 bg-transparent py-3 text-[#191c1d] outline-none transition-all placeholder:text-[#7a7488]/50 focus:border-[#4800b2] focus:ring-0"

const labelClass =
  "mb-1 block text-[11px] font-semibold uppercase tracking-widest text-[#494456]"

export default function ContactInformationPage() {
  useDesignPortalLightTheme()

  const navigate = useNavigate();
  const { state } = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const legalName = formData.get("legalName") as string;
    const parts = legalName.trim().split(" ");
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "Admin";

    const email = formData.get("professionalEmail") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await accountsService.registerTenant({
        company_name: state?.name || "Acme Corp",
        subdomain: state?.subdomain || "acme",
        admin_email: email,
        admin_password: password,
        admin_first_name: firstName,
        admin_last_name: lastName,
      });
      navigate("/register-org/status");
    } catch (err: any) {
      console.error("Registration error:", err);
      let backendError = "Registration failed. Please check your network or try a different subdomain.";
      if (err.response?.data) {
        if (err.response.data.error?.details) {
          backendError = Object.values(err.response.data.error.details).flat().join(", ");
        } else if (err.response.data.error?.message) {
          backendError = err.response.data.error.message;
        } else if (err.response.data.detail) {
          backendError = err.response.data.detail;
        } else if (err.response.data.message) {
          backendError = err.response.data.message;
        } else {
           backendError = Object.values(err.response.data).flat().join(", ");
        }
      }
      setError(backendError);
      setLoading(false);
    }
  }

  return (
    <RegisterOrgWizardLayout step={2}>
      <header className="mb-10">
        <h2 className="font-headline text-3xl font-bold tracking-tight text-[#191c1d]">
          Primary contact information
        </h2>
        <p className="mt-2 text-[#494456]">
          Who should we reach out to for account management and verification?
        </p>
      </header>
      <form id="contact-form" className="space-y-8" onSubmit={onSubmit}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <label className={labelClass}>Full Legal Name</label>
              <input
                className={inputClass}
                placeholder="e.g., Alexander Sterling"
                type="text"
                name="legalName"
                defaultValue={state?.legalName || ""}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Professional Email</label>
              <input
                className={inputClass}
                placeholder="e.g., alexander@organization.com"
                type="email"
                name="professionalEmail"
                defaultValue={state?.professionalEmail || ""}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="relative">
              <label className={labelClass}>Admin Password</label>
              <div className="relative">
                <input
                  className={inputClass}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  defaultValue={state?.password || ""}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-[#7a7488]/50 hover:text-[#4800b2] transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Confirm Password</label>
              <input
                className={inputClass}
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                defaultValue={state?.confirmPassword || ""}
                required
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 pt-8">
          <button
            type="button"
            onClick={() => {
              const form = document.getElementById('contact-form') as HTMLFormElement;
              const currentData = form ? Object.fromEntries(new FormData(form).entries()) : {};
              navigate("/register-org", { state: { ...state, ...currentData } });
            }}
            className="flex items-center gap-2 px-6 py-3.5 font-semibold text-[#494456] transition-colors hover:text-[#4800b2]"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back
          </button>
          <div className="flex flex-col items-end gap-2">
            {error && <span className="text-red-500 text-sm font-medium">{error}</span>}
            <button
              type="submit"
              disabled={loading}
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#4800b2] to-[#6200ee] px-10 py-3.5 font-bold text-white shadow-lg shadow-[#4800b2]/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Confirm identity"}
              {!loading && <span className="material-symbols-outlined text-sm">check_circle</span>}
            </button>
          </div>
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
          Next: step 3 shows your submission status. An Admin will set your
          organization to <strong>ACTIVE</strong> or <strong>REJECTED</strong>;
          you will be notified by email.
        </p>
      </footer>
    </RegisterOrgWizardLayout>
  )
}
