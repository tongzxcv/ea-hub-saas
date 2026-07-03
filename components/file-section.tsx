import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { FileCard } from '@/components/file-card'
import type { FileRecord } from '@/lib/types'

export function FileSection({
  title,
  icon,
  files,
  href,
  emptyMessage,
}: {
  title: string
  icon?: React.ReactNode
  files: FileRecord[]
  href?: string
  emptyMessage?: string
}) {
  if (files.length === 0) {
    if (!emptyMessage) return null
    return (
      <section aria-label={title}>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight">
          {icon}
          {title}
        </h2>
        <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      </section>
    )
  }

  return (
    <section aria-label={title}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          {icon}
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            View all
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {files.slice(0, 4).map((file) => (
          <FileCard key={file.id} file={file} />
        ))}
      </div>
    </section>
  )
}
