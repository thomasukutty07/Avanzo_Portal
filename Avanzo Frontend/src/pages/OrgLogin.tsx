import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Loader2, Briefcase, Lock, Eye, EyeOff, Check, ArrowRight, ArrowLeft, Mail, Key, ShieldCheck, X } from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import AvanzoLogo from "@/assets/Avanzo Logo corrected and final-png.png"
import { api } from "@/lib/axios"


export default function OrgLogin() {
  useDesignPortalLightTheme()
  const { login, logout } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Forgot password states
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotStep, setForgotStep] = useState<1 | 2>(1)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotCode, setForgotCode] = useState("")
  const [forgotNewPassword, setForgotNewPassword] = useState("")
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false)
  const [forgotError, setForgotError] = useState<string | null>(null)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [demoCode, setDemoCode] = useState<string | null>(null)



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
      if (u.role !== "Admin") {
        logout()
        setError("Personnel credentials detected. Please use the Employee Identity Portal.")
        return
      }
    } catch {
      setError("Invalid email or password")
    } finally {
      setSubmitting(false)
    }
  }

  const handleForgotRequest = async (e: FormEvent) => {
    e.preventDefault()
    const trimmed = forgotEmail.trim()
    if (!trimmed) {
      setForgotError("Please enter your email address")
      return
    }
    setForgotError(null)
    setForgotLoading(true)
    setDemoCode(null)
    try {
      const response = await api.post("/api/auth/password-reset/", { email: trimmed })
      if (response.data && response.data.code) {
        setDemoCode(response.data.code)
        setForgotCode(response.data.code)
      }
      setForgotStep(2)
    } catch (err: any) {
      let msg = "Failed to initiate password reset."
      if (err.response?.data) {
        const data = err.response.data
        if (data.error && typeof data.error === "object") {
          const errorObj = data.error
          msg = errorObj.message || msg
          if (errorObj.details && typeof errorObj.details === "object") {
            const firstDetailKey = Object.keys(errorObj.details)[0]
            if (firstDetailKey) {
              const detailVal = errorObj.details[firstDetailKey]
              msg = Array.isArray(detailVal) ? detailVal[0] : (typeof detailVal === "string" ? detailVal : msg)
            }
          }
        } else if (typeof data === "object") {
          const firstKey = Object.keys(data)[0]
          if (firstKey) {
            const val = data[firstKey]
            msg = Array.isArray(val) ? val[0] : (typeof val === "string" ? val : JSON.stringify(val))
          }
        } else if (typeof data === "string") {
          msg = data
        }
      }
      setForgotError(msg)
    } finally {
      setForgotLoading(false)
    }
  }

  const handleForgotConfirm = async (e: FormEvent) => {
    e.preventDefault()
    if (!forgotCode.trim() || !forgotNewPassword) {
      setForgotError("Please enter the verification code and your new password")
      return
    }
    setForgotError(null)
    setForgotLoading(true)
    try {
      await api.post("/api/auth/password-reset/confirm/", {
        email: forgotEmail.trim(),
        code: forgotCode.trim(),
        new_password: forgotNewPassword,
      })
      setForgotSuccess(true)
    } catch (err: any) {
      let msg = "Reset confirmation failed. Check your code or password strength."
      if (err.response?.data) {
        const data = err.response.data
        if (data.error && typeof data.error === "object") {
          const errorObj = data.error
          msg = errorObj.message || msg
          if (errorObj.details && typeof errorObj.details === "object") {
            const firstDetailKey = Object.keys(errorObj.details)[0]
            if (firstDetailKey) {
              const detailVal = errorObj.details[firstDetailKey]
              msg = Array.isArray(detailVal) ? detailVal[0] : (typeof detailVal === "string" ? detailVal : msg)
            }
          }
        } else if (typeof data === "object") {
          const firstKey = Object.keys(data)[0]
          if (firstKey) {
            const val = data[firstKey]
            msg = Array.isArray(val) ? val[0] : (typeof val === "string" ? val : JSON.stringify(val))
          }
        } else if (typeof data === "string") {
          msg = data
        }
      }
      setForgotError(msg)
    } finally {
      setForgotLoading(false)
    }
  }

  const closeForgotModal = () => {
    setShowForgotModal(false)
    setForgotStep(1)
    setForgotEmail("")
    setForgotCode("")
    setForgotNewPassword("")
    setForgotError(null)
    setForgotSuccess(false)
    setDemoCode(null)
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
      <main className="flex min-h-screen items-stretch flex-row-reverse">
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
            <div className="flex flex-col items-center justify-center gap-8">
              <img src={AvanzoLogo} alt="Avanzo Logo" className="h-32 w-auto brightness-0 invert transition-all duration-700 hover:scale-105" />
            </div>
            <div className="relative z-10 mt-12 max-w-lg">
              <h1 className="mb-6 font-headline text-5xl font-black leading-tight tracking-tighter text-white">
                Organization Portal.
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
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleUp {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-4px); }
              75% { transform: translateX(4px); }
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
                Admin Sign In
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
                    Work Email
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute bottom-3 left-0 size-5 text-[#7a7488] transition-colors group-focus-within:text-[#4800b2]" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@enterprise.com"
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
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-sm font-semibold text-[#4800b2] transition-colors hover:text-[#6200ee] bg-transparent border-none p-0 cursor-pointer"
                >
                  Forgot Password?
                </button>
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
                Don&apos;t have an account?{" "}
                <Link
                  to="/register-org"
                  className="ml-1 font-bold text-[#4800b2] decoration-primary/30 underline-offset-4 hover:underline"
                >
                  Create organization account
                </Link>
              </p>
              <p className="font-medium text-[#494456]">
                Are you an employee?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="ml-1 font-bold text-[#4800b2] decoration-primary/30 underline-offset-4 hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                  Employee Login
                </button>
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Premium Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" style={{ animation: "fadeIn 0.25s ease-out" }}>
          <div 
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 shadow-[0_24px_48px_-12px_rgba(72,0,178,0.16)] border border-[#cbc3d9]/30 transition-all duration-300 transform scale-100"
            style={{ animation: "scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          >
            {/* Close Button */}
            <button 
              type="button"
              onClick={closeForgotModal} 
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-[#7a7488] hover:bg-[#f3f4f5] hover:text-[#4800b2] transition-all"
            >
              <X size={18} />
            </button>

            {forgotSuccess ? (
              // Success Step
              <div className="text-center py-6 space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 animate-bounce">
                  <ShieldCheck size={36} strokeWidth={2} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-headline text-2xl font-bold text-[#191c1d]">
                    Password Reset Complete
                  </h3>
                  <p className="text-sm font-medium text-[#494456] leading-relaxed">
                    Your password has been successfully updated. You can now sign in with your new credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeForgotModal}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#4800b2] to-[#6200ee] px-6 py-4 font-bold text-white shadow-md transition-all hover:opacity-95 active:scale-[0.98]"
                >
                  <span>Return to Sign In</span>
                </button>
              </div>
            ) : (
              // Active Form Step
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-headline text-2xl font-bold tracking-tight text-[#191c1d]">
                    {forgotStep === 1 ? "Forgot Password" : "Reset Password"}
                  </h3>
                  <p className="text-sm font-medium text-[#494456]">
                    {forgotStep === 1 
                      ? "Enter your email to receive a password reset verification code."
                      : "Enter the code generated for your email and set a new password."}
                  </p>
                </div>

                {forgotError && (
                  <div className="rounded-lg bg-red-50 border border-red-100 p-3.5 text-xs font-semibold text-red-600" style={{ animation: "shake 0.4s ease-in-out" }}>
                    {forgotError}
                  </div>
                )}

                {forgotStep === 1 ? (
                  // Step 1: Email Form
                  <form onSubmit={handleForgotRequest} className="space-y-6">
                    <div className="group">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#494456]" htmlFor="forgotEmail">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute bottom-3 left-0 size-5 text-[#7a7488] transition-colors group-focus-within:text-[#4800b2]" />
                        <input
                          id="forgotEmail"
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="admin@enterprise.com"
                          className="w-full border-0 border-b border-[#cbc3d9]/30 bg-transparent pt-2 pb-3 pl-8 text-[#191c1d] placeholder:text-[#7a7488]/40 focus:border-[#4800b2] focus:ring-0 transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#4800b2] to-[#6200ee] px-6 py-4 font-bold text-white shadow-md transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-55"
                    >
                      {forgotLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <span>Request Reset Code</span>
                          <ArrowRight size={18} strokeWidth={3} />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  // Step 2: Code and Password Confirm Form
                  <form onSubmit={handleForgotConfirm} className="space-y-6">
                    {demoCode && (
                      <div className="rounded-xl bg-[#e8ddff]/40 border border-[#cbc3d9]/30 p-4 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#4800b2]">Development Mode Assist</span>
                        <p className="text-xs text-[#191c1d] leading-relaxed">
                          A password reset code has been generated for testing: <strong className="text-sm font-black text-[#4800b2] font-mono tracking-widest">{demoCode}</strong>
                        </p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="group opacity-70">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#494456]">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute bottom-3 left-0 size-5 text-[#7a7488]" />
                          <input
                            type="email"
                            disabled
                            value={forgotEmail}
                            className="w-full border-0 border-b border-[#cbc3d9]/30 bg-transparent pt-2 pb-3 pl-8 text-[#191c1d] focus:ring-0"
                          />
                        </div>
                      </div>

                      <div className="group">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#494456]" htmlFor="forgotCode">
                          Verification Code
                        </label>
                        <div className="relative">
                          <Key className="absolute bottom-3 left-0 size-5 text-[#7a7488] transition-colors group-focus-within:text-[#4800b2]" />
                          <input
                            id="forgotCode"
                            type="text"
                            required
                            maxLength={6}
                            value={forgotCode}
                            onChange={(e) => setForgotCode(e.target.value)}
                            placeholder="123456"
                            className="w-full border-0 border-b border-[#cbc3d9]/30 bg-transparent pt-2 pb-3 pl-8 text-[#191c1d] placeholder:text-[#7a7488]/40 focus:border-[#4800b2] focus:ring-0 font-mono tracking-widest font-bold"
                          />
                        </div>
                      </div>

                      <div className="group">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#494456]" htmlFor="forgotNewPassword">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute bottom-3 left-0 size-5 text-[#7a7488] transition-colors group-focus-within:text-[#4800b2]" />
                          <input
                            id="forgotNewPassword"
                            type={showForgotNewPassword ? "text" : "password"}
                            required
                            value={forgotNewPassword}
                            onChange={(e) => setForgotNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full border-0 border-b border-[#cbc3d9]/30 bg-transparent pt-2 pb-3 pl-8 pr-10 text-[#191c1d] placeholder:text-[#7a7488]/40 focus:border-[#4800b2] focus:ring-0"
                          />
                          <button
                            type="button"
                            onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                            className="absolute bottom-3 right-0 flex items-center justify-center text-[#7a7488] transition-colors hover:text-[#4800b2]"
                          >
                            {showForgotNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#4800b2] to-[#6200ee] px-6 py-4 font-bold text-white shadow-md transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-55"
                      >
                        {forgotLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <span>Reset Password</span>
                            <ArrowRight size={18} strokeWidth={3} />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setForgotStep(1)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#cbc3d9]/20 bg-transparent py-3 text-sm font-semibold text-[#494456] transition-all hover:bg-[#f3f4f5] hover:text-[#191c1d]"
                      >
                        <ArrowLeft size={16} />
                        <span>Back to Email</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

