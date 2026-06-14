import Link from "next/link";
import { getAllStates, getGlobalStats, getPromiseCountsByState } from "@/lib/data";
import { EmailSignup } from "@/components/EmailSignup";
import type { State } from "@/types";

export default async function HomePage() {
  const [states, stats] = await Promise.all([getAllStates(), getGlobalStats()]);

  const statesWithCounts = await Promise.all(
    states.map(async (s) => ({
      state: s,
      counts: await getPromiseCountsByState(s.id),
    })),
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Hero */}
      <section className="pt-20 pb-16">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
            Civic Accountability · India
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
            India&apos;s AI promises,<br />
            <span className="text-slate-500">held to account.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-2xl">
            State governments are making billion-rupee AI bets with public money and zero public
            accountability. We track what they promise, what they deliver, and what they owe you an
            answer on.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/states/ka"
              className="inline-flex items-center px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              View Karnataka →
            </Link>
            <Link
              href="/methodology"
              className="inline-flex items-center px-5 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              How we score
            </Link>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-slate-200 max-w-md">
          <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide">Get monthly updates</p>
          <EmailSignup />
        </div>
      </section>

      {/* Live stats bar */}
      <section className="py-8 border-y border-slate-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <Stat label="Promises tracked" value={stats.totalPromises} />
          <Stat label="Delivered" value={stats.delivered} accent="green" />
          <Stat label="Delayed" value={stats.delayed} accent="orange" />
          <Stat label="No evidence yet" value={stats.noEvidence} accent="slate" />
        </div>
      </section>

      {/* States */}
      <section className="py-16">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6">
          States being tracked
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statesWithCounts.map(({ state, counts }) => (
            <StateCard
              key={state.id}
              state={state}
              promiseCount={Object.values(counts).reduce((a, b) => a + b, 0)}
            />
          ))}
          <ComingSoonCard name="Kerala" note="India's first cabinet-level AI ministry" />
          <ComingSoonCard name="Maharashtra" note="Largest state AI budget in Western India" />
        </div>
      </section>

      {/* Quote */}
      <section className="py-12 border-t border-slate-200">
        <blockquote className="max-w-2xl">
          <p className="text-xl text-slate-700 font-medium leading-relaxed">
            &ldquo;The most dangerous AI policy is the one nobody is watching.&rdquo;
          </p>
          <footer className="mt-3 text-sm text-slate-500">
            India AI Watch · Est. June 2026
          </footer>
        </blockquote>
      </section>
    </div>
  );
}

function Stat({ label, value, accent = "slate" }: { label: string; value: number; accent?: string }) {
  const colors: Record<string, string> = {
    green: "text-green-700",
    orange: "text-orange-600",
    slate: "text-slate-500",
  };
  return (
    <div>
      <p className={`text-3xl font-bold ${colors[accent] ?? "text-slate-900"}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function StateCard({ state, promiseCount }: { state: State; promiseCount: number }) {
  return (
    <Link href={`/states/${state.code.toLowerCase()}`}>
      <div className="p-5 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-slate-900">{state.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">CM: {state.current_cm}</p>
          </div>
          <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">Live</span>
        </div>
        <p className="mt-4 text-2xl font-bold text-slate-900">{promiseCount}</p>
        <p className="text-xs text-slate-500">promises tracked</p>
      </div>
    </Link>
  );
}

function ComingSoonCard({ name, note }: { name: string; note: string }) {
  return (
    <div className="p-5 bg-slate-50 rounded-xl border border-dashed border-slate-300">
      <div className="flex items-start justify-between">
        <p className="font-semibold text-slate-400">{name}</p>
        <span className="text-xs bg-slate-100 text-slate-400 font-medium px-2 py-0.5 rounded-full">Soon</span>
      </div>
      <p className="mt-3 text-xs text-slate-400 leading-relaxed">{note}</p>
    </div>
  );
}
