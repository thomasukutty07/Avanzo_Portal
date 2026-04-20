import AVATAR_MALE from "@/assets/avatar_male.png"
import AVATAR_FEMALE from "@/assets/avatar_female.png"

interface UserAvatarProps {
  firstName?: string
  lastName?: string
  className?: string
  size?: number
  gender?: string
}

const COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-cyan-500",
]

export function UserAvatar({ firstName, lastName, className = "", size = 40, gender }: UserAvatarProps) {
  const normalizedGender = gender?.toLowerCase()
  const avatarSrc = normalizedGender === "male" ? AVATAR_MALE : normalizedGender === "female" ? AVATAR_FEMALE : null

  if (avatarSrc) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-full overflow-hidden shadow-sm border-2 border-white ring-1 ring-slate-100 bg-slate-50 ${className}`}
        style={{ width: size, height: size }}
      >
        <img src={avatarSrc} alt="User Avatar" className="w-full h-full object-cover" />
      </div>
    )
  }

  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?"
  
  // Deterministic color based on name
  const nameSum = (firstName || "").length + (lastName || "").length
  const colorClass = COLORS[nameSum % COLORS.length]

  return (
    <div 
      className={`relative flex items-center justify-center rounded-full text-white font-black shadow-sm border-2 border-white ring-1 ring-slate-100 ${colorClass} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      <span className="tracking-tight">{initials}</span>
      <div className="absolute inset-0 rounded-full bg-black/5 pointer-events-none" />
    </div>
  )
}
