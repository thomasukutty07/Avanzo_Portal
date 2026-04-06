import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import { 
  Camera, 
  Lock, 
  HelpCircle, 
  Plus,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react"

type Step = 'personal' | 'job' | 'documents' | 'credentials' | 'review'

export default function AdminEmployeeRegistrationPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('personal')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [departments, setDepartments] = useState<any[]>([])
  const [designations, setDesignations] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [loadingForm, setLoadingForm] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [r, d, g, empRes] = await Promise.all([
          api.get("/api/auth/roles/"),
          api.get("/api/organization/departments/"),
          api.get("/api/organization/designations/"),
          api.get("/api/auth/employees/")
        ])
        setRoles(extractResults(r.data))
        setDepartments(extractResults(d.data))
        setDesignations(extractResults(g.data))
        const emps = extractResults<any>(empRes.data)
        setLeads(emps.filter(e => e.role === "Team Lead" || String(e.role).includes("Lead")))
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
    phone: "",
    dob: "",
    gender: "Male",
    address: "",
    employeeId: "",
    department: "",
    jobTitle: "", 
    employmentType: "Full-time",
    workEmail: "",
    hireDate: "",
    salary: "",
    manager: "", 
    loginId: "",
    password: "",
    confirmPassword: "",
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
        if (!formData.email) newErrors.email = "Required"
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email"
        if (!formData.phone) newErrors.phone = "Required"
        if (!formData.dob) newErrors.dob = "Required"
        if (!formData.gender) newErrors.gender = "Required"
        if (!formData.address) newErrors.address = "Required"
    } 
    else if (currentStep === 'job') {
        if (!formData.employeeId) newErrors.employeeId = "Required"
        if (!formData.department) newErrors.department = "Required"
        if (!formData.jobTitle) newErrors.jobTitle = "Required"
        if (!formData.workEmail) newErrors.workEmail = "Required"
        else if (!/\S+@\S+\.\S+/.test(formData.workEmail)) newErrors.workEmail = "Invalid email"
        if (!formData.hireDate) newErrors.hireDate = "Required"
    }
    else if (currentStep === 'credentials') {
        if (!formData.accessRole) newErrors.accessRole = "Required"
        if (!formData.password) newErrors.password = "Required"
        else if (formData.password.length < 10) newErrors.password = "Min 10 chars"
        if (!formData.confirmPassword) newErrors.confirmPassword = "Required"
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Mismatch"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const steps = [
    { id: 'personal', label: 'Personal Info', description: 'Personal Information' },
    { id: 'job', label: 'Job Details', description: 'Employment details' },
    { id: 'documents', label: 'Documents', description: 'Verification files' },
    { id: 'credentials', label: 'Credentials', description: 'Account access' },
    { id: 'review', label: 'Review', description: 'Final summary' },
  ]

  const currentStepIndex = steps.findIndex(s => s.id === step)
  const progressPercent = ((currentStepIndex + 1) / steps.length) * 100

  const handleNext = async () => {
    if (validateStep(step)) {
      const nextStep = steps[currentStepIndex + 1]
      if (nextStep) {
        setStep(nextStep.id as Step)
      } else {
        try {
          setLoadingForm(true)
          await api.post("/api/auth/employees/", {
            email: formData.workEmail,
            password: formData.password,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone || null,
            employee_id: formData.employeeId || null,
            access_role: formData.accessRole || null,
            department: formData.department || null,
            designation: formData.jobTitle || null,
            team_lead: formData.manager || null,
            status: "active",
            date_of_joining: formData.hireDate || null
          })
          toast.success("Employee registered successfully!")
          navigate("/users")
        } catch (e: any) {
          const data = e.response?.data || {}
          const errorMsg = data.email?.[0] || data.employee_id?.[0] || "Failed to register employee."
          toast.error(errorMsg)
        } finally {
          setLoadingForm(false)
        }
      }
    } else {
      toast.error("Please fill in all required fields.")
    }
  }

  const handleBack = () => {
    const prevStep = steps[currentStepIndex - 1]
    if (prevStep) {
      setStep(prevStep.id as Step)
    } else {
      navigate("/users")
    }
  }

  return (
    <OrganizationAdminChrome>
      <div className="min-h-full bg-[#fcfcfc] space-y-10 animate-in fade-in duration-500 font-display">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Employee Registration</h1>
            <p className="text-sm font-medium text-slate-500 mt-3">Initialize enterprise network access for new system entities.</p>
          </div>
          <div className="text-right">
            <p className="text-violet-600 font-black text-xs uppercase tracking-widest">Phase {currentStepIndex + 1} of 5</p>
            <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">{steps[currentStepIndex].description}</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto space-y-6">
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-violet-600 transition-all duration-700 ease-in-out shadow-lg shadow-violet-600/20"
                  style={{ width: `${progressPercent}%` }}
                />
            </div>

            <div className="flex items-center gap-10 border-b border-slate-100 overflow-x-auto no-scrollbar py-2">
                {steps.map((s) => (
                    <button 
                      key={s.id}
                      onClick={() => {
                          if (currentStepIndex > steps.findIndex(st => st.id === s.id) || validateStep(step)) {
                              setStep(s.id as Step)
                          }
                      }}
                      className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${step === s.id ? 'text-violet-600' : 'text-slate-300 hover:text-slate-500'}`}
                    >
                        {s.label}
                        {step === s.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-violet-600 rounded-full" />
                        )}
                    </button>
                ))}
            </div>
        </div>

        <div className="max-w-5xl mx-auto md:pb-20">
            <Card className="border-none shadow-2xl shadow-slate-200/40 rounded-[40px] overflow-hidden bg-white">
                <CardContent className="p-8 md:p-16 space-y-12">
                    {step === 'personal' && (
                        <div className="space-y-12">
                          <div className="flex flex-col md:flex-row items-center gap-10">
                              <div className="relative group cursor-pointer">
                                  <div className="size-28 rounded-[32px] border-4 border-dashed border-violet-100 bg-violet-50/30 flex items-center justify-center group-hover:bg-violet-50 transition-all duration-500 group-hover:scale-105 rotate-3 group-hover:rotate-0">
                                      <Camera className="size-10 text-violet-300 group-hover:text-violet-600 transition-colors" />
                                  </div>
                                  <div className="absolute -bottom-2 -right-2 size-10 rounded-2xl bg-violet-600 shadow-xl border-4 border-white flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                      <Plus size={20} strokeWidth={3} />
                                  </div>
                              </div>
                              <div className="text-center md:text-left">
                                  <h3 className="font-black text-lg text-slate-900 tracking-tight">Security Profile Photo</h3>
                                  <p className="text-xs font-bold text-slate-400 mt-1 tracking-widest">Biometric authentication standard</p>
                                  <Button variant="link" className="text-violet-600 font-black text-[10px] tracking-widest p-0 h-auto mt-3 hover:no-underline shadow-none">Upload Media Access</Button>
                              </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
                              <FormField label="First Name" placeholder="Identification A" error={errors.firstName} value={formData.firstName} onChange={(v: string) => updateForm('firstName', v)} />
                              <FormField label="Last Name" placeholder="Identification B" error={errors.lastName} value={formData.lastName} onChange={(v: string) => updateForm('lastName', v)} />
                              <FormField label="Enterprise Email" placeholder="corporate@network.com" type="email" error={errors.email} value={formData.email} onChange={(v: string) => updateForm('email', v)} />
                              <FormField label="Communication Line" placeholder="+91 00000 00000" error={errors.phone} value={formData.phone} onChange={(v: string) => updateForm('phone', v)} />
                              <FormField label="Baseline Date" placeholder="mm/dd/yyyy" type="date" isDatePicker error={errors.dob} value={formData.dob} onChange={(v: string) => updateForm('dob', v)} />
                              <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-500 tracking-widest ml-1">Biological Identity</label>
                                <div className="relative">
                                  <select 
                                    className="w-full h-11 bg-slate-50 border-none rounded-2xl px-6 text-sm font-black text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                                    value={formData.gender}
                                    onChange={(e) => updateForm('gender', e.target.value)}
                                  >
                                      <option value="Male">Male</option>
                                      <option value="Female">Female</option>
                                      <option value="Other">Other</option>
                                  </select>
                                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="m6 9 6 6 6-6"/></svg>
                                  </div>
                                </div>
                              </div>
                              <div className="md:col-span-2 space-y-3">
                                  <label className="text-[11px] font-black text-slate-500 tracking-widest ml-1 block">Operational Residence</label>
                                  <textarea 
                                    placeholder="Registered physical location..."
                                    rows={3}
                                    className="w-full bg-slate-50 border-none rounded-3xl px-6 py-4 text-sm font-black text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:bg-white transition-all outline-none resize-none placeholder:text-slate-300"
                                    value={formData.address}
                                    onChange={(e) => updateForm('address', e.target.value)}
                                  />
                              </div>
                          </div>
                        </div>
                    )}

                    {step === 'job' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left animate-in slide-in-from-right-4 duration-700">
                            <FormField label="Access ID" placeholder="e.g. NET-9982" error={errors.employeeId} value={formData.employeeId} onChange={(v: string) => updateForm('employeeId', v)} />
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-500 tracking-widest ml-1">Organizational Unit</label>
                                <select 
                                  className="w-full h-11 bg-slate-50 border-none rounded-2xl px-6 text-sm font-black text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:bg-white transition-all outline-none appearance-none"
                                  value={formData.department}
                                  onChange={(e) => updateForm('department', e.target.value)}
                                >
                                    <option value="">Select Unit</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-500 tracking-widest ml-1">Rank / Designation</label>
                                <select 
                                  className="w-full h-11 bg-slate-50 border-none rounded-2xl px-6 text-sm font-black text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:bg-white transition-all outline-none appearance-none"
                                  value={formData.jobTitle}
                                  onChange={(e) => updateForm('jobTitle', e.target.value)}
                                >
                                    <option value="">Select Rank</option>
                                    {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-500 tracking-widest ml-1">Deployment Status</label>
                                <select 
                                  className="w-full h-11 bg-slate-50 border-none rounded-2xl px-6 text-sm font-black text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:bg-white transition-all outline-none appearance-none"
                                  value={formData.employmentType}
                                  onChange={(e) => updateForm('employmentType', e.target.value)}
                                >
                                    <option>Full-time</option>
                                    <option>Contract</option>
                                </select>
                            </div>
                            <FormField label="Work Email" placeholder="primary.auth@network.com" type="email" error={errors.workEmail} value={formData.workEmail} onChange={(v: string) => updateForm('workEmail', v)} />
                            <FormField label="Activation Date" type="date" isDatePicker error={errors.hireDate} value={formData.hireDate} onChange={(v: string) => updateForm('hireDate', v)} />
                            <FormField label="Operational Credits" placeholder="e.g. 12.0" value={formData.salary} onChange={(v: string) => updateForm('salary', v)} />
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-500 tracking-widest ml-1">Network Supervisor</label>
                                <select 
                                  className="w-full h-11 bg-slate-50 border-none rounded-2xl px-6 text-sm font-black text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:bg-white transition-all outline-none appearance-none"
                                  value={formData.manager}
                                  onChange={(e) => updateForm('manager', e.target.value)}
                                >
                                    <option value="">N/A</option>
                                    {leads.map(l => <option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {step === 'documents' && (
                        <div className="space-y-10 animate-in slide-in-from-right-4 duration-700">
                            <AdminDocumentBox title="Identification Matrix" desc="Passport or National ID verification." />
                            <AdminDocumentBox title="Operational Protocols" desc="Signed system usage agreements." />
                        </div>
                    )}

                    {step === 'credentials' && (
                        <div className="max-w-2xl mx-auto space-y-10 animate-in slide-in-from-right-4 duration-700 text-left">
                            <div className="space-y-8">
                                <FormField label="System Login Alias" value={formData.workEmail} onChange={(v: string) => updateForm('workEmail', v)} />
                                <div className="space-y-3">
                                  <label className="text-[11px] font-black text-slate-500 tracking-widest ml-1">Network Role Priority</label>
                                  <select 
                                    className="w-full h-11 bg-slate-50 border-none rounded-2xl px-6 text-sm font-black text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:bg-white transition-all outline-none appearance-none"
                                    value={formData.accessRole}
                                    onChange={(e) => updateForm('accessRole', e.target.value)}
                                  >
                                      <option value="">Select Priority</option>
                                      {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                  </select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3 relative">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 block">Security Key</label>
                                        <div className="relative">
                                            <input 
                                              type={showPassword ? "text" : "password"}
                                              placeholder="••••••••" 
                                              className="w-full h-11 bg-slate-50 border-none rounded-2xl px-6 pr-14 text-sm font-black text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:bg-white transition-all outline-none"
                                              value={formData.password}
                                              onChange={(e) => updateForm('password', e.target.value)}
                                            />
                                            <button 
                                              type="button"
                                              onClick={() => setShowPassword(!showPassword)}
                                              className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} strokeWidth={3} /> : <Eye size={18} strokeWidth={3} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-3 relative">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 block">Verify Key</label>
                                        <input 
                                          type={showPassword ? "text" : "password"}
                                          placeholder="••••••••" 
                                          className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-black text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:bg-white transition-all outline-none"
                                          value={formData.confirmPassword}
                                          onChange={(e) => updateForm('confirmPassword', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'review' && (
                        <div className="space-y-10 animate-in zoom-in-95 duration-700">
                            <div className="p-10 bg-slate-50/50 rounded-[40px] border border-slate-100 space-y-10">
                                <h3 className="text-xs font-black text-violet-600 uppercase tracking-[0.2em] border-b border-slate-100 pb-6">Final Data Validation</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                                    <ReviewBox label="Full Name" value={`${formData.firstName} ${formData.lastName}`} />
                                    <ReviewBox label="Registry Id" value={formData.employeeId} />
                                    <ReviewBox label="Access Rank" value={formData.accessRole} />
                                    <ReviewBox label="Unit" value={formData.department} />
                                    <ReviewBox label="Auth Email" value={formData.workEmail} />
                                    <ReviewBox label="Status" value="STANDBY" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-10 border-t border-slate-50">
                        <Button 
                          variant="link" 
                          onClick={() => toast.info("Encryption saved.")}
                          className="text-slate-300 font-black text-[10px] uppercase tracking-widest p-0 h-auto hover:text-slate-500 hover:no-underline"
                        >
                          Cache for later
                        </Button>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <Button 
                              variant="outline" 
                              onClick={handleBack}
                              className="w-full sm:w-40 h-14 rounded-2xl border-slate-100 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                            >
                                Revert
                            </Button>
                            <Button 
                              onClick={handleNext}
                              disabled={loadingForm}
                              className="w-full sm:w-auto h-14 bg-violet-600 hover:bg-violet-700 text-white font-black text-[11px] uppercase tracking-widest px-12 rounded-2xl shadow-2xl shadow-violet-900/10 transition-all hover:-translate-y-1 active:translate-y-0 flex gap-3 items-center disabled:opacity-70"
                            >
                                {loadingForm ? "Processing..." : (step === 'review' ? 'Initialize Network Access' : 'Progress Integration')}
                                <ArrowRight className="size-4 stroke-[3px]" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-10 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-3">
                    <Lock className="size-4" />
                    Secure Layer Encryption
                </div>
                <div className="flex items-center gap-3 cursor-pointer hover:text-violet-600 transition-colors">
                    <HelpCircle className="size-4" />
                    System Assistance Locked
                </div>
            </div>
        </div>
      </div>
    </OrganizationAdminChrome>
  )
}

function FormField({ label, placeholder, type = "text", isDatePicker = false, value, onChange, error }: { label: string, placeholder?: string, type?: string, isDatePicker?: boolean, value: string, onChange: (val: string) => void, error?: string }) {
  return (
    <div className="space-y-3 text-left">
        <label className="text-[11px] font-black text-slate-500 tracking-widest ml-1">{label}</label>
        <div className="relative">
            <input 
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full h-11 bg-slate-50 border-none rounded-2xl px-6 text-sm font-black text-slate-900 focus:ring-4 focus:ring-violet-600/5 focus:bg-white transition-all outline-none ${error ? 'ring-2 ring-red-500/20' : ''}`}
            />
            {isDatePicker && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="size-4"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                </div>
            )}
        </div>
        {error && <p className="text-[10px] font-black text-red-500 ml-2 mt-1 tracking-widest leading-none">{error}</p>}
    </div>
  )
}

function AdminDocumentBox({ title, desc }: any) {
    return (
        <div className="flex flex-col md:flex-row items-center gap-10 p-10 rounded-[32px] border border-slate-100 bg-slate-50/20 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all group">
            <div className="size-20 rounded-[24px] bg-violet-600 text-white flex items-center justify-center shadow-xl shadow-violet-600/20 group-hover:scale-110 transition-transform">
                <Plus className="size-8 stroke-[3.5px]" />
            </div>
            <div className="flex-1 text-center md:text-left">
                <h4 className="font-black text-slate-900 tracking-tight">{title}</h4>
                <p className="text-xs font-bold text-slate-400 mt-1 tracking-widest leading-relaxed">{desc}</p>
            </div>
            <Button variant="outline" className="h-12 rounded-2xl px-10 border-slate-100 font-black text-[10px] tracking-widest bg-white shadow-sm">
                Attach Media
            </Button>
        </div>
    )
}

function ReviewBox({ label, value }: any) {
    return (
        <div className="space-y-2 text-left">
            <p className="text-[10px] font-black text-slate-300 tracking-widest leading-none">{label}</p>
            <p className="text-sm font-black text-slate-900 tracking-tight leading-none">{value || 'N/A'}</p>
        </div>
    )
}
