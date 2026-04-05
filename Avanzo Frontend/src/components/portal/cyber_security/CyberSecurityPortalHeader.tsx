import { useState } from "react"
import { Bell, Search, Menu } from "lucide-react"
import { toast } from "sonner"

interface CyberSecurityPortalHeaderProps {
  onMenuClick?: () => void
}

export function CyberSecurityPortalHeader({ onMenuClick }: CyberSecurityPortalHeaderProps) {
  const [query, setQuery] = useState("")

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur-sm px-4 md:px-6 font-display shadow-sm shadow-slate-100/60">
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
            className="w-full rounded-xl border border-slate-100 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-600/10 outline-none transition-all"
          />
        </form>
      </div>

      {/* Right: notifications only */}
      <div className="ml-4 flex items-center">
        <button
          type="button"
          onClick={() => toast.info("No new security notifications")}
          className="relative p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
      </div>
    </header>
  )
}
