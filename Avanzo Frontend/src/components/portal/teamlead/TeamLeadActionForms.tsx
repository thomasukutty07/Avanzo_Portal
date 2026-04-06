import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { projectsService } from "@/services/projects"
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogTitle, 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { toast } from "sonner"
import { 
  Loader2,
  Zap,
  Search,
  CheckSquare,
  Folder,
  Megaphone,
  Globe,
  ImageIcon,
  Paperclip,
  UserCheck,
  CheckCircle2,
  Target,
  Users,
  X,
} from "lucide-react"
import NewTaskModal from "./NewTaskModal"


export { NewTaskModal }

export function ReviewTaskModal({ open, onOpenChange, task, onSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, task: any, onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [approved, setApproved] = useState<boolean | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (approved === null) {
      toast.error("Please explicitly approve or reject the work.")
      return
    }
    setLoading(true)
    try {
      await projectsService.reviewTask(task.id, { approved })
      toast.success(approved ? "Task successfully closed." : "Task sent back for rework.")
      onSuccess?.()
      onOpenChange(false)
    } catch (err: any) {
      toast.error("Failed to review task.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="w-[95vw] sm:max-w-xl rounded-2xl sm:rounded-3xl p-0 border border-violet-100 overflow-hidden bg-white shadow-[0_20px_50px_rgba(109,40,217,0.08)] font-sans outline-none">
        <DialogTitle className="sr-only">Review submission</DialogTitle>
        <DialogDescription className="sr-only">Review unit sector work and close task or request rework.</DialogDescription>
        
        <div className="bg-white px-5 sm:px-8 pt-5 pb-4 flex items-center gap-3 border-b border-violet-50 shrink-0">
          <div className="size-8 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-violet-600/30 shrink-0">
            <CheckCircle2 className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight text-slate-900 leading-none">Review submission</h2>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Evaluate task completion and assign final status.</p>
          </div>
        </div>

        <div className="overflow-y-auto">
          <form onSubmit={handleSubmit} className="px-5 sm:px-8 py-6 space-y-6 bg-white">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-800">{task?.title}</h3>
              <p className="text-xs font-bold text-slate-400">{task?.project_name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button 
                 type="button"
                 onClick={() => setApproved(true)}
                 className={`flex flex-col items-center justify-center gap-2 h-24 rounded-2xl border-2 transition-all ${approved === true ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
               >
                 <CheckCircle2 className={`size-6 ${approved === true ? 'text-emerald-500' : 'text-slate-400'}`} />
                 <span className={`text-[10px] font-black uppercase tracking-widest ${approved === true ? 'text-emerald-600' : 'text-slate-500'}`}>Approve & Close</span>
               </button>

               <button 
                 type="button"
                 onClick={() => setApproved(false)}
                 className={`flex flex-col items-center justify-center gap-2 h-24 rounded-2xl border-2 transition-all ${approved === false ? 'border-amber-500 bg-amber-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
               >
                 <X className={`size-6 ${approved === false ? 'text-amber-500' : 'text-slate-400'}`} />
                 <span className={`text-[10px] font-black uppercase tracking-widest ${approved === false ? 'text-amber-600' : 'text-slate-500'}`}>Sent for Rework</span>
               </button>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-slate-50 mt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="w-full sm:flex-1 h-10 text-slate-400 font-medium text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">
                Cancel
              </Button>
              <Button type="submit" disabled={loading || approved === null} className="w-full sm:flex-[2] h-10 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-md active:scale-95 transition-all">
                {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                Finalize Review
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function SearchModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState("")
  const navigate = useNavigate()

  const suggestions = [
    { label: "Team Tasks", icon: CheckSquare, path: "/tasks", hint: "Manage assignments" },
    { label: "Projects", icon: Folder, path: "/projects", hint: "Track mission projects" },
    { label: "Team Members", icon: Users, path: "/team", hint: "View personnel registry" },
    { label: "Announcements", icon: Megaphone, path: "/team-announcements", hint: "Broadcast updates" },
  ]

  const filtered = query.trim()
    ? suggestions.filter(s =>
        s.label.toLowerCase().includes(query.toLowerCase()) ||
        s.hint.toLowerCase().includes(query.toLowerCase())
      )
    : suggestions

  const handleSelect = (path: string) => {
    navigate(path)
    onOpenChange(false)
    setQuery("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-lg rounded-3xl p-0 border border-slate-100 overflow-hidden bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] font-sans outline-none">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">Search for pages and actions</DialogDescription>
        <div className="flex flex-col">
          <div className="flex items-center gap-4 px-6 pt-6 pb-4 border-b border-slate-50">
            <Search className="size-5 text-slate-400 shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") { onOpenChange(false); setQuery("") }
                if (e.key === "Enter" && filtered.length > 0) handleSelect(filtered[0].path)
              }}
              placeholder="Search pages, tasks, projects..."
              className="flex-1 text-base font-bold text-slate-900 placeholder:text-slate-300 bg-transparent outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-slate-300 hover:text-slate-500 transition-colors">
                <X className="size-4" />
              </button>
            )}
          </div>
          <div className="py-3 px-3">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleSelect(item.path)}
                  className="w-full flex items-center gap-4 rounded-2xl px-4 py-3 hover:bg-slate-50 transition-all group text-left"
                >
                  <div className="size-9 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white text-slate-500 transition-colors shrink-0">
                    <item.icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{item.label}</p>
                    <p className="text-xs text-slate-400 font-medium truncate">{item.hint}</p>
                  </div>
                  <Zap className="size-3.5 text-slate-200 group-hover:text-violet-400 ml-auto shrink-0 transition-colors" />
                </button>
              ))
            ) : (
              <div className="py-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                No results found
              </div>
            )}
          </div>
          <div className="px-6 py-3 border-t border-slate-50 flex items-center gap-4 text-[10px] text-slate-300 font-bold uppercase tracking-widest">
            <span>↑↓ Navigate</span>
            <span>↵ Open</span>
            <span>Esc Close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AddMemberModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success("Team member successfully onboarded.")
      onOpenChange(false)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="w-[95vw] sm:max-w-3xl rounded-2xl sm:rounded-3xl p-0 border border-violet-100 overflow-hidden bg-white shadow-[0_20px_50px_rgba(109,40,217,0.08)] font-sans outline-none max-h-[90vh] flex flex-col">
        <DialogTitle className="sr-only">Onboard member</DialogTitle>
        <DialogDescription className="sr-only">Invite a new professional to join your unit registry.</DialogDescription>
        {/* Header */}
        <div className="bg-white px-5 sm:px-8 pt-5 pb-4 flex items-center gap-3 border-b border-violet-50 shrink-0">
          <div className="size-8 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-violet-600/30 shrink-0">
            <UserCheck className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight text-slate-900 leading-none">Onboard member</h2>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Invite a new professional to join your unit registry.</p>
          </div>
        </div>

        <div className="overflow-y-auto">
          <form onSubmit={handleSubmit} className="px-5 sm:px-8 py-6 space-y-5 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Given name</Label>
                <Input placeholder="Candidate name..." required className="rounded-xl border-slate-100 bg-slate-50 h-10 text-sm font-medium focus:border-violet-500 focus:bg-white transition-all placeholder:text-slate-300" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Surname</Label>
                <Input placeholder="Candidate surname..." required className="rounded-xl border-slate-100 bg-slate-50 h-10 text-sm font-medium focus:border-violet-500 focus:bg-white transition-all placeholder:text-slate-300" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact email</Label>
                <Input type="email" placeholder="professional@avanzo.com" required className="rounded-xl border-slate-100 bg-slate-50 h-10 text-sm font-medium focus:border-violet-500 focus:bg-white transition-all placeholder:text-slate-300" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sector assignment</Label>
                <Select defaultValue="engineering">
                  <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 h-10 text-sm font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="engineering">Engineering Unit</SelectItem>
                    <SelectItem value="design">Strategic Design</SelectItem>
                    <SelectItem value="product">Core Product</SelectItem>
                    <SelectItem value="security">Cyber Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mission role</Label>
                <Select defaultValue="dev">
                  <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 h-10 text-sm font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="dev">Software Operative</SelectItem>
                    <SelectItem value="lead">Technical Lead</SelectItem>
                    <SelectItem value="qa">QA / Analyst</SelectItem>
                    <SelectItem value="pm">Mission Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="w-full sm:flex-1 h-10 text-slate-400 font-medium text-[10px] uppercase tracking-widest rounded-xl hover:bg-violet-50 hover:text-violet-600 transition-all">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="w-full sm:flex-[2] h-10 bg-violet-600 hover:bg-violet-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-md shadow-violet-600/25 active:scale-95 transition-all">
                {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <CheckCircle2 className="size-4 mr-2" />}
                {loading ? "Onboarding..." : "Authorize member"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function CreateProjectModal({ open, onOpenChange, onSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: "",
    is_internal: true,
    client: "",
    target_end_date: "",
  })

  useEffect(() => {
    if (open) {
      projectsService.getClients()
        .then(data => setClients(Array.isArray(data) ? data : (data.results || [])))
        .catch(() => setClients([]))
    }
  }, [open])

  const reset = () => setFormData({ title: "", is_internal: true, client: "", target_end_date: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.is_internal && !formData.client) {
      toast.error("External projects require a client.")
      return
    }
    setLoading(true)
    try {
      const payload: any = {
        title: formData.title,
        is_internal: formData.is_internal,
        target_end_date: formData.target_end_date || null,
      }
      if (!formData.is_internal && formData.client) payload.client = formData.client
      await projectsService.createProject(payload)
      toast.success("Project successfully initialized.")
      onSuccess?.()
      onOpenChange(false)
      reset()
    } catch (err: any) {
      const data = err.response?.data
      console.error("[CreateProject] 400 response:", data)
      const raw = data?.detail || data?.non_field_errors?.[0]
        || (typeof data === "object" ? Object.values(data).flat()[0] : null)
        || "Failed to create project."
      const msg = Array.isArray(raw) ? raw[0] : raw
      toast.error(String(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="w-[95vw] sm:max-w-3xl rounded-2xl sm:rounded-3xl p-0 border border-violet-100 overflow-hidden bg-white shadow-[0_20px_50px_rgba(109,40,217,0.08)] font-sans outline-none max-h-[90vh] flex flex-col">
        <DialogTitle className="sr-only">Initialize project</DialogTitle>
        <DialogDescription className="sr-only">Launch a new tactical project module for the unit sector.</DialogDescription>
        {/* Header */}
        <div className="bg-white px-5 sm:px-8 pt-5 pb-4 flex items-center gap-3 border-b border-violet-50 shrink-0">
          <div className="size-8 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-violet-600/30 shrink-0">
            <Target className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight text-slate-900 leading-none">Initialize project</h2>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Launch a new tactical project module for the unit sector.</p>
          </div>
        </div>

        <div className="overflow-y-auto">
          <form onSubmit={handleSubmit} className="px-5 sm:px-8 py-6 space-y-5 bg-white">
            {/* Title */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project title</Label>
              <input
                required
                placeholder="e.g. Project Aurora: API Core Refresh"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full h-10 rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Internal / External toggle */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment type</Label>
                <select
                  className="w-full h-10 rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm font-medium text-slate-900 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 outline-none transition-all appearance-none cursor-pointer"
                  value={formData.is_internal ? "internal" : "external"}
                  onChange={e => setFormData({ ...formData, is_internal: e.target.value === "internal", client: "" })}
                >
                  <option value="internal">Internal Infrastructure</option>
                  <option value="external">Operational Delivery (External)</option>
                </select>
              </div>

              {/* Target deadline */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target deadline</Label>
                <input
                  type="date"
                  value={formData.target_end_date}
                  onChange={e => setFormData({ ...formData, target_end_date: e.target.value })}
                  className="w-full h-10 rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm font-medium text-slate-900 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 outline-none transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* Client — only shown for external projects */}
            {!formData.is_internal && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</Label>
                <select
                  required
                  value={formData.client}
                  onChange={e => setFormData({ ...formData, client: e.target.value })}
                  className="w-full h-10 rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm font-medium text-slate-900 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select client...</option>
                  {clients.length === 0
                    ? <option value="" disabled>No clients available</option>
                    : clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                  }
                </select>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => { onOpenChange(false); reset() }} className="w-full sm:flex-1 h-10 text-slate-400 font-medium text-[10px] uppercase tracking-widest rounded-xl hover:bg-violet-50 hover:text-violet-600 transition-all">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="w-full sm:flex-[2] h-10 bg-violet-600 hover:bg-violet-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-md shadow-violet-600/25 active:scale-95 transition-all">
                {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <CheckCircle2 className="size-4 mr-2" />}
                {loading ? "Deploying..." : "Initialize mission project"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function NewUpdateModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success("Tactical update successfully broadcasted.")
      onOpenChange(false)
      setContent("")
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="w-[95vw] sm:max-w-3xl rounded-2xl sm:rounded-3xl p-0 border border-violet-100 overflow-hidden bg-white shadow-[0_20px_50px_rgba(109,40,217,0.08)] font-sans outline-none max-h-[90vh] flex flex-col">
        <DialogTitle className="sr-only">Draft transmission</DialogTitle>
        <DialogDescription className="sr-only">Compose a strategic broadcast update for the unit sector.</DialogDescription>
        {/* Header */}
        <div className="bg-white px-5 sm:px-8 pt-5 pb-4 flex items-center gap-3 border-b border-violet-50 shrink-0">
          <div className="size-8 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-violet-600/30 shrink-0">
            <Megaphone className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight text-slate-900 leading-none">Draft transmission</h2>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Compose a strategic broadcast update for the unit sector.</p>
          </div>
        </div>

        <div className="overflow-y-auto">
          <form onSubmit={handleSubmit} className="px-5 sm:px-8 py-6 space-y-5 bg-white">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Broadcast headline</Label>
              <input placeholder="Enter a descriptive subject..." required className="w-full h-10 rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 outline-none transition-all" />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transmission detail</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Synchronize your message with the tactical teams..."
                required
                className="rounded-xl border-slate-100 bg-slate-50 min-h-[120px] p-3 text-sm font-medium resize-none focus:border-violet-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button type="button" className="p-2 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"><ImageIcon className="size-4" /></button>
                <button type="button" className="p-2 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"><Paperclip className="size-4" /></button>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  <Globe className="size-3 text-emerald-500" />Everyone
                </div>
              </div>
              <Button type="submit" disabled={loading} className="sm:ml-auto h-10 px-6 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md shadow-violet-600/25 active:scale-95 transition-all">
                {loading ? <Loader2 className="size-4 animate-spin" /> : "Transmit update"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
