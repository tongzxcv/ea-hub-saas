"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { UploadCloud, X, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { createFile } from "@/lib/actions"
import { cn } from "@/lib/utils"
import type { Category, Tag } from "@/lib/types"

const ALLOWED_EXTENSIONS = [".ex4", ".ex5", ".mq4", ".mq5", ".set", ".zip", ".rar", ".7z"]
const MAX_FILE_MB = 50
const MAX_SCREENSHOTS = 5

export function UploadForm({
  categories,
  tags,
  userId,
}: {
  categories: Category[]
  tags: Tag[]
  userId: string
}) {
  const router = useRouter()
  const [categoryId, setCategoryId] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [mainFile, setMainFile] = useState<File | null>(null)
  const [screenshots, setScreenshots] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const screenshotInputRef = useRef<HTMLInputElement>(null)

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : prev.length < 6 ? [...prev, tagId] : prev,
    )
  }

  function handleMainFile(file: File | null) {
    if (!file) return
    const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error(`File type not allowed. Accepted: ${ALLOWED_EXTENSIONS.join(", ")}`)
      return
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`File must be under ${MAX_FILE_MB} MB.`)
      return
    }
    setMainFile(file)
  }

  function handleScreenshots(files: FileList | null) {
    if (!files) return
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"))
    setScreenshots((prev) => [...prev, ...images].slice(0, MAX_SCREENSHOTS))
  }

  async function handleSubmit(formData: FormData) {
    if (!mainFile) {
      toast.error("Please attach your EA/indicator file.")
      return
    }
    if (!categoryId) {
      toast.error("Please select a category.")
      return
    }

    setSubmitting(true)
    const supabase = createClient()

    try {
      // Upload main file
      const filePath = `${userId}/${Date.now()}-${mainFile.name}`
      const { error: uploadError } = await supabase.storage.from("files").upload(filePath, mainFile)
      if (uploadError) {
        toast.error(`Upload failed: ${uploadError.message}`)
        return
      }

      // Upload screenshots
      const screenshotUrls: string[] = []
      for (const shot of screenshots) {
        const shotPath = `${userId}/${Date.now()}-${shot.name}`
        const { error: shotError } = await supabase.storage.from("screenshots").upload(shotPath, shot)
        if (!shotError) {
          const { data } = supabase.storage.from("screenshots").getPublicUrl(shotPath)
          screenshotUrls.push(data.publicUrl)
        }
      }

      formData.set("category_id", categoryId)
      formData.set("storage_path", filePath)
      formData.set("file_size_bytes", String(mainFile.size))
      for (const tagId of selectedTags) formData.append("tag_ids", tagId)
      for (const url of screenshotUrls) formData.append("screenshot_urls", url)

      const result = await createFile(formData)
      if (result?.error) {
        toast.error(result.error)
      } else if (result?.slug) {
        toast.success("File published!")
        router.push(`/files/${result.slug}`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      {/* Main file */}
      <div className="flex flex-col gap-2">
        <Label>File</Label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card px-6 py-10 text-center transition-colors hover:border-primary/50",
            mainFile && "border-primary/50",
          )}
        >
          <UploadCloud className="size-8 text-muted-foreground" />
          {mainFile ? (
            <span className="text-sm font-medium text-card-foreground">{mainFile.name}</span>
          ) : (
            <>
              <span className="text-sm font-medium text-card-foreground">Click to select your file</span>
              <span className="text-xs text-muted-foreground">
                {ALLOWED_EXTENSIONS.join(", ")} — up to {MAX_FILE_MB} MB
              </span>
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_EXTENSIONS.join(",")}
          className="sr-only"
          onChange={(e) => handleMainFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {/* Title */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="e.g. Gold Scalper Pro v2" required maxLength={100} />
      </div>

      {/* Category */}
      <div className="flex flex-col gap-2">
        <Label>Category</Label>
        <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-2">
        <Label>Tags (up to 6)</Label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}>
              <Badge variant={selectedTags.includes(tag.id) ? "default" : "secondary"}>{tag.name}</Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Version */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="version">Version</Label>
          <Input id="version" name="version" placeholder="1.0.0" defaultValue="1.0.0" required maxLength={20} />
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe your file: strategy, recommended pairs, timeframes, settings..."
          rows={6}
          maxLength={5000}
        />
      </div>

      {/* Changelog */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="changelog">Changelog</Label>
        <Textarea id="changelog" name="changelog" placeholder="What's in this version?" rows={3} maxLength={2000} />
      </div>

      {/* Screenshots */}
      <div className="flex flex-col gap-2">
        <Label>Screenshots (up to {MAX_SCREENSHOTS})</Label>
        <div className="flex flex-wrap gap-3">
          {screenshots.map((shot, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(shot) || "/placeholder.svg"}
                alt={`Screenshot ${i + 1}`}
                className="h-20 w-32 rounded-lg border border-border object-cover"
              />
              <button
                type="button"
                onClick={() => setScreenshots((prev) => prev.filter((_, j) => j !== i))}
                aria-label={`Remove screenshot ${i + 1}`}
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {screenshots.length < MAX_SCREENSHOTS && (
            <button
              type="button"
              onClick={() => screenshotInputRef.current?.click()}
              className="flex h-20 w-32 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50"
            >
              <ImageIcon className="size-5" />
              <span className="text-xs">Add image</span>
            </button>
          )}
        </div>
        <input
          ref={screenshotInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => handleScreenshots(e.target.files)}
        />
      </div>

      <Button type="submit" size="lg" disabled={submitting} className="gap-2 self-start">
        {submitting && <Loader2 className="size-4 animate-spin" />}
        {submitting ? "Publishing..." : "Publish file"}
      </Button>
    </form>
  )
}
