import type { ReactNode } from "react"

const STEPS = [
  { n: 1 as const, label: "Profile" },
  { n: 2 as const, label: "Contact" },
  { n: 3 as const, label: "Access" },
]

export type RegisterOrgWizardStep = 1 | 2 | 3

function progressWidth(step: RegisterOrgWizardStep, allComplete: boolean) {
  if (allComplete) return "w-full"
  if (step === 1) return "w-1/3"
  if (step === 2) return "w-2/3"
  return "w-full"
}

export type RegisterOrgWizardLayoutProps = {
  step: RegisterOrgWizardStep
  allStepsComplete?: boolean
  children: ReactNode
}

export function RegisterOrgWizardLayout({
  step,
  allStepsComplete = false,
  children,
}: RegisterOrgWizardLayoutProps) {
  const barClass = progressWidth(step, allStepsComplete)

  return (
    <main className="flex h-screen items-stretch overflow-hidden bg-[#f8f9fa] font-display text-[#191c1d] antialiased">
      <aside className="relative hidden w-2/5 flex-col items-center justify-center overflow-hidden bg-[#4800b2] p-10 lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#6200ee] opacity-30 mix-blend-multiply blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#674dae] opacity-30 mix-blend-multiply blur-3xl" />
        <div className="relative z-10 flex flex-col items-center gap-12 text-center">
          {/* Tagline */}
          <div>
            <h1 className="font-headline text-4xl font-extrabold leading-tight tracking-tight text-white">
              Your Organization.<br />
              <span className="text-[#d0beff]">One Platform.</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[#e8ddff] opacity-80">
              Register once. Manage teams, projects,<br />incidents and compliance — all in one place.
            </p>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 border-t border-white/10 pt-8 w-full">
            {[
              { value: "5,000+", label: "Organizations" },
              { value: "99.9%", label: "Uptime SLA" },
              { value: "24/7", label: "Support" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-extrabold text-white">{value}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-[#d0beff]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
      <section className="flex flex-1 flex-col bg-white px-8 py-8 pb-12 md:px-20 md:py-10 md:pb-16 overflow-y-auto">
        <nav className="mx-auto mb-5 w-full max-w-5xl">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-5 right-5 top-5 z-0 h-0.5 -translate-y-1/2 bg-[#e7e8e9]" />
            <div
              className={`absolute left-5 top-5 z-0 h-0.5 ${barClass} -translate-y-1/2 bg-[#4800b2] transition-[width] duration-500 ease-in-out`}
            />
            {STEPS.map(({ n, label }) => {
              const done = allStepsComplete || n < step
              const current = !allStepsComplete && n === step

              return (
                <div
                  key={n}
                  className="relative z-10 flex flex-col items-center gap-2"
                >
                  <div
                    className={
                      done || current
                        ? "flex h-10 w-10 items-center justify-center rounded-full bg-[#4800b2] font-bold text-white shadow-lg shadow-[#4800b2]/20"
                        : "flex h-10 w-10 items-center justify-center rounded-full bg-[#e7e8e9] font-bold text-[#494456]"
                    }
                  >
                    {done ? (
                      <span className="material-symbols-outlined text-lg text-white">
                        check
                      </span>
                    ) : (
                      <span>{n}</span>
                    )}
                  </div>
                  <span
                    className={
                      done || current
                        ? "text-[10px] font-bold uppercase tracking-widest text-[#4800b2]"
                        : "text-[10px] font-semibold uppercase tracking-widest text-[#494456]"
                    }
                  >
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </nav>
        <div
          key={step}
          className="mx-auto w-full max-w-5xl"
          style={{
            animation: "fadeSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
        >
          <style>{`
            @keyframes fadeSlideIn {
              from { opacity: 0; transform: translateY(16px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          {children}
        </div>
      </section>
    </main>
  )
}

