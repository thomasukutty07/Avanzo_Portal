import { useState } from "react"
import type { FormEvent } from "react"
import { Link } from "react-router-dom"
import { Copy, Loader2, Shield, AtSign, Lock, Eye, EyeOff, Check, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import {
  DUMMY_ACCOUNTS,
  DUMMY_SHARED_PASSWORD,
  isDummyAuthEnabled,
} from "@/lib/dummyAuth"

export default function Login() {
  useDesignPortalLightTheme()
  const { login, logout } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const copyText = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${what} copied`)
    } catch {
      toast.error("Could not copy to clipboard")
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !password) {
      setError("Please enter email and password")
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const u = await login(trimmed, password)
      if (u.role === "Admin" || u.role === "Super Admin" || u.role === "Organization") {
        logout()
        setError("Administrative credentials detected. Please use the Organization Portal.")
        return
      }
    } catch {
      setError("Invalid email or password")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#f8f9fa] font-display text-[#191c1d] antialiased selection:bg-[#e8ddff] selection:text-[#4800b2]">
      {error && (
        <div className="fixed top-4 left-1/2 z-[100] -translate-x-1/2 rounded-md bg-destructive px-4 py-2 text-sm text-white shadow-lg">
          {error}
        </div>
      )}
      {submitting && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <main className="flex min-h-screen items-stretch">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#6200ee] lg:flex lg:w-1/2">
          <div className="pointer-events-none absolute inset-0 opacity-20">
            <img
              alt=""
              className="h-full w-full object-cover mix-blend-overlay"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtFEpf8aWktW5Fscnv5RzmZOASldfj869lzDF_hPTfGySGHVhfg8RyWelPuEvdFHgAJFsxARg7NU7DJyV0VWwXiwOF6Pce4GlulNNk9RNBCNto_VYPYjQ9v2mNaiNUKYVf4eaew_kmIdmko5LbSZrBSR4_uHDCbARnRCUmiEwNWEeYqV9YOJr46eqvJfyOkfGqwqKbECCDYG1BiGmQGyQ-RcMFhQBvQHfnIki1-2RUy9t_P5TkQ1gtsr45ubw7-cku8BqTEzAeoO4"
            />
          </div>
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-16 text-center"
               style={{ animation: 'fadeSlideIn 0.5s ease-out both' }}>
            <div className="flex items-center justify-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg">
                <Shield className="h-6 w-6 text-[#4800b2]" fill="currentColor" />
              </div>
              <span className="text-3xl font-extrabold tracking-tighter text-white">
                AVANZO CYBER SECURITY
              </span>
            </div>
            <div className="relative z-10 mt-16 max-w-lg">
              <h1 className="mb-6 font-headline text-5xl font-bold leading-tight tracking-tight text-white">
                Welcome to <br />
                <span className="text-[#d0beff]">AVANZO CYBER SECURITY.</span>
              </h1>
            </div>
          </div>
          <div className="relative z-10 p-16 text-center text-sm font-medium uppercase tracking-wide text-[#d0beff]/60">
            © {new Date().getFullYear()} AVANZO CYBER SECURITY. All Rights
            Reserved.
          </div>
        </section>
        <section className="flex w-full items-center justify-center bg-[#f3f4f5] p-8 lg:w-1/2">
          <style>{`
            @keyframes fadeSlideIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div className="w-full max-w-md space-y-10"
               style={{ animation: 'fadeSlideIn 0.5s ease-out both' }}>
            <div className="space-y-2">
              <div className="mb-8 flex items-center gap-2 lg:hidden">
                <span className="text-2xl font-extrabold tracking-tighter text-[#4800b2]">
                  AVANZO CYBER SECURITY
                </span>
              </div>
              <h2 className="font-headline text-3xl font-bold tracking-tight text-[#191c1d]">
                Employee Sign In
              </h2>
              <p className="font-medium text-[#494456]">
                Please enter your credentials.
              </p>
            </div>
            <form className="space-y-6" onSubmit={onSubmit}>
              <div className="space-y-6">
                <div className="group">
                  <label
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#494456]"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <AtSign className="absolute bottom-3 left-0 size-5 text-[#7a7488] transition-colors group-focus-within:text-[#4800b2]" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full border-0 border-b border-[#cbc3d9]/30 bg-transparent pt-2 pb-3 pl-8 text-[#191c1d] placeholder:text-[#7a7488]/40 focus:border-[#4800b2] focus:ring-0"
                    />
                  </div>
                </div>
                <div className="group">
                  <label
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#494456]"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute bottom-3 left-0 size-5 text-[#7a7488] transition-colors group-focus-within:text-[#4800b2]" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border-0 border-b border-[#cbc3d9]/30 bg-transparent pt-2 pb-3 pl-8 pr-10 text-[#191c1d] placeholder:text-[#7a7488]/40 focus:border-[#4800b2] focus:ring-0"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute bottom-3 right-0 flex items-center justify-center text-[#7a7488] transition-colors hover:text-[#4800b2]"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="group flex cursor-pointer items-center gap-3">
                  <div className="relative flex items-center">
                    <input
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-[#cbc3d9]/50 transition-all checked:border-[#4800b2] checked:bg-[#4800b2]"
                      type="checkbox"
                    />
                    <Check className="pointer-events-none absolute left-1/2 -translate-x-1/2 size-3.5 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
                  </div>
                  <span className="text-sm font-medium text-[#494456] transition-colors group-hover:text-[#191c1d]">
                    Keep me signed in
                  </span>
                </label>
                <a
                  className="text-sm font-semibold text-[#4800b2] transition-colors hover:text-[#6200ee]"
                  href="#"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="space-y-4 pt-4">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#4800b2] to-[#6200ee] px-6 py-4 font-bold text-white shadow-[0px_4px_20px_rgba(73,68,86,0.04),0px_12px_40px_rgba(73,68,86,0.08)] transition-all hover:opacity-95 active:scale-[0.98]"
                >
                  <span>Sign In</span>
                  <ArrowRight size={18} strokeWidth={3} />
                </button>
                <div className="relative py-4">
                  <div
                    aria-hidden
                    className="absolute inset-0 flex items-center"
                  >
                    <div className="w-full border-t border-[#cbc3d9]/20" />
                  </div>
                  <div className="relative flex justify-center text-xs font-semibold uppercase tracking-widest">
                    <span className="bg-[#f3f4f5] px-4 font-bold text-[#7a7488]">
                      Or continue with
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#cbc3d9]/10 bg-white py-4 px-6 font-semibold text-[#191c1d] shadow-[0px_4px_20px_rgba(73,68,86,0.04),0px_12px_40px_rgba(73,68,86,0.08)] transition-all hover:bg-[#f8f9fa]"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Authenticate with Google</span>
                </button>
              </div>
            </form>
            <div className="pt-8 text-center space-y-2">
              <p className="font-medium text-[#494456]">
                Are you an organization administrator?{" "}
                <Link
                  to="/org-login"
                  className="ml-1 font-bold text-[#4800b2] decoration-primary/30 underline-offset-4 hover:underline"
                >
                  Organization Portal
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      {isDummyAuthEnabled() && (
        <div className="fixed bottom-4 right-4 z-[101] max-h-[min(60vh,420px)] max-w-sm overflow-y-auto rounded-lg border border-border bg-card/95 p-4 text-xs shadow-lg backdrop-blur-sm">
          <p className="mb-2 font-semibold text-foreground">
            Demo logins (password for all accounts)
          </p>
          <div className="mb-3 flex items-center gap-2">
            <p className="min-w-0 flex-1 break-all font-mono text-[11px] text-muted-foreground">
              {DUMMY_SHARED_PASSWORD}
            </p>
            <button
              type="button"
              className="inline-flex shrink-0 items-center justify-center rounded-md border border-border bg-background p-1.5 text-foreground hover:bg-muted"
              aria-label="Copy demo password"
              onClick={() => copyText(DUMMY_SHARED_PASSWORD, "Password")}
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
          <ul className="space-y-2 text-muted-foreground">
            {DUMMY_ACCOUNTS.map((a) => (
              <li key={a.email}>
                <span className="font-medium text-foreground">{a.label}</span>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="min-w-0 flex-1 break-all font-mono text-[11px]">
                    {a.email}
                  </span>
                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center justify-center rounded-md border border-border bg-background p-1.5 text-foreground hover:bg-muted"
                    aria-label={`Copy ${a.label} email`}
                    onClick={() => copyText(a.email, "Email")}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

