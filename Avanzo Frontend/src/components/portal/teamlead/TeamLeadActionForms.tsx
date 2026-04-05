import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { 
  Plus,
  UserPlus, 
  FolderPlus,
  Calendar,
  Loader2,
  Users,
  Zap,
  Search,
  CheckSquare,
  Folder,
  Megaphone
} from "lucide-react"

export function NewTaskModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success("Task created successfully and assigned to lead unit.")
      onOpenChange(false)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] font-body p-0 overflow-hidden rounded-3xl border-slate-200 shadow-2xl">
        <div className="bg-violet-600 p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Plus className="h-6 w-6" />
            <DialogTitle className="font-headline text-2xl font-black">Initialize Mission Unit</DialogTitle>
          </div>
          <DialogDescription className="text-violet-100 font-medium">
            Define high-level parameters and tactical assignments for the upcoming operational task.
          </DialogDescription>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Mission Label / Tactical Identifier</Label>
              <Input id="title" placeholder="e.g. CORE-441: API Layer Optimization" required className="rounded-xl border-slate-200 h-12 focus:ring-violet-600/20" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Urgency Level</Label>
              <Select defaultValue="medium">
                <SelectTrigger className="rounded-xl border-slate-200 h-12">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  <SelectItem value="low">Low Impact (Standard)</SelectItem>
                  <SelectItem value="medium">Medium Urgency (Tactical)</SelectItem>
                  <SelectItem value="high">Critical Path (Immediate)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee" className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Tactical Assignment</Label>
              <Select defaultValue="unassigned">
                <SelectTrigger className="rounded-xl border-slate-200 h-12">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  <SelectItem value="unassigned">Unassigned (Pool)</SelectItem>
                  <SelectItem value="sarah">Sarah Miller (Design Lead)</SelectItem>
                  <SelectItem value="james">James Chen (Tech Staff)</SelectItem>
                  <SelectItem value="mike">Mike Ross (Infra)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due" className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Projected Completion</Label>
              <Input id="due" type="date" required className="rounded-xl border-slate-200 h-12" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated" className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Estimated Effort (Story Points)</Label>
              <Input id="estimated" type="number" placeholder="5" className="rounded-xl border-slate-200 h-12" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Operational Briefing / Requirements</Label>
            <Textarea id="description" placeholder="Detail the objective, technical constraints, and desired outcomes..." className="rounded-xl border-slate-200 min-h-[120px] p-4 text-sm" />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2 text-slate-400">
               <Users className="h-4 w-4" />
               <span className="text-[10px] font-bold uppercase tracking-widest">3 Units Available</span>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold uppercase text-[10px] tracking-widest text-slate-400">Abort</Button>
              <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-10 h-12 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-violet-900/20">
                {loading ? "Transmitting..." : "Initialize Task"}
              </Button>
            </div>
          </div>
        </form>
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
      toast.success("New team member has been successfully added.")
      onOpenChange(false)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] font-body p-0 overflow-hidden rounded-[24px] border-slate-200 shadow-2xl bg-white">
        {/* Header */}
        <div className="bg-violet-600 px-8 py-10 text-white relative">
          <div className="relative z-10 flex items-center gap-5">
             <div className="size-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-sm ring-1 ring-white/10">
                <UserPlus className="h-7 w-7" />
             </div>
             <div>
                <DialogTitle className="font-headline text-2xl font-black tracking-tight">Add New Member</DialogTitle>
                <DialogDescription className="text-violet-100 font-medium mt-0.5">Invite a new professional to join your team registry.</DialogDescription>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label htmlFor="first_name" className="text-xs font-bold uppercase tracking-widest text-slate-500">First Name</Label>
                <Input id="first_name" placeholder="First Name" required className="rounded-xl border-slate-200 h-11 focus:ring-violet-600/10" />
              </div>
              <div className="space-y-4">
                <Label htmlFor="last_name" className="text-xs font-bold uppercase tracking-widest text-slate-500">Last Name</Label>
                <Input id="last_name" placeholder="Last Name" required className="rounded-xl border-slate-200 h-11 focus:ring-violet-600/10" />
              </div>
            </div>

            <div className="space-y-4">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500">Professional Email Address</Label>
              <Input id="email" type="email" placeholder="example@avanzo.com" required className="rounded-xl border-slate-200 h-11 focus:ring-violet-600/10" />
            </div>

            <div className="space-y-4">
              <Label htmlFor="dept" className="text-xs font-bold uppercase tracking-widest text-slate-500">Primary Department</Label>
              <Select defaultValue="engineering">
                <SelectTrigger className="rounded-xl border-slate-200 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl font-body">
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="design">Design Unit</SelectItem>
                  <SelectItem value="product">Product Laboratory</SelectItem>
                  <SelectItem value="security">Cyber Security</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-4">
                <Label htmlFor="role" className="text-xs font-bold uppercase tracking-widest text-slate-500">Departmental Role</Label>
                <Select defaultValue="dev">
                  <SelectTrigger className="rounded-xl border-slate-200 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-body">
                    <SelectItem value="dev">Software Engineer</SelectItem>
                    <SelectItem value="design">Product Designer</SelectItem>
                    <SelectItem value="qa">QA / SDET</SelectItem>
                    <SelectItem value="pm">Product Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <Label htmlFor="team" className="text-xs font-bold uppercase tracking-widest text-slate-500">Assign To Team</Label>
                <Select defaultValue="core">
                  <SelectTrigger className="rounded-xl border-slate-200 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-body">
                    <SelectItem value="core">Core Platform</SelectItem>
                    <SelectItem value="mobile">Mobile Engineering</SelectItem>
                    <SelectItem value="infra">Cloud / Infrastructure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-50">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl h-11 font-bold text-slate-400 hover:text-slate-600">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-[2] bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-11 font-bold shadow-lg shadow-violet-900/10 transition-all">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding Member...
                </span>
              ) : "Add Team Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CreateProjectModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success("New project has been successfully created.")
      onOpenChange(false)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] font-body p-0 overflow-hidden rounded-[24px] border-slate-200 shadow-2xl bg-white">
        {/* Header Section */}
        <div className="bg-slate-900 px-8 py-10 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
             <FolderPlus className="size-24" />
          </div>
          <div className="relative z-10 flex items-center gap-6">
             <div className="size-14 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Plus className="h-7 w-7" />
             </div>
             <div>
                <DialogTitle className="font-headline text-3xl font-black tracking-tight">Create New Project</DialogTitle>
                <DialogDescription className="text-slate-400 font-medium mt-1">Fill in the details below to launch a new team project.</DialogDescription>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <Label htmlFor="proj_name" className="text-xs font-bold uppercase tracking-widest text-slate-500">Project Name</Label>
              <Input id="proj_name" placeholder="Enter a descriptive project title..." required className="rounded-xl border-slate-200 h-12 text-base focus:ring-violet-600/10 placeholder:text-slate-300" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label htmlFor="category" className="text-xs font-bold uppercase tracking-widest text-slate-500">Strategic Category</Label>
                <Select defaultValue="internal">
                  <SelectTrigger className="rounded-xl border-slate-200 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-body">
                    <SelectItem value="internal">Internal Project</SelectItem>
                    <SelectItem value="client">Client Deliverable</SelectItem>
                    <SelectItem value="research">R&D / Innovation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <Label htmlFor="deadline" className="text-xs font-bold uppercase tracking-widest text-slate-500">Target Deadline</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input id="deadline" type="date" required className="rounded-xl border-slate-200 h-12 pl-10" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <Label htmlFor="brief" className="text-xs font-bold uppercase tracking-widest text-slate-500">Project Description</Label>
              <Textarea id="brief" placeholder="Provide a brief overview of the project goals and core requirements..." className="rounded-xl border-slate-200 min-h-[120px] p-4 text-sm resize-none focus:ring-violet-600/10" />
            </div>

            {/* Team Selection */}
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Involved Departments</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {['Engineering', 'Product', 'Security', 'Design', 'DevOps', 'Legal'].map(dept => (
                  <label key={dept} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/30 text-sm font-semibold text-slate-600 hover:bg-violet-50 hover:border-violet-100 transition-all cursor-pointer group">
                    <input type="checkbox" className="accent-violet-600 size-4 rounded-md" />
                    {dept}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-8 border-t border-slate-100 flex gap-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="px-8 rounded-xl font-bold text-slate-400 hover:text-slate-600">Cancel</Button>
            <div className="flex-1 flex gap-4">
              <Button type="button" variant="outline" className="flex-1 rounded-xl h-12 font-bold shadow-sm border-slate-200 hover:bg-slate-50">Save as Draft</Button>
              <Button type="submit" disabled={loading} className="flex-[1.5] bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-12 font-bold shadow-xl shadow-violet-900/10">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Project...
                  </span>
                ) : "Create Project"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CreateDepartmentModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success("New department has been successfully initialized.")
      onOpenChange(false)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] font-body p-0 overflow-hidden rounded-[24px] border-slate-200 shadow-2xl bg-white">
        <div className="bg-slate-900 px-8 py-10 text-white relative">
          <div className="relative z-10 flex items-center gap-5">
             <div className="size-14 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="h-7 w-7 text-white" />
             </div>
             <div>
                <DialogTitle className="font-headline text-2xl font-black tracking-tight">New Department</DialogTitle>
                <DialogDescription className="text-slate-400 font-medium mt-0.5">Initialize a new organizational unit within the core team.</DialogDescription>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <Label htmlFor="dept_name" className="text-xs font-bold uppercase tracking-widest text-slate-500">Department Title</Label>
            <Input id="dept_name" placeholder="e.g. Infrastructure, Design Lab, R&D..." required className="rounded-xl border-slate-200 h-11 focus:ring-violet-600/10" />
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-50">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl h-11 font-bold text-slate-400 hover:text-slate-600">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-[2] bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-11 font-bold shadow-lg shadow-violet-900/10 transition-all">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Initializing...
                </span>
              ) : "Create Department"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function NewUpdateModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState("")
  const [attachments, setAttachments] = useState<{ name: string, type: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success("Operational update transmitted with " + (attachments.length ? attachments.length + " attachments" : "no attachments"))
      onOpenChange(false)
      setContent("")
      setAttachments([])
    }, 1500)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0]
    if (file) {
      setAttachments(prev => [...prev, { name: file.name, type }])
      toast.success(`${type === 'media' ? 'Media' : 'Document'} attached: ${file.name}`)
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const addEmoji = (emoji: string) => {
    setContent(prev => prev + emoji)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] font-body p-0 overflow-hidden rounded-[32px] border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] bg-[#fcfcfd]">
        <div className="p-10 space-y-10">
          <div className="space-y-2">
            <DialogTitle className="font-headline text-4xl font-black text-slate-900 tracking-tight">Draft Transmission</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium text-lg leading-relaxed">Compose a critical update for your team units.</DialogDescription>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'document')} />
            <input type="file" accept="image/*" ref={mediaInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'media')} />
            
            <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-8 space-y-10">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Subject Heading</Label>
                <Input placeholder="Enter a compelling title..." required className="border-none p-0 h-10 text-2xl font-black placeholder:text-slate-200 focus-visible:ring-0 shadow-none bg-transparent" />
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Update Content</Label>
                <Textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Broadcast your message here..." 
                  required 
                  className="border-none p-0 min-h-[200px] text-lg font-medium leading-relaxed placeholder:text-slate-200 focus-visible:ring-0 shadow-none resize-none bg-transparent" 
                />
              </div>

              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-50">
                  {attachments.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl group animate-in fade-in slide-in-from-bottom-2">
                      {file.type === 'media' ? <Plus className="h-4 w-4 text-violet-600" /> : <Users className="h-4 w-4 text-blue-600" />}
                      <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{file.name}</span>
                      <button type="button" onClick={() => removeAttachment(i)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Plus className="h-4 w-4 rotate-45" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                 <div className="flex items-center gap-2">
                    <button type="button" onClick={() => mediaInputRef.current?.click()} className="p-3 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all" title="Add Media">
                      <Plus className="h-5 w-5" />
                    </button>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all" title="Attach Document">
                      <Users className="h-5 w-5" />
                    </button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button type="button" className="p-3 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all" title="Add Emoji">
                          <Calendar className="h-5 w-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="p-2 grid grid-cols-4 gap-1 w-fit rounded-2xl border-slate-100 shadow-2xl">
                        {['👍', '🚀', '🔥', '✅', '⚠️', '📈', '💡', '🗓️'].map(emoji => (
                          <button key={emoji} type="button" onClick={() => addEmoji(emoji)} className="size-10 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-colors text-xl">
                            {emoji}
                          </button>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="w-px h-8 bg-slate-100 mx-2" />
                    <button type="button" className="p-3 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all" onClick={() => toast.info("Rich-text editing engaged.")}>
                      <span className="font-serif italic font-bold text-xl text-slate-600">T</span>
                    </button>
                 </div>
                 
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                       <span className="size-2 rounded-full bg-emerald-500" />
                       Everyone
                    </div>
                    <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700 text-white rounded-[20px] px-10 h-14 font-black uppercase text-[11px] tracking-[0.15em] shadow-[0_12px_32px_rgba(124,58,237,0.3)] transition-all transform hover:-translate-y-1 active:scale-95">
                      {loading ? (
                         <span className="flex items-center gap-3">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Transmitting...
                         </span>
                      ) : (
                         <span className="flex items-center gap-3">
                            <Zap className="h-5 w-5" />
                            Transmit Update
                         </span>
                      )}
                    </Button>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-violet-100 transition-all cursor-help">
                  <div className="size-12 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-all">
                     <Plus className="h-6 w-6" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Global Visibility</p>
                     <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-0.5">Visible to all members of the team across their unified dashboards.</p>
                  </div>
               </div>
               <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-amber-100 transition-all cursor-help">
                  <div className="size-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all">
                     <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Immutable Record</p>
                     <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-0.5">Once transmitted, a cryptographically signed copy is stored in departmental audit logs.</p>
                  </div>
               </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function SearchModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate()
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-[24px] border-slate-100 shadow-2xl bg-white/95 backdrop-blur-xl">
        <div className="relative">
           <Search className="absolute left-6 top-6 h-6 w-6 text-slate-400" />
           <Input 
             placeholder="Search tasks, projects, or personnel..." 
             className="w-full border-none h-20 pl-16 pr-10 text-xl font-medium focus-visible:ring-0 bg-transparent placeholder:text-slate-300"
             autoFocus
           />
           <div className="absolute right-6 top-7 px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-400 uppercase tracking-widest">Esc</div>
        </div>
        
        <div className="p-4 border-t border-slate-50 bg-slate-50/30">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                 <h3 className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Quick Navigation</h3>
                 <div className="space-y-1">
                    {[
                      { label: "View Active Tasks", icon: <CheckSquare className="h-4 w-4" />, path: "/tasks" },
                      { label: "Project Portfolio", icon: <Folder className="h-4 w-4" />, path: "/projects" },
                      { label: "Team Roster", icon: <Users className="h-4 w-4" />, path: "/team" },
                      { label: "Communications Hub", icon: <Megaphone className="h-4 w-4" />, path: "/team-announcements" },
                    ].map((link, i) => (
                      <button 
                        key={i} 
                        onClick={() => { navigate(link.path); onOpenChange(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-sm font-bold text-slate-700 group text-left"
                      >
                         <div className="p-2 rounded-lg bg-slate-100 text-slate-400 group-hover:bg-violet-600 group-hover:text-white transition-all">
                            {link.icon}
                         </div>
                         {link.label}
                      </button>
                    ))}
                 </div>
              </div>
              
              <div className="space-y-4">
                 <h3 className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Tactical Actions</h3>
                 <div className="space-y-1">
                    {[
                      { label: "New Task Transmission", icon: <Plus className="h-4 w-4" /> },
                      { label: "Global Announcement", icon: <Zap className="h-4 w-4" /> },
                      { label: "Recruit New Member", icon: <Users className="h-4 w-4" /> },
                    ].map((action, i) => (
                      <button key={i} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-sm font-bold text-slate-500 hover:text-slate-900 group text-left">
                         <div className="p-2 rounded-lg bg-slate-50 text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                            {action.icon}
                         </div>
                         {action.label}
                      </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>
        
        <div className="px-8 py-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           <div className="flex items-center gap-4">
              <span>↑↓ to navigate</span>
              <span>⏎ to select</span>
           </div>
           <span>Advanced Search Mode</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
