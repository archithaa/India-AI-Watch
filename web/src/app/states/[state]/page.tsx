import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PromiseGrid } from "@/components/PromiseGrid";
import { getStateByCode, getPromisesByState, getRTIsByState } from "@/lib/data";
import type { RTIStatus } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state } = await params;
  try {
    const s = await getStateByCode(state);
    return {
      title: `${s.name} AI Policy Tracker — India AI Watch`,
      description: `Tracking every AI policy promise made by the ${s.name} government — what was announced, what was delivered, and what is overdue.`,
      openGraph: {
        title: `${s.name} AI Policy Tracker`,
        description: `AI policy promises tracked for ${s.name}. Open data, sourced from public documents.`,
        url: `https://indiaaiwatch.in/states/${state.toLowerCase()}`,
      },
    };
  } catch {
    return { title: "State — India AI Watch" };
  }
}

export default async function StatePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;

  let stateData;
  try {
    stateData = await getStateByCode(state);
  } catch {
    notFound();
  }

  const [promises, rtis] = await Promise.all([
    getPromisesByState(stateData.id),
    getRTIsByState(stateData.id),
  ]);

  const deliveredCount = promises.filter((p) => p.status === "delivered").length;
  const delayedCount = promises.filter((p) => p.status === "delayed").length;
  const pendingRTIs = rtis.filter((r) => r.status === "pending").length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
          State · {stateData.name}
        </p>
        <h1 className="text-3xl font-bold text-slate-900">
          {stateData.name} AI Policy Tracker
        </h1>
        <p className="mt-2 text-slate-500 text-sm">
          {stateData.current_cm && (
            <>
              CM:{" "}
              <a
                href="https://cm.karnataka.gov.in/en"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-700"
              >
                {stateData.current_cm}
              </a>{" "}
              ·{" "}
            </>
          )}
          {stateData.capital && <>Capital: {stateData.capital} · </>}
          <span className="text-slate-400">
            Last updated {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatBox label="Promises tracked" value={promises.length} />
        <StatBox label="Delivered" value={deliveredCount} color="text-green-700" />
        <StatBox label="Delayed" value={delayedCount} color="text-orange-600" />
        <StatBox label="RTIs pending" value={pendingRTIs} color="text-blue-600" />
      </div>

      {/* Promise grid */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">
          All promises · {promises.length} tracked
        </h2>
      </div>

      <PromiseGrid promises={promises} stateCode={stateData.code} />

      {/* RTI section */}
      {rtis.length > 0 && (
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
                <RTIBadge status={rti.status} />
              </div>
            ))}
          </div>
        </div>
      )}

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

function StatBox({
  label,
  value,
  color = "text-slate-900",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="p-4 bg-white rounded-xl border border-slate-200">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

const RTI_STYLES: Record<string, string> = {
  pending:     "bg-blue-100 text-blue-700",
  responded:   "bg-green-100 text-green-700",
  stonewalled: "bg-red-100 text-red-700",
  appealed:    "bg-orange-100 text-orange-700",
  withdrawn:   "bg-slate-100 text-slate-500",
};

function RTIBadge({ status }: { status: RTIStatus }) {
  return (
    <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${RTI_STYLES[status] ?? "bg-slate-100 text-slate-500"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
