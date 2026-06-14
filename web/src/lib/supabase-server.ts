import { createClient } from '@supabase/supabase-js'

// Server-only client — uses service role key, bypasses RLS.
// Import this ONLY in API routes, server actions, or server components.
// NEVER import in client components or files with 'use client'.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export function createServerClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase server credentials are not configured.')
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })
}
