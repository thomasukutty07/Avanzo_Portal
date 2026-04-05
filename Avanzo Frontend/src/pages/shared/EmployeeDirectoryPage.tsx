import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/axios"
import { extractResults } from "@/lib/apiResults"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import {
  EmployeeUpsertForm,
  type EmployeeRow,
} from "@/components/employees/EmployeeUpsertForm"

type Props = {
  title: string
  description: string
}

export function EmployeeDirectoryPage({ title, description }: Props) {
  const [rows, setRows] = useState<EmployeeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get("/api/auth/employees/")
      setRows(extractResults<EmployeeRow>(res.data))
    } catch {
      toast.error("Failed to load employees")
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => load()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Add employee
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Register employee</DialogTitle>
                </DialogHeader>
                <EmployeeUpsertForm
                  onSuccess={() => {
                    setOpen(false)
                    load()
                  }}
                  onCancel={() => setOpen(false)}
                  submitLabel="Create & save"
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">ID</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="px-4 py-3 font-medium">
                          {r.first_name} {r.last_name}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                        <td className="px-4 py-3">{r.role ?? "—"}</td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {r.employee_id || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="text-[10px] capitalize">
                            {r.status?.replace(/_/g, " ") || "—"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length === 0 && (
                  <p className="py-12 text-center text-sm text-muted-foreground">
                    No employees yet. Add your first colleague.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
