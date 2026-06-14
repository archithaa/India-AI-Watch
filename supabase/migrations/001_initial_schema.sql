-- Karnataka AI Watch — Initial Schema
-- Multi-state from day one; Karnataka (KA) seeded as first state.

create extension if not exists "uuid-ossp";
create extension if not exists vector;

-- ─────────────────────────────────────────
-- States
-- ─────────────────────────────────────────
create table states (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  code        text not null unique,   -- KA, KL, MH, etc.
  capital     text,
  current_cm  text,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- Policy Documents
-- ─────────────────────────────────────────
create type document_source_type as enum (
  'policy', 'gazette', 'procurement', 'news', 'speech', 'budget', 'rti_response', 'other'
);

create type parsing_status as enum ('pending', 'processing', 'done', 'failed');

create table policy_documents (
  id              uuid primary key default uuid_generate_v4(),
  state_id        uuid not null references states(id) on delete cascade,
  title           text not null,
  source_url      text,
  source_type     document_source_type not null default 'other',
  published_at    date,
  raw_text        text,
  ai_parsed_at    timestamptz,
  parsing_status  parsing_status not null default 'pending',
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- Promises
-- ─────────────────────────────────────────
create type promise_category as enum (
  'education', 'infrastructure', 'startup', 'governance', 'research', 'agriculture', 'health', 'other'
);

create type promise_status as enum (
  'announced', 'in_progress', 'delivered', 'delayed', 'abandoned', 'unknown'
);

create table promises (
  id                uuid primary key default uuid_generate_v4(),
  state_id          uuid not null references states(id) on delete cascade,
  document_id       uuid references policy_documents(id) on delete set null,
  category          promise_category not null default 'other',
  text              text not null,
  target_date       date,
  amount_inr        bigint,           -- in rupees
  status            promise_status not null default 'announced',
  last_verified_at  timestamptz,
  ai_summary        text,
  slug              text unique,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- Evidence
-- ─────────────────────────────────────────
create type evidence_type as enum (
  'delivery', 'delay', 'contradiction', 'budget_allocated', 'procurement_issued', 'news_coverage', 'rti_finding'
);

create table evidence (
  id                  uuid primary key default uuid_generate_v4(),
  promise_id          uuid not null references promises(id) on delete cascade,
  type                evidence_type not null,
  source_url          text,
  description         text not null,
  found_at            date,
  verified_by_human   boolean not null default false,
  created_at          timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- RTI Filings
-- ─────────────────────────────────────────
create type rti_status as enum ('pending', 'responded', 'appealed', 'stonewalled', 'withdrawn');

create table rti_filings (
  id                uuid primary key default uuid_generate_v4(),
  state_id          uuid not null references states(id) on delete cascade,
  filed_date        date not null,
  department        text not null,
  subject           text not null,
  status            rti_status not null default 'pending',
  response_date     date,
  response_summary  text,
  filing_url        text,
  response_url      text,
  created_at        timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- Monthly Digests
-- ─────────────────────────────────────────
create table digests (
  id                    uuid primary key default uuid_generate_v4(),
  state_id              uuid references states(id) on delete cascade,  -- null = national digest
  period                text not null,       -- YYYY-MM
  title                 text not null,
  content_mdx           text,
  highlights_json       jsonb,
  published_at          timestamptz,
  newsletter_sent_at    timestamptz,
  subscriber_count      integer,
  created_at            timestamptz not null default now(),
  unique(state_id, period)
);

-- ─────────────────────────────────────────
-- Seed: Karnataka
-- ─────────────────────────────────────────
insert into states (name, code, capital, current_cm) values
  ('Karnataka', 'KA', 'Bengaluru', 'Siddaramaiah');

-- Seed: Karnataka AI Policy 2024 document
insert into policy_documents (state_id, title, source_url, source_type, published_at, parsing_status)
select
  id,
  'Karnataka Artificial Intelligence Policy 2024',
  'https://itbt.karnataka.gov.in',
  'policy',
  '2024-01-01',
  'done'
from states where code = 'KA';

-- Seed: 7 tracked promises
insert into promises (state_id, document_id, category, text, amount_inr, status, slug, ai_summary)
select
  s.id,
  d.id,
  unnest(array[
    'infrastructure'::promise_category,
    'education'::promise_category,
    'startup'::promise_category,
    'infrastructure'::promise_category,
    'governance'::promise_category,
    'governance'::promise_category,
    'agriculture'::promise_category
  ]),
  unnest(array[
    'Establish a Centre for Applied AI with a dedicated budget of ₹50 crore',
    'Integrate AI tools into every government school classroom across Karnataka',
    'Nurture 25,000 AI-ready startups in Karnataka by 2027',
    'Position Bengaluru as the deep tech capital of South Asia',
    'Establish an AI Governance Framework and Ethics Board for Karnataka',
    'Deploy AI-powered citizen services across all government departments',
    'Create a Centre of Excellence for AI in Agriculture to support farmers'
  ]),
  unnest(array[
    5000000000::bigint,
    null,
    null,
    null,
    null,
    null,
    null
  ]),
  'announced'::promise_status,
  unnest(array[
    'ka-centre-applied-ai',
    'ka-ai-schools',
    'ka-25000-startups',
    'ka-deep-tech-capital',
    'ka-ai-ethics-board',
    'ka-ai-citizen-services',
    'ka-ai-agriculture-coe'
  ]),
  unnest(array[
    'Karnataka has committed ₹50 crore to establish a Centre for Applied AI. No procurement has been issued, no site selected, and no progress report published as of June 2026.',
    'The state promised AI tools in every government school. No tender has been floated, no vendor selected, and no pilot results published.',
    'Karnataka aims for 25,000 AI-ready startups by 2027. Current baseline and tracking methodology are undefined.',
    'The policy designates Bengaluru as a global deep tech hub. No international benchmarking or measurement framework has been published.',
    'An AI Ethics Board was proposed to oversee governance. It has not been constituted; no members or mandate published.',
    'AI-powered citizen services were promised across all departments. No deployment timeline or department-wise rollout plan is public.',
    'A Centre of Excellence for AI in Agriculture was announced. No site, budget, or advisory board has been identified.'
  ])
from states s, policy_documents d
where s.code = 'KA' and d.state_id = s.id;

-- ─────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────
create index on promises(state_id, status);
create index on promises(state_id, category);
create index on evidence(promise_id);
create index on rti_filings(state_id, status);
create index on policy_documents(state_id, source_type);
