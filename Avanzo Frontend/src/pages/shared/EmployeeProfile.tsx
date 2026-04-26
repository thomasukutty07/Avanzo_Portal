import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { api } from "@/lib/axios"
import { useAuth } from "@/context/AuthContext"
import { 
  ArrowLeft, 
  Edit2, 
  Mail, 
  Briefcase, 
  Building2,
  User as UserIcon,
  Loader2,
  Fingerprint,
  Download,
  CheckCircle2,
  ClipboardList,
  AlertCircle,
  CheckCircle,
  Circle,
  Award,
  Plus,
  Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { EmployeeUpsertForm } from "@/components/employees/EmployeeUpsertForm"
import { HRPortalChrome } from "@/components/portal/hr/HRPortalChrome"
import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function EmployeeProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [pendingTab, setPendingTab] = useState<string | null>(null)
  const [talentTags, setTalentTags] = useState<any[]>([])
  const [isEvalOpen, setIsEvalOpen] = useState(false)
  const [updatingSkills, setUpdatingSkills] = useState(false)
  const [customTagName, setCustomTagName] = useState("")

  useEffect(() => {
    fetchTalentTags()
  }, [])

  const fetchTalentTags = async () => {
    try {
      const res = await api.get("/api/skills/catalog/")
      const data = res.data
      setTalentTags(Array.isArray(data) ? data : (data.results || []))
    } catch (e) {
      console.error(e)
    }
  }

  const handleAddCustomTag = async () => {
    if (!customTagName.trim()) return
    try {
      const res = await api.post("/api/skills/catalog/", { name: customTagName, category: "Custom" })
      const newTag = res.data
      setTalentTags(prev => [...prev, newTag])
      setEmployee((m: any) => ({ ...m, evaluated_talents: [...(m?.evaluated_talents || []), newTag.id] }))
      setCustomTagName("")
      toast.success("New skill added to catalog.")
    } catch {
      toast.error("Failed to add skill.")
    }
  }

  const handleSaveSkills = async () => {
    try {
      setUpdatingSkills(true)
      await api.post(`/api/auth/employees/${employee.id}/update-skills/`, { talent_ids: employee.evaluated_talents })
      toast.success("Skills updated successfully.")
      setIsEvalOpen(false)
    } catch {
      toast.error("Failed to update skills.")
    } finally {
      setUpdatingSkills(false)
    }
  }

  const loadEmployee = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/api/auth/employees/${id}/`)
      setEmployee(res.data)
    } catch (error) {
      toast.error("Process error: Could not retrieve personnel data.")
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) loadEmployee()
  }, [id])

  const Layout = currentUser?.role === 'Admin' ? OrganizationAdminChrome : HRPortalChrome

  if (loading) {
    return (
      <Layout>
        <div className="h-[75vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="size-8 animate-spin text-indigo-500/50" />
            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Accessing Registry...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!employee) return null

  return (
    <Layout>
      <div className="bg-[#fcfcfc] min-h-screen animate-in fade-in duration-700">
        {/* Navigation & Action Bar */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
          <div className="w-full px-4 md:px-6 py-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <button 
                    onClick={() => navigate(-1)}
                    className="size-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div className="h-4 w-px bg-slate-100 mx-2" />
                  <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Directory</span>
                    <span className="opacity-30">/</span>
                    <span className="text-slate-900">Personnel Dossier</span>
                  </nav>
               </div>
               
               <div className="flex items-center gap-3">
                 <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-100 bg-white text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
                    <Download size={14} /> Export File
                 </button>
                 {!isEditing && (
                   <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                   >
                     <Edit2 size={14} /> Edit Identity
                   </button>
                 )}
               </div>
            </div>
          </div>
        </div>

        {/* Profile Identity Section */}
        <div className="bg-white border-b border-slate-50">
          <div className="w-full px-4 md:px-6 py-12">
            <div className="flex items-center gap-10">
               <div className="size-28 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shadow-inner shrink-0 text-3xl font-bold text-slate-300">
                  {employee.first_name[0]}{employee.last_name[0]}
               </div>
               <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{employee.first_name} {employee.last_name}</h1>
                    <Badge variant="outline" className="rounded-lg border-emerald-100 bg-emerald-50/50 text-emerald-600 text-[9px] font-bold uppercase tracking-widest px-3 py-1">
                      {employee.status || 'Active'}
                    </Badge>
                  </div>

                  {/* Key Identity Chips */}
                  <div className="flex flex-wrap items-center gap-3">
                    {employee.email && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                        <Mail size={13} className="text-slate-400" />
                        <span className="text-xs font-semibold text-slate-700">{employee.email}</span>
                      </div>
                    )}
                    {(employee.department_name || employee.department) && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                        <Building2 size={13} className="text-slate-400" />
                        <span className="text-xs font-semibold text-slate-700">{employee.department_name || employee.department}</span>
                      </div>
                    )}
                    {(employee.designation_name || employee.role) && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                        <Briefcase size={13} className="text-slate-400" />
                        <span className="text-xs font-semibold text-slate-700">{employee.designation_name || employee.role}</span>
                      </div>
                    )}
                    {employee.gender && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                        <UserIcon size={13} className="text-slate-400" />
                        <span className="text-xs font-semibold text-slate-700 capitalize">{employee.gender}</span>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="bg-white sticky top-[89px] z-20">
          <div className="w-full px-4 md:px-6 overflow-x-auto no-scrollbar">
            <Tabs 
              value={activeTab} 
              onValueChange={(val) => {
                if (isEditing) {
                  setPendingTab(val);
                } else {
                  setActiveTab(val);
                }
              }} 
              className="outline-none min-w-max md:min-w-0"
            >
              <TabsList className="h-16 bg-transparent border-none p-0 gap-8 outline-none">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "professional", label: "Work Details" },
                  { id: "identity", label: "Personal" },
                  { id: "skills", label: "Skills" },
                  { id: "assigned_work", label: "Assigned Work" },
                ].map((tab) => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id} 
                    className="rounded-none border-none shadow-none ring-0 p-0 focus:ring-0 focus-visible:ring-0 data-[state=active]:shadow-none data-[state=active]:bg-transparent text-sm font-semibold text-slate-400 data-[state=active]:text-slate-900 h-full transition-all flex flex-col justify-center relative group"
                  >
                    {tab.label}
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full px-4 md:px-6 py-8">
           {isEditing ? (
             <div className="max-w-7xl mx-auto bg-white border border-slate-100 rounded-[2rem] px-8 py-10 shadow-sm animate-in zoom-in-95 duration-300">
                <EmployeeUpsertForm 
                    initialData={employee}
                    onSuccess={() => { setIsEditing(false); loadEmployee(); }}
                    onCancel={() => setIsEditing(false)}
                    submitLabel="Commit Updates"
                 />
             </div>
           ) : (
             <div className="max-w-5xl w-full relative">
                   <Tabs value={activeTab} className="w-full">
                       
                       {/* Overview Section */}
                       <TabsContent value="overview" className="m-0 space-y-6">
                          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                             <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/10">
                                <div>
                                   <h3 className="text-sm font-bold text-slate-900">General Information</h3>
                                   <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Core identity and contact details</p>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                                   <CheckCircle2 size={12} />
                                   Verified
                                </div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-50">
                                <div className="divide-y divide-slate-50">
                                   <div className="px-8 py-5 hover:bg-slate-50/50 transition-colors">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</p>
                                      <p className="text-sm font-bold text-slate-900 capitalize">{employee.first_name} {employee.last_name}</p>
                                   </div>
                                   <div className="px-8 py-5 hover:bg-slate-50/50 transition-colors">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Work Email</p>
                                      <p className="text-sm font-bold text-slate-900">{employee.email}</p>
                                   </div>
                                   <div className="px-8 py-5 hover:bg-slate-50/50 transition-colors">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Gender</p>
                                      <p className="text-sm font-bold text-slate-900 capitalize">{employee.gender || "—"}</p>
                                   </div>
                                </div>
                                <div className="divide-y divide-slate-50">
                                   <div className="px-8 py-5 hover:bg-slate-50/50 transition-colors">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Employee ID</p>
                                      <p className="text-sm font-bold text-indigo-600">{employee.employee_id}</p>
                                   </div>
                                   <div className="px-8 py-5 hover:bg-slate-50/50 transition-colors">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Department</p>
                                      <p className="text-sm font-bold text-slate-900 whitespace-nowrap">{employee.department_name}</p>
                                   </div>
                                   <div className="px-8 py-5 hover:bg-slate-50/50 transition-colors">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Current Status</p>
                                      <p className="text-sm font-bold text-emerald-600 capitalize">{employee.status || 'Active'}</p>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </TabsContent>

                       {/* Work Details Section */}
                       <TabsContent value="professional" className="m-0">
                          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                             <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/10">
                                <div className="size-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                                   <Briefcase size={16} />
                                </div>
                                <div>
                                   <h3 className="text-sm font-bold text-slate-900">Professional Record</h3>
                                   <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Official role and deployment data</p>
                                </div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-50">
                                <div className="divide-y divide-slate-50">
                                   <div className="px-8 py-5 hover:bg-slate-50/50 transition-colors">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Designation</p>
                                      <p className="text-sm font-bold text-slate-900 capitalize">{employee.role || employee.designation_name}</p>
                                   </div>
                                   <div className="px-8 py-5 hover:bg-slate-50/50 transition-colors">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Joining Date</p>
                                      <p className="text-sm font-bold text-slate-900">{employee.date_of_joining || '—'}</p>
                                   </div>
                                </div>
                                <div className="divide-y divide-slate-50">
                                   <div className="px-8 py-5 hover:bg-slate-50/50 transition-colors">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Access Privilege</p>
                                      <p className="text-sm font-bold text-slate-900">{employee.access_role_name || employee.access_role}</p>
                                   </div>
                                   <div className="px-8 py-5 hover:bg-slate-50/50 transition-colors">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Department Head</p>
                                      <p className="text-sm font-bold text-slate-900">{employee.department_name}</p>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </TabsContent>

                       {/* Personal Section */}
                        {/* Skills Section */}
                        <TabsContent value="skills" className="m-0">
                           <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                              <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/10">
                                 <div className="size-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                                    <Award size={16} />
                                 </div>
                                 <div>
                                    <h3 className="text-sm font-bold text-slate-900">Professional Skills</h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Competencies and expertises</p>
                                 </div>
                              </div>
                              <div className="p-8">
                                 {employee.evaluated_talents && employee.evaluated_talents.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                       {talentTags
                                          .filter((t: any) => employee.evaluated_talents.includes(t.id))
                                          .map((tag: any) => (
                                             <span key={tag.id} className="px-4 py-2 bg-violet-50 border border-violet-100 rounded-xl text-[10px] font-bold text-violet-600 uppercase tracking-wider">
                                                {tag.name}
                                             </span>
                                          ))
                                       }
                                    </div>
                                 ) : (
                                    <div className="py-12 flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                       <Award size={32} className="text-slate-200 mb-3" />
                                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No skills evaluated</p>
                                       <button 
                                          onClick={() => setIsEvalOpen(true)}
                                          className="mt-4 text-[10px] font-bold text-violet-600 hover:underline"
                                       >
                                          Add Skills Now
                                       </button>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </TabsContent>

                       <TabsContent value="identity" className="m-0">
                          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                             <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-3 bg-slate-50/10">
                                <div className="size-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                   <Fingerprint size={16} />
                                </div>
                                <div>
                                   <h3 className="text-sm font-bold text-slate-900">Private Information</h3>
                                   <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Personal background and contact</p>
                                </div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-50">
                                <div className="divide-y divide-slate-50">
                                   <div className="px-8 py-5 hover:bg-slate-50/50 transition-colors">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">First Name</p>
                                      <p className="text-sm font-bold text-slate-900 capitalize">{employee.first_name}</p>
                                   </div>
                                   <div className="px-8 py-5 hover:bg-slate-50/50 transition-colors">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Last Name</p>
                                      <p className="text-sm font-bold text-slate-900 capitalize">{employee.last_name}</p>
                                   </div>
                                   <div className="px-8 py-5 hover:bg-slate-50/50 transition-colors">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Date of Birth</p>
                                      <p className="text-sm font-bold text-slate-900">{employee.date_of_birth || '—'}</p>
                                   </div>
                                </div>
                                <div className="divide-y divide-slate-50">
                                   <div className="px-8 py-5 hover:bg-slate-50/50 transition-colors">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Personal Mobile</p>
                                      <p className="text-sm font-bold text-slate-900">{employee.phone || '—'}</p>
                                   </div>
                                   <div className="px-8 py-5 hover:bg-slate-50/50 transition-colors">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Gender Identity</p>
                                      <p className="text-sm font-bold text-slate-900 capitalize">{employee.gender || '—'}</p>
                                   </div>
                                   <div className="px-8 py-5 hover:bg-slate-50/50 transition-colors">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Contact Email</p>
                                      <p className="text-sm font-bold text-slate-900 whitespace-nowrap">{employee.email}</p>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </TabsContent>

                       <TabsContent value="assigned_work" className="m-0">
                          <AssignedWorkTab employeeId={id!} employeeName={`${employee.first_name} ${employee.last_name}`} />
                       </TabsContent>

                   </Tabs>
             </div>
           )}
        </div>
      </div>

      <AlertDialog open={!!pendingTab} onOpenChange={(open) => !open && setPendingTab(null)}>
        <AlertDialogContent className="max-w-lg rounded-[3rem] border-slate-100 p-12 shadow-2xl">
          <AlertDialogHeader className="py-6 text-center">
            <AlertDialogTitle className="text-3xl font-black text-slate-900 font-headline tracking-tight text-center w-full">Discard Unsaved Changes?</AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium text-slate-500 mt-6 leading-relaxed text-center">
              You are currently editing this employee's personnel dossier. Navigating away will discard all unsaved modifications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-12 gap-4 flex flex-col sm:flex-row justify-center sm:justify-center items-center">
            <AlertDialogCancel className="h-14 w-full sm:w-40 rounded-2xl border-slate-100 text-[11px] font-black uppercase tracking-widest outline-none transition-all hover:bg-slate-50 active:scale-95">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (pendingTab) {
                  setIsEditing(false);
                  setActiveTab(pendingTab);
                  setPendingTab(null);
                }
              }}
              className="h-14 w-full sm:w-40 rounded-2xl bg-violet-600 hover:bg-violet-700 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-violet-600/20 outline-none transition-all active:scale-95"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       {/* Skills Dialog */}
       <Dialog open={isEvalOpen} onOpenChange={setIsEvalOpen}>
         <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl font-sans bg-white">
           <div className="bg-slate-50/50 p-10 pb-8 flex items-center gap-6 border-b border-slate-100/50">
             <div className="size-14 rounded-2xl bg-[#FFF8E6] text-[#FFB800] flex items-center justify-center">
               <Award className="size-7 stroke-[2.2]" />
             </div>
             <div>
               <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                 Skill Evaluation
               </DialogTitle>
               <DialogDescription className="text-xs font-medium text-slate-400 mt-1">
                 Update skills for <span className="text-slate-900 font-bold">{employee.first_name} {employee.last_name}</span>
               </DialogDescription>
             </div>
           </div>

           <div className="p-10 space-y-8">
             <div className="space-y-3">
               <Label className="px-1 text-[11px] font-bold text-slate-400">Add New Skill to Catalog</Label>
               <div className="relative group">
                 <Input
                   placeholder="Type a new skill name..."
                   value={customTagName}
                   onChange={(e) => setCustomTagName(e.target.value)}
                   className="h-14 rounded-xl bg-slate-50 border-transparent px-5 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all shadow-inner"
                 />
                 <button
                   onClick={handleAddCustomTag}
                   disabled={!customTagName.trim()}
                   className="absolute right-2 top-2 size-10 bg-slate-900 text-white rounded-lg flex items-center justify-center hover:bg-violet-600 transition-all active:scale-95 shadow-lg disabled:opacity-0"
                 >
                   <Plus className="size-4" />
                 </button>
               </div>
             </div>

             <div className="space-y-4">
               <Label className="text-[11px] font-bold text-slate-400">Select Skills</Label>
               <div className="flex flex-wrap gap-2 max-h-[250px] overflow-y-auto pr-2">
                 {talentTags.map((tag: any) => {
                   const isSelected = employee?.evaluated_talents?.includes(tag.id)
                   return (
                     <button
                       key={tag.id}
                       onClick={() => {
                         const current = employee?.evaluated_talents || []
                         const updated = isSelected
                           ? current.filter((tid: any) => tid !== tag.id)
                           : [...current, tag.id]
                         setEmployee((m: any) => ({ ...m, evaluated_talents: updated }))
                       }}
                       className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                         isSelected
                           ? 'bg-violet-600 text-white border-violet-600 shadow-lg'
                           : 'bg-white text-slate-400 border-slate-100 hover:border-violet-100 hover:text-slate-900'
                       }`}
                     >
                       {isSelected && <CheckCircle2 className="size-3 mr-2 inline-block -mt-0.5" />}
                       {tag.name}
                     </button>
                   )
                 })}
               </div>
             </div>
           </div>

           <div className="p-10 pt-0 flex gap-3">
             <Button variant="ghost" onClick={() => setIsEvalOpen(false)} className="flex-1 h-12 rounded-xl bg-slate-50 text-slate-400 text-xs font-bold hover:bg-slate-100">
               Cancel
             </Button>
             <Button onClick={handleSaveSkills} disabled={updatingSkills} className="flex-[2] h-12 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-violet-600 transition-all active:scale-95 disabled:opacity-50 flex gap-2 items-center justify-center">
               {updatingSkills ? <Loader2 className="size-4 animate-spin" /> : <Shield className="size-4" />}
               Save Changes
             </Button>
           </div>
         </DialogContent>
       </Dialog>
    </Layout>
  )
}

