import { NextResponse } from 'next/server'
import { api } from '../lib/api'
import { toSlug } from '../lib/slug'

export const revalidate = 3600

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bestprn.com'
  const currentDate = new Date().toISOString().split('T')[0]

  // Fetch all pornstars (robust to various API response shapes)
  let page = 1
  const limit = 100
  let pornstars = []
  let fetched = []

  try {
    while (true) {
      const res = await api.getAllPornstars(page, limit)
      // Normalize: array or wrapped arrays {items|records|data}
      const batch = Array.isArray(res)
        ? res
        : (Array.isArray(res?.items) ? res.items
          : Array.isArray(res?.records) ? res.records
          : Array.isArray(res?.data) ? res.data
          : Array.isArray(res?.pornstars) ? res.pornstars
          : Array.isArray(res?.results) ? res.results
          : [])

      pornstars = pornstars.concat(batch)
      if (batch.length < limit) break
      page++
      if (page > 200) break // safety guard
    }
  } catch (e) {
    // On failure, keep list empty rather than emitting undefined slugs
    pornstars = []
  }

  const urlEntries = pornstars
    .map(p => {
      const raw = typeof p === 'string' ? p : (p?.name || p?.slug || p?.fullname || p?.title || p?.Name)
      if (!raw || typeof raw !== 'string') return ''
      const slug = toSlug(raw)
      const safe = encodeURIComponent(slug)
      if (!safe) return ''
      return `  <url>\n    <loc>${siteUrl}/pornstar/${safe}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
    })
    .filter(Boolean)
    .join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
