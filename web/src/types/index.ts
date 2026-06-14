export type PromiseStatus = 'announced' | 'in_progress' | 'delivered' | 'delayed' | 'abandoned' | 'unknown'
export type PromiseCategory = 'education' | 'infrastructure' | 'startup' | 'governance' | 'research' | 'agriculture' | 'health' | 'other'
export type EvidenceType = 'delivery' | 'delay' | 'contradiction' | 'budget_allocated' | 'procurement_issued' | 'news_coverage' | 'rti_finding'
export type RTIStatus = 'pending' | 'responded' | 'appealed' | 'stonewalled' | 'withdrawn'

export interface State {
  id: string
  name: string
  code: string
  capital: string | null
  current_cm: string | null
  created_at: string
}

export interface PolicyDocument {
  id: string
  state_id: string
  title: string
  source_url: string | null
  source_type: string
  published_at: string | null
  raw_text: string | null
  ai_parsed_at: string | null
  parsing_status: string
  created_at: string
}

export interface PolicyPromise {
  id: string
  state_id: string
  document_id: string | null
  category: PromiseCategory
  text: string
  target_date: string | null
  amount_inr: number | null
  status: PromiseStatus
  last_verified_at: string | null
  ai_summary: string | null
  slug: string | null
  created_at: string
  updated_at: string
  evidence?: Evidence[]
}

export interface Evidence {
  id: string
  promise_id: string
  type: EvidenceType
  source_url: string | null
  description: string
  found_at: string | null
  verified_by_human: boolean
  created_at: string
}

export interface RTIFiling {
  id: string
  state_id: string
  filed_date: string
  department: string
  subject: string
  status: RTIStatus
  response_date: string | null
  response_summary: string | null
  filing_url: string | null
  response_url: string | null
  created_at: string
}
