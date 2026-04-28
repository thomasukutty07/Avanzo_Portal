import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { 
  Camera, 
  LogOut, 
  User, 
  Layers, 
  ShieldCheck, 
  Workflow, 
  UserCircle
} from "lucide-react"
import { UserAvatar } from "@/components/shared/UserAvatar"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function SettingsLegacyPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canManageOrg =
    user?.role === "Admin" ||
    user?.role === "Organization" ||
    user?.role === "HR" ||
    user?.role === "Team Lead"

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1500)),
        {
          loading: "Uploading photo...",
          success: "Profile updated!",
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
          <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none font-headline">
            Account Settings
          </h1>
          <p className="text-slate-400 font-bold text-[10px] opacity-60">
            Email Address: {email}
          </p>
        </div>
        <button
          onClick={() => {
            logout()
            navigate("/login", { replace: true })
          }}
          className="flex items-center gap-3 px-6 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-black text-[11px] transition-all shadow-sm border border-red-100/50"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
        <Tabs defaultValue="profile" className="w-full">
          <div className="flex border-b border-slate-100 mb-8 w-full overflow-x-auto no-scrollbar">
            <TabsList className="bg-transparent border-none gap-8 h-auto p-0">
              <TabsTrigger 
                value="profile" 
                className="pb-4 rounded-none !border-x-0 !border-t-0 border-b-2 border-b-transparent text-sm font-bold text-slate-400 data-[state=active]:!border-x-0 data-[state=active]:!border-t-0 data-[state=active]:border-b-violet-600 data-[state=active]:text-violet-600 data-[state=active]:bg-transparent transition-all flex items-center gap-2 whitespace-nowrap px-0 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:outline-none focus-visible:!border-none focus:outline-none ring-0 !shadow-none outline-none"
              >
                <UserCircle className="size-4" />
                Profile
              </TabsTrigger>
              
              {canManageOrg && (
                <>
                  <TabsTrigger 
                    value="departments" 
                    className="pb-4 rounded-none !border-x-0 !border-t-0 border-b-2 border-b-transparent text-sm font-bold text-slate-400 data-[state=active]:!border-x-0 data-[state=active]:!border-t-0 data-[state=active]:border-b-violet-600 data-[state=active]:text-violet-600 data-[state=active]:bg-transparent transition-all flex items-center gap-2 whitespace-nowrap px-0 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:outline-none focus-visible:!border-none focus:outline-none ring-0 !shadow-none outline-none"
                  >
                    <Layers className="size-4" />
                    Department
                  </TabsTrigger>
                  <TabsTrigger 
                    value="designations" 
                    className="pb-4 rounded-none !border-x-0 !border-t-0 border-b-2 border-b-transparent text-sm font-bold text-slate-400 data-[state=active]:!border-x-0 data-[state=active]:!border-t-0 data-[state=active]:border-b-violet-600 data-[state=active]:text-violet-600 data-[state=active]:bg-transparent transition-all flex items-center gap-2 whitespace-nowrap px-0 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:outline-none focus-visible:!border-none focus:outline-none ring-0 !shadow-none outline-none"
                  >
                    <ShieldCheck className="size-4" />
                    Job Titles
                  </TabsTrigger>
                  <TabsTrigger 
                    value="services" 
                    className="pb-4 rounded-none !border-x-0 !border-t-0 border-b-2 border-b-transparent text-sm font-bold text-slate-400 data-[state=active]:!border-x-0 data-[state=active]:!border-t-0 data-[state=active]:border-b-violet-600 data-[state=active]:text-violet-600 data-[state=active]:bg-transparent transition-all flex items-center gap-2 whitespace-nowrap px-0 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:outline-none focus-visible:!border-none focus:outline-none ring-0 !shadow-none outline-none"
                  >
                    <Workflow className="size-4" />
                    Project categories
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </div>

          <TabsContent value="profile" className="mt-0 outline-none space-y-12">
            {/* Profile Information Section */}
            <section className="space-y-6">
              <header className="flex items-center gap-4">
                <div className="p-2.5 bg-violet-50 rounded-xl text-violet-600 shadow-sm border border-violet-100">
                   <User className="h-4 w-4 stroke-[3]" />
                </div>
                <h3 className="text-slate-900 font-black text-[12px]">
                  Profile Information
                </h3>
              </header>
              
              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-10 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-violet-600/5" />
                <div className="relative group/avatar cursor-pointer">
                  <div className="p-1.5 rounded-full bg-gradient-to-br from-violet-200 to-violet-600 shadow-xl shadow-violet-600/20 group-hover:rotate-12 transition-transform duration-700">
                    <div className="h-28 w-28 bg-white rounded-full p-1.5 shadow-inner">
                       <div className="h-full w-full rounded-full flex items-center justify-center overflow-hidden relative">
                          <UserAvatar firstName={user?.first_name} lastName={user?.last_name} gender={user?.gender} size={112} className="!border-none !ring-0 text-4xl" />
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
                      <h4 className="text-xl font-black text-slate-900 font-headline tracking-tight">{fullName}</h4>
                      <p className="text-sm font-bold text-slate-400 mt-2 opacity-80">{email}</p>
                   </div>
                   <div className="flex items-center justify-center md:justify-start gap-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-black text-[11px] rounded-xl transition-all shadow-lg shadow-violet-600/20 active:scale-95 uppercase tracking-widest">
                             Edit Profile
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md rounded-[2.5rem] p-0 border-none font-sans shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden">
                          <div className="bg-gradient-to-br from-white to-slate-50/50 p-10">
                            <DialogHeader className="mb-10">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="size-10 bg-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-violet-600/20">
                                  <User className="size-5" />
                                </div>
                                <div>
                                  <DialogTitle className="text-xl font-black text-slate-900 tracking-tight font-headline uppercase">Edit Profile</DialogTitle>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Personal Identity</p>
                                </div>
                              </div>
                              <DialogDescription className="text-xs font-medium text-slate-500 leading-relaxed">
                                Update your personal information below. These changes will be reflected across all portals.
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">First Name</label>
                                   <input 
                                     type="text" 
                                     defaultValue={user?.first_name} 
                                     className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-violet-600/5 focus:border-violet-600 outline-none transition-all shadow-sm" 
                                   />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Last Name</label>
                                   <input 
                                     type="text" 
                                     defaultValue={user?.last_name} 
                                     className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-violet-600/5 focus:border-violet-600 outline-none transition-all shadow-sm" 
                                   />
                                </div>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Email Address</label>
                                 <input 
                                   type="email" 
                                   defaultValue={email} 
                                   className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-violet-600/5 focus:border-violet-600 outline-none transition-all shadow-sm" 
                                 />
                              </div>
                            </div>

                            <div className="flex gap-4 mt-12">
                              <DialogTrigger asChild>
                                 <button 
                                   onClick={() => toast.success("Profile updated successfully!")} 
                                   className="flex-[2] px-5 py-4 bg-violet-600 hover:bg-violet-700 text-white font-black text-[11px] rounded-2xl transition-all shadow-xl shadow-violet-600/20 active:scale-95 uppercase tracking-widest"
                                 >
                                   Save Changes
                                 </button>
                              </DialogTrigger>
                               <DialogTrigger asChild>
                                <button className="flex-1 px-5 py-4 bg-slate-100/50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 font-black text-[11px] rounded-2xl transition-all active:scale-95 uppercase tracking-widest">
                                  Cancel
                                </button>
                              </DialogTrigger>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <button className="px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-400 font-black text-[11px] rounded-xl transition-all border border-slate-100">
                         Reset Password
                      </button>
                   </div>
                </div>
              </div>
            </section>

          </TabsContent>

          {canManageOrg && (
            <OrgDepartmentsDesignations />
          )}
        </Tabs>
      </div>
    </div>
  )
}
