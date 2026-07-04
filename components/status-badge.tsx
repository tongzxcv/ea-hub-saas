import { Badge } from '@/components/ui/badge'
import type { FileStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const statusStyles: Record<FileStatus, string> = {
  approved: 'bg-primary/15 text-primary border-primary/30',
  verified: 'bg-primary/15 text-primary border-primary/30',
  pending: 'bg-rating/15 text-rating border-rating/30',
  unverified: 'bg-muted text-muted-foreground border-border',
  denied: 'bg-destructive/15 text-destructive border-destructive/30',
  expired: 'bg-muted text-muted-foreground border-border',
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