function getTaskStatusIcon(status: string) {
  switch (status) {
    case "resolved": return <CheckCircle className="size-4 text-emerald-500" />
    case "progress": return <Circle className="size-4 text-blue-500 fill-blue-100" />
    default: return <AlertCircle className="size-4 text-orange-400" />
  }
}

function getTaskStatusStyle(status: string) {
  switch (status) {
    case "resolved": return "bg-emerald-50 text-emerald-600 border-emerald-100"
    case "progress": return "bg-blue-50 text-blue-600 border-blue-100"
    default: return "bg-orange-50 text-orange-600 border-orange-100"
  }
}

function AssignedWorkTab({ employeeId, employeeName }: { employeeId: string; employeeName: string }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const { user: currentUser } = useAuth()
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [newProgress, setNewProgress] = useState(0)
  const [updating, setUpdating] = useState(false)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/api/projects/tasks/?assignee=${employeeId}&_t=${Date.now()}`)
      const data = res.data
      setTasks(Array.isArray(data) ? data : (data.results || []))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [employeeId])

  const handleUpdateProgress = async () => {
    if (!selectedTask) return
    try {
      setUpdating(true)
      await api.patch(`/api/projects/tasks/${selectedTask.id}/progress/`, { completion_pct: newProgress })
      toast.success("Progress updated successfully")
      setSelectedTask(null)
      fetchTasks()
    } catch (error) {
      toast.error("Failed to update task progress")
    } finally {
      setUpdating(false)
    }
  }

  const isOwner = currentUser?.employee_id?.toString() === employeeId?.toString() || currentUser?.id?.toString() === employeeId?.toString()

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="size-6 animate-spin text-violet-500" />
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loading tasks...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ClipboardList size={18} className="text-slate-400" />
          <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Assigned Tasks</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-violet-50 text-violet-600 border-violet-100 text-[10px] font-black rounded-lg border">{tasks.length} Tasks</Badge>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-100 rounded-[2rem]">
          <ClipboardList size={32} className="text-slate-200 mb-4" />
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">No tasks assigned</p>
          <p className="text-xs text-slate-300 mt-1">{employeeName} has no current work assignments.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Task</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hidden md:table-cell">Project</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Progress</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Status</th>
                {isOwner && <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.map((task: any) => (
                <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      {getTaskStatusIcon(task.status)}
                      <div>
                        <p className="text-sm font-bold text-slate-900">{task.title}</p>
                        {task.due_date && (
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-widest">
                            Due: {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 hidden md:table-cell">
                    <span className="text-sm font-semibold text-slate-600">{task.project_name || '—'}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1.5 min-w-[120px]">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-slate-400">{task.completion_pct || 0}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-violet-500 transition-all duration-500" 
                          style={{ width: `${task.completion_pct || 0}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getTaskStatusStyle(task.status)}`}>
                      {task.status === 'resolved' ? 'Resolved' : task.status === 'progress' ? 'In Progress' : 'Open'}
                    </span>
                  </td>
                  {isOwner && (
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => {
                          setSelectedTask(task)
                          setNewProgress(task.completion_pct || 0)
                        }}
                        className="text-[10px] font-bold text-violet-600 hover:text-violet-700 bg-violet-50 px-3 py-1.5 rounded-lg border border-violet-100 transition-all active:scale-95"
                      >
                        Update Work
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Update Modal */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl font-sans bg-white">
          <div className="bg-slate-50/50 p-8 pb-6 flex items-center gap-4 border-b border-slate-100">
             <div className="size-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <Edit2 size={18} />
             </div>
             <div>
                <DialogTitle className="text-lg font-bold text-slate-900 leading-none">Update Task Progress</DialogTitle>
                <DialogDescription className="text-xs font-medium text-slate-400 mt-1 truncate max-w-[240px]">
                  {selectedTask?.title}
                </DialogDescription>
             </div>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Completion Percentage</label>
                <span className="text-lg font-black text-violet-600">{newProgress}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="5"
                value={newProgress}
                onChange={(e) => setNewProgress(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-violet-600"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-300 px-1">
                <span>START</span>
                <span>FINISH</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                disabled={updating}
                onClick={handleUpdateProgress}
                className="flex-1 h-12 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-violet-600 transition-all shadow-lg shadow-slate-900/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updating ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle size={16} />}
                Confirm Progress
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
