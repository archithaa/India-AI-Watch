'use client'

import { useState } from 'react'
import { PromiseCard } from '@/components/PromiseCard'
import type { PolicyPromise, PromiseStatus } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  all: 'All',
  announced: 'Announced',
  in_progress: 'In Progress',
  delivered: 'Delivered',
  delayed: 'Delayed',
  abandoned: 'Abandoned',
  unknown: 'Unknown',
}

const STATUS_ORDER: PromiseStatus[] = [
  'delivered', 'in_progress', 'delayed', 'announced', 'abandoned', 'unknown',
]

export function PromiseGrid({ promises, stateCode }: { promises: PolicyPromise[]; stateCode: string }) {
  const [active, setActive] = useState<string>('all')

  const sorted = [...promises].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
  )

  const filtered = active === 'all' ? sorted : sorted.filter((p) => p.status === active)

  const counts: Record<string, number> = { all: promises.length }
  for (const p of promises) {
    counts[p.status] = (counts[p.status] ?? 0) + 1
  }

  const tabs = ['all', ...STATUS_ORDER.filter((s) => counts[s])]

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              active === s
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
            }`}
          >
            {STATUS_LABELS[s] ?? s} {counts[s] !== undefined ? `(${counts[s]})` : ''}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-400 py-8 text-center">No promises with this status yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((promise) => (
            <PromiseCard key={promise.id} promise={promise} stateCode={stateCode} />
          ))}
        </div>
      )}
    </div>
  )
}
