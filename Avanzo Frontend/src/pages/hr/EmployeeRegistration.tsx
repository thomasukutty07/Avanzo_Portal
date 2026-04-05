import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { HRPortalChrome } from "@/components/portal/hr/HRPortalChrome"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import { useEffect } from "react"
import { 
  Camera, 
  Lock, 
  HelpCircle, 
  Plus,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react"

type Step = 'personal' | 'job' | 'documents' | 'credentials' | 'review'

export default function EmployeeRegistrationPage() {
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

  // Centralized form state
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
    jobTitle: "", // maps to designation
    employmentType: "Full-time",
    workEmail: "",
    hireDate: "",
    salary: "",
    manager: "", // maps to team_lead
    loginId: "",
    password: "",
    confirmPassword: "",
    accessRole: ""
  })

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for that field
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
          toast.success("Employee registered successfully!", {
            description: `${formData.firstName} ${formData.lastName} has been added to the system.`
          })
          navigate("/employees")
        } catch (e: any) {
          console.error("Registration Error:", e.response?.data || e)
          const data = e.response?.data || {}
          const errorMsg = data.email?.[0] || data.employee_id?.[0] || data.password?.[0] || data.status?.[0] || "Failed to register employee."
          toast.error(errorMsg, {
            description: "Please check the highlighted fields."
          })
        } finally {
          setLoadingForm(false)
        }
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

  return (
    <HRPortalChrome>
      <div className="min-h-full bg-slate-50/50 p-6 md:p-10 space-y-10 animate-in fade-in duration-500 font-display">
        {/* Step Header */}
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">New Registration</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Onboard a new team member to your organization.</p>
          </div>
          <div className="text-right">
            <p className="text-violet-600 font-bold text-sm">Step {currentStepIndex + 1} of 5</p>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">{steps[currentStepIndex].description}</p>
          </div>
        </div>

        {/* Progress & Tabs */}
        <div className="max-w-6xl mx-auto space-y-6">
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

        {/* Main Form Area */}
        <div className="max-w-6xl mx-auto md:pb-20">
            <Card className="border border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
                <CardContent className="p-8 md:p-12 space-y-12">
                    {/* Step Content */}
                    {step === 'personal' && (
                        <div className="space-y-12">
                          <div className="flex flex-col md:flex-row items-center gap-8">
                              <div className="relative group cursor-pointer text-left">
                                  <div className="size-24 rounded-full border-2 border-dashed border-violet-200 bg-violet-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                                      <Camera className="size-8 text-violet-400 group-hover:text-violet-600" />
                                  </div>
                                  <div className="absolute -bottom-1 -right-1 size-8 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform">
                                      <Plus size={16} strokeWidth={3} />
                                  </div>
                              </div>
                              <div className="text-center md:text-left">
                                  <h3 className="font-bold text-slate-900">Profile Photo</h3>
                                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">PNG, JPG up to 5MB</p>
                                  <Button variant="link" className="text-violet-600 font-bold text-xs p-0 h-auto mt-2 hover:no-underline">Upload photo</Button>
                              </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                              <FormField label="First Name" placeholder="e.g. John" error={errors.firstName} value={formData.firstName} onChange={(v) => updateForm('firstName', v)} />
                              <FormField label="Last Name" placeholder="e.g. Doe" error={errors.lastName} value={formData.lastName} onChange={(v) => updateForm('lastName', v)} />
                              <FormField label="Email Address" placeholder="john.doe@company.com" type="email" error={errors.email} value={formData.email} onChange={(v) => updateForm('email', v)} />
                              <FormField label="Phone Number" placeholder="+91 00000 00000" error={errors.phone} value={formData.phone} onChange={(v) => updateForm('phone', v)} />
                              <FormField label="Date of Birth" placeholder="mm/dd/yyyy" type="date" isDatePicker error={errors.dob} value={formData.dob} onChange={(v) => updateForm('dob', v)} />
                              <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-700 ml-1">Gender</label>
                                <div className="relative">
                                  <select 
                                    className={`w-full h-12 bg-slate-50 border-transparent rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-violet-600/20 focus:bg-white focus:border-violet-100 transition-all outline-none appearance-none cursor-pointer ${errors.gender ? 'ring-2 ring-red-500/20 border-red-200 bg-red-50/10' : ''}`}
                                    value={formData.gender}
                                    onChange={(e) => updateForm('gender', e.target.value)}
                                  >
                                      <option value="">Select gender</option>
                                      <option value="Male">Male</option>
                                      <option value="Female">Female</option>
                                      <option value="Other">Other</option>
                                      <option value="Prefer not to say">Prefer not to say</option>
                                  </select>
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="m6 9 6 6 6-6"/></svg>
                                  </div>
                                </div>
                                {errors.gender && <p className="text-[10px] font-bold text-red-500 ml-2 mt-1">{errors.gender}</p>}
                              </div>
                              <div className="md:col-span-2 space-y-2">
                                  <label className="text-[13px] font-bold text-slate-700 ml-1 block">Home Address</label>
                                  <textarea 
                                    placeholder="Street address, City, State, ZIP"
                                    rows={3}
                                    className={`w-full bg-slate-50 border-transparent rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-violet-600/20 focus:bg-white focus:border-violet-100 transition-all outline-none resize-none ${errors.address ? 'ring-2 ring-red-500/20 border-red-200 bg-red-50/10' : ''}`}
                                    value={formData.address}
                                    onChange={(e) => updateForm('address', e.target.value)}
                                  />
                                  {errors.address && <p className="text-[10px] font-bold text-red-500 ml-2 mt-1">{errors.address}</p>}
                              </div>
                          </div>
                        </div>
                    )}

                    {step === 'job' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left animate-in slide-in-from-right-4 duration-500">
                            <FormField label="Employee ID" placeholder="e.g. EMP12345" error={errors.employeeId} value={formData.employeeId} onChange={(v) => updateForm('employeeId', v)} />
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-700 ml-1">Department</label>
                                <select 
                                  className={`w-full h-12 bg-slate-50 border-transparent rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-violet-600/20 focus:bg-white focus:border-violet-100 transition-all outline-none appearance-none cursor-pointer ${errors.department ? 'ring-2 ring-red-500/20 border-red-200 bg-red-50/10' : ''}`}
                                  value={formData.department}
                                  onChange={(e) => updateForm('department', e.target.value)}
                                >
                                    <option value="">Select Dept</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                                                        <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-700 ml-1">Designation</label>
                                <select 
                                  className={`w-full h-12 bg-slate-50 border-transparent rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-violet-600/20 focus:bg-white focus:border-violet-100 transition-all outline-none appearance-none cursor-pointer ${errors.jobTitle ? 'ring-2 ring-red-500/20 border-red-200 bg-red-50/10' : ''}`}
                                  value={formData.jobTitle}
                                  onChange={(e) => updateForm('jobTitle', e.target.value)}
                                >
                                    <option value="">Select Designation</option>
                                    {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-700 ml-1">Employment Type</label>
                                <select 
                                  className="w-full h-12 bg-slate-50 border-transparent rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-violet-600/20 focus:bg-white focus:border-violet-100 transition-all outline-none appearance-none cursor-pointer"
                                  value={formData.employmentType}
                                  onChange={(e) => updateForm('employmentType', e.target.value)}
                                >
                                    <option>Full-time</option>
                                    <option>Part-time</option>
                                    <option>Contract</option>
                                    <option>Internship</option>
                                </select>
                            </div>
                            <FormField label="Work Email" placeholder="primary.email@work.com" type="email" error={errors.workEmail} value={formData.workEmail} onChange={(v) => updateForm('workEmail', v)} />
                            <FormField label="Hire Date" placeholder="mm/dd/yyyy" type="date" isDatePicker error={errors.hireDate} value={formData.hireDate} onChange={(v) => updateForm('hireDate', v)} />
                            <FormField label="Annual CTC (LPA)" placeholder="e.g. 12.0" error={errors.salary} value={formData.salary} onChange={(v) => updateForm('salary', v)} />
                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-700 ml-1">Reporting Manager</label>
                                <select 
                                  className="w-full h-12 bg-slate-50 border-transparent rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-violet-600/20 focus:bg-white focus:border-violet-100 transition-all outline-none appearance-none cursor-pointer"
                                  value={formData.manager}
                                  onChange={(e) => updateForm('manager', e.target.value)}
                                >
                                    <option value="">None / N/A</option>
                                    {leads.map(l => <option key={l.id} value={l.id}>{l.first_name} {l.last_name} ({l.role})</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {step === 'documents' && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                            <DocumentUploadItem title="National ID / Passport" description="Clear scanned copy of front and back." />
                            <DocumentUploadItem title="Employment Contract" description="Signed copy of the offer letter or contract." />
                            <DocumentUploadItem title="Experience Certificates" description="Relevant academic or experience proofs." />
                        </div>
                    )}

                    {step === 'credentials' && (
                        <div className="max-w-xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500 text-left">
                            <div className="space-y-6">
                                <FormField label="Login Email" placeholder="primary.email@work.com" error={errors.loginId} value={formData.workEmail} onChange={(v) => updateForm('workEmail', v)} />
                                <div className="space-y-2">
                                  <label className="text-[13px] font-bold text-slate-700 ml-1">Portal Access Role</label>
                                  <select 
                                    className={`w-full h-12 bg-slate-50 border-transparent rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-violet-600/20 focus:bg-white focus:border-violet-100 transition-all outline-none appearance-none cursor-pointer ${errors.accessRole ? 'ring-2 ring-red-500/20 border-red-200 bg-red-50/10' : ''}`}
                                    value={formData.accessRole}
                                    onChange={(e) => updateForm('accessRole', e.target.value)}
                                  >
                                      <option value="">Select Portal Role</option>
                                      {roles.map(r => <option key={r.id} value={r.id}>{r.name} - {r.description}</option>)}
                                  </select>
                                  {errors.accessRole && <p className="text-[10px] font-bold text-red-500 ml-2 mt-1">{errors.accessRole}</p>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 relative">
                                        <label className="text-[13px] font-bold text-slate-700 ml-1 block">Password</label>
                                        <div className="relative">
                                            <input 
                                              type={showPassword ? "text" : "password"}
                                              placeholder="••••••••" 
                                              className={`w-full h-12 bg-slate-50 border-transparent rounded-xl px-4 pr-12 text-sm font-medium focus:ring-2 focus:ring-violet-600/20 focus:bg-white focus:border-violet-100 transition-all outline-none ${errors.password ? 'ring-2 ring-red-500/20 border-red-200 bg-red-50/10' : ''}`}
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
                                        {errors.password && <p className="text-[10px] font-bold text-red-500 ml-2 mt-1">{errors.password}</p>}
                                    </div>
                                    <div className="space-y-2 relative">
                                        <label className="text-[13px] font-bold text-slate-700 ml-1 block">Confirm Password</label>
                                        <div className="relative">
                                            <input 
                                              type={showPassword ? "text" : "password"}
                                              placeholder="••••••••" 
                                              className={`w-full h-12 bg-slate-50 border-transparent rounded-xl px-4 pr-12 text-sm font-medium focus:ring-2 focus:ring-violet-600/20 focus:bg-white focus:border-violet-100 transition-all outline-none ${errors.confirmPassword ? 'ring-2 ring-red-500/20 border-red-200 bg-red-50/10' : ''}`}
                                              value={formData.confirmPassword}
                                              onChange={(e) => updateForm('confirmPassword', e.target.value)}
                                            />
                                            <button 
                                              type="button"
                                              onClick={() => setShowPassword(!showPassword)}
                                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={16} strokeWidth={2.5} /> : <Eye size={16} strokeWidth={2.5} />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && <p className="text-[10px] font-bold text-red-500 ml-2 mt-1">{errors.confirmPassword}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                                    <input type="checkbox" className="size-4 accent-violet-600" id="send-invite" />
                                    <label htmlFor="send-invite" className="text-xs font-bold text-slate-600 cursor-pointer">Send login instructions to personal email</label>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'review' && (
                        <div className="space-y-8 animate-in zoom-in-95 duration-500">
                            <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 space-y-6">
                                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-4">Personal Summary</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <ReviewItem label="Name" value={`${formData.firstName} ${formData.lastName}`} />
                                    <ReviewItem label="Email" value={formData.email} />
                                    <ReviewItem label="Gender" value={formData.gender} />
                                    <ReviewItem label="Phone" value={formData.phone} />
                                    <ReviewItem label="DOB" value={formData.dob} />
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 space-y-6">
                                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-4">Employment Summary</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <ReviewItem label="Title" value={formData.jobTitle} />
                                    <ReviewItem label="Dept" value={formData.department} />
                                    <ReviewItem label="ID" value={formData.employeeId} />
                                    <ReviewItem label="Manager" value={formData.manager} />
                                    <ReviewItem label="Type" value={formData.employmentType} />
                                    <ReviewItem label="Hire Date" value={formData.hireDate} />
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 space-y-6">
                                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-4">Account Access</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 items-end">
                                    <ReviewItem label="Login ID" value={formData.loginId} />
                                    <div className="space-y-1 text-left relative">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Security Password</p>
                                        <div className="flex items-center gap-3">
                                            <p className="text-[13px] font-bold text-slate-800 tracking-wider">
                                                {showPassword ? formData.password : "••••••••"}
                                            </p>
                                            <button 
                                              type="button"
                                              onClick={() => setShowPassword(!showPassword)}
                                              className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword ? <EyeOff size={14} strokeWidth={2.5} /> : <Eye size={14} strokeWidth={2.5} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center py-4">
                                <p className="text-xs font-medium text-slate-400 italic">By clicking register, you confirm all information provided is accurate and verifiable.</p>
                            </div>
                        </div>
                    )}

                    {/* Form Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-50">
                        <Button 
                          variant="link" 
                          onClick={() => toast.info("Draft saved successfully!")}
                          className="text-slate-400 font-bold text-xs p-0 h-auto hover:text-slate-600 hover:no-underline uppercase tracking-tight"
                        >
                          Save for later
                        </Button>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button 
                              variant="outline" 
                              onClick={handleBack}
                              className="w-full sm:w-32 h-12 rounded-xl border-slate-200 text-slate-700 font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
                            >
                                Back
                            </Button>
                            <Button 
                              onClick={handleNext}
                              disabled={loadingForm}
                              className="w-full sm:w-auto h-12 bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 rounded-xl shadow-lg shadow-violet-200 transition-all hover:-translate-y-0.5 active:translate-y-0 flex gap-2 items-center disabled:opacity-70"
                            >
                                {loadingForm ? (
                                  <>
                                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    {step === 'review' ? 'Register Employee' : `Continue to ${steps[currentStepIndex + 1]?.label || ''}`}
                                    <ArrowRight className="size-4 stroke-[3px]" />
                                  </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bottom Help */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <Lock className="size-3" />
                    Secure Data Encryption
                </div>
                <div className="flex items-center gap-2 cursor-pointer hover:text-violet-600 transition-colors">
                    <HelpCircle className="size-3" />
                    Need help? Contact HR Support
                </div>
            </div>
        </div>
      </div>
    </HRPortalChrome>
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
              className={`w-full h-12 bg-slate-50 border-transparent rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-violet-600/20 focus:bg-white focus:border-violet-100 transition-all outline-none ${error ? 'ring-2 ring-red-500/20 border-red-200 bg-red-50/10' : ''}`}
            />
            {isDatePicker && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-4"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                </div>
            )}
        </div>
        {error && (
            <div className="flex items-center gap-1.5 ml-2 mt-1">
                <AlertCircle size={10} className="text-red-500" />
                <p className="text-[10px] font-bold text-red-500">{error}</p>
            </div>
        )}
    </div>
  )
}

function DocumentUploadItem({ title, description }: { title: string, description: string }) {
    return (
        <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group">
            <div className="size-16 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-all">
                <Plus className="size-6" />
            </div>
            <div className="flex-1 text-center md:text-left">
                <h4 className="font-bold text-slate-800">{title}</h4>
                <p className="text-xs font-medium text-slate-400 mt-1">{description}</p>
            </div>
            <Button variant="outline" className="h-10 rounded-xl px-6 border-slate-200 font-bold text-xs bg-white">
                Upload File
            </Button>
        </div>
    )
}

function ReviewItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="space-y-1 text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-[13px] font-bold text-slate-800">{value}</p>
        </div>
    )
}
