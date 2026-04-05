import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"

const roles = [
  {
    icon: "admin_panel_settings",
    title: "Admin",
    description:
      "Full system access, user management, and global configurations.",
  },
  {
    icon: "groups",
    title: "HR Manager",
    description:
      "Personnel records, payroll management, and recruitment pipelines.",
  },
  {
    icon: "leaderboard",
    title: "Team Lead",
    description:
      "Project tracking, team performance, and resource allocation.",
  },
  {
    icon: "badge",
    title: "Employee",
    description:
      "Personal dashboard, task management, and self-service tools.",
  },
] as const

export default function RoleSelectionPage() {
  useDesignPortalLightTheme()

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f8f9fa] font-display text-[#1c1b1f] antialiased">
      <header className="flex items-center justify-between border-b border-[#e7e0ef] px-6 py-4 lg:px-20">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#6200ee] text-white">
            <span className="material-symbols-outlined text-2xl">
              rocket_launch
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Avanzo</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden flex-col items-end md:flex">
            <span className="text-sm font-medium">System Gateway</span>
            <span className="text-xs text-slate-500">v4.2.0-stable</span>
          </div>
          <div className="flex size-10 items-center justify-center rounded-full border border-[#5a5af6]/30 bg-[#5a5af6]/20">
            <span className="material-symbols-outlined text-[#5a5af6]">
              person
            </span>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 lg:py-20">
        <div className="w-full max-w-4xl">
          <div className="mb-8 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-center text-sm text-slate-600 shadow-sm">
            <p className="font-semibold text-slate-800">System hierarchy</p>
            <p className="mt-1 font-mono text-xs text-slate-500 md:text-sm">
              Super Admin → Organization → Admin → HR → Team Lead → Employee
            </p>
          </div>
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-black tracking-tight md:text-5xl">
              Select Your Role
            </h1>
            <p className="mx-auto max-w-lg text-lg text-slate-600">
              Choose your workspace environment to continue to the enterprise
              dashboard.
            </p>
          </div>
          <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map((role) => (
              <button
                key={role.title}
                type="button"
                className="group relative flex flex-col items-start rounded-xl border-2 border-slate-200 bg-white p-6 text-left transition-all duration-300 hover:border-[#5a5af6]"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-[#5a5af6]/10 transition-colors group-hover:bg-[#5a5af6] group-hover:text-white">
                  <span className="material-symbols-outlined">{role.icon}</span>
                </div>
                <h3 className="mb-2 text-lg font-bold">{role.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {role.description}
                </p>
                <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="material-symbols-outlined text-sm text-[#5a5af6]">
                    check_circle
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              className="flex h-14 w-full max-w-md items-center justify-center gap-2 rounded-xl bg-[#5a5af6] font-bold text-white shadow-lg shadow-[#5a5af6]/20 transition hover:bg-[#5a5af6]/90"
            >
              <span>Confirm Selection</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <p className="text-xs text-slate-500">
              Not sure which role to pick?{" "}
              <a className="text-[#5a5af6] hover:underline" href="#">
                Contact your system administrator
              </a>
              .
            </p>
          </div>
        </div>
      </main>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-24 size-96 rounded-full bg-[#5a5af6]/5 blur-3xl" />
        <div className="absolute -right-24 top-1/2 size-96 rounded-full bg-[#5a5af6]/10 blur-3xl" />
      </div>
      <footer className="p-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Avanzo Enterprise. Secure Access Protocol
        Active.
      </footer>
    </div>
  )
}

