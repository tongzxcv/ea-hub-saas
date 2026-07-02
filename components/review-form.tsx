"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { submitReview } from "@/lib/actions"
import { cn } from "@/lib/utils"

export function ReviewForm({ fileId, fileSlug }: { fileId: string; fileSlug: string }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    if (rating === 0) {
      toast.error("Please select a rating.")
      return
    }
    formData.set("rating", String(rating))
    setSubmitting(true)
    try {
      const result = await submitReview(fileId, fileSlug, formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Review submitted")
        setRating(0)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-semibold text-card-foreground">Write a review</p>
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            className="p-0.5"
          >
            <Star
              className={cn(
                "size-6 transition-colors",
                (hover || rating) >= n ? "fill-primary text-primary" : "text-muted-foreground",
              )}
            />
          </button>
        ))}
      </div>
      <Input name="title" placeholder="Review title (optional)" maxLength={100} />
      <Textarea name="body" placeholder="Share your experience with this file..." rows={3} maxLength={2000} />
      <Button type="submit" disabled={submitting} className="self-start">
        {submitting ? "Submitting..." : "Submit review"}
      </Button>
    </form>
  )
}
