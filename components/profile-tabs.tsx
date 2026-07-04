'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileCard } from '@/components/file-card'
import { RatingStars } from '@/components/rating-stars'
import type { FileRecord } from '@/lib/types'

interface Review {
  id: string
  rating: number
  title: string | null
  body: string
  created_at: string
  file?: { title: string; slug: string } | null
}

interface ProfileTabsProps {
  files: FileRecord[]
  reviews: Review[]
}

export function ProfileTabs({ files, reviews }: ProfileTabsProps) {
  return (
    <Tabs defaultValue="uploads">
      <TabsList>
        <TabsTrigger value="uploads">Uploads ({files.length})</TabsTrigger>
        <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="uploads" className="mt-4">
        {files.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No uploads yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {files.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="reviews" className="mt-4">
        {reviews.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No reviews written yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {review.file ? (
                    <Link
                      href={`/files/${review.file.slug}`}
                      className="text-sm font-semibold text-card-foreground hover:text-primary"
                    >
                      {review.file.title}
                    </Link>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Deleted file
                    </span>
                  )}
                  <RatingStars rating={review.rating} />
                </div>
                {review.title && (
                  <p className="text-sm font-medium text-card-foreground">
                    {review.title}
                  </p>
                )}
                {review.body && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {review.body}
                  </p>
                )}
                <span className="text-xs text-muted-foreground">
                  {format(new Date(review.created_at), 'MMM d, yyyy')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </TabsContent>
    </Tabs>
  )
}
