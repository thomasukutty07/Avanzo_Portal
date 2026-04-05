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
  /** Confirmation screen: full progress, all step circles show check */
  allStepsComplete?: boolean
  asideTitle: ReactNode
  asideLead?: ReactNode
  children: ReactNode
}

export function RegisterOrgWizardLayout({
  step,
  allStepsComplete = false,
  asideTitle,
  asideLead,
  children,
}: RegisterOrgWizardLayoutProps) {
  const barClass = progressWidth(step, allStepsComplete)

  return (
    <main className="flex min-h-screen items-stretch bg-[#f8f9fa] font-sans text-[#191c1d] antialiased">
      <aside className="relative hidden w-2/5 flex-col justify-between overflow-hidden bg-[#4800b2] p-16 lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#6200ee] opacity-30 mix-blend-multiply blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#674dae] opacity-30 mix-blend-multiply blur-3xl" />
        <div className="relative z-10">
          <div className="mb-12 text-3xl font-extrabold tracking-tighter text-white">
            Avanzo
          </div>
          <h1 className="font-['Manrope',sans-serif] text-5xl font-extrabold leading-tight tracking-tight text-white">
            {asideTitle}
          </h1>
          {asideLead ? (
            <div className="mt-6 max-w-md text-lg leading-relaxed text-[#e8ddff] opacity-90">
              {asideLead}
            </div>
          ) : null}
        </div>
        <div className="relative z-10 mt-auto">
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-[20px]">
            <img
              className="mb-6 w-full rounded-lg shadow-2xl"
              alt=""
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBq1ndRQVrL3TpQ-wBoCwKB2_7GjgJ-OwN5k_OZbu9pTsb5ysGRntraAzegC8CJlpHJimcWBpIePyv6I3176o1XAAuDKvZufb_ab_5ksdEualBgGCxoM0qM7xOm49xmMH642FUHHOupa6-UTHizC-J9PMIw6yWHrOiZk3OHOqIYjtoM8rVrvbxRbFKO3eKfcxiywGuQnUtLEaipppI5y-D7HOy-5sJpl7SZjJAHm4cmXAxtOp5xjLXoqMGFsY1-2nIg-DxHdL2BF5s"
            />
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6200ee]">
                <span className="material-symbols-outlined text-white">
                  shield_person
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Enterprise Ready
                </p>
                <p className="text-xs text-[#e8ddff]">
                  ISO 27001 &amp; SOC2 Certified
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
      <section className="flex flex-1 flex-col overflow-y-auto bg-white px-8 py-12 md:px-20 md:py-16">
        <nav className="mx-auto mb-12 w-full max-w-xl">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 top-1/2 z-0 h-0.5 w-full -translate-y-1/2 bg-[#e7e8e9]" />
            <div
              className={`absolute left-0 top-1/2 z-0 h-0.5 ${barClass} -translate-y-1/2 bg-[#4800b2] transition-[width] duration-300`}
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
        <div className="mx-auto w-full max-w-xl">{children}</div>
      </section>
    </main>
  )
}
