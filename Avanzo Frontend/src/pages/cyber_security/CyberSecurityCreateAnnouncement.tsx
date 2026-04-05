import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

export default function CyberSecurityCreateAnnouncementPage() {
  const navigate = useNavigate()
  return (
    <>
      <div className="mb-6">
        <Link
          to="/CyberSecurity/announcements"
          className="text-sm font-medium text-[#7e22ce] hover:underline"
        >
          ← Back to announcements
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 font-headline">Create announcement</h1>
        <p className="text-slate-500">Draft a message for the CyberSecurity channel (UI only).</p>
      </div>

      <form
        className="max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          const title = String(fd.get("title") ?? "").trim()
          if (!title) {
            toast.error("Add a title first.")
            return
          }
          toast.success("Announcement saved locally — connect API to publish.")
          navigate("/CyberSecurity/announcements", { replace: true })
        }}
      >
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Short headline"
          />
        </div>
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-slate-700">
            Body
          </label>
          <textarea
            id="body"
            name="body"
            rows={6}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Message content…"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-[#7e22ce] px-4 py-2 text-sm font-medium text-white hover:bg-[#6b21a8]"
          >
            Publish (stub)
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => navigate("/CyberSecurity/announcements")}
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  )
}
