"use client"

import Link from "next/link"
import { Check, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { resolveReport } from "@/lib/admin-actions"
import type { Report } from "@/lib/types"

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  open: "destructive",
  resolved: "default",
  dismissed: "secondary",
}

export function AdminReportsTable({ reports }: { reports: Report[] }) {
  async function handleResolve(reportId: string, status: "resolved" | "dismissed") {
    const result = await resolveReport(reportId, status)
    if (result?.error) toast.error(result.error)
    else toast.success(`Report ${status}`)
  }

  if (reports.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No reports. All clear!</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {reports.map((report) => (
        <li key={report.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusVariant[report.status]}>{report.status}</Badge>
              <span className="text-sm font-semibold text-card-foreground">{report.reason}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
            </span>
          </div>
          {report.details && <p className="text-sm leading-relaxed text-muted-foreground">{report.details}</p>}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>Reported by: {report.reporter?.username ?? "Unknown"}</span>
            {report.file && (
              <Link href={`/files/${report.file.slug}`} className="text-primary hover:underline">
                View file: {report.file.title}
              </Link>
            )}
          </div>
          {report.status === "open" && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1.5 bg-transparent" onClick={() => handleResolve(report.id, "resolved")}>
                <Check className="size-3.5" /> Resolve
              </Button>
              <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => handleResolve(report.id, "dismissed")}>
                <X className="size-3.5" /> Dismiss
              </Button>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
