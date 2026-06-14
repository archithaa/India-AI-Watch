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

type PromiseRow = {
  id: string
  slug: string | null
  text: string
  status: string
  last_verified_at: string | null
}

export function AdminShell({ promises }: { promises: PromiseRow[] }) {
  const [rows, setRows] = useState(promises)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  async function updateStatus(id: string, status: string) {
    setSaving(id)
    const res = await fetch('/api/admin/promise', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) {
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, status, last_verified_at: new Date().toISOString() } : r))
      setSaved(id)
      setTimeout(() => setSaved(null), 2000)
    }
    setSaving(null)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
          <p className="text-sm text-slate-500 mt-0.5">India AI Watch · Promise manager</p>
        </div>
        <a href="/states/ka" className="text-sm text-slate-500 hover:text-slate-800 underline">
          View live site ↗
        </a>
      </div>

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
                disabled={saving === p.id}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border-0 cursor-pointer focus:ring-2 focus:ring-slate-400 ${STATUS_COLORS[p.status] ?? 'bg-slate-100'}`}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
              {saving === p.id && <span className="text-xs text-slate-400">Saving…</span>}
              {saved === p.id && <span className="text-xs text-green-600">Saved ✓</span>}
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
    </div>
  )
}
