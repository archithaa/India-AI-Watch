import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPromiseBySlug, getStateByCode } from "@/lib/data";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryBadge } from "@/components/CategoryBadge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string; slug: string }>;
}): Promise<Metadata> {
  const { state, slug } = await params;
  try {
    const [promise, stateData] = await Promise.all([
      getPromiseBySlug(slug),
      getStateByCode(state),
    ]);
    return {
      title: `${promise.text.slice(0, 60)}… — India AI Watch`,
      description: promise.ai_summary ?? `Tracking this ${stateData.name} AI policy promise: ${promise.text.slice(0, 120)}`,
      openGraph: {
        title: promise.text.slice(0, 80),
        description: promise.ai_summary ?? `Status: ${promise.status}. Tracked by India AI Watch.`,
        url: `https://indiaaiwatch.in/states/${state.toLowerCase()}/promises/${slug}`,
      },
    };
  } catch {
    return { title: "Promise — India AI Watch" };
  }
}

const EVIDENCE_LABELS: Record<string, string> = {
  delivery:           'Delivered',
  delay:              'Delay recorded',
  contradiction:      'Contradiction',
  budget_allocated:   'Budget allocated',
  procurement_issued: 'Procurement issued',
  news_coverage:      'News coverage',
  rti_finding:        'RTI finding',
}

const EVIDENCE_STYLE: Record<string, { dot: string; badge: string; icon: string }> = {
  delivery:           { dot: 'bg-green-500 text-white',   badge: 'bg-green-100 text-green-700',   icon: '✓'  },
  budget_allocated:   { dot: 'bg-blue-500 text-white',    badge: 'bg-blue-100 text-blue-700',     icon: '₹'  },
  procurement_issued: { dot: 'bg-indigo-500 text-white',  badge: 'bg-indigo-100 text-indigo-700', icon: '📋' },
  delay:              { dot: 'bg-orange-400 text-white',  badge: 'bg-orange-100 text-orange-700', icon: '!'  },
  contradiction:      { dot: 'bg-red-500 text-white',     badge: 'bg-red-100 text-red-700',       icon: '✗'  },
  news_coverage:      { dot: 'bg-slate-400 text-white',   badge: 'bg-slate-100 text-slate-600',   icon: '📰' },
  rti_finding:        { dot: 'bg-purple-500 text-white',  badge: 'bg-purple-100 text-purple-700', icon: '📄' },
}

function formatAmount(amount: number | null) {
  if (!amount) return null;
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(0)} crore`;
  if (amount >= 100000)   return `₹${(amount / 100000).toFixed(0)} lakh`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default async function PromiseDetailPage({
  params,
}: {
  params: Promise<{ state: string; slug: string }>;
}) {
  const { state, slug } = await params;

  let promise;
  let stateData;
  try {
    [promise, stateData] = await Promise.all([
      getPromiseBySlug(slug),
      getStateByCode(state),
    ]);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link
        href={`/states/${state.toLowerCase()}`}
        className="text-xs text-slate-500 hover:text-slate-800 mb-6 inline-block"
      >
        ← {stateData.name} tracker
      </Link>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <CategoryBadge category={promise.category} />
        <StatusBadge status={promise.status} />
      </div>

      <h1 className="text-2xl font-bold text-slate-900 leading-snug">{promise.text}</h1>

      {promise.amount_inr && (
        <p className="mt-2 text-lg font-semibold text-slate-600">{formatAmount(promise.amount_inr)}</p>
      )}

      {promise.ai_summary && (
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">AI Summary</p>
          <p className="text-sm text-slate-700 leading-relaxed">{promise.ai_summary}</p>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-sm font-semibold text-slate-700 mb-6">Timeline</h2>
        {!promise.evidence || promise.evidence.length === 0 ? (
          <div className="p-4 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-sm text-slate-500">No evidence found yet. The absence of evidence is also data.</p>
            <p className="text-xs text-slate-400 mt-1">RTI filed. Response pending.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200" />
            <div className="space-y-6">
              {[...promise.evidence]
                .sort((a, b) =>
                  new Date(a.found_at ?? a.created_at).getTime() -
                  new Date(b.found_at ?? b.created_at).getTime()
                )
                .map((e) => (
                  <div key={e.id} className="relative pl-10">
                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs ${EVIDENCE_STYLE[e.type]?.dot ?? 'bg-slate-200'}`}>
                      {EVIDENCE_STYLE[e.type]?.icon ?? '·'}
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${EVIDENCE_STYLE[e.type]?.badge ?? 'bg-slate-100 text-slate-500'}`}>
                          {EVIDENCE_LABELS[e.type] ?? e.type}
                        </span>
                        {e.found_at && (
                          <span className="text-xs text-slate-400">
                            {new Date(e.found_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-800 leading-relaxed">{e.description}</p>
                      {e.source_url && (
                        <a
                          href={e.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-400 underline hover:text-slate-700 mt-2 inline-block"
                        >
                          Source ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200">
        <p className="text-xs text-slate-400">
          Last verified:{" "}
          {promise.last_verified_at
            ? new Date(promise.last_verified_at).toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric",
              })
            : "Not yet verified"}
          {" · "}
          <a href="/methodology" className="underline hover:text-slate-600">How we verify</a>
        </p>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
