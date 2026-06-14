import type { PromiseCategory } from '@/types'

const labels: Record<PromiseCategory, string> = {
  education:      'Education',
  infrastructure: 'Infrastructure',
  startup:        'Startups',
  governance:     'Governance',
  research:       'Research',
  agriculture:    'Agriculture',
  health:         'Health',
  other:          'Other',
}

export function CategoryBadge({ category }: { category: PromiseCategory }) {
  return (
    <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
      {labels[category]}
    </span>
  )
}
