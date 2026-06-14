import { createServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const format = searchParams.get('format') ?? 'json'
  const state = searchParams.get('state')

  const db = createServerClient()
  let query = db
    .from('promises')
    .select('slug, text, category, status, amount_inr, target_date, last_verified_at, ai_summary, states(name, code)')
    .order('created_at')

  if (state) query = query.eq('states.code', state.toUpperCase())

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (format === 'csv') {
    const headers = ['slug', 'state', 'category', 'status', 'amount_inr', 'target_date', 'last_verified_at', 'text', 'ai_summary']
    const rows = (data ?? []).map((p) => {
      const s = p.states as { name: string; code: string } | null
      return [
        p.slug ?? '',
        s?.code ?? '',
        p.category,
        p.status,
        p.amount_inr ?? '',
        p.target_date ?? '',
        p.last_verified_at ?? '',
        `"${(p.text ?? '').replace(/"/g, '""')}"`,
        `"${(p.ai_summary ?? '').replace(/"/g, '""')}"`,
      ].join(',')
    })
    const csv = [headers.join(','), ...rows].join('\n')
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="india-ai-watch-promises.csv"',
      },
    })
  }

  return NextResponse.json(
    { data, meta: { count: data?.length ?? 0, license: 'CC BY 4.0', source: 'India AI Watch' } },
    { headers: { 'Access-Control-Allow-Origin': '*' } },
  )
}
