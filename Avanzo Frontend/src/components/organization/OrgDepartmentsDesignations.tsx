import { useState, useEffect, type FormEvent } from "react"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Building2, Briefcase, Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { Department, Designation } from "@/types"

export function OrgDepartmentsDesignations() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [designations, setDesignations] = useState<Designation[]>([])
  const [newDeptName, setNewDeptName] = useState("")
  const [newDesigName, setNewDesigName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeptDialog, setShowDeptDialog] = useState(false)
  const [showDesigDialog, setShowDesigDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchOrg = async () => {
    setLoading(true)
    try {
      const [deptRes, desigRes] = await Promise.all([
        api.get("/api/organization/departments/"),
        api.get("/api/organization/designations/"),
      ])
      setDepartments(extractResults<Department>(deptRes.data))
      setDesignations(extractResults<Designation>(desigRes.data))
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
      toast.error("Failed to delete. It may be assigned to employees.")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Departments</h4>
              <p className="text-sm text-muted-foreground">
                {departments.length} departments
              </p>
            </div>
            <Dialog open={showDeptDialog} onOpenChange={setShowDeptDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add department</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateDept}>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      placeholder="e.g. Engineering"
                      required
                    />
                  </div>
                  <DialogFooter className="mt-4">
                    <Button type="submit" disabled={isSubmitting || !newDeptName.trim()}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Separator className="my-4" />
          <div className="space-y-2">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{dept.name}</span>
                  <Badge
                    variant={dept.is_active ? "default" : "destructive"}
                    className="text-[10px]"
                  >
                    {dept.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteDept(dept.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {departments.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No departments yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Designations</h4>
              <p className="text-sm text-muted-foreground">
                {designations.length} job titles
              </p>
            </div>
            <Dialog open={showDesigDialog} onOpenChange={setShowDesigDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add designation</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateDesig}>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={newDesigName}
                      onChange={(e) => setNewDesigName(e.target.value)}
                      placeholder="e.g. Senior Engineer"
                      required
                    />
                  </div>
                  <DialogFooter className="mt-4">
                    <Button type="submit" disabled={isSubmitting || !newDesigName.trim()}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Separator className="my-4" />
          <div className="space-y-2">
            {designations.map((des) => (
              <div
                key={des.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{des.name}</span>
                  <Badge
                    variant={des.is_active ? "default" : "destructive"}
                    className="text-[10px]"
                  >
                    {des.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteDesig(des.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {designations.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No designations yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
