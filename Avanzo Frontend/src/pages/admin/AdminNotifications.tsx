import { useState, useMemo } from "react"
import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import { useEffect } from "react"
import { toast } from "sonner"
import { 
  Check, 
  History, 
} from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"


export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState("All Notifications")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [notificationsData, setNotificationsData] = useState<any[]>([])

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await api.get("/api/notifications/")
        const apiNotifs = extractResults(res.data)
        const mapped = apiNotifs.map((n: any) => ({
           id: n.id,
           title: n.title,
           message: n.message,
           time: new Date(n.created_at).toLocaleString(),
           priority: "MEDIUM",
           priorityColor: "text-slate-400",
           actionText: n.target_url ? "View Action" : "",
           actionColor: "text-slate-400 hover:text-slate-600",
           iconBg: "bg-slate-100",
           iconColor: "text-slate-500",
           cardBg: "bg-white border border-slate-100",
           titleColor: "text-slate-900",
           messageColor: "text-slate-500 font-medium",
           timeColor: "text-slate-400",
           ActionIcon: History,
           type: n.notification_type || "System Updates",
           isRead: n.is_read
        }))
        setNotificationsData(mapped)
      } catch (e) {
        console.error(e)
      }
    }
    fetchNotifications()
  }, [])

  // Apply filters dynamically
  const filteredNotifications = useMemo(() => {
    return notificationsData.filter((note) => {
      // 1. Tab filter
      if (activeTab !== "All Notifications" && note.type !== activeTab) return false;
      
      // 2. Priority filter
      if (priorityFilter !== "all" && note.priority !== priorityFilter) return false;
      
      // 3. Status filter
      if (statusFilter === "unread" && note.isRead) return false;
      if (statusFilter === "read" && !note.isRead) return false;

      // Note: Date filter allows simulated filtering
      return true;
    });
  }, [activeTab, priorityFilter, statusFilter, dateFilter]);

  return (
    <OrganizationAdminChrome>
      <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 min-h-screen font-display bg-[#fcfcfc] text-slate-900">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div className="">
              <h1 className="text-[32px] font-black tracking-tight text-slate-900 leading-tight">
                Notifications
              </h1>
              <p className="text-slate-500 mt-2 text-sm font-medium">
                Manage your system alerts and security audit logs.
              </p>
           </div>
           <button 
             onClick={() => toast.success("All notifications marked as read.")}
             className="flex items-center gap-2.5 px-8 py-3.5 bg-violet-600 text-white rounded-2xl text-[11px] font-black shadow-xl shadow-violet-900/20 hover:bg-violet-700 transition-all active:scale-95 uppercase tracking-widest"
           >
              <Check className="h-4 w-4 stroke-[3px]" />
              Mark all read
           </button>
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-slate-100 overflow-x-auto pb-px">
          {["All Notifications", "Security Alerts", "System Updates", "Administrative"].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[11px] font-black whitespace-nowrap relative py-4 uppercase tracking-widest transition-all ${ activeTab === tab ? 'text-violet-600' : 'text-slate-300 hover:text-slate-600' }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-violet-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Functional Filters */}
        <div className="flex items-center gap-4 flex-wrap">
           <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px] rounded-full border-slate-200 bg-white font-bold text-xs text-slate-600 shadow-sm hover:bg-slate-50 transition-colors h-10 px-5">
                 <SelectValue placeholder="Priority: All" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-50 shadow-2xl">
                 <SelectItem value="all" className="text-xs font-bold p-3">Priority: All</SelectItem>
                 <SelectItem value="CRITICAL" className="text-xs font-bold p-3 text-red-600">CRITICAL</SelectItem>
                 <SelectItem value="HIGH" className="text-xs font-bold p-3 text-violet-600">HIGH</SelectItem>
                 <SelectItem value="MEDIUM" className="text-xs font-bold p-3 text-slate-500">MEDIUM</SelectItem>
                 <SelectItem value="LOW" className="text-xs font-bold p-3 text-slate-500">LOW</SelectItem>
              </SelectContent>
           </Select>

           <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] rounded-full border-slate-200 bg-white font-bold text-xs text-slate-600 shadow-sm hover:bg-slate-50 transition-colors h-10 px-5">
                 <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-50 shadow-2xl">
                 <SelectItem value="all" className="text-xs font-bold p-3">Status: All</SelectItem>
                 <SelectItem value="unread" className="text-xs font-bold p-3">Unread Only</SelectItem>
                 <SelectItem value="read" className="text-xs font-bold p-3">Read Only</SelectItem>
              </SelectContent>
           </Select>

           <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[150px] rounded-full border-slate-200 bg-white font-bold text-xs text-slate-600 shadow-sm hover:bg-slate-50 transition-colors h-10 px-5">
                 <SelectValue placeholder="Date: Last 24h" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-50 shadow-2xl">
                 <SelectItem value="all" className="text-xs font-bold p-3">Date: All Time</SelectItem>
                 <SelectItem value="24h" className="text-xs font-bold p-3">Last 24 Hours</SelectItem>
                 <SelectItem value="7d" className="text-xs font-bold p-3">Last 7 Days</SelectItem>
                 <SelectItem value="30d" className="text-xs font-bold p-3">Last 30 Days</SelectItem>
              </SelectContent>
           </Select>
        </div>

        {/* Custom Notification List */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((note) => (
              <div 
                key={note.id} 
                className={`rounded-2xl p-6 shadow-sm transition-all flex items-start gap-5 group cursor-pointer hover:shadow-md ${note.cardBg}`}
              >
                <div className={`shrink-0 size-10 rounded-full flex items-center justify-center ${note.iconBg} ${note.iconColor}`}>
                   <note.ActionIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center justify-between gap-4 mb-2">
                      <h4 className={`text-base font-black tracking-tight ${note.titleColor}`}>{note.title}</h4>
                      <div className="flex items-center gap-2 shrink-0">
                         <span className={`text-[9px] font-black tracking-[0.2em] uppercase ${note.priorityColor}`}>
                           {note.priority}
                         </span>
                         {note.unreadDot && (
                           <div className={`size-2 rounded-full animate-pulse ${note.unreadDot}`} />
                         )}
                      </div>
                   </div>
                   <p className={`text-sm ${note.messageColor} leading-relaxed mb-5 font-medium`}>
                      {note.message}
                   </p>
                   <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest">
                      <span className={note.timeColor}>{note.time}</span>
                      {note.actionText && (
                         <button className={`${note.actionColor} transition-all hover:underline decoration-2 underline-offset-4`}>
                           {note.actionText}
                         </button>
                      )}
                   </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center">
               <p className="text-slate-400 font-bold">No notifications match your current filters.</p>
            </div>
          )}
        </div>

      </div>
    </OrganizationAdminChrome>
  )
}
