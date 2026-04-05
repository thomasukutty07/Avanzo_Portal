import { useState, useMemo } from "react"
import { OrganizationAdminChrome } from "@/components/portal/organizationadmin/OrganizationAdminChrome"
import { toast } from "sonner"
import { 
  Check, 
  AlertCircle, 
  Server, 
  History, 
  UserPlus, 
  Database
} from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

const NOTIFICATIONS_DATA = [
  {
    id: "1",
    title: "Unauthorized Access Attempt",
    message: "Multiple failed login attempts detected on Cluster-A from unknown IP (192.168.1.105). Immediate action recommended.",
    time: "2 minutes ago",
    priority: "CRITICAL",
    priorityColor: "text-red-600",
    actionText: "Block IP Address",
    actionColor: "text-red-700 hover:text-red-800",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    cardBg: "bg-red-50/30 border border-red-100 border-l-4 border-l-red-500",
    titleColor: "text-red-800",
    messageColor: "text-red-800/80 font-medium",
    timeColor: "text-red-700",
    ActionIcon: AlertCircle,
    unreadDot: "bg-red-500",
    type: "Security Alerts",
    isRead: false,
  },
  {
    id: "2",
    title: "System Kernel Update Available",
    message: "Stable release v4.2.1-hotfix is available for deployment. This update addresses 3 known security vulnerabilities.",
    time: "45 minutes ago",
    priority: "HIGH",
    priorityColor: "text-violet-600",
    actionText: "Schedule Update",
    actionColor: "text-violet-600 hover:text-violet-700",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    cardBg: "bg-white border border-slate-100",
    titleColor: "text-slate-900",
    messageColor: "text-slate-500 font-medium",
    timeColor: "text-slate-400",
    ActionIcon: Server,
    unreadDot: "bg-violet-500",
    type: "System Updates",
    isRead: false,
  },
  {
    id: "3",
    title: "Backup Completed Successfully",
    message: "Daily snapshot for Project Orion (750GB) has been verified and stored in S3 Region: US-East-1.",
    time: "3 hours ago",
    priority: "MEDIUM",
    priorityColor: "text-slate-400",
    actionText: "View Details",
    actionColor: "text-slate-400 hover:text-slate-600",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
    cardBg: "bg-white border border-slate-100",
    titleColor: "text-slate-900",
    messageColor: "text-slate-500 font-medium",
    timeColor: "text-slate-400",
    ActionIcon: History,
    type: "System Updates",
    isRead: true,
  },
  {
    id: "4",
    title: "New Admin Member Invited",
    message: "Invitation sent to sarah.j@quantum.ai to join the Security Operations team.",
    time: "Yesterday at 4:15 PM",
    priority: "LOW",
    priorityColor: "text-slate-400",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
    cardBg: "bg-white border border-slate-100",
    titleColor: "text-slate-900",
    messageColor: "text-slate-500 font-medium",
    timeColor: "text-slate-400",
    ActionIcon: UserPlus,
    type: "Administrative",
    isRead: true,
  },
  {
    id: "5",
    title: "Storage Capacity Warning",
    message: "Main Database Cluster reached 85% storage capacity. Autoscaling will trigger at 90%.",
    time: "May 15, 2024",
    priority: "HIGH",
    priorityColor: "text-orange-600",
    actionText: "Adjust Thresholds",
    actionColor: "text-violet-600 hover:text-violet-700",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    cardBg: "bg-white border border-slate-100",
    titleColor: "text-slate-900",
    messageColor: "text-slate-500 font-medium",
    timeColor: "text-slate-400",
    ActionIcon: Database,
    unreadDot: "bg-violet-500",
    type: "System Updates",
    isRead: false,
  }
]

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState("All Notifications")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  // Apply filters dynamically
  const filteredNotifications = useMemo(() => {
    return NOTIFICATIONS_DATA.filter((note) => {
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
      <div className="p-8 lg:p-12 space-y-8 min-h-screen bg-[#fcfcfd] font-sans">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div>
              <h1 className="text-[32px] font-black tracking-tight text-slate-900 leading-tight font-display">
                Notifications
              </h1>
              <p className="text-slate-500 mt-1 font-medium">
                Manage your system alerts and security audit logs.
              </p>
           </div>
           <button 
             onClick={() => toast.success("All notifications marked as read.")}
             className="flex items-center gap-2.5 px-6 py-3 bg-[#a855f7] text-white rounded-2xl text-[13px] font-black shadow-lg shadow-[#a855f7]/20 hover:bg-[#9333ea] transition-all active:scale-95"
           >
              <Check className="h-4 w-4" strokeWidth={3} />
              Mark all read
           </button>
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-slate-100 overflow-x-auto pb-px">
          {["All Notifications", "Security Alerts", "System Updates", "Administrative"].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-bold whitespace-nowrap relative py-3 ${
                activeTab === tab ? 'text-[#a855f7]' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a855f7]" />
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
                      <h4 className={`text-base font-black ${note.titleColor}`}>{note.title}</h4>
                      <div className="flex items-center gap-2 shrink-0">
                         <span className={`text-[10px] font-black tracking-widest uppercase ${note.priorityColor}`}>
                           {note.priority}
                         </span>
                         {note.unreadDot && (
                           <div className={`size-1.5 rounded-full ${note.unreadDot}`} />
                         )}
                      </div>
                   </div>
                   <p className={`text-sm ${note.messageColor} leading-relaxed mb-4`}>
                      {note.message}
                   </p>
                   <div className="flex items-center gap-5 text-xs font-black">
                      <span className={note.timeColor}>{note.time}</span>
                      {note.actionText && (
                         <button className={`${note.actionColor} transition-colors capitalize`}>
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
