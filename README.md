# India AI Watch

**Tracking what Indian state governments promise on AI — and whether they deliver.**

India's state governments are making billion-rupee AI bets with public money and zero public accountability infrastructure. No body tracks whether policies deliver. This project changes that.

→ **Live tracker:** [indiaaiwatch.in](https://indiaaiwatch.in) *(coming soon)*

---

## What this is

A civic accountability platform that makes AI policy visible:

- **Promise tracker** — every specific AI commitment, sourced to the original document
- **Status scoring** — Announced / In Progress / Delivered / Delayed / Abandoned
- **RTI log** — Right to Information filings and responses (silence is data too)
- **Open data** — full dataset downloadable as CSV/JSON, API available
- **Monthly digest** — plain-language summary of what changed

Currently tracking: **Karnataka** (7 promises, 2 RTIs filed). Kerala and Maharashtra coming next.

---

## Project structure

```
India-AI-Watch/
├── web/                    Next.js 16 frontend (Vercel)
│   ├── src/app/            Pages: /, /states/ka, /methodology, /data
│   ├── src/components/     PromiseCard, StatusBadge, Nav, etc.
│   ├── src/lib/            Supabase client, data access layer
│   └── src/types/          TypeScript types
├── scrapers/               Python data pipeline
│   ├── .venv/              Python 3.13 virtual environment (gitignored)
│   └── requirements.txt    httpx, playwright, supabase, groq, pdfplumber
├── supabase/
│   └── migrations/         SQL schema — run this in your Supabase SQL Editor
└── .github/workflows/      Scheduled scrapers (coming soon)
```

---

## Tech stack

| Layer | Tool | Cost |
|---|---|---|
| Frontend | Next.js 16 + Tailwind + shadcn/ui | Free (Vercel) |
| Database | Supabase (PostgreSQL) | Free tier |
| Document AI | DeepSeek-R1 via Groq | Free tier |
| Scraping | Python + GitHub Actions | Free |
| Newsletter | Resend | Free tier |

**Total monthly infra cost: $0**

---

## Running locally

**Prerequisites:** Node.js 18+, Python 3.11+

### 1. Clone and install

```bash
git clone https://github.com/archithaa/India-AI-Watch.git
cd India-AI-Watch

# Frontend
cd web && npm install

# Python scrapers
cd ../scrapers
python -m venv .venv
.venv/Scripts/activate      # Windows
# source .venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL Editor — this creates all tables and seeds Karnataka data
3. Go to Project Settings → API and copy your keys

### 3. Configure environment

```bash
cp web/.env.local.example web/.env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
```

### 4. Run

```bash
cd web && npm run dev
# → http://localhost:3000
```

---

## Data sources

All data is sourced from public documents. See [/methodology](https://indiaaiwatch.in/methodology) for the full list of portals, how we score each status, and how we handle RTI non-responses.

Primary sources for Karnataka:
- Government of Karnataka portal
- Karnataka Legislative Assembly (kla.neva.gov.in)
- GeM procurement portal
- Karnataka e-Procurement portal
- RTI Online (central + Karnataka)
- The Hindu, Deccan Herald, Scroll

---

## Fork this for your state

Want to run this for Telangana, Kerala, or Maharashtra?

1. Fork this repo
2. Set up your own Supabase project (same schema, different data)
3. Update `supabase/migrations/001_initial_schema.sql` — change the seed INSERT to your state
4. Update scraping targets in `scrapers/` for your state's government portals
5. Deploy to Vercel

A step-by-step guide is at [/fork](https://indiaaiwatch.in/fork) *(coming soon)*.

---

## Contributing

Found a broken link, wrong status, or missing promise? [Open an issue](https://github.com/archithaa/India-AI-Watch/issues) — we review and update within 7 days with a public change log entry.

Journalists and researchers: the full dataset is available at [/data](https://indiaaiwatch.in/data) under CC BY 4.0 via the open API — no auth required.

---

## License

Code: MIT  
Made in Bengaluru · Est. June 2026
