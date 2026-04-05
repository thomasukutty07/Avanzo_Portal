import { toast } from "sonner"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { SuperAdminChrome } from "@/components/layout/SuperAdminChrome"
import { useState } from "react"
import { 
  ShieldCheck, 
  Lock, 
  Globe, 
  Clock,
  RotateCcw,
  Save,
  Loader2
} from "lucide-react"

export default function SuperAdminSettingsPage() {
  useDesignPortalLightTheme()
  const [loading, setLoading] = useState(false)
  
  const [settings, setSettings] = useState({
    portalVisibility: true,
    maintenanceMode: false,
    twoFactor: true,
    sessionTimeout: "15 Minutes"
  })

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key]
    }))
  }

  const handleSave = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success("System configurations saved successfully.")
    }, 1500)
  }

  const handleReset = () => {
    setSettings({
      portalVisibility: true,
      maintenanceMode: false,
      twoFactor: true,
      sessionTimeout: "15 Minutes"
    })
    toast.info("Configurations reverted to factory defaults.")
  }

  return (
    <SuperAdminChrome>
      <div className="space-y-10 py-8 font-sans text-slate-600">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 text-slate-900">
          <div>
            <h1 className="font-display text-3xl font-black tracking-tight leading-tight">
              Admin Settings
            </h1>
            <p className="text-slate-500 mt-1 font-medium italic">
               Manage global portal configurations and security preferences.
            </p>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={handleReset}
               className="flex items-center gap-3 px-8 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all active:scale-95"
             >
                <RotateCcw className="h-4 w-4 text-slate-400" />
                Reset Defaults
             </button>
             <button 
               onClick={handleSave}
               disabled={loading}
               className="flex items-center gap-3 px-10 py-3 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-violet-900/20 hover:bg-violet-700 transition-all active:scale-95 disabled:opacity-50"
             >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {loading ? 'Saving...' : 'Save Changes'}
             </button>
          </div>
        </header>

        <div className="max-w-4xl space-y-8">
            <section className="rounded-[40px] border border-slate-50 bg-white p-10 shadow-sm space-y-8">
              <div className="flex items-center gap-3">
                 <Globe className="h-5 w-5 text-violet-600" />
                 <h2 className="font-display text-xl font-black text-slate-900 leading-none">
                    General Configuration
                 </h2>
              </div>
              
              <div className="space-y-6">
                <div className="group flex items-center justify-between p-6 rounded-3xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100 shadow-sm hover:shadow-inner" onClick={() => toggleSetting('portalVisibility')}>
                  <div className="space-y-1">
                    <p className="font-black text-slate-900 group-hover:text-violet-600 transition-colors text-sm uppercase tracking-tight">
                      Portal Visibility
                    </p>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed italic">
                      Enable or disable public access to the registration portal.
                    </p>
                  </div>
                  <button className={`relative h-8 w-14 rounded-full transition-all duration-300 ${settings.portalVisibility ? 'bg-violet-600 shadow-lg shadow-violet-600/30' : 'bg-slate-100'}`}>
                    <div className={`absolute top-1.5 size-5 rounded-full bg-white shadow-sm transition-all duration-300 ${settings.portalVisibility ? 'left-7.5' : 'left-1.5'}`} />
                  </button>
                </div>

                <div className="group flex items-center justify-between p-6 rounded-3xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100 shadow-sm hover:shadow-inner" onClick={() => toggleSetting('maintenanceMode')}>
                  <div className="space-y-1">
                    <p className="font-black text-slate-900 group-hover:text-violet-600 transition-colors text-sm uppercase tracking-tight">
                      Maintenance Mode
                    </p>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed italic">
                      Restrict access while performing critical system updates.
                    </p>
                  </div>
                  <button className={`relative h-8 w-14 rounded-full transition-all duration-300 ${settings.maintenanceMode ? 'bg-amber-500 shadow-lg shadow-amber-500/30' : 'bg-slate-100'}`}>
                    <div className={`absolute top-1.5 size-5 rounded-full bg-white shadow-sm transition-all duration-300 ${settings.maintenanceMode ? 'left-7.5' : 'left-1.5'}`} />
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-[40px] border border-slate-50 bg-white p-10 shadow-sm space-y-8">
              <div className="flex items-center gap-3">
                 <ShieldCheck className="h-5 w-5 text-violet-600" />
                 <h2 className="font-display text-xl font-black text-slate-900 leading-none">
                    Security Protocols
                 </h2>
              </div>

              <div className="space-y-6">
                <div className="group flex items-center justify-between p-6 rounded-3xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100 shadow-sm hover:shadow-inner" onClick={() => toggleSetting('twoFactor')}>
                  <div className="space-y-1">
                    <p className="font-black text-slate-900 group-hover:text-violet-600 transition-colors text-sm uppercase tracking-tight">
                      Two-Factor Authentication
                    </p>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed italic">
                      Enforce strict 2FA protocols for all high-level admin accounts.
                    </p>
                  </div>
                  <button className={`relative h-8 w-14 rounded-full transition-all duration-300 ${settings.twoFactor ? 'bg-violet-600 shadow-lg shadow-violet-600/30' : 'bg-slate-100'}`}>
                    <div className={`absolute top-1.5 size-5 rounded-full bg-white shadow-sm transition-all duration-300 ${settings.twoFactor ? 'left-7.5' : 'left-1.5'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50/50 border border-slate-100">
                  <div className="flex items-center gap-4">
                    <Clock className="h-4 w-4 text-violet-600" />
                    <div>
                      <p className="font-black text-slate-900 text-sm uppercase tracking-tight">
                        Session Lifecycle Timeout
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 italic">Duration before automatic logout</p>
                    </div>
                  </div>
                  <select 
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                    className="rounded-2xl border-slate-200 bg-white px-5 py-3 text-xs font-black text-slate-900 focus:ring-4 focus:ring-violet-600/10 focus:border-violet-600 shadow-sm outline-none transition-all"
                  >
                    <option>15 Minutes</option>
                    <option>30 Minutes</option>
                    <option>1 Hour</option>
                    <option>Never Terminate</option>
                  </select>
                </div>
              </div>
            </section>
        </div>
      </div>
    </SuperAdminChrome>
  )
}
