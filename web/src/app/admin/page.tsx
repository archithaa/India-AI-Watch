import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase-server'
import { getPendingEvidence } from '@/lib/data'
import { AdminShell } from './AdminShell'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value

  if (token !== process.env.ADMIN_SECRET) {
    redirect('/admin/login')
  }

  const db = createServerClient()
  const [{ data: promises }, pendingEvidence] = await Promise.all([
    db.from('promises').select('id, slug, text, status, last_verified_at').order('created_at'),
    getPendingEvidence(),
  ])

  return <AdminShell promises={promises ?? []} pendingEvidence={pendingEvidence} />
}
