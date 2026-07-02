import Link from 'next/link'
import Image from 'next/image'
import { Download, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/status-badge'
import type { FileRecord } from '@/lib/types'

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function FileCard({ file }: { file: FileRecord }) {
  return (
    <Card className="group gap-0 overflow-hidden p-0 transition-colors hover:border-primary/40">
      <Link href={`/files/${file.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          {file.cover_image_url ? (
            <Image
              src={file.cover_image_url || '/placeholder.svg'}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Download className="size-8 opacity-30" aria-hidden="true" />
            </div>
          )}
          <div className="absolute left-2 top-2">
            <StatusBadge status={file.status} />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-medium leading-snug">
              {file.title}
            </h3>
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {file.description}
          </p>
          <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star
                className="size-3.5 fill-rating text-rating"
                aria-hidden="true"
              />
              {file.rating_count > 0 ? Number(file.avg_rating).toFixed(1) : '—'}
              <span className="opacity-70">({file.rating_count})</span>
            </span>
            <span className="flex items-center gap-1">
              <Download className="size-3.5" aria-hidden="true" />
              {formatCount(file.download_count)}
            </span>
            <span className="truncate">
              by {file.uploader?.username ?? 'unknown'}
            </span>
          </div>
        </div>
      </Link>
    </Card>
  )
}
