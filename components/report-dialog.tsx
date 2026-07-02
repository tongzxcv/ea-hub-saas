"use client"

import { useState } from "react"
import { Flag } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { submitReport } from "@/lib/actions"

const REASONS = ["Malware or virus", "Scam or fraud", "Copyright violation", "Broken file", "Spam", "Other"]

export function ReportDialog({ fileId }: { fileId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    if (!reason) {
      toast.error("Please select a reason.")
      return
    }
    formData.set("reason", reason)
    formData.set("file_id", fileId)
    setSubmitting(true)
    try {
      const result = await submitReport(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Report submitted. Thank you.")
        setOpen(false)
        setReason("")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" />
        }
      >
        <Flag className="size-3.5" /> Report
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this file</DialogTitle>
          <DialogDescription>Help keep the community safe by reporting problematic content.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <Select value={reason} onValueChange={(v) => setReason(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent>
              {REASONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea name="details" placeholder="Additional details (optional)" rows={3} maxLength={1000} />
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit report"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
