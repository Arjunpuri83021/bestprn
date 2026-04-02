import { NextResponse } from 'next/server'
import { api } from '../lib/api'
import { toSlug } from '../lib/slug'

export const revalidate = 3600

export async function GET(req) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bestprn.com'
  const currentDate = new Date().toISOString().split('T')[0]

  const url = req?.nextUrl
  const pageParam = url?.searchParams?.get('page') || '1'
  const perParam = url?.searchParams?.get('per') || '5000'
  const page = Math.max(1, parseInt(pageParam, 10) || 1)
  const per = Math.min(5000, Math.max(50, parseInt(perParam, 10) || 1000))

  // Fetch only the slice needed for this sitemap page
  const apiLimit = 200
  const startIndex = (page - 1) * per
  const endIndex = startIndex + per - 1

  const startApiPage = Math.floor(startIndex / apiLimit) + 1
  const endApiPage = Math.floor(endIndex / apiLimit) + 1

  let totalRecords = 0
  const allFetched = []

  try {
    for (let apiPage = startApiPage; apiPage <= endApiPage; apiPage++) {
      const res = await api.getAllPosts(apiPage, apiLimit)
      if (!totalRecords) totalRecords = Number(res?.totalRecords || 0)
      const batch = Array.isArray(res?.records) ? res.records
        : Array.isArray(res?.data) ? res.data
        : Array.isArray(res) ? res
        : []
      allFetched.push(...batch)
      if (batch.length < apiLimit) break
    }
  } catch {
    // fallthrough
  }

  const offsetInFirstPage = startIndex % apiLimit
  const slice = allFetched.slice(offsetInFirstPage, offsetInFirstPage + per)

  const urlEntries = slice.map(p => {
    const id = p?._id ? String(p._id) : ''
    if (!id) return ''
    const title = p?.titel || p?.title || p?.metatitel || ''
    const slug = toSlug(title)
    const loc = slug ? `${siteUrl}/video/${id}-${slug}` : `${siteUrl}/video/${id}`
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`
  }).filter(Boolean).join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>`

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
