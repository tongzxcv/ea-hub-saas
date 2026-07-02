import { Badge } from '@/components/ui/badge'
import type { FileStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const statusStyles: Record<FileStatus, string> = {
  verified: 'bg-primary/15 text-primary border-primary/30',
  stable: 'bg-chart-2/15 text-chart-2 border-chart-2/30',
  testing: 'bg-rating/15 text-rating border-rating/30',
  experimental: 'bg-muted text-muted-foreground border-border',
  deprecated: 'bg-destructive/15 text-destructive border-destructive/30',
  archived: 'bg-muted text-muted-foreground border-border',
}

export function StatusBadge({
  status,
  className,
}: {
  status: FileStatus
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn('capitalize', statusStyles[status], className)}
    >
      {status}
    </Badge>
  )
}
