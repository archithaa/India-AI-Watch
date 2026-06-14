import { Badge } from '@/components/ui/badge'
import type { PromiseStatus } from '@/types'

const config: Record<PromiseStatus, { label: string; className: string }> = {
  announced:   { label: 'Announced',   className: 'bg-blue-100 text-blue-800 border-blue-200' },
  in_progress: { label: 'In Progress', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  delivered:   { label: 'Delivered',   className: 'bg-green-100 text-green-800 border-green-200' },
  delayed:     { label: 'Delayed',     className: 'bg-orange-100 text-orange-800 border-orange-200' },
  abandoned:   { label: 'Abandoned',   className: 'bg-red-100 text-red-800 border-red-200' },
  unknown:     { label: 'Unknown',     className: 'bg-gray-100 text-gray-600 border-gray-200' },
}

export function StatusBadge({ status }: { status: PromiseStatus }) {
  const { label, className } = config[status]
  return (
    <Badge variant="outline" className={`text-xs font-medium ${className}`}>
      {label}
    </Badge>
  )
}
