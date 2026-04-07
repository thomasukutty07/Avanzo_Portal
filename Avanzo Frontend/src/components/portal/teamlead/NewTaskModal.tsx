import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { projectsService } from "@/services/projects"
import { accountsService } from "@/services/accounts"
import { toast } from "sonner"
import { Loader2, Plus, Calendar, ShieldAlert, Target, UserCheck, CheckCircle2 } from "lucide-react"

interface NewTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function NewTaskModal({ open, onOpenChange, onSuccess }: NewTaskModalProps) {
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState("")
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project: "",
    assignee: "",
    priority: "medium",
    status: "open",
    start_date: new Date().toISOString().split('T')[0],
    due_date: "",
    force_assign: false
  })

  useEffect(() => {
    if (open) {
      loadInitialData()
    }
  }, [open])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const projectsData = await projectsService.getProjects()
      const employeesData = await accountsService.getEmployees()
      console.log("[NewTaskModal] projectsData:", projectsData)
      console.log("[NewTaskModal] employeesData:", employeesData)
      setProjects(Array.isArray(projectsData) ? projectsData : (projectsData.results || []))
      setEmployees(Array.isArray(employeesData) ? employeesData : (employeesData.results || []))
    } catch (error) {
      toast.error("Mission telemetry synchronization failed.")
    } finally {
      setLoading(false)
    }
  }

  const filteredEmployees = selectedProjectId 
    ? employees.filter(emp => {
        const project = projects.find(p => p.id === selectedProjectId)
        return project?.team?.includes(emp.id)
      })
    : employees

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.project || !formData.assignee || !formData.title || !formData.start_date || !formData.due_date) {
      toast.error("Mandatory mission parameters missing.")
      return
    }

    setSubmitting(true)
    try {
      await projectsService.createTask(formData)
      toast.success("Directive initialized and synchronized.")
      onSuccess?.()
      onOpenChange(false)
      setFormData({
        title: "",
        description: "",
        project: "",
        assignee: "",
        priority: "medium",
        status: "open",
        start_date: new Date().toISOString().split('T')[0],
        due_date: "",
        force_assign: false
      })
      setSelectedProjectId("")
    } catch (error: any) {
      toast.error(error.response?.data?.conflict || "Workflow transmission error.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="w-[95vw] sm:max-w-3xl rounded-2xl sm:rounded-3xl p-0 border border-violet-100 overflow-hidden bg-white shadow-[0_20px_50px_rgba(109,40,217,0.08)] font-sans outline-none max-h-[90vh] flex flex-col">
        <DialogTitle className="sr-only">Assign Task</DialogTitle>
        <DialogDescription className="sr-only">Configure and assign technical deliverables to unit sectors.</DialogDescription>
        {/* Header */}
        <div className="bg-white px-5 sm:px-8 pt-5 pb-4 flex items-center gap-3 border-b border-violet-50 shrink-0">
          <div className="size-8 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-violet-600/30 shrink-0">
            <Plus className="size-4 stroke-[3px]" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight text-slate-900 leading-none uppercase tracking-[0.05em]">Assign Task</h2>
            <p className="text-[11px] font-medium text-slate-400 mt-1.5 flex items-center gap-1.5 leading-none opacity-80 italic">Configure and assign technical deliverables to unit sectors.</p>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white">
              <Loader2 className="size-7 animate-spin text-violet-600 mb-4" />
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Synchronizing telemetry matrix...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-5 sm:px-8 md:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8 bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-8 sm:gap-y-6">
                {/* Sector Selection */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    <Target className="size-3.5 text-slate-200 shrink-0" />
                    Mission project sector
                  </label>
                  <select
                    className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-950 hover:bg-slate-100 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all appearance-none cursor-pointer"
                    value={formData.project}
                    onChange={(e) => {
                      setFormData({...formData, project: e.target.value})
                      setSelectedProjectId(e.target.value)
                    }}
                    required
                  >
                    <option value="" disabled>Select sector...</option>
                    {projects.length === 0 ? (
                      <option value="" disabled>No projects found for your department</option>
                    ) : (
                      projects.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))
                    )}
                  </select>
                </div>

                {/* Unit Assignee */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    <UserCheck className="size-3.5 text-slate-200 shrink-0" />
                    Tactical mission unit
                  </label>
                  <select
                    className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-950 hover:bg-slate-100 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all appearance-none cursor-pointer"
                    value={formData.assignee}
                    onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                    required
                  >
                    <option value="" disabled>Select unit...</option>
                    {filteredEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                    ))}
                  </select>
                </div>

                {/* Directive Title — full width */}
                <div className="space-y-2.5 sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Mission briefing directive headline</label>
                  <input
                    type="text"
                    className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-950 placeholder:text-slate-300 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all"
                    placeholder="Brief description of mission parameters..."
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2.5 sm:col-span-1">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="size-3.5 text-slate-200 shrink-0" />
                    Start date
                  </label>
                  <input
                    type="date"
                    className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-950 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all cursor-pointer"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    required
                  />
                </div>

                {/* Deadline */}
                <div className="space-y-2.5 sm:col-span-1">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="size-3.5 text-slate-200 shrink-0" />
                    Target deadline
                  </label>
                  <input
                    type="date"
                    className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-950 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all cursor-pointer"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    required
                  />
                </div>

                {/* Priority */}
                <div className="space-y-2.5 sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert className="size-3.5 text-slate-200 shrink-0" />
                    Priority index
                  </label>
                  <select
                    className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold text-slate-950 hover:bg-slate-100 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all cursor-pointer appearance-none"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="low">Standard</option>
                    <option value="medium">Tactical Focus</option>
                    <option value="high">Critical Frontier</option>
                  </select>
                </div>
              </div>

              {/* Force Assign Card — wraps on mobile */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 group ${
                  formData.force_assign
                    ? 'bg-violet-600 border-violet-600 shadow-xl shadow-violet-600/25'
                    : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                }`}
                onClick={() => setFormData({...formData, force_assign: !formData.force_assign})}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`size-10 shrink-0 rounded-xl flex items-center justify-center transition-all ${
                    formData.force_assign ? 'bg-white text-violet-600 shadow-md' : 'bg-white text-slate-300 border border-slate-100'
                  }`}>
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className={`text-sm font-black tracking-tight leading-none ${formData.force_assign ? 'text-white' : 'text-slate-950'}`}>Force assignment protocol</h4>
                    <p className={`text-xs font-bold mt-1.5 lowercase leading-snug opacity-80 ${formData.force_assign ? 'text-violet-100' : 'text-slate-400'}`}>Bypass existing mission conflicts for critical unit deployment.</p>
                  </div>
                </div>
                <div className={`size-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                  formData.force_assign ? 'bg-white border-white' : 'border-slate-200'
                }`}>
                  {formData.force_assign && <div className="size-2 bg-violet-600 rounded-full" />}
                </div>
              </div>

              {/* Action Buttons — stack on mobile */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="w-full sm:w-auto sm:flex-1 h-10 text-slate-400 font-medium text-[10px] uppercase tracking-widest rounded-xl hover:bg-violet-50 hover:text-violet-600 transition-all"
                >
                  Cancel mission
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:flex-[2] h-10 bg-violet-600 hover:bg-violet-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-md shadow-violet-600/25 active:scale-95 transition-all"
                >
                  {submitting ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="size-4 mr-2" />
                  )}
                  {submitting ? "Initializing..." : "Transmit directive"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
