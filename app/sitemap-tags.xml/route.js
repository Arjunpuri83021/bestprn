import { NextResponse } from 'next/server'
import { api } from '../lib/api'
import { toSlug } from '../lib/slug'

export const revalidate = 3600

export async function GET(req) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bestprn.com'
  const currentDate = new Date().toISOString().split('T')[0]
  const url = req?.nextUrl
  const pageParam = url?.searchParams?.get('page') || '1'
  const perParam = url?.searchParams?.get('per') || '1000'
  const page = Math.max(1, parseInt(pageParam, 10) || 1)
  const per = Math.min(5000, Math.max(50, parseInt(perParam, 10) || 1000))

  // Fetch all tags (robust to various API response shapes)
  let apiPage = 1
  const apiLimit = 100
  let tags = []

  try {
    while (true) {
      const res = await api.getTags(apiPage, apiLimit)

      let batch = []
      if (Array.isArray(res)) {
        batch = res
      } else if (res && typeof res === 'object') {
        batch = Array.isArray(res.items) ? res.items
          : Array.isArray(res.records) ? res.records
          : Array.isArray(res.data) ? res.data
          : Array.isArray(res.tags) ? res.tags
          : Array.isArray(res.results) ? res.results
          : Array.isArray(res.result) ? res.result
          : (Array.isArray(res?.data?.tags) ? res.data.tags : [])

        // Fallback: pick first array value from object
        if (!Array.isArray(batch) || batch.length === 0) {
          const firstArray = Object.values(res).find(v => Array.isArray(v))
          if (Array.isArray(firstArray)) batch = firstArray
        }
      }

      tags = tags.concat(batch)
      if (batch.length < apiLimit) break
      apiPage++
      if (apiPage > 200) break // safety guard
    }
  } catch (e) {
    tags = []
  }

  // Fallback: derive tags from posts if /tags endpoint yielded none
  if (tags.length === 0) {
    try {
      let p = 1
      const postLimit = 100
      const tagSet = new Set()
      while (true) {
        const res = await api.getAllPosts(p, postLimit)
        const posts = Array.isArray(res?.records) ? res.records
          : Array.isArray(res?.data) ? res.data
          : Array.isArray(res) ? res
          : []
        for (const post of posts) {
          if (Array.isArray(post?.tags)) {
            for (const t of post.tags) {
              if (typeof t === 'string' && t.trim()) tagSet.add(t.trim())
            }
          }
        }
        if (posts.length < postLimit) break
        p++
        if (p > 200) break
      }
      if (tagSet.size > 0) tags = Array.from(tagSet)
    } catch {}
  }

  // Deduplicate and sort
  const normalized = Array.from(
    new Set(
      tags
        .map(t => (typeof t === 'string' ? t.trim() : (t?.name || t?.slug || t?.tag || t?.title || '')).trim())
        .filter(Boolean)
        .map(t => toSlug(t))
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b))

  // Paginate
  const start = (page - 1) * per
  const pageItems = normalized.slice(start, start + per)

  const urlEntries = pageItems
    .map(t => {
      const raw = t
      if (!raw || typeof raw !== 'string') return ''
      const safe = encodeURIComponent(raw.trim())
      if (!safe) return ''
      return `  <url>\n    <loc>${siteUrl}/tag/${safe}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
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
