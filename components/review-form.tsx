"use client"

import { useRef, useState } from "react"
import { Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { submitReview } from "@/lib/actions"
import { cn } from "@/lib/utils"

export function ReviewForm({ fileId, fileSlug }: { fileId: string; fileSlug: string }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (rating === 0) {
      toast.error("Please select a rating.")
      return
    }
    const formData = new FormData(e.currentTarget)
    formData.set("rating", String(rating))
    setSubmitting(true)
    try {
      const result = await submitReview(fileId, fileSlug, formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Review submitted!")
        setRating(0)
        formRef.current?.reset()
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4"
    >
      <p className="text-sm font-semibold text-card-foreground">Write a review</p>

      {/* Star rating picker */}
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
            className="cursor-pointer p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <Star
              className={cn(
                "size-7 transition-colors",
                (hover || rating) >= n
                  ? "fill-rating text-rating"
                  : "fill-muted text-muted-foreground",
              )}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            {rating} / 5
          </span>
        )}
      </div>

      <Input name="title" placeholder="Review title (optional)" maxLength={100} />
      <Textarea
        name="body"
        placeholder="Share your experience with this file..."
        rows={3}
        maxLength={2000}
      />

      {/* Native button to avoid Base UI ButtonPrimitive blocking form submission */}
      <button
        type="submit"
        disabled={submitting}
        className="self-start inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:pointer-events-none disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit review"}
      </button>
    </form>
  )
}
