"use client"

import Link from "next/link"
import { Trash2 } from "lucide-react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { updateFileStatus, deleteFile } from "@/lib/admin-actions"
import type { FileRecord, FileStatus } from "@/lib/types"

const STATUSES: FileStatus[] = ["unverified", "pending", "approved", "verified", "denied", "expired"]

export function AdminFilesTable({ files }: { files: FileRecord[] }) {
  async function handleStatusChange(fileId: string, status: string) {
    const result = await updateFileStatus(fileId, status)
    if (result?.error) toast.error(result.error)
    else toast.success("Status updated")
  }

  async function handleDelete(fileId: string) {
    const result = await deleteFile(fileId)
    if (result?.error) toast.error(result.error)
    else toast.success("File deleted")
  }

  if (files.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No files yet.</p>
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Uploader</TableHead>
            <TableHead>Downloads</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-16">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell>
                <Link href={`/files/${file.slug}`} className="font-medium text-foreground hover:text-primary">
                  {file.title}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{file.uploader?.username ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">{file.download_count.toLocaleString()}</TableCell>
              <TableCell className="text-muted-foreground">
                {Number(file.avg_rating).toFixed(1)} ({file.rating_count})
              </TableCell>
              <TableCell className="text-muted-foreground">{format(new Date(file.created_at), "MMM d, yyyy")}</TableCell>
              <TableCell>
                <Select defaultValue={file.status} onValueChange={(v) => v && handleStatusChange(file.id, v)}>
                  <SelectTrigger className="h-8 w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger
                    render={
                      <Button variant="ghost" size="icon" aria-label={`Delete ${file.title}`} />
                    }
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete file?</DialogTitle>
                      <DialogDescription>
                        This will permanently delete &quot;{file.title}&quot; and all its versions, reviews, and
                        comments.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="destructive" onClick={() => handleDelete(file.id)}>
                        Delete permanently
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
