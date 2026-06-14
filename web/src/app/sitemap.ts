import type { MetadataRoute } from 'next'
import { getAllStates, getPromisesByState } from '@/lib/data'

const BASE = 'https://indiaaiwatch.in'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const states = await getAllStates().catch(() => [])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/methodology`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/data`,      changeFrequency: 'weekly',  priority: 0.7 },
  ]

  const stateRoutes: MetadataRoute.Sitemap = states.map((s) => ({
    url: `${BASE}/states/${s.code.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  const promiseRoutes: MetadataRoute.Sitemap = (
    await Promise.all(
      states.map(async (s) => {
        const promises = await getPromisesByState(s.id).catch(() => [])
        return promises
          .filter((p) => p.slug)
          .map((p) => ({
            url: `${BASE}/states/${s.code.toLowerCase()}/promises/${p.slug}`,
            lastModified: p.last_verified_at ? new Date(p.last_verified_at) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
          }))
      })
    )
  ).flat()

  return [...staticRoutes, ...stateRoutes, ...promiseRoutes]
}
