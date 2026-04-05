import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { Building2, Camera, LogOut, Bell, Settings as SettingsIcon, Shield, User, Smartphone, Key, Upload } from "lucide-react"
import { OrgDepartmentsDesignations } from "@/components/organization/OrgDepartmentsDesignations"
import { useState, useRef } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const Toggle = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out relative flex items-center shrink-0 ${
      active ? "bg-[#a855f7]" : "bg-slate-200"
    }`}
  >
    <div
      className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out shadow-sm ${
        active ? "translate-x-6" : "translate-x-0"
      }`}
    />
  </button>
)

export default function SettingsLegacyPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const canManageOrg =
    user?.role === "Admin" ||
    user?.role === "Organization" ||
    user?.role === "HR"

  const [systemAlerts, setSystemAlerts] = useState(true)
  const [emailSummary, setEmailSummary] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1500)),
        {
          loading: "Uploading new avatar...",
          success: "Avatar updated successfully!",
          error: "Failed to upload avatar."
        }
      )
    }
  }

  // Use actual user data or fallback
  const fullName = user?.first_name ? `${user.first_name} ${user.last_name || ''}` : "Alex Avanzo"
  const email = user?.email || "alex.a@avanzo-sys.com"
  const initials = user?.first_name ? `${user.first_name.charAt(0)}${user.last_name?.charAt(0) || ''}` : "AA"

  return (
    <div className="space-y-12 bg-[#fcfcfd] min-h-[calc(100vh-64px)] p-6 md:p-12 font-sans overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[32px] font-black tracking-tight text-slate-900 leading-tight font-display">
            Settings
          </h1>
          <p className="text-slate-500 font-medium">
            {email}
          </p>
        </div>
        <button
          onClick={() => {
            logout()
            navigate("/login", { replace: true })
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 font-bold text-sm transition-all shadow-sm"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>

      <div className="space-y-10">
        {/* Profile Information Section */}
        <section className="space-y-4">
          <h3 className="flex items-center gap-2 text-[#a855f7] font-bold text-lg">
            <User className="h-5 w-5 stroke-[2.5]" />
            Profile Information
          </h3>
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
            <div className="relative group cursor-pointer">
              {/* Avatar Border Gradient */}
              <div className="p-1.5 rounded-full bg-gradient-to-br from-violet-200 to-[#a855f7]">
                <div className="h-24 w-24 bg-white rounded-full p-1">
                   <div className="h-full w-full bg-violet-50 rounded-full flex items-center justify-center text-violet-600 text-3xl font-black font-display overflow-hidden relative">
                      {/* Placeholder for avatar styling in design */}
                      <img 
                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${fullName}&backgroundColor=f5f3ff`} 
                        alt={fullName}
                        className="h-full w-full object-cover scale-110"
                      />
                   </div>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <button 
                className="absolute bottom-1 right-1 bg-[#a855f7] p-2 rounded-full text-white shadow-lg border-2 border-white hover:scale-110 transition-transform"
                onClick={() => fileInputRef.current?.click()}
              >
                 <Camera className="h-3 w-3" />
              </button>
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-4">
               <div>
                  <h4 className="text-xl font-black text-slate-900">{fullName}</h4>
                  <p className="text-sm font-medium text-slate-500 mt-1">{email}</p>
               </div>
               <div className="flex items-center justify-center md:justify-start gap-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="px-6 py-2.5 bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-purple-500/20 active:scale-95">
                         Edit Profile
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-3xl p-6 border-slate-100 shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900">Edit Profile</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500">
                          Update your personal information below.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-5 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-xs font-black uppercase tracking-widest text-slate-400">First Name</label>
                             <input type="text" defaultValue={user?.first_name || "Alex"} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-violet-600/20 transition-all" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-black uppercase tracking-widest text-slate-400">Last Name</label>
                             <input type="text" defaultValue={user?.last_name || "Avanzo"} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-violet-600/20 transition-all" />
                          </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</label>
                           <input type="email" defaultValue={email} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-violet-600/20 transition-all" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 mt-4">
                        <DialogTrigger asChild>
                          <button className="px-5 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 font-bold text-sm transition-colors">
                            Cancel
                          </button>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                           <button onClick={() => toast.success("Profile updated successfully!")} className="px-5 py-2.5 bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-purple-500/20">
                             Save Changes
                           </button>
                        </DialogTrigger>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <button className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition-all active:scale-95">
                     Reset
                  </button>
               </div>
            </div>
          </div>
        </section>

        {/* Security & Privacy Section */}
        <section className="space-y-4">
          <h3 className="flex items-center gap-2 text-[#a855f7] font-bold text-lg">
            <Shield className="h-5 w-5 stroke-[2.5]" />
            Security & Privacy
          </h3>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
             
             <div className="p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
                <div>
                   <h4 className="text-base font-bold text-slate-900">Password</h4>
                   <p className="text-sm font-medium text-slate-400 mt-1">{email}</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="px-5 py-2.5 border-2 border-violet-100 text-[#a855f7] hover:bg-violet-50 font-bold text-xs uppercase tracking-widest rounded-xl transition-all whitespace-nowrap">
                       Change Password
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md rounded-3xl p-6 border-slate-100 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black text-slate-900">Change Password</DialogTitle>
                      <DialogDescription className="text-sm font-medium text-slate-500">
                        Update the password for your account {email}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                         <label className="text-xs font-black uppercase tracking-widest text-slate-400">Current Password</label>
                         <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-violet-600/20 transition-all" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black uppercase tracking-widest text-slate-400">New Password</label>
                         <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-violet-600/20 transition-all" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black uppercase tracking-widest text-slate-400">Confirm New Password</label>
                         <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-violet-600/20 transition-all" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                      <DialogTrigger asChild>
                        <button className="px-5 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 font-bold text-sm transition-colors">
                          Cancel
                        </button>
                      </DialogTrigger>
                      <DialogTrigger asChild>
                         <button onClick={() => toast.success("Password updated successfully!")} className="px-5 py-2.5 bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-purple-500/20">
                           Update Password
                         </button>
                      </DialogTrigger>
                    </div>
                  </DialogContent>
                </Dialog>
             </div>

             <div className="p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
                <div>
                   <h4 className="text-base font-bold text-slate-900">Two-Factor Authentication (2FA)</h4>
                   <p className="text-sm font-medium text-slate-400 mt-1">{email}</p>
                </div>
                <div className="flex items-center gap-4">
                   <span className="bg-emerald-100 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                     Enabled
                   </span>
                   <Dialog>
                     <DialogTrigger asChild>
                       <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                          <SettingsIcon className="h-5 w-5" />
                       </button>
                     </DialogTrigger>
                     <DialogContent className="sm:max-w-md rounded-3xl p-6 border-slate-100 shadow-2xl">
                       <DialogHeader>
                         <DialogTitle className="text-xl font-black text-slate-900">Two-Factor Authentication</DialogTitle>
                         <DialogDescription className="text-sm font-medium text-slate-500">
                           Manage your 2FA methods to secure your {email} account.
                         </DialogDescription>
                       </DialogHeader>
                       <div className="space-y-4 py-4">
                         <div className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-violet-100 bg-violet-50/30">
                           <div className="flex gap-4 items-center">
                             <div className="h-10 w-10 flex shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                               <Smartphone className="h-5 w-5" />
                             </div>
                             <div>
                               <h5 className="text-sm font-bold text-slate-900">Authenticator App</h5>
                               <p className="text-xs font-medium text-slate-500 mt-0.5">Configured via Google Authenticator</p>
                             </div>
                           </div>
                           <button className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest pt-1">
                             Remove
                           </button>
                         </div>

                         <div className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-slate-100">
                           <div className="flex gap-4 items-center">
                             <div className="h-10 w-10 flex shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                               <Key className="h-5 w-5" />
                             </div>
                             <div>
                               <h5 className="text-sm font-bold text-slate-900">Recovery Codes</h5>
                               <p className="text-xs font-medium text-slate-500 mt-0.5">8 unused codes remaining</p>
                             </div>
                           </div>
                           <button className="text-xs font-bold text-violet-600 hover:text-violet-700 transition-colors uppercase tracking-widest pt-1">
                             Regenerate
                           </button>
                         </div>
                       </div>
                       <div className="flex justify-end gap-3 mt-4">
                         <DialogTrigger asChild>
                           <button className="px-5 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 font-bold text-sm transition-colors">
                             Close
                           </button>
                         </DialogTrigger>
                       </div>
                     </DialogContent>
                   </Dialog>
                </div>
             </div>

          </div>
        </section>

        {/* Notification Preferences Section */}
        <section className="space-y-4">
          <h3 className="flex items-center gap-2 text-[#a855f7] font-bold text-lg">
            <Bell className="h-5 w-5 stroke-[2.5]" />
            Notification Preferences
          </h3>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
             
             <div className="p-8 flex flex-row items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setSystemAlerts(!systemAlerts)}>
                <div>
                   <h4 className="text-base font-bold text-slate-900">System Alerts</h4>
                   <p className="text-sm font-medium text-slate-400 mt-1">{email}</p>
                </div>
                <Toggle active={systemAlerts} onClick={() => setSystemAlerts(!systemAlerts)} />
             </div>

             <div className="p-8 flex flex-row items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setEmailSummary(!emailSummary)}>
                <div>
                   <h4 className="text-base font-bold text-slate-900">Email Summary</h4>
                   <p className="text-sm font-medium text-slate-400 mt-1">Weekly reports and insights</p>
                </div>
                <Toggle active={emailSummary} onClick={() => setEmailSummary(!emailSummary)} />
             </div>

          </div>
        </section>

        {/* Admin/Organization Extension (Preserved functionality) */}
        {canManageOrg && (
          <section className="space-y-4 pt-4 border-t border-slate-100">
             <h3 className="flex items-center gap-2 text-slate-700 font-bold text-lg">
               <Building2 className="h-5 w-5 stroke-[2.5]" />
               Advanced Organization Configuration
             </h3>
             <div className="bg-white pl-1 rounded-3xl">
                <OrgDepartmentsDesignations />
             </div>
          </section>
        )}
      </div>
    </div>
  )
}
