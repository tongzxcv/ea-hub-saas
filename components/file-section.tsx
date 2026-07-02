import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { FileCard } from '@/components/file-card'
import type { FileRecord } from '@/lib/types'

export function FileSection({
  title,
  icon,
  files,
  href,
}: {
  title: string
  icon?: React.ReactNode
  files: FileRecord[]
  href?: string
}) {
  if (files.length === 0) return null

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
