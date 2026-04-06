import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { Building2, Camera, LogOut, Bell, Settings as SettingsIcon, Shield, User, Smartphone, Key } from "lucide-react"
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
      active ? "bg-violet-600 shadow-md shadow-violet-600/20" : "bg-slate-200"
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
  const [systemAlerts, setSystemAlerts] = useState(true)
  const [emailSummary, setEmailSummary] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canManageOrg =
    user?.role === "Admin" ||
    user?.role === "Organization" ||
    user?.role === "HR"

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1500)),
        {
          loading: "Uploading intelligence node...",
          success: "Unit identity synchronized!",
          error: "Failed to upload node."
        }
      )
    }
  }

  const fullName = user?.first_name ? `${user.first_name} ${user.last_name || ''}` : (user?.email?.split('@')[0] || "Authenticated User")
  const email = user?.email || ""

  return (
    <div className="space-y-12 bg-[#fcfcfd] min-h-[calc(100vh-64px)] p-4 md:p-8 font-sans overflow-x-hidden animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none uppercase font-headline">
            Portal Control
          </h1>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] opacity-60">
            System Identity Registry: {email}
          </p>
        </div>
        <button
          onClick={() => {
            logout()
            navigate("/login", { replace: true })
          }}
          className="flex items-center gap-3 px-6 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-black text-[10px] uppercase tracking-widest transition-all shadow-sm border border-red-100/50"
        >
          <LogOut className="h-4 w-4" />
          Exit Protocol
        </button>
      </div>

      <div className="space-y-12 max-w-6xl">
        {/* Profile Information Section */}
        <section className="space-y-6">
          <header className="flex items-center gap-4">
            <div className="p-2.5 bg-violet-50 rounded-xl text-violet-600 shadow-sm border border-violet-100">
               <User className="h-4 w-4 stroke-[3]" />
            </div>
            <h3 className="text-slate-900 font-black text-[11px] uppercase tracking-[0.2em]">
              Core Identity Profile
            </h3>
          </header>
          
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-10 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-violet-600/5" />
            <div className="relative group/avatar cursor-pointer">
              <div className="p-1.5 rounded-full bg-gradient-to-br from-violet-200 to-violet-600 shadow-xl shadow-violet-600/20 group-hover:rotate-12 transition-transform duration-700">
                <div className="h-28 w-28 bg-white rounded-full p-1.5 shadow-inner">
                   <div className="h-full w-full bg-violet-50 rounded-full flex items-center justify-center text-violet-600 text-3xl font-black font-display overflow-hidden relative shadow-inner">
                      <img 
                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${fullName}&backgroundColor=f5f3ff`} 
                        alt={fullName}
                        className="h-full w-full object-cover scale-110 group-hover/avatar:scale-125 transition-transform duration-700"
                      />
                   </div>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
              <button 
                className="absolute bottom-1 right-1 bg-violet-600 p-2.5 rounded-2xl text-white shadow-xl border-4 border-white hover:bg-violet-700 transition-colors active:scale-95 group/btn"
                onClick={() => fileInputRef.current?.click()}
              >
                 <Camera className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
              </button>
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-6">
               <div>
                  <h4 className="text-xl font-black text-slate-900 font-headline tracking-tight uppercase">{fullName}</h4>
                  <p className="text-sm font-bold text-slate-400 mt-2 lowercase opacity-80">{email}</p>
               </div>
               <div className="flex items-center justify-center md:justify-start gap-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-violet-600/20 active:scale-95">
                         Edit Dossier
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-[2.5rem] p-10 border-slate-100 font-sans shadow-2xl">
                      <DialogHeader className="mb-8">
                        <DialogTitle className="text-xl font-black text-slate-900 uppercase tracking-tight font-headline">Update Unit Record</DialogTitle>
                        <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-3">
                          Synchronize your personal intelligence profile.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2.5">
                             <label className="text-[9px] font-black uppercase tracking-widest text-slate-300">Given Name</label>
                             <input type="text" defaultValue={user?.first_name} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white outline-none transition-all" />
                          </div>
                          <div className="space-y-2.5">
                             <label className="text-[9px] font-black uppercase tracking-widest text-slate-300">Family Name</label>
                             <input type="text" defaultValue={user?.last_name} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white outline-none transition-all" />
                          </div>
                        </div>
                        <div className="space-y-2.5">
                           <label className="text-[9px] font-black uppercase tracking-widest text-slate-300">Primary Contact</label>
                           <input type="email" defaultValue={email} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white outline-none transition-all" />
                        </div>
                      </div>
                      <div className="flex gap-4 mt-10">
                        <DialogTrigger asChild>
                           <button onClick={() => toast.success("Intelligence synchronized successfully!")} className="flex-1 px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all">
                             Deploy Changes
                           </button>
                        </DialogTrigger>
                         <DialogTrigger asChild>
                          <button className="flex-1 px-5 py-3 bg-slate-50 text-slate-400 hover:text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl transition-colors">
                            Abort
                          </button>
                        </DialogTrigger>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <button className="px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all border border-slate-100">
                     Reset Terminal
                  </button>
               </div>
            </div>
          </div>
        </section>

        {/* Security / Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Security Section */}
           <section className="space-y-6">
              <header className="flex items-center gap-4">
                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 shadow-sm border border-blue-100">
                   <Shield className="h-4 w-4 stroke-[3]" />
                </div>
                <h3 className="text-slate-900 font-black text-[11px] uppercase tracking-[0.2em]">
                  Security protocols
                </h3>
              </header>
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                 <div className="p-8 flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 transition-colors">
                    <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Access Key</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 lowercase opacity-60">Last updated mission day 42</p>
                    </div>
                    <button className="p-3 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all">
                       <Key className="size-5" />
                    </button>
                 </div>
                 <div className="p-8 flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 transition-colors">
                    <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">2FA AUTHENTICATION</h4>
                        <p className="text-[10px] font-black text-emerald-500 mt-2 tracking-widest uppercase">ACTIVE NODES SECURED</p>
                    </div>
                    <div className="size-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                       <Smartphone className="size-5" />
                    </div>
                 </div>
              </div>
           </section>

           {/* Telemetry Section */}
           <section className="space-y-6">
              <header className="flex items-center gap-4">
                <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 shadow-sm border border-amber-100">
                   <Bell className="h-4 w-4 stroke-[3]" />
                </div>
                <h3 className="text-slate-900 font-black text-[11px] uppercase tracking-[0.2em]">
                  Telemetry Feeds
                </h3>
              </header>
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                 <div className="p-8 flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => setSystemAlerts(!systemAlerts)}>
                    <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">System Awareness</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 lowercase opacity-60">Critical tactical alerts only</p>
                    </div>
                    <Toggle active={systemAlerts} onClick={() => {}} />
                 </div>
                 <div className="p-8 flex items-center justify-between group cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => setEmailSummary(!emailSummary)}>
                    <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Mission Sync</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 lowercase opacity-60">Weekly operational intelligence</p>
                    </div>
                    <Toggle active={emailSummary} onClick={() => {}} />
                 </div>
              </div>
           </section>
        </div>

        {/* Administration Section */}
        {canManageOrg && (
          <section className="space-y-8 pt-10 border-t border-slate-100">
             <header className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-xl">
                   <Building2 className="h-4 w-4 stroke-[3]" />
                </div>
                <h3 className="text-slate-900 font-black text-[11px] uppercase tracking-[0.2em]">
                  Organization Alignment
                </h3>
             </header>
             <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <OrgDepartmentsDesignations />
             </div>
          </section>
        )}
      </div>
    </div>
  )
}
