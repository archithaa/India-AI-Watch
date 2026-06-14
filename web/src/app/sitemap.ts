import type { MetadataRoute } from 'next'
import { getPromisesByState, getStateByCode } from '@/lib/data'

const BASE = 'https://indiaaiwatch.in'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const state = await getStateByCode('KA').catch(() => null)
  const promises = state ? await getPromisesByState(state.id).catch(() => []) : []

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/states/ka`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/methodology`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/data`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ]

  const promiseRoutes: MetadataRoute.Sitemap = promises.map((p) => ({
    url: `${BASE}/states/ka/promises/${p.slug}`,
    lastModified: p.last_verified_at ? new Date(p.last_verified_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...promiseRoutes]
}
