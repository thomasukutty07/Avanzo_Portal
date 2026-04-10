import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { HRPortalChrome } from "@/components/portal/hr/HRPortalChrome"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import { 
  Eye, 
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from "lucide-react"

type Step = 'personal' | 'job' | 'security' | 'review'

export default function EmployeeRegistrationPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('personal')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [departments, setDepartments] = useState<any[]>([])
  const [designations, setDesignations] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [loadingForm, setLoadingForm] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [r, d, g] = await Promise.all([
          api.get("/api/auth/roles/"),
          api.get("/api/organization/departments/"),
          api.get("/api/organization/designations/"),
        ])
        setRoles(extractResults(r.data))
        setDepartments(extractResults(d.data))
        setDesignations(extractResults(g.data))
      } catch (e) {
        console.error(e)
      }
    }
    loadData()
  }, [])

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "+91 ",
    gender: "",
    dob: "",
    employeeId: "",
    department: "",
    designation: "",
    joiningDate: "",
    password: "",
    accessRole: ""
  })

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
        setErrors(prev => {
            const next = { ...prev }
            delete next[field]
            return next
        })
    }
  }

  const validateStep = (currentStep: Step) => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 'personal') {
        if (!formData.firstName) newErrors.firstName = "Required"
        if (!formData.lastName) newErrors.lastName = "Required"
        if (!formData.phone) newErrors.phone = "Required"
        if (!formData.gender) newErrors.gender = "Required"
        if (!formData.dob) newErrors.dob = "Required"
    } 
    else if (currentStep === 'job') {
        if (!formData.email) newErrors.email = "Required"
        else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid email format"
        
        if (!formData.employeeId) newErrors.employeeId = "Required"
        if (!formData.department) newErrors.department = "Required"
        if (!formData.designation) newErrors.designation = "Required"
        if (!formData.joiningDate) newErrors.joiningDate = "Required"
    }
    else if (currentStep === 'security') {
        if (!formData.accessRole) newErrors.accessRole = "Required"
        if (!formData.password) newErrors.password = "Required"
        else if (formData.password.length < 10) newErrors.password = "Min 10 characters required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const steps = [
    { id: 'personal', label: 'Personal Info', description: 'Basic identity' },
    { id: 'job', label: 'Job Details', description: 'Organizational post' },
    { id: 'security', label: 'Security', description: 'Portals & passwords' },
    { id: 'review', label: 'Review', description: 'Final verification' },
  ]

  const currentStepIndex = steps.findIndex(s => s.id === step)
  const progressPercent = ((currentStepIndex + 1) / steps.length) * 100

  const handleNext = () => {
    if (validateStep(step)) {
      const nextStep = steps[currentStepIndex + 1]
      if (nextStep) {
        setStep(nextStep.id as Step)
      } else {
        handleSubmit()
      }
    } else {
      toast.error("Please fill in all required fields correctly.")
    }
  }

  const handleBack = () => {
    const prevStep = steps[currentStepIndex - 1]
    if (prevStep) {
      setStep(prevStep.id as Step)
    } else {
      navigate("/employees")
    }
  }

  const handleSubmit = async () => {
    try {
      setLoadingForm(true)
      await api.post("/api/auth/employees/", {
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone || null,
        gender: formData.gender || null,
        date_of_birth: formData.dob || null,
        employee_id: formData.employeeId || null,
        access_role: formData.accessRole || null,
        department: formData.department || null,
        designation: formData.designation || null,
        status: "active",
        date_of_joining: formData.joiningDate || null
      })
      toast.success("Employee registered successfully!", {
        description: `${formData.firstName} ${formData.lastName} has been added to the system.`
      })
      navigate("/employees")
    } catch (e: any) {
      console.error("Registration Error:", e.response?.data || e)
      const data = e.response?.data || {}
      const errorMsg = data.email?.[0] || data.employee_id?.[0] || data.password?.[0] || "Failed to register employee."
      toast.error(errorMsg)
    } finally {
      setLoadingForm(false)
    }
  }

  return (
    <HRPortalChrome>
      <div className="min-h-full bg-slate-50/50 space-y-10 animate-in fade-in duration-500 font-display py-8 px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Employee Registration</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Directly onboard an employee matching backend schemas.</p>
          </div>
          <div className="text-right">
            <p className="text-violet-600 font-bold text-sm">Step {currentStepIndex + 1} of {steps.length}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-tighter uppercase">{steps[currentStepIndex].description}</p>
          </div>
        </div>

        {/* Progress & Tabs */}
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-violet-600 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
            </div>

            <div className="flex items-center gap-8 border-b border-slate-100 overflow-x-auto no-scrollbar">
                {steps.map((s) => (
                    <button 
                      key={s.id}
                      onClick={() => {
                          if (currentStepIndex > steps.findIndex(st => st.id === s.id) || validateStep(step)) {
                              setStep(s.id as Step)
                          }
                      }}
                      className={`pb-4 text-[13px] font-bold transition-all relative whitespace-nowrap ${step === s.id ? 'text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {s.label}
                        {step === s.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 rounded-full" />
                        )}
                    </button>
                ))}
            </div>
        </div>

        {/* Main Form Box */}
        <div className="max-w-4xl mx-auto">
            <Card className="border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
                <CardContent className="p-8 md:p-12 space-y-10">
                    {step === 'personal' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left animate-in slide-in-from-right-4 duration-500">
                            <div className="space-y-2 md:col-span-2">
                               <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Core Identity</h3>
                            </div>
                            <FormField label="First Name" placeholder="e.g. John" error={errors.firstName} value={formData.firstName} onChange={(v) => updateForm('firstName', v)} />
                            <FormField label="Last Name" placeholder="e.g. Doe" error={errors.lastName} value={formData.lastName} onChange={(v) => updateForm('lastName', v)} />
                            <FormField label="Phone Number" placeholder="+91 00000 00000" error={errors.phone} value={formData.phone} onChange={(v) => updateForm('phone', v)} />
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-700 ml-1">Gender</label>
                                <div className="relative">
                                  <select 
                                    className={`w-full h-11 bg-slate-50 border-transparent rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-violet-600/20 focus:bg-white focus:border-violet-100 transition-all outline-none appearance-none cursor-pointer ${errors.gender ? 'ring-2 ring-red-500/20 border-red-200 bg-red-50/10' : ''}`}
                                    value={formData.gender}
                                    onChange={(e) => updateForm('gender', e.target.value)}
                                  >
                                      <option value="">Select Gender</option>
                                      <option value="male">Male</option>
                                      <option value="female">Female</option>
                                      <option value="other">Other</option>
                                      <option value="prefer_not_to_say">Prefer not to say</option>
                                  </select>
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="m6 9 6 6 6-6"/></svg>
                                  </div>
                                </div>
                                {errors.gender && <FormError msg={errors.gender} />}
                            </div>
                            <div className="md:col-span-2">
                                <FormField label="Date of Birth" placeholder="mm/dd/yyyy" type="date" isDatePicker error={errors.dob} value={formData.dob} onChange={(v) => updateForm('dob', v)} />
                            </div>
                        </div>
                    )}

                    {step === 'job' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left animate-in slide-in-from-right-4 duration-500">
                            <div className="space-y-2 md:col-span-2">
                               <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Organizational Post</h3>
                            </div>
                            <FormField label="Work Email" placeholder="john.doe@avanzo.com" type="email" error={errors.email} value={formData.email} onChange={(v) => updateForm('email', v)} />
                            <FormField label="Employee ID" placeholder="e.g. EMP12345" error={errors.employeeId} value={formData.employeeId} onChange={(v) => updateForm('employeeId', v)} />
                            <div className="md:col-span-2">
                                <FormField label="Joining Date" placeholder="mm/dd/yyyy" type="date" isDatePicker error={errors.joiningDate} value={formData.joiningDate} onChange={(v) => updateForm('joiningDate', v)} />
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[13px] font-bold text-slate-700">Department</label>
                                    <button 
                                      onClick={() => navigate("/settings")} 
                                      className="text-[10px] font-black text-violet-600 hover:text-violet-800 transition-colors uppercase tracking-widest"
                                    >
                                      Manage
                                    </button>
                                </div>
                                <select 
                                  className={`w-full h-11 bg-slate-50 border-transparent rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-violet-600/20 focus:bg-white focus:border-violet-100 transition-all outline-none appearance-none cursor-pointer ${errors.department ? 'ring-2 ring-red-500/20 border-red-200 bg-red-50/10' : ''}`}
                                  value={formData.department}
                                  onChange={(e) => updateForm('department', e.target.value)}
                                >
                                    <option value="">Select Dept</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                                {errors.department && <FormError msg={errors.department} />}
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[13px] font-bold text-slate-700">Designation</label>
                                    <button 
                                      onClick={() => navigate("/settings")} 
                                      className="text-[10px] font-black text-violet-600 hover:text-violet-800 transition-colors uppercase tracking-widest"
                                    >
                                      Manage
                                    </button>
                                </div>
                                <select 
                                  className={`w-full h-11 bg-slate-50 border-transparent rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-violet-600/20 focus:bg-white focus:border-violet-100 transition-all outline-none appearance-none cursor-pointer ${errors.designation ? 'ring-2 ring-red-500/20 border-red-200 bg-red-50/10' : ''}`}
                                  value={formData.designation}
                                  onChange={(e) => updateForm('designation', e.target.value)}
                                >
                                    <option value="">Select Designation</option>
                                    {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                                {errors.designation && <FormError msg={errors.designation} />}
                            </div>

                        </div>
                    )}

                    {step === 'security' && (
                        <div className="grid grid-cols-1 gap-8 text-left animate-in slide-in-from-right-4 duration-500 h-[280px]">
                            <div className="space-y-2">
                               <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2"><ShieldCheck className="text-emerald-500 size-4" /> System Security Override</h3>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-700 ml-1">Access Role & Permission</label>
                                <select 
                                  className={`w-full h-11 bg-slate-50 border-transparent rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-violet-600/20 focus:bg-white focus:border-violet-100 transition-all outline-none appearance-none cursor-pointer ${errors.accessRole ? 'ring-2 ring-red-500/20 border-red-200 bg-red-50/10' : ''}`}
                                  value={formData.accessRole}
                                  onChange={(e) => updateForm('accessRole', e.target.value)}
                                >
                                    <option value="">Select Portal Role</option>
                                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                                {errors.accessRole && <FormError msg={errors.accessRole} />}
                            </div>
                            
                            <div className="space-y-2 relative">
                                <label className="text-[13px] font-bold text-slate-700 ml-1 block">Log-on Password</label>
                                <div className="relative">
                                    <input 
                                      type={showPassword ? "text" : "password"}
                                      placeholder="Min 10 characters" 
                                      className={`w-full h-11 bg-slate-50 border-transparent rounded-xl px-4 pr-12 text-sm font-medium focus:ring-2 focus:ring-violet-600/20 focus:bg-white focus:border-violet-100 transition-all outline-none ${errors.password ? 'ring-2 ring-red-500/20 border-red-200 bg-red-50/10' : ''}`}
                                      value={formData.password}
                                      onChange={(e) => updateForm('password', e.target.value)}
                                    />
                                    <button 
                                      type="button"
                                      onClick={() => setShowPassword(!showPassword)}
                                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} strokeWidth={2.5} /> : <Eye size={16} strokeWidth={2.5} />}
                                    </button>
                                </div>
                                {errors.password && <FormError msg={errors.password} />}
                            </div>
                        </div>
                    )}

                    {step === 'review' && (
                        <div className="space-y-8 animate-in zoom-in-95 duration-500">
                            <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 space-y-6">
                                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-4">Onboarding Verification</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <ReviewItem label="Name" value={`${formData.firstName} ${formData.lastName}`} />
                                    <ReviewItem label="Gender" value={formData.gender} />
                                    <ReviewItem label="DOB" value={formData.dob} />
                                    <ReviewItem label="Phone" value={formData.phone} />
                                    <ReviewItem label="Role" value={roles.find(r => r.id === formData.accessRole)?.name || formData.accessRole} />
                                    <ReviewItem label="Email" value={formData.email} />
                                    <ReviewItem label="Employee ID" value={formData.employeeId} />
                                    <ReviewItem label="Joining Date" value={formData.joiningDate} />
                                </div>
                            </div>
                            <div className="text-center py-4">
                                <p className="text-xs font-medium text-slate-400 italic">By registering, you confirm the provided operational data aligns with company HR policy.</p>
                            </div>
                        </div>
                    )}

                    {/* Form Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-slate-50">
                        <Button 
                          variant="outline" 
                          onClick={handleBack}
                          className="w-full sm:w-32 h-12 rounded-xl border-slate-200 text-slate-700 font-bold px-8 shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
                        >
                            {currentStepIndex === 0 ? 'Cancel' : 'Back'}
                        </Button>
                        <Button 
                          onClick={handleNext}
                          disabled={loadingForm}
                          className="w-full sm:w-auto h-12 bg-violet-600 hover:bg-violet-700 text-white font-bold px-10 rounded-xl shadow-lg shadow-violet-200 transition-all active:scale-95 flex gap-2 items-center disabled:opacity-70"
                        >
                            {loadingForm ? (
                              <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                {step === 'review' ? 'Execute Registration' : `Next Phase`} 
                                <ArrowRight className="size-4 stroke-[3px]" />
                              </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </HRPortalChrome>
  )
}

function FormError({ msg }: { msg: string }) {
    return (
        <div className="flex items-center gap-1.5 ml-2 mt-1">
            <AlertCircle size={10} className="text-red-500" />
            <p className="text-[10px] font-bold text-red-500">{msg}</p>
        </div>
    )
}

function FormField({ label, placeholder, type = "text", isDatePicker = false, value, onChange, error }: { label: string, placeholder: string, type?: string, isDatePicker?: boolean, value?: string, onChange?: (val: string) => void, error?: string }) {
  return (
    <div className="space-y-2 text-left">
        <label className="text-[13px] font-bold text-slate-700 ml-1 block">{label}</label>
        <div className="relative">
            <input 
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              className={`w-full h-11 bg-slate-50 border-transparent rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-violet-600/20 focus:bg-white focus:border-violet-100 transition-all outline-none ${error ? 'ring-2 ring-red-500/20 border-red-200 bg-red-50/10' : ''}`}
            />
            {isDatePicker && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-4"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                </div>
            )}
        </div>
        {error && <FormError msg={error} />}
    </div>
  )
}

function ReviewItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="space-y-1 text-left">
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{label}</p>
            <p className="text-[13px] font-bold text-slate-800">{value}</p>
        </div>
    )
}
