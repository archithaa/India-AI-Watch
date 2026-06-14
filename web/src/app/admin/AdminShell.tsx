'use client'

import { useState } from 'react'

const STATUSES = ['announced', 'in_progress', 'delivered', 'delayed', 'abandoned', 'unknown']

const STATUS_COLORS: Record<string, string> = {
  announced:   'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-100 text-blue-700',
  delivered:   'bg-green-100 text-green-700',
  delayed:     'bg-orange-100 text-orange-700',
  abandoned:   'bg-red-100 text-red-700',
  unknown:     'bg-slate-100 text-slate-400',
}

const EVIDENCE_TYPE_LABELS: Record<string, string> = {
  news_coverage:      'News',
  procurement_issued: 'Procurement',
  budget_allocated:   'Budget',
  delivery:           'Delivery',
  delay:              'Delay',
  contradiction:      'Contradiction',
  rti_finding:        'RTI finding',
}

type PromiseRow = {
  id: string
  slug: string | null
  text: string
  status: string
  last_verified_at: string | null
}

type EvidenceRow = {
  id: string
  type: string
  description: string
  source_url: string | null
  found_at: string | null
  created_at: string
  promise: { id: string; text: string; status: string; slug: string | null }
}

export function AdminShell({
  promises,
  pendingEvidence,
}: {
  promises: PromiseRow[]
  pendingEvidence: EvidenceRow[]
}) {
  const [rows, setRows] = useState(promises)
  const [queue, setQueue] = useState(pendingEvidence)
  const [savingPromise, setSavingPromise] = useState<string | null>(null)
  const [savedPromise, setSavedPromise] = useState<string | null>(null)
  const [actioningEvidence, setActioningEvidence] = useState<string | null>(null)

  async function updateStatus(id: string, status: string) {
    setSavingPromise(id)
    const res = await fetch('/api/admin/promise', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) {
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, status, last_verified_at: new Date().toISOString() } : r))
      setSavedPromise(id)
      setTimeout(() => setSavedPromise(null), 2000)
    }
    setSavingPromise(null)
  }

  async function handleEvidence(id: string, action: 'approve' | 'reject') {
    setActioningEvidence(id)
    const res = await fetch('/api/admin/evidence', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })
    if (res.ok) {
      setQueue((prev) => prev.filter((e) => e.id !== id))
    }
    setActioningEvidence(null)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
          <p className="text-sm text-slate-500 mt-0.5">India AI Watch</p>
        </div>
        <a href="/states/ka" className="text-sm text-slate-500 hover:text-slate-800 underline">
          View live site ↗
        </a>
      </div>

      {/* Review queue */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-semibold text-slate-700">Review queue</h2>
          {queue.length > 0 && (
            <span className="text-xs font-medium bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              {queue.length} pending
            </span>
          )}
        </div>

        {queue.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
            <p className="text-sm text-slate-400">No items pending review. Scrapers will deposit new findings here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {queue.map((e) => (
              <div key={e.id} className="p-4 bg-white rounded-xl border border-slate-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {EVIDENCE_TYPE_LABELS[e.type] ?? e.type}
                      </span>
                      {e.found_at && (
                        <span className="text-xs text-slate-400">
                          {new Date(e.found_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-800 leading-snug">{e.description}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      → Promise: {e.promise?.text?.slice(0, 80)}…
                    </p>
                    {e.source_url && (
                      <a
                        href={e.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-400 underline hover:text-slate-700 mt-1 inline-block"
                      >
                        Read article ↗
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEvidence(e.id, 'approve')}
                      disabled={actioningEvidence === e.id}
                      className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 rounded-lg disabled:opacity-50 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleEvidence(e.id, 'reject')}
                      disabled={actioningEvidence === e.id}
                      className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 rounded-lg disabled:opacity-50 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Promise status manager */}
      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Promise statuses</h2>
        <div className="space-y-3">
          {rows.map((p) => (
            <div key={p.id} className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 leading-snug line-clamp-2">{p.text}</p>
                {p.last_verified_at && (
                  <p className="text-xs text-slate-400 mt-1">
                    Verified {new Date(p.last_verified_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={p.status}
                  onChange={(e) => updateStatus(p.id, e.target.value)}
                  disabled={savingPromise === p.id}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg border-0 cursor-pointer focus:ring-2 focus:ring-slate-400 ${STATUS_COLORS[p.status] ?? 'bg-slate-100'}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
                {savingPromise === p.id && <span className="text-xs text-slate-400">Saving…</span>}
                {savedPromise === p.id && <span className="text-xs text-green-600">Saved ✓</span>}
                {p.slug && (
                  <a
                    href={`/states/ka/promises/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-400 hover:text-slate-700"
                  >
                    View ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
