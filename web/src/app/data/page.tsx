import { getGlobalStats } from '@/lib/data'

export default async function OpenDataPage() {
  const stats = await getGlobalStats()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
        Open Data
      </p>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Download the data</h1>
      <p className="text-slate-500 text-sm mb-10">
        All data is published under{' '}
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-800">
          CC BY 4.0
        </a>
        {' '}— free to use, share, and build on with attribution.
        Currently tracking <strong>{stats.totalPromises} promises</strong> across{' '}
        <strong>{stats.stateCount} state{stats.stateCount !== 1 ? 's' : ''}</strong>.
      </p>

      {/* Downloads */}
      <div className="space-y-4 mb-14">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Downloads</h2>

        <DownloadCard
          title="All promises — JSON"
          description="Full dataset with AI summaries, status, evidence count, and metadata."
          href="/api/data/promises?format=json"
          label="Download JSON"
          badge="Live"
        />
        <DownloadCard
          title="All promises — CSV"
          description="Spreadsheet-ready format. Opens in Excel, Google Sheets, or any data tool."
          href="/api/data/promises?format=csv"
          label="Download CSV"
          badge="Live"
        />
        <DownloadCard
          title="Karnataka only — JSON"
          description="Filtered to Karnataka promises only."
          href="/api/data/promises?format=json&state=KA"
          label="Download JSON"
          badge="KA"
        />
        <DownloadCard
          title="Karnataka only — CSV"
          description="Karnataka promises in spreadsheet format."
          href="/api/data/promises?format=csv&state=KA"
          label="Download CSV"
          badge="KA"
        />
      </div>

      {/* API */}
      <div className="mb-14">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">API</h2>
        <div className="p-5 bg-slate-900 rounded-xl text-sm font-mono text-slate-300 space-y-3">
          <div>
            <p className="text-slate-500 text-xs mb-1"># All promises</p>
            <p>GET /api/data/promises</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1"># Filter by state code</p>
            <p>GET /api/data/promises?state=KA</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1"># CSV format</p>
            <p>GET /api/data/promises?format=csv</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          No auth required. CORS open. Add{' '}
          <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">Accept: application/json</code>{' '}
          header for best results.
        </p>
      </div>

      {/* Citation */}
      <div className="mb-14">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">How to cite</h2>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 font-mono leading-relaxed">
          India AI Watch (2026). <em>Karnataka AI Policy Promise Tracker</em>.
          Retrieved from indiaaiwatch.in. CC BY 4.0.
        </div>
      </div>

      {/* Schema */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Data schema</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 pr-4 font-semibold text-slate-700">Field</th>
                <th className="py-2 pr-4 font-semibold text-slate-700">Type</th>
                <th className="py-2 font-semibold text-slate-700">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              {[
                ['slug', 'string', 'Unique identifier for the promise'],
                ['state', 'string', 'State code (e.g. KA, KL, MH)'],
                ['category', 'enum', 'education · infrastructure · startup · governance · research · agriculture · health · other'],
                ['status', 'enum', 'announced · in_progress · delivered · delayed · abandoned · unknown'],
                ['amount_inr', 'integer | null', 'Committed budget in Indian Rupees'],
                ['target_date', 'date | null', 'Stated completion date, if any'],
                ['last_verified_at', 'datetime | null', 'When status was last checked'],
                ['text', 'string', 'Full text of the promise as stated in source'],
                ['ai_summary', 'string | null', 'AI-generated plain-language status summary'],
              ].map(([field, type, desc]) => (
                <tr key={field} className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-mono text-slate-800">{field}</td>
                  <td className="py-2 pr-4 text-slate-500">{type}</td>
                  <td className="py-2">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function DownloadCard({
  title, description, href, label, badge,
}: {
  title: string; description: string; href: string; label: string; badge: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-shadow">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-medium text-slate-800">{title}</p>
          <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">{badge}</span>
        </div>
        <p className="text-xs text-slate-500 truncate">{description}</p>
      </div>
      <a
        href={href}
        className="shrink-0 text-xs font-medium px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
      >
        {label}
      </a>
    </div>
  )
}
