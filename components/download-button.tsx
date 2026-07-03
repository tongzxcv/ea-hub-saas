"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { recordDownload } from "@/lib/actions"

export function DownloadButton({
  fileId,
  versionId,
  storagePath,
  size = "lg",
  label = "Download",
}: {
  fileId: string
  versionId: string
  storagePath: string | null
  size?: "sm" | "lg"
  label?: string
}) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    if (!storagePath) {
      toast.error("No file available for this version.")
      return
    }
    setLoading(true)
    try {
      const result = await recordDownload(fileId, versionId, storagePath)
      if (result?.error) {
        toast.error(result.error)
      } else if (result?.url) {
        window.open(result.url, "_blank")
        toast.success("Download started")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleDownload} disabled={loading} size={size} className="gap-2">
      {loading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
      {label}
    </Button>
  )
}
