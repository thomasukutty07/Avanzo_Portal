import { useState, useEffect, type FormEvent } from "react"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TabsContent } from "@/components/ui/tabs"
import { Building2, Briefcase, Loader2, Plus, Trash2, Settings, Layers, Workflow, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import type { Department, Designation } from "@/types"

export function OrgDepartmentsDesignations() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [designations, setDesignations] = useState<Designation[]>([])
  const [services, setServices] = useState<any[]>([])
  
  const [newDeptName, setNewDeptName] = useState("")
  const [newDesigName, setNewDesigName] = useState("")
  const [newServiceName, setNewServiceName] = useState("")
  const [newServiceDept, setNewServiceDept] = useState("")
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeptDialog, setShowDeptDialog] = useState(false)
  const [showDesigDialog, setShowDesigDialog] = useState(false)
  const [showServiceDialog, setShowServiceDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchOrg = async () => {
    setLoading(true)
    try {
      const [deptRes, desigRes, serviceRes] = await Promise.all([
        api.get("/api/organization/departments/"),
        api.get("/api/organization/designations/"),
        api.get("/api/projects/services/"),
      ])
      setDepartments(extractResults<Department>(deptRes.data))
      setDesignations(extractResults<Designation>(desigRes.data))
      setServices(extractResults<any>(serviceRes.data))
    } catch {
      toast.error("Failed to load organization data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrg()
  }, [])

  const handleCreateDept = async (e: FormEvent) => {
    e.preventDefault()
    if (!newDeptName.trim()) return
    setIsSubmitting(true)
    try {
      const res = await api.post("/api/organization/departments/", {
        name: newDeptName,
        is_active: true,
      })
      setDepartments((prev) => [...prev, res.data])
      setNewDeptName("")
      setShowDeptDialog(false)
      toast.success(`Department "${newDeptName}" created`)
    } catch {
      toast.error("Failed to create department")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateDesig = async (e: FormEvent) => {
    e.preventDefault()
    if (!newDesigName.trim()) return
    setIsSubmitting(true)
    try {
      const res = await api.post("/api/organization/designations/", {
        name: newDesigName,
        is_active: true,
      })
      setDesignations((prev) => [...prev, res.data])
      setNewDesigName("")
      setShowDesigDialog(false)
      toast.success(`Designation "${newDesigName}" created`)
    } catch {
      toast.error("Failed to create designation")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateService = async (e: FormEvent) => {
    e.preventDefault()
    if (!newServiceName.trim()) return
    setIsSubmitting(true)
    try {
      const res = await api.post("/api/projects/services/", {
        name: newServiceName,
        department: newServiceDept || null,
      })
      setServices((prev) => [...prev, res.data])
      setNewServiceName("")
      setNewServiceDept("")
      setShowServiceDialog(false)
      toast.success(`Service category "${newServiceName}" created`)
    } catch {
      toast.error("Failed to create service category")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteDept = async (id: string) => {
    try {
      await api.delete(`/api/organization/departments/${id}/`)
      setDepartments((prev) => prev.filter((d) => d.id !== id))
      toast.success("Department deleted")
    } catch {
      toast.error("Failed to delete. It may have active employees.")
    }
  }

  const handleDeleteDesig = async (id: string) => {
    try {
      await api.delete(`/api/organization/designations/${id}/`)
      setDesignations((prev) => prev.filter((d) => d.id !== id))
      toast.success("Designation deleted")
    } catch {
      toast.error("Failed to delete designation")
    }
  }

  const handleDeleteService = async (id: string) => {
    try {
      await api.delete(`/api/projects/services/${id}/`)
      setServices((prev) => prev.filter((s) => s.id !== id))
      toast.success("Service category deleted")
    } catch {
      toast.error("Failed to delete service category")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    )
  }

  return (
    <>
        <TabsContent value="departments" className="mt-0 outline-none">
          {/* Departments Card */}
          <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h4 className="text-xl font-bold text-slate-900 tracking-tight">Department Registry</h4>
                  <p className="text-sm text-slate-500">
                    Manage the organizational units within the hierarchy.
                  </p>
                </div>
                <Dialog open={showDeptDialog} onOpenChange={setShowDeptDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md px-4 py-2 text-sm font-semibold shadow-sm active:scale-95 transition-all">
                      <Plus className="h-4 w-4" /> Add Department
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:rounded-xl border border-slate-100 shadow-xl p-8 bg-white font-sans sm:max-w-[425px]">
                    <DialogHeader className="mb-6">
                      <DialogTitle className="text-lg font-bold text-slate-900">Register Unit</DialogTitle>
                      <p className="text-sm text-slate-500 mt-1">Add a new operational department to the workspace.</p>
                    </DialogHeader>
                    <form onSubmit={handleCreateDept} className="space-y-6">
                      <div className="space-y-2">
                         <Label className="text-sm font-semibold text-slate-700">Department Name</Label>
                         <Input
                           value={newDeptName}
                           onChange={(e) => setNewDeptName(e.target.value)}
                           placeholder="e.g. Cybersecurity Operations"
                           required
                           className="h-11 rounded-md border border-slate-200 bg-white text-sm text-slate-900 px-3 focus-visible:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 shadow-sm transition-all"
                         />
                      </div>
                      <Button type="submit" disabled={isSubmitting || !newDeptName.trim()} className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold text-sm transition-all active:scale-[0.98]">
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Layers className="mr-2 h-4 w-4" />}
                        Initialize Unit
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 p-5 bg-white hover:border-slate-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg group-hover:bg-slate-100 group-hover:text-slate-800 transition-colors">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDept(dept.id)}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all pointer-events-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-5 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-slate-800 tracking-tight">{dept.name}</span>
                      </div>
                      <Badge
                        className={`${dept.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'} text-xs font-semibold px-2 py-0.5 border rounded-md shadow-none font-normal`}
                      >
                        {dept.is_active ? "Operational" : "Offline"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="designations" className="mt-0 outline-none">
          {/* Designations Card */}
          <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h4 className="text-xl font-bold text-slate-900 tracking-tight">Designation Glossary</h4>
                  <p className="text-sm text-slate-500">
                    Define the professional roles and titles across the organization.
                  </p>
                </div>
                <Dialog open={showDesigDialog} onOpenChange={setShowDesigDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md px-4 py-2 text-sm font-semibold shadow-sm active:scale-95 transition-all">
                      <Plus className="h-4 w-4" /> Add Title
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:rounded-xl border border-slate-100 shadow-xl p-8 bg-white font-sans sm:max-w-[425px]">
                    <DialogHeader className="mb-6">
                      <DialogTitle className="text-lg font-bold text-slate-900">Add Designation</DialogTitle>
                      <p className="text-sm text-slate-500 mt-1">Create a new professional role or title.</p>
                    </DialogHeader>
                    <form onSubmit={handleCreateDesig} className="space-y-6">
                      <div className="space-y-2">
                         <Label className="text-sm font-semibold text-slate-700">Job Title</Label>
                         <Input
                           value={newDesigName}
                           onChange={(e) => setNewDesigName(e.target.value)}
                           placeholder="e.g. Lead Technical Architect"
                           required
                           className="h-11 rounded-md border border-slate-200 bg-white text-sm text-slate-900 px-3 focus-visible:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 shadow-sm transition-all"
                         />
                      </div>
                      <Button type="submit" disabled={isSubmitting || !newDesigName.trim()} className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold text-sm transition-all active:scale-[0.98]">
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                        Register Title
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {designations.map((des) => (
                  <div
                    key={des.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-white hover:border-slate-300 hover:bg-slate-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 text-slate-500 rounded-lg group-hover:bg-white group-hover:text-slate-800 transition-colors border border-transparent group-hover:border-slate-200">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-800 tracking-tight">{des.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDesig(des.id)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md pointer-events-auto opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="mt-0 outline-none">
          {/* Service Categories Card */}
          <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h4 className="text-xl font-bold text-slate-900 tracking-tight">Service Catalogue</h4>
                  <p className="text-sm text-slate-500">
                    Define the categories and service lines for active projects.
                  </p>
                </div>
                <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md px-4 py-2 text-sm font-semibold shadow-sm active:scale-95 transition-all">
                      <Plus className="h-4 w-4" /> Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:rounded-xl border border-slate-100 shadow-xl p-8 bg-white font-sans sm:max-w-[425px]">
                    <DialogHeader className="mb-6 text-left">
                      <DialogTitle className="text-lg font-bold text-slate-900">Register Service Class</DialogTitle>
                      <p className="text-sm text-slate-500 mt-1">
                        Categorize projects within a specific unit or global scope.
                      </p>
                    </DialogHeader>
                    <form onSubmit={handleCreateService} className="space-y-5">
                      <div className="space-y-2">
                         <Label className="text-sm font-semibold text-slate-700">Category Label</Label>
                         <Input
                           value={newServiceName}
                           onChange={(e) => setNewServiceName(e.target.value)}
                           placeholder="e.g. Strategic Security Audit"
                           required
                           className="h-11 rounded-md border border-slate-200 bg-white text-sm text-slate-900 px-3 focus-visible:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 shadow-sm transition-all"
                         />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-sm font-semibold text-slate-700">Associated Department</Label>
                         <div className="relative">
                            <select
                              value={newServiceDept}
                              onChange={(e) => setNewServiceDept(e.target.value)}
                              className="w-full h-11 rounded-md border border-slate-200 bg-white text-sm text-slate-900 px-3 appearance-none cursor-pointer focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 shadow-sm transition-all"
                            >
                              <option value="">Global (All Departments)</option>
                              {departments.map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                              ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <Layers className="size-4 text-slate-400" />
                            </div>
                         </div>
                      </div>
                      <Button type="submit" disabled={isSubmitting || !newServiceName.trim()} className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold text-sm transition-all active:scale-[0.98] mt-2">
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Workflow className="mr-2 h-4 w-4" />}
                        Register Category Node
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className="group bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between hover:border-slate-300 hover:shadow-md transition-all duration-300"
                  >
                    <div className="space-y-4">
                      <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg w-fit group-hover:bg-slate-100 group-hover:text-slate-800 transition-colors">
                        <Settings className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-slate-900 tracking-tight">{s.name}</p>
                        <p className="text-xs font-semibold text-slate-500">
                          {s.department_name || "Global Scope"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteService(s.id)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all pointer-events-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {services.length === 0 && (
                <div className="py-24 text-center space-y-4 opacity-30">
                  <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                    <Workflow className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Empty Registry</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
    </>
  )
}
