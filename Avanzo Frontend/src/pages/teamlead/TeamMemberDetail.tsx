import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { api } from "@/lib/axios"
import { accountsService } from "@/services/accounts"
import TeamLeadChrome from "@/components/portal/teamlead/TeamLeadChrome"
import {
  ArrowLeft,
  Award,
  Briefcase,
  CheckCircle,
  Circle,
  AlertCircle,
  ClipboardList,
  Loader2,
  Mail,
  MapPin,
  Building2,
  CheckCircle2,
  Plus,
  Shield,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

function getTaskStatusLabel(status: string) {
  switch (status) {
    case "resolved": return "Resolved"
    case "progress": return "In Progress"
    default: return "Open"
  }
}

export default function TeamMemberDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [member, setMember] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [talentTags, setTalentTags] = useState<any[]>([])
  const [memberLoading, setMemberLoading] = useState(true)
  const [tasksLoading, setTasksLoading] = useState(true)
  const [isEvalOpen, setIsEvalOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [customTagName, setCustomTagName] = useState("")

  useEffect(() => {
    window.scrollTo(0, 0)
    if (id) {
      fetchMember()
      fetchTasks()
      fetchTalentTags()
    }
  }, [id])

  const fetchMember = async () => {
    try {
      setMemberLoading(true)
      const data = await accountsService.getEmployees()
      const all = Array.isArray(data) ? data : (data.results || [])
      const found = all.find((m: any) => m.id === id)
      if (found) {
        setMember({ ...found, full_name: `${found.first_name} ${found.last_name}` })
      }
    } catch (e) {
      toast.error("Failed to load member data.")
    } finally {
      setMemberLoading(false)
    }
  }

  const fetchTasks = async () => {
    try {
      setTasksLoading(true)
      // Use a cache-buster to ensure the browser doesn't serve a stale empty array
      const res = await api.get(`/api/projects/tasks/?assignee=${id}&_t=${Date.now()}`)
      const data = res.data
      const parsedTasks = Array.isArray(data) ? data : (data.results || [])
      setTasks(parsedTasks)
      if (parsedTasks.length === 0) {
         console.warn(`0 tasks fetched for ID: ${id}. Full API response:`, data)
         // toast.info(`API returned 0 tasks for ${id}`) 
      }
    } catch (e: any) {
      console.error(e)
      toast.error(`Failed to load tasks: ${e.message}`)
    } finally {
      setTasksLoading(false)
    }
  }

  const fetchTalentTags = async () => {
    try {
      const res = await api.get("/api/auth/talent-tags/")
      const data = res.data
      setTalentTags(Array.isArray(data) ? data : (data.results || []))
    } catch (e) {
      console.error(e)
    }
  }

  const handleAddCustomTag = async () => {
    if (!customTagName.trim()) return
    try {
      const res = await api.post("/api/auth/talent-tags/", { name: customTagName, category: "Custom" })
      const newTag = { ...res.data, is_custom: true }
      setTalentTags(prev => [...prev, newTag])
      setMember((m: any) => ({ ...m, evaluated_talents: [...(m?.evaluated_talents || []), newTag.id] }))
      setCustomTagName("")
      toast.success("New skill added.")
    } catch {
      toast.error("Failed to add skill.")
    }
  }

  const handleSaveSkills = async () => {
    try {
      setUpdating(true)
      await api.post(`/api/auth/employees/${member.id}/update-skills/`, { talent_ids: member.evaluated_talents })
      toast.success("Skills updated successfully.")
      setIsEvalOpen(false)
    } catch {
      toast.error("Failed to update skills.")
    } finally {
      setUpdating(false)
    }
  }

  const completedTasks = tasks.filter(t => t.status === "resolved").length
  const inProgressTasks = tasks.filter(t => t.status === "progress").length
  const openTasks = tasks.filter(t => t.status === "open").length

  if (memberLoading) {
    return (
      <TeamLeadChrome>
        <div className="h-[75vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="size-8 animate-spin text-violet-500/50" />
            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Loading member...</p>
          </div>
        </div>
      </TeamLeadChrome>
    )
  }

  if (!member) {
    return (
      <TeamLeadChrome>
        <div className="h-[75vh] flex items-center justify-center">
          <p className="text-slate-400 font-bold">Member not found.</p>
        </div>
      </TeamLeadChrome>
    )
  }

  return (
    <TeamLeadChrome>
      <div className="bg-[#fcfcfc] min-h-screen animate-in fade-in duration-500 font-sans">

        {/* Top Bar */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
          <div className="w-full px-4 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/team")}
                className="size-9 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="h-4 w-px bg-slate-100 mx-1" />
              <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span className="cursor-pointer hover:text-slate-600 transition-colors" onClick={() => navigate("/team")}>Team</span>
                <span className="opacity-30">/</span>
                <span className="text-slate-900">{member.full_name}</span>
              </nav>
            </div>
            <button
              onClick={() => setIsEvalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-[11px] font-bold rounded-xl hover:bg-violet-600 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
            >
              <Award size={14} />
              Edit Skills
            </button>
          </div>
        </div>

        <div className="w-full py-6 space-y-8">

          {/* Profile Card */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <img
              src={member.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name)}&background=f5f3ff&color=7c3aed&bold=true&size=128`}
              alt={member.full_name}
              className="size-24 rounded-[1.5rem] object-cover border border-slate-100 shadow-sm shrink-0"
            />
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight capitalize">{member.full_name}</h1>
                <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase tracking-widest rounded-lg px-3 py-1">
                  Active
                </Badge>
              </div>
              <div className="flex flex-wrap gap-3">
                {member.email && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <Mail size={12} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600">{member.email}</span>
                  </div>
                )}
                {(member.department_name || member.department) && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <Building2 size={12} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600">{member.department_name || member.department}</span>
                  </div>
                )}
                {member.address && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <MapPin size={12} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600">{member.address?.split(',').pop()?.trim() || 'HQ'}</span>
                  </div>
                )}
              </div>

              {/* Skills */}
              {member.evaluated_talents && member.evaluated_talents.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {talentTags
                    .filter((t: any) => member.evaluated_talents.includes(t.id))
                    .map((tag: any) => (
                      <span key={tag.id} className="px-3 py-1 bg-violet-50 border border-violet-100 rounded-lg text-[10px] font-bold text-violet-600">
                        {tag.name}
                      </span>
                    ))
                  }
                </div>
              )}
            </div>
          </div>

          {/* Task Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Completed", value: completedTasks, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
              { label: "In Progress", value: inProgressTasks, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
              { label: "Open", value: openTasks, color: "text-orange-600", bg: "bg-orange-50 border-orange-100" },
            ].map(stat => (
              <div key={stat.label} className={`${stat.bg} border rounded-2xl p-6 text-center`}>
                <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Assigned Work */}
          <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ClipboardList size={18} className="text-slate-400" />
                <h2 className="text-base font-black text-slate-900 tracking-tight">Assigned Work</h2>
              </div>
              <Badge className="bg-violet-50 text-violet-600 border border-violet-100 text-[10px] font-black rounded-lg">
                {tasks.length} Tasks
              </Badge>
            </div>

            {tasksLoading ? (
              <div className="py-20 flex flex-col items-center gap-4">
                <Loader2 className="size-6 animate-spin text-violet-400" />
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loading tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-20 flex flex-col items-center gap-3">
                <ClipboardList size={36} className="text-slate-200" />
                <p className="text-sm font-bold text-slate-400">No tasks assigned</p>
                <p className="text-xs text-slate-300">{member.full_name} has no current work assignments.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Task</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hidden md:table-cell">Project</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Priority</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center hidden sm:table-cell">Progress</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Status</th>
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
                        <div className="flex items-center gap-2">
                          <Briefcase size={13} className="text-slate-300" />
                          <span className="text-sm font-semibold text-slate-600">{task.project_name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                          task.priority === 'critical' || task.priority === 'high'
                            ? 'bg-red-50 text-red-500 border-red-100'
                            : task.priority === 'medium'
                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                            : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          {task.priority || 'low'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center hidden sm:table-cell">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-violet-600 rounded-full transition-all"
                              style={{ width: `${task.completion_pct || 0}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{task.completion_pct || 0}%</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getTaskStatusStyle(task.status)}`}>
                          {getTaskStatusLabel(task.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Skills Dialog */}
      <Dialog open={isEvalOpen} onOpenChange={setIsEvalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl font-sans bg-white">
          <div className="bg-slate-50/50 p-10 pb-8 flex items-center gap-6 border-b border-slate-100/50">
            <div className="size-14 rounded-2xl bg-[#FFF8E6] text-[#FFB800] flex items-center justify-center">
              <Award className="size-7 stroke-[2.2]" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                Member Skills
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-400 mt-1">
                Update skills for <span className="text-slate-900 font-bold">{member.full_name}</span>
              </DialogDescription>
            </div>
          </div>

          <div className="p-10 space-y-8">
            <div className="space-y-3">
              <Label className="px-1 text-[11px] font-bold text-slate-400">Add New Skill</Label>
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
              <Label className="text-[11px] font-bold text-slate-400">Skill List</Label>
              <div className="flex flex-wrap gap-2 max-h-[250px] overflow-y-auto pr-2">
                {talentTags.map((tag: any) => {
                  const isSelected = member?.evaluated_talents?.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      onClick={() => {
                        const current = member?.evaluated_talents || []
                        const updated = isSelected
                          ? current.filter((tid: any) => tid !== tag.id)
                          : [...current, tag.id]
                        setMember((m: any) => ({ ...m, evaluated_talents: updated }))
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
            <Button onClick={handleSaveSkills} disabled={updating} className="flex-[2] h-12 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-violet-600 transition-all active:scale-95 disabled:opacity-50 flex gap-2 items-center justify-center">
              {updating ? <Loader2 className="size-4 animate-spin" /> : <Shield className="size-4" />}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TeamLeadChrome>
  )
}
