import { createServerClient } from '@/lib/supabase-server'
import type { PolicyPromise, State, RTIFiling } from '@/types'

// All functions in this file run server-side only (server components / API routes).
// They use the service role key, which bypasses RLS and anon permission issues.
const getClient = () => createServerClient()

export async function getStateByCode(code: string): Promise<State> {
  const { data, error } = await getClient()
    .from('states')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()
  if (error) throw new Error(`State not found: ${code} — ${error.message}`)
  return data
}

export async function getAllStates(): Promise<State[]> {
  const { data, error } = await getClient().from('states').select('*').order('name')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getPromisesByState(stateId: string): Promise<PolicyPromise[]> {
  const { data, error } = await getClient()
    .from('promises')
    .select('*, evidence(*)')
    .eq('state_id', stateId)
    .order('created_at')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getPromiseBySlug(slug: string): Promise<PolicyPromise> {
  const { data, error } = await getClient()
    .from('promises')
    .select('*, evidence(*)')
    .eq('slug', slug)
    .single()
  if (error) throw new Error(`Promise not found: ${slug} — ${error.message}`)
  return data
}

export async function getRTIsByState(stateId: string): Promise<RTIFiling[]> {
  const { data, error } = await getClient()
    .from('rti_filings')
    .select('*')
    .eq('state_id', stateId)
    .order('filed_date', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getPromiseCountsByState(
  stateId: string,
): Promise<Record<string, number>> {
  const { data, error } = await getClient()
    .from('promises')
    .select('status')
    .eq('state_id', stateId)
  if (error) throw new Error(error.message)
  return (data ?? []).reduce(
    (acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
}

export async function getPendingEvidence(): Promise<
  Array<{
    id: string
    type: string
    description: string
    source_url: string | null
    found_at: string | null
    created_at: string
    promise: { id: string; text: string; status: string; slug: string | null }
  }>
> {
  const { data, error } = await getClient()
    .from('evidence')
    .select('id, type, description, source_url, found_at, created_at, promises(id, text, status, slug)')
    .eq('verified_by_human', false)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => ({
    ...row,
    promise: (row.promises as unknown as { id: string; text: string; status: string; slug: string | null }),
  }))
}

export async function getGlobalStats(): Promise<{
  totalPromises: number
  delivered: number
  delayed: number
  noEvidence: number
  stateCount: number
}> {
  const [{ count: totalPromises }, { count: stateCount }, statusRows] = await Promise.all([
    getClient().from('promises').select('*', { count: 'exact', head: true }),
    getClient().from('states').select('*', { count: 'exact', head: true }),
    getClient().from('promises').select('status'),
  ])

  const counts = (statusRows.data ?? []).reduce(
    (acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return {
    totalPromises: totalPromises ?? 0,
    stateCount: stateCount ?? 0,
    delivered: counts['delivered'] ?? 0,
    delayed: counts['delayed'] ?? 0,
    noEvidence: (counts['announced'] ?? 0) + (counts['unknown'] ?? 0),
  }
}
