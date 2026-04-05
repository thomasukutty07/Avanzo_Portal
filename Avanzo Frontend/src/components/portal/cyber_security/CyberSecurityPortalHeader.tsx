import { useState } from "react"
import { Bell, Search, Menu } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

const PROFILE_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDzgVkabVGiXiA6U8CKH1uEo2cviFMMhGE3m61Lf-HlkVCFU0mxSigT7qAoTykRrl1baKV1YIvoQUH5rUYo-xmTt4SVHNeuMb0ea2lBxVyMjDVZOzjhGcdbmzIQYvZO0BHOU2lBwKYGyHAZd9Nc62y03TuhGlGkcHqNi7d-ZEHFs5NMYQG4ODpY6IsuWG31eC6vuIaEaWGg4H66p1UmBoHr9uSbLl03VivPw1e5vXOCzk-rQ3R_Me2jBcFdLjfIqxWfcqSQmDFliE4"

interface CyberSecurityPortalHeaderProps {
  onMenuClick?: () => void
}

export function CyberSecurityPortalHeader({ onMenuClick }: CyberSecurityPortalHeaderProps) {
  const [query, setQuery] = useState("")
  const { user } = useAuth()
  const name = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email
    : "Security Analyst"
  const role = user?.designation_name ?? user?.role ?? "Security Admin"

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur-sm px-4 md:px-6 font-headline">
      {/* Left: mobile menu + search */}
      <div className="flex flex-1 items-center gap-3">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <form
          className="relative flex-1 max-w-lg"
          onSubmit={(e) => {
            e.preventDefault()
            if (query.trim()) toast.info(`Searching for: ${query}`)
          }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search logs, IPs, or ticket IDs..."
            className="w-full rounded-xl border border-slate-100 bg-slate-50 py-2.5 pl-10 pr-4 text-[13px] font-bold text-slate-900 placeholder:text-slate-300 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-600/5 outline-none transition-all tracking-tight"
          />
        </form>
      </div>

      {/* Right: notifications + profile */}
      <div className="ml-4 flex items-center gap-6">
        <button
          type="button"
          onClick={() => toast.info("No new security notifications")}
          className="relative flex items-center justify-center size-10 rounded-full border border-slate-100 text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white ring-white" />
        </button>

        <div className="h-8 w-px bg-slate-100 hidden sm:block" />

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold leading-none text-slate-900">{name}</p>
            <p className="text-[11px] font-semibold text-slate-500 mt-1">{role}</p>
          </div>
          <img
            alt=""
            className="size-10 rounded-full object-cover shadow-sm ring-2 ring-white"
            src={PROFILE_IMG}
          />
        </div>
      </div>
    </header>
  )
}
