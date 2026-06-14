export default function MethodologyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
        How it works
      </p>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Methodology</h1>

      <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">What we track</h2>
          <p className="text-slate-600">
            We track specific, attributable AI policy commitments made by Indian state governments —
            promises with a named outcome, a budget figure, a target date, or a responsible
            department. Vague aspirations (&ldquo;we will become an AI leader&rdquo;) are logged
            but not scored.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">How we score status</h2>
          <div className="space-y-2">
            {[
              { status: "Announced", desc: "A promise exists in a public document. No implementation evidence found." },
              { status: "In Progress", desc: "A tender, procurement notice, budget allocation, or pilot has been publicly recorded." },
              { status: "Delivered", desc: "The promised outcome is verifiably operational, with public evidence (e.g., audit report, official launch, procurement closure)." },
              { status: "Delayed", desc: "A stated deadline has passed with no delivery evidence, or an official acknowledgement of delay exists." },
              { status: "Abandoned", desc: "The promise has been officially withdrawn, or there has been no activity for 24+ months with no explanation." },
              { status: "Unknown", desc: "Insufficient public information to classify. RTI has been filed." },
            ].map(({ status, desc }) => (
              <div key={status} className="flex gap-3">
                <span className="shrink-0 font-medium text-slate-700 w-24">{status}</span>
                <span className="text-slate-600">{desc}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">Where the data comes from</h2>
          <p className="text-slate-600 mb-4">
            Every promise on this tracker is sourced from a public document. We do not rely on
            anonymous tips, off-the-record briefings, or unverified claims. Below are the primary
            source categories and the specific portals we draw from for Karnataka.
          </p>
          <div className="space-y-3">
            {[
              {
                category: "Government policy documents",
                sources: [
                  { name: "Government of Karnataka — official portal", url: "https://karnataka.gov.in/english" },
                  { name: "INDIAai — Government of India AI portal", url: "https://indiaai.gov.in" },
                  { name: "DPIIT — Ministry of Commerce & Industry", url: "https://dpiit.gov.in" },
                  { name: "MeitY — Ministry of Electronics & IT", url: "https://meity.gov.in" },
                ],
                note: "Policy text is quoted verbatim. Any paraphrase is clearly marked. Source PDFs are archived in our document library."
              },
              {
                category: "State budget & finance",
                sources: [
                  { name: "Karnataka Finance Department", url: "https://finance.karnataka.gov.in" },
                  { name: "Karnataka Legislative Assembly (eVidhan)", url: "https://kla.neva.gov.in/" },
                ],
                note: "Budget figures are taken from the tabled document, not press summaries."
              },
              {
                category: "Procurement records",
                sources: [
                  { name: "GeM — Government e-Marketplace", url: "https://gem.gov.in" },
                  { name: "Karnataka e-Procurement portal", url: "https://eproc.karnataka.gov.in" },
                ],
                note: "We search for keywords: 'artificial intelligence', 'AI', 'machine learning' filtered to Karnataka."
              },
              {
                category: "Official notifications",
                sources: [
                  { name: "Karnataka Legislative Assembly proceedings", url: "https://kla.neva.gov.in/" },
                  { name: "Government of Karnataka — portal & notifications", url: "https://karnataka.gov.in/english" },
                ],
                note: "Gazette notifications (Karnataka Printing Dept.) are the most authoritative record of government decisions. The state gazette portal has intermittent availability; we archive relevant notifications directly."
              },
              {
                category: "RTI filings (this project)",
                sources: [
                  { name: "RTI Online Portal — Government of India", url: "https://rtionline.gov.in" },
                  { name: "Karnataka RTI Online portal", url: "https://rtionline.karnataka.gov.in/" },
                ],
                note: "We file RTIs for every unverified promise. Responses are logged verbatim; non-responses are recorded as 'stonewalled'."
              },
              {
                category: "News & media (corroborating only)",
                sources: [
                  { name: "The Hindu (Bengaluru edition)", url: "https://thehindu.com" },
                  { name: "Deccan Herald", url: "https://deccanherald.com" },
                  { name: "Scroll.in", url: "https://scroll.in" },
                  { name: "NDTV", url: "https://ndtv.com" },
                ],
                note: "News is used to corroborate government records, not as a primary source. A news report alone is not sufficient to mark a promise as 'delivered'."
              },
            ].map(({ category, sources, note }) => (
              <div key={category} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-sm font-semibold text-slate-800 mb-2">{category}</p>
                <ul className="space-y-1 mb-2">
                  {sources.map((s) => (
                    <li key={s.name} className="flex items-baseline gap-2">
                      <span className="text-slate-400 text-xs">→</span>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-700 underline hover:text-slate-900"
                      >
                        {s.name}
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-slate-500 italic">{note}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">AI assistance</h2>
          <p className="text-slate-600">
            We use open-source LLMs (DeepSeek-R1 via Groq) to parse policy documents and surface
            potential matches between promises and procurement records. Every AI-generated finding is
            reviewed by a human before being published. Prompts and model outputs are versioned in
            our GitHub repository.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">What counts as silence</h2>
          <p className="text-slate-600">
            If an RTI is filed and not answered within 30 days (as required by law), we log it as a
            &ldquo;stonewalled&rdquo; response. The silence is data, and we publish it as such.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">Corrections</h2>
          <p className="text-slate-600">
            If you have evidence that a status is wrong, please open an issue on our{" "}
            <a href="https://github.com" className="underline hover:text-slate-800" target="_blank" rel="noopener noreferrer">
              GitHub repository
            </a>
            . We will review and update within 7 days, with a public change log entry.
          </p>
        </section>
      </div>
    </div>
  );
}
