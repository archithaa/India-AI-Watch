import { PromiseCard } from "@/components/PromiseCard";
import { getStateByCode, getPromisesByState, getRTIsByState } from "@/lib/data";
import type { PromiseStatus } from "@/types";

const statusOrder: PromiseStatus[] = [
  "delivered", "in_progress", "delayed", "announced", "abandoned", "unknown",
];

export default async function KarnatakaPage() {
  const state = await getStateByCode("KA");
  const [promises, rtis] = await Promise.all([
    getPromisesByState(state.id),
    getRTIsByState(state.id),
  ]);

  const sorted = [...promises].sort(
    (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status),
  );

  const deliveredCount = promises.filter((p) => p.status === "delivered").length;
  const delayedCount = promises.filter((p) => p.status === "delayed").length;
  const pendingRTIs = rtis.filter((r) => r.status === "pending").length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
          State · Karnataka
        </p>
        <h1 className="text-3xl font-bold text-slate-900">
          Karnataka AI Policy Tracker
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          CM:{" "}
          <a
            href="https://cm.karnataka.gov.in/en"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-700"
          >
            {state.current_cm}
          </a>{" "}
          · Capital: {state.capital} ·{" "}
          <span className="text-slate-400">Last updated June 2026</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatBox label="Promises tracked" value={promises.length} />
        <StatBox label="Delivered" value={deliveredCount} color="text-green-700" />
        <StatBox label="Delayed" value={delayedCount} color="text-orange-600" />
        <StatBox label="RTIs pending" value={pendingRTIs} color="text-blue-600" />
      </div>

      {/* Context */}
      <div className="mb-10 p-5 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-sm font-semibold text-amber-800 mb-1">What we&apos;re watching</p>
        <p className="text-sm text-amber-700 leading-relaxed">
          Karnataka committed <strong>₹50 crore</strong> to a Centre for Applied AI, promised AI
          in every government classroom, and declared Bengaluru the deep tech capital of South Asia.
          No public body was tracking whether any of this happens. We are.
        </p>
      </div>

      {/* Promise grid */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">
          All promises · {promises.length} tracked
        </h2>
        <p className="text-xs text-slate-400">Source: Karnataka AI Policy 2024</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((promise) => (
          <PromiseCard key={promise.id} promise={promise} stateCode="KA" />
        ))}
      </div>

      {/* RTI section */}
      <div className="mt-16">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">
          RTI filings · {rtis.length} filed
        </h2>
        <div className="space-y-3">
          {rtis.map((rti) => (
            <div
              key={rti.id}
              className="p-4 bg-white rounded-xl border border-slate-200 flex items-start justify-between gap-4"
            >
              <div>
                <p className="text-sm font-medium text-slate-800">{rti.subject}</p>
                <p className="text-xs text-slate-500 mt-0.5">{rti.department}</p>
                <p className="text-xs text-slate-400 mt-1">Filed {rti.filed_date}</p>
              </div>
              <span
                className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                  rti.status === "pending"
                    ? "bg-blue-100 text-blue-700"
                    : rti.status === "responded"
                    ? "bg-green-100 text-green-700"
                    : rti.status === "stonewalled"
                    ? "bg-red-100 text-red-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {rti.status.charAt(0).toUpperCase() + rti.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology note */}
      <p className="mt-12 text-xs text-slate-400 leading-relaxed max-w-2xl">
        Status is determined by cross-referencing policy documents, procurement records, government
        press releases, and RTI responses. &ldquo;Announced&rdquo; means a promise exists but no
        evidence of implementation has been found. All data is open — download it at{" "}
        <a href="/data" className="underline hover:text-slate-600">/data</a>.
      </p>
    </div>
  );
}

function StatBox({ label, value, color = "text-slate-900" }: { label: string; value: number; color?: string }) {
  return (
    <div className="p-4 bg-white rounded-xl border border-slate-200">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}
