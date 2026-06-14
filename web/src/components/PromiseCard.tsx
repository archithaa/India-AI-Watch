import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { CategoryBadge } from './CategoryBadge'
import type { PolicyPromise } from '@/types'

function formatAmount(amount: number | null) {
  if (!amount) return null
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(0)} crore`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(0)} lakh`
  return `₹${amount.toLocaleString('en-IN')}`
}

export function PromiseCard({ promise, stateCode }: { promise: PolicyPromise; stateCode: string }) {
  return (
    <Link href={`/states/${stateCode.toLowerCase()}/promises/${promise.slug}`}>
      <Card className="h-full hover:shadow-md transition-shadow duration-200 cursor-pointer border-slate-200 group">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CategoryBadge category={promise.category} />
            <StatusBadge status={promise.status} />
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="text-sm font-medium text-slate-800 leading-snug group-hover:text-slate-900">
            {promise.text}
          </p>
          {promise.amount_inr && (
            <p className="mt-2 text-sm font-semibold text-slate-600">
              {formatAmount(promise.amount_inr)}
            </p>
          )}
          {promise.ai_summary && (
            <p className="mt-3 text-xs text-slate-500 leading-relaxed line-clamp-3">
              {promise.ai_summary}
            </p>
          )}
        </CardContent>
        <CardFooter className="pt-0">
          {promise.last_verified_at && (
            <p className="text-xs text-slate-400">
              Verified {new Date(promise.last_verified_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </p>
          )}
        </CardFooter>
      </Card>
    </Link>
  )
}
