import { TeamLeadChrome } from "@/components/portal/teamlead/TeamLeadChrome"
import { useDesignPortalLightTheme } from "@/hooks/useDesignPortalLightTheme"
import { useState } from "react"
import { toast } from "sonner"
import { NewTaskModal } from "@/components/portal/teamlead/TeamLeadActionForms"
import { 
  MoreHorizontal, 
  Plus, 
  MessageSquare, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertTriangle, 
  Timer
} from "lucide-react"

const COLUMNS = [
  { id: "todo", title: "To Do", count: 5, color: "bg-slate-400" },
  { id: "inprogress", title: "In Progress", count: 3, color: "bg-amber-400", border: "border-l-amber-400" },
  { id: "review", title: "Review", count: 2, color: "bg-blue-500" },
  { id: "done", title: "Done", count: 8, color: "bg-emerald-500", opacity: "opacity-70 grayscale" },
]

export default function TaskManagement() {
  useDesignPortalLightTheme()
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)

  return (
    <TeamLeadChrome>
      <div className="p-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-headline text-3xl font-black tracking-tight text-slate-900 leading-none">Team Workflow</h2>
            <p className="font-body text-slate-500 font-medium italic mt-2">Manage and track your team's progress across all active tasks.</p>
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm font-body">
            <button className="px-4 py-1.5 text-sm font-bold bg-violet-600 text-white rounded-lg shadow-sm transition-all">Kanban Board</button>
            <button 
              onClick={() => toast.info("List view coming soon")}
              className="px-4 py-1.5 text-sm font-bold text-slate-400 hover:text-slate-900 transition-all font-body"
            >
              List View
            </button>
            <button 
              onClick={() => toast.info("Timeline view coming soon")}
              className="px-4 py-1.5 text-sm font-bold text-slate-400 hover:text-slate-900 transition-all font-body"
            >
              Timeline
            </button>
          </div>
        </div>

        <div className="flex gap-6 pb-12 overflow-x-auto min-h-[calc(100vh-280px)] font-body">
          {COLUMNS.map((col) => (
            <div key={col.id} className={`w-80 flex flex-col gap-4 shrink-0 ${col.opacity || ''}`}>
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${col.color}`}></span>
                  <h3 className="font-bold text-slate-900 uppercase tracking-tight">{col.title}</h3>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 tracking-widest">{col.count}</span>
                </div>
                <button onClick={() => toast.info(`Opening ${col.title} menu...`)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {col.id === 'todo' && (
                  <>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group" onClick={() => toast.info("Viewing task details")}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-violet-600 bg-violet-50 px-2 py-1 rounded-lg">Design</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mb-4 leading-tight group-hover:text-violet-600 transition-colors">Update mobile navigation patterns</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          <img className="size-8 rounded-full border-2 border-white shadow-sm" src="https://i.pravatar.cc/100?img=1" alt="Member" />
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Timer className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-tighter">Oct 12</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-grab group" onClick={() => toast.info("Viewing task details")}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">Planning</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mb-4 leading-tight group-hover:text-violet-600 transition-colors">Q4 Performance metrics dashboard</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          <img className="size-8 rounded-full border-2 border-white shadow-sm" src="https://i.pravatar.cc/100?img=2" alt="Member" />
                          <img className="size-8 rounded-full border-2 border-white shadow-sm" src="https://i.pravatar.cc/100?img=3" alt="Member" />
                        </div>
                        <div className="flex items-center gap-1 text-red-500 font-bold uppercase text-[9px] tracking-widest">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Urgent
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {col.id === 'inprogress' && (
                  <div className={`bg-white p-5 rounded-2xl border-l-[6px] ${col.border || ''} border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-grab group`} onClick={() => toast.info("Viewing task progress")}>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Engineering</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-2 leading-tight group-hover:text-violet-600 transition-colors">API Integration for Avanzo v2</h4>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 my-4 overflow-hidden border border-slate-100 shadow-inner">
                      <div className="bg-amber-400 h-full rounded-full w-[65%]"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        <img className="size-8 rounded-full border-2 border-white shadow-sm" src="https://i.pravatar.cc/100?img=4" alt="Member" />
                      </div>
                      <div className="flex items-center gap-3 text-slate-400">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="size-3.5" />
                          <span className="text-[10px] font-bold">8</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <LinkIcon className="size-3.5" />
                          <span className="text-[10px] font-bold">3</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {col.id === 'review' && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-grab group" onClick={() => toast.info("Opening review request")}>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-violet-600 bg-violet-50 px-2 py-1 rounded-lg">Design</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-4 leading-tight group-hover:text-violet-600 transition-colors">Brand Guidelines Update v1.4</h4>
                    <div className="h-28 w-full rounded-xl mb-4 bg-gradient-to-br from-violet-50 to-blue-50 flex items-center justify-center overflow-hidden border border-slate-100">
                      <img className="object-cover w-full h-full opacity-40 group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80" alt="Design" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        <img className="size-8 rounded-full border-2 border-white shadow-sm" src="https://i.pravatar.cc/100?img=5" alt="Member" />
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); toast.success("Review session initialized"); }} className="text-[10px] font-bold text-violet-600 uppercase tracking-widest hover:underline">Review Now</button>
                    </div>
                  </div>
                )}

                {col.id === 'done' && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all group grayscale">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">Engineering</span>
                      <CheckCircle2 className="size-5 text-emerald-500" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-400 mb-4 leading-tight line-through">Database migration setup</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        <img className="size-8 rounded-full border-2 border-white shadow-sm opacity-50" src="https://i.pravatar.cc/100?img=6" alt="Member" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Completed 2d ago</span>
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => setIsNewTaskOpen(true)}
                  className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-violet-600 hover:border-violet-300 hover:bg-violet-50 transition-all text-xs font-bold flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  Add Task
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <NewTaskModal open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen} />
    </TeamLeadChrome>
  )
}
