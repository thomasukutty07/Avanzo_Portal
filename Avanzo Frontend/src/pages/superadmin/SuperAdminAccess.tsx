import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

export default function SuperAdminAccessPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <div className="flex h-stretch min-h-screen items-stretch bg-[#f8f9fa] font-body text-[#191c1d]">
      <button
        type="button"
        onClick={handleLogout}
        className="absolute right-4 top-4 z-[60] rounded-lg border border-[#cbc3d9]/40 bg-white/90 px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-red-50"
      >
        Log out
      </button>

      {/* Left Panel: The Digital Bastion Visuals */}
      <aside className="relative hidden w-2/5 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#4800b2] to-[#6200ee] p-16 lg:flex">
        {/* Abstract Background Element */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-full opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100">
            <defs>
              <pattern
                height="10"
                id="grid"
                patternUnits="userSpaceOnUse"
                width="10"
              >
                <path
                  d="M 10 0 L 0 0 0 10"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                ></path>
              </pattern>
            </defs>
            <rect fill="url(#grid)" height="100" width="100"></rect>
          </svg>
        </div>
        <div className="relative z-10">
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#4800b2] shadow-xl">
              <span className="material-symbols-outlined">security</span>
            </div>
            <span className="font-headline text-2xl font-extrabold tracking-tight text-white">
              Avanzo
            </span>
          </div>
          <h1 className="font-headline mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white">
            Secure your workspace.
          </h1>
          <p className="text-lg font-medium leading-relaxed text-[#d0beff] opacity-90">
            Define the initial access controls and security protocols for your
            organization.
          </p>
        </div>
        <div className="relative z-10">
          <div className="flex items-start gap-5 rounded-2xl border border-white/10 bg-white/10 p-8 backdrop-blur-3xl">
            <div className="rounded-xl bg-[#6200ee]/20 p-3">
              <span className="material-symbols-outlined text-white">lock</span>
            </div>
            <div>
              <h4 className="font-headline mb-2 font-bold text-white">
                Advanced Encryption
              </h4>
              <p className="text-sm leading-relaxed text-[#d0beff]">
                All access keys are managed within our proprietary Avanzo Vault.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Panel: Access Configuration Form */}
      <main className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-white p-8 md:p-16">
        <div className="w-full max-w-xl">
          {/* Progress Stepper */}
          <div className="relative mb-16 flex items-center justify-between">
            <div className="absolute left-0 top-1/2 -z-10 h-px w-full bg-[#f3f4f5]"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4800b2] text-white ring-4 ring-white">
                <span className="material-symbols-outlined text-sm">check</span>
              </div>
              <span className="font-label text-[10px] font-bold uppercase tracking-widest text-[#494456]">
                Profile
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4800b2] text-white ring-4 ring-white">
                <span className="material-symbols-outlined text-sm">check</span>
              </div>
              <span className="font-label text-[10px] font-bold uppercase tracking-widest text-[#494456]">
                Contact
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6200ee] text-white shadow-lg shadow-[#4800b2]/20 ring-4 ring-[#e8ddff]">
                <span className="material-symbols-outlined text-sm">
                  lock_open
                </span>
              </div>
              <span className="font-label text-[10px] font-bold uppercase tracking-widest text-[#4800b2]">
                Access
              </span>
            </div>
          </div>

          <div className="text-left">
            <h2 className="font-headline mb-2 text-3xl font-extrabold tracking-tight text-[#191c1d]">
              Access & Security Setup
            </h2>
            <p className="font-medium text-[#494456]">
              Establish the foundation for your secure digital bastion.
            </p>
          </div>

          <form
            className="mt-10 space-y-12"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="space-y-8">
              <div className="relative">
                <label className="font-label mb-1 block text-[11px] font-bold uppercase tracking-widest text-[#494456]">
                  Primary Admin Username
                </label>
                <input
                  className="w-full border-b border-[#cbc3d9]/40 bg-transparent py-3 px-0 font-medium text-[#191c1d] transition-all placeholder:text-[#d9dadb] focus:border-[#4800b2] focus:outline-none focus:ring-0"
                  placeholder="e.g. administrator_alpha"
                  type="text"
                />
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="relative">
                  <label className="font-label mb-1 block text-[11px] font-bold uppercase tracking-widest text-[#494456]">
                    Password
                  </label>
                  <input
                    className="w-full border-b border-[#cbc3d9]/40 bg-transparent py-3 px-0 font-medium text-[#191c1d] transition-all placeholder:text-[#d9dadb] focus:border-[#4800b2] focus:outline-none focus:ring-0"
                    placeholder="••••••••"
                    type="password"
                  />
                  <div className="mt-2 flex h-1 gap-1">
                    <div className="flex-1 rounded-full bg-[#4800b2]"></div>
                    <div className="flex-1 rounded-full bg-[#4800b2]"></div>
                    <div className="flex-1 rounded-full bg-[#4800b2]"></div>
                    <div className="flex-1 rounded-full bg-[#e7e8e9]"></div>
                  </div>
                  <span className="mt-1 block text-[10px] font-bold uppercase tracking-tight text-[#4800b2]">
                    Strong Security
                  </span>
                </div>
                <div className="relative">
                  <label className="font-label mb-1 block text-[11px] font-bold uppercase tracking-widest text-[#494456]">
                    Confirm Password
                  </label>
                  <input
                    className="w-full border-b border-[#cbc3d9]/40 bg-transparent py-3 px-0 font-medium text-[#191c1d] transition-all placeholder:text-[#d9dadb] focus:border-[#4800b2] focus:outline-none focus:ring-0"
                    placeholder="••••••••"
                    type="password"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6">
              <button
                onClick={() => toast.info("Returning to step 2...")}
                className="text-sm font-bold text-[#4800b2] transition-all hover:underline"
                type="button"
              >
                Back
              </button>
              <button
                onClick={() => toast.success("Access configuration complete!")}
                className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-[#4800b2] to-[#6200ee] px-8 py-4 font-bold text-white shadow-xl shadow-[#4800b2]/20 transition-all hover:scale-105 active:scale-95"
                type="button"
              >
                <span>Complete Registration</span>
                <span className="material-symbols-outlined">
                  rocket_launch
                </span>
              </button>
            </div>
          </form>

          <footer className="mt-20 border-t border-[#f3f4f5] pt-10">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex items-center gap-6 opacity-40 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0">
                <span className="font-label text-[10px] font-black tracking-widest">
                  AES-256
                </span>
                <span className="font-label text-[10px] font-black tracking-widest">
                  GDPR COMPLIANT
                </span>
                <span className="font-label text-[10px] font-black tracking-widest">
                  SOC2 READY
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-full bg-[#e7e8e9]/50 px-4 py-2">
                <div className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4800b2] opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4800b2]"></span>
                </div>
                <span className="font-label text-[10px] font-bold uppercase tracking-widest text-[#494456]">
                  SYSTEM LIVE
                </span>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}
