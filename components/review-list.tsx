"use client"

import { ThumbsUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { RatingStars } from "@/components/rating-stars"
import { toggleReviewLike } from "@/lib/actions"
import type { Review } from "@/lib/types"

export function ReviewList({
  reviews,
  fileSlug,
  isLoggedIn,
}: {
  reviews: Review[]
  fileSlug: string
  isLoggedIn: boolean
}) {
  if (reviews.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
  }

  return (
    <ul className="flex flex-col gap-4">
      {reviews.map((review) => (
        <li key={review.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarImage src={review.user?.avatar_url ?? undefined} alt="" />
                <AvatarFallback>{review.user?.username?.slice(0, 2).toUpperCase() ?? "??"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-card-foreground">{review.user?.username ?? "Unknown"}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
            <RatingStars rating={review.rating} />
          </div>
          {review.title && <p className="text-sm font-semibold text-card-foreground">{review.title}</p>}
          {review.body && <p className="text-sm leading-relaxed text-muted-foreground">{review.body}</p>}
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              disabled={!isLoggedIn}
              onClick={() => toggleReviewLike(review.id, fileSlug)}
            >
              <ThumbsUp className="size-3.5" />
              Helpful ({review.helpful_count})
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
