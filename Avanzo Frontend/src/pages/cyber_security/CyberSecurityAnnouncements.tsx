import { 
  MessageSquare,
  ChevronRight,
  FileText,
  ShieldCheck,
  Phone,
  Lock,
  ExternalLink
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const ANNOUNCEMENTS = [
  {
    tag: "URGENT ACTION",
    tagColor: "text-red-500 bg-red-50 border-red-100",
    date: "Today at 09:30 AM",
    author: "A. Smith (Lead SecOps)",
    initials: "AS",
    title: "Emergency Patching: CVE-2024-X12 Server Farm Vulnerability",
    content: "A critical vulnerability has been identified in the central Linux kernel used across our primary cloud nodes. All sysadmins must begin staggered reboots after applying the hotfix provided in Jira ticket #SEC-992. No exceptions for downtime during the 12:00-14:00 maintenance window.",
    linkText: "View Mitigation Steps",
    comments: 14,
    accent: "border-l-red-500"
  },
  {
    tag: "POLICY CHANGE",
    tagColor: "text-violet-600 bg-violet-50 border-violet-100",
    date: "Yesterday at 14:15 PM",
    author: "R. Baker (Compliance)",
    initials: "RB",
    title: "New Password Rotation Schedule for Q3",
    content: "Starting October 1st, we are transitioning to a 90-day rotation for all internal service accounts. Please review the updated documentation in the Confluence 'CyberSecurity Guidelines' space to ensure your scripts are updated for automated rotation.",
    file: "Q3_Compliance_Protocol.pdf",
    accent: "border-l-violet-600"
  },
  {
    tag: "INTERNAL NEWS",
    tagColor: "text-slate-500 bg-slate-50 border-slate-100",
    date: "Sep 18, 2024",
    author: "M. Lopez (Manager)",
    initials: "ML",
    title: "Welcome New Team Members",
    content: "Join us in welcoming three new analysts joining our threat hunting team next Monday. We will be hosting a brief introductory coffee session in the lounge at 10:00 AM.",
    accent: "border-l-slate-200"
  }
]

const COMPANY_UPDATES = [
  { dept: "HR DEPT", time: "2d ago", title: "Annual Health Benefits Enrollment", desc: "Please ensure you've selected your plan for the next fiscal year by Friday..." },
  { dept: "IT / ADMIN", time: "4d ago", title: "Office Maintenance: East Wing", desc: "HVAC maintenance will take place this Saturday from 8 AM to 4 PM..." },
  { dept: "FINANCE", time: "Sep 15", title: "New Expense Reimbursement Portal", desc: "We are migrating to 'SpendFlow' for all travel and office expense claims..." }
]

export default function CyberSecurityAnnouncementsPage() {
  return (
    <div className="space-y-10 pt-4 min-h-screen pb-12 font-display bg-[#fcfcfc]">
      <div className="mb-10 font-headline space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600">
          SECURITY INTELLIGENCE • BROADCASTS
        </p>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">Operation Alerts</h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">Internal updates, CyberSecurity alerts, and organizational intelligence.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* News Feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2 mb-4">
             <h4 className="font-black text-slate-900 tracking-tight font-headline uppercase italic">CyberSecurity Department Updates</h4>
             <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-violet-600 transition-colors bg-slate-50 px-3 py-1 rounded-lg font-headline">Sort By: Newest</button>
          </div>

          {ANNOUNCEMENTS.map((news, i) => (
            <Card key={i} className={`border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white border-l-4 ${news.accent}`}>
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6 font-headline">
                  <div className="flex items-center gap-4">
                    <span className={`px-2.5 py-1 rounded-[6px] text-[9px] font-black tracking-widest border ${news.tagColor} shadow-sm uppercase italic`}>
                      {news.tag}
                    </span>
                    <span className="text-[10px] font-black text-slate-300 tracking-tight uppercase tabular-nums">{news.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-[11px] font-black text-slate-900 leading-none uppercase italic">{news.author}</p>
                    </div>
                    <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200/50 shadow-sm uppercase italic">
                      {news.initials}
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight leading-tight font-headline">{news.title}</h3>
                <p className="text-[14px] text-slate-600 font-medium leading-relaxed mb-8">
                  {news.content}
                </p>

                <div className="flex items-center gap-6 pt-6 border-t border-slate-50 font-headline">
                  {news.linkText && (
                    <button className="text-[11px] font-black text-violet-700 hover:underline flex items-center gap-2 group italic uppercase tracking-tight">
                      {news.linkText}
                      <ChevronRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                  {news.comments && (
                    <button className="text-[11px] font-black text-slate-400 hover:text-slate-600 flex items-center gap-2 uppercase italic tracking-tight">
                       <MessageSquare className="size-3.5" />
                       {news.comments} Comments
                    </button>
                  )}
                  {news.file && (
                    <div className="flex-1 flex justify-between items-center p-3 px-5 bg-slate-50 rounded-xl group cursor-pointer hover:bg-slate-100 transition-colors font-headline">
                       <div className="flex items-center gap-3">
                         <FileText className="size-4 text-violet-600" />
                         <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{news.file}</span>
                       </div>
                       <button className="text-[10px] font-black text-violet-600 uppercase tracking-widest group-hover:scale-105 transition-transform">Download</button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Company Updates */}
          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
               <ShieldCheck className="size-5 text-violet-600" />
               <h4 className="font-black text-[12px] uppercase tracking-[0.2em] text-slate-900 font-headline">Company-wide Updates</h4>
            </div>
            
            <div className="space-y-8">
                {COMPANY_UPDATES.map((upd, i) => (
                  <div key={i} className="group cursor-pointer font-headline">
                     <div className="flex justify-between items-center mb-1.5 text-[9px] font-black uppercase tracking-widest">
                        <span className="text-violet-600">{upd.dept}</span>
                        <span className="text-slate-300 group-hover:text-slate-400 transition-colors">{upd.time}</span>
                     </div>
                     <h5 className="text-[13px] font-black text-slate-900 group-hover:text-violet-700 transition-colors mb-1 font-headline uppercase italic tracking-tight">{upd.title}</h5>
                     <p className="text-[11px] text-slate-500 font-bold line-clamp-2 leading-relaxed italic pr-2 uppercase tracking-tight">
                       {upd.desc}
                     </p>
                  </div>
                ))}
            </div>

            <button className="mt-10 w-full py-2 text-[10px] font-black text-violet-700 hover:text-violet-800 uppercase tracking-widest border-t border-slate-50 pt-4 text-center transition-colors font-headline">
              View All Company News
            </button>
          </div>

          {/* Quick Resources */}
          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
             <h4 className="font-black text-[12px] uppercase tracking-[0.2em] text-slate-900 mb-8 font-headline">Quick Resources</h4>
             <div className="space-y-2">
                {[
                  { label: "Incident Playbooks", icon: ShieldCheck },
                  { label: "Emergency Contact List", icon: Phone },
                  { label: "Compliance Certifications", icon: Lock },
                  { label: "Knowledge Base", icon: ExternalLink },
                ].map((res, i) => (
                  <button key={i} className="w-full flex items-center justify-between p-3 px-4 rounded-xl hover:bg-slate-50 transition-all group text-left">
                    <span className="text-[12px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{res.label}</span>
                    <ChevronRight className="size-4 text-slate-300 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
             </div>
          </div>
          
          <div className="px-8 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-300">
             © 2024 Avanzo Cyber Defense Group. Confidential.
          </div>
        </div>
      </div>
    </div>
  )
}
