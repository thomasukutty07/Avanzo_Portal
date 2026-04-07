import { useState } from "react"
import { Link } from "react-router-dom"
import { Bell, Search } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { AttendanceClockWidget } from "@/components/shared/AttendanceClockWidget"

const PROFILE_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDzgVkabVGiXiA6U8CKH1uEo2cviFMMhGE3m61Lf-HlkVCFU0mxSigT7qAoTykRrl1baKV1YIvoQUH5rUYo-xmTt4SVHNeuMb0ea2lBxVyMjDVZOzjhGcdbmzIQYvZO0BHOU2lBwKYGyHAZd9Nc62y03TuhGlGkcHqNi7d-ZEHFs5NMYQG4ODpY6IsuWG31eC6vuIaEaWGg4H66p1UmBoHr9uSbLl03VivPw1e5vXOCzk-rQ3R_Me2jBcFdLjfIqxWfcqSQmDFliE4"

export function TechnicalPortalHeader({ onToggleSidebar }: { onToggleSidebar?: (open: boolean) => void }) {
  const [query, setQuery] = useState("")
  const { user } = useAuth()
  const name = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email
    : "Alex Rivera"
  const role = user?.designation_name ?? user?.role ?? "Technical"

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-12">
        {/* Logo removed - Consolidated to Sidebar Branding */}
        
        <form
          className="relative hidden lg:flex items-center w-96"
          onSubmit={(e) => {
            e.preventDefault()
            if (query.trim()) toast.info(`Searching: ${query}`)
          }}
        >
          <Search className="pointer-events-none absolute left-4 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, bugs, or projects..."
            className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 py-2.5 pl-11 pr-4 text-[11px] font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-600/20 focus:border-violet-200 transition-all"
          />
        </form>
      </div>
      
      <div className="flex items-center gap-6 text-right">
        <AttendanceClockWidget onToggleSidebar={onToggleSidebar} />
        
        <button
          type="button"
          onClick={() => toast.info("No unread technical notifications")}
          className="relative flex items-center justify-center size-10 rounded-full border border-slate-100 text-slate-500 hover:bg-slate-50 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute max-w-fit -right-1 -top-1 size-3 rounded-full border-2 border-white bg-red-500" />
        </button>
        
        <div className="h-8 w-px bg-slate-200 hidden sm:block" />
        
        <Link 
          to="/technical/profile"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer group"
        >
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold leading-none text-slate-900 group-hover:text-violet-600 transition-colors uppercase italic">
              {name}
            </p>
            <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-widest italic">{role}</p>
          </div>
          <img
            alt=""
            className="size-10 rounded-full object-cover shadow-sm ring-2 ring-white group-hover:ring-violet-100 transition-all"
            src={PROFILE_IMG}
          />
        </Link>
      </div>
    </div>
  )
}
