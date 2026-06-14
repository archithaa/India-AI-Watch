import { notFound } from "next/navigation";
import Link from "next/link";
import { getPromiseBySlug } from "@/lib/data";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryBadge } from "@/components/CategoryBadge";

function formatAmount(amount: number | null) {
  if (!amount) return null;
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(0)} crore`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(0)} lakh`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default async function PromiseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let promise;
  try {
    promise = await getPromiseBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/states/ka" className="text-xs text-slate-500 hover:text-slate-800 mb-6 inline-block">
        ← Karnataka tracker
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

      <div className="mt-8 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">Evidence</h2>
        {!promise.evidence || promise.evidence.length === 0 ? (
          <div className="p-4 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-sm text-slate-500">
              No evidence found yet. The absence of evidence is also data.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              We have filed RTIs for this promise. Response pending.
            </p>
          </div>
        ) : (
          promise.evidence.map((e) => (
            <div key={e.id} className="p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-sm text-slate-800">{e.description}</p>
              {e.source_url && (
                <a
                  href={e.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-500 underline hover:text-slate-800 mt-1 inline-block"
                >
                  Source ↗
                </a>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200">
        <p className="text-xs text-slate-400">
          Last verified:{" "}
          {promise.last_verified_at
            ? new Date(promise.last_verified_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "Not yet verified"}
          {" · "}
          <a href="/methodology" className="underline hover:text-slate-600">
            How we verify
          </a>
        </p>
      </div>
    </div>
  );
}

// Dynamic rendering — no static params needed; pages are server-rendered on demand.
export const dynamic = "force-dynamic";
