import { NextResponse } from 'next/server'
import { api } from '../lib/api'

export const revalidate = 3600

export async function GET(req) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bestprn.com'
  const currentDate = new Date().toISOString().split('T')[0]

  const url = req?.nextUrl
  const perParam = url?.searchParams?.get('per') || '5000'
  const per = Math.min(5000, Math.max(50, parseInt(perParam, 10) || 5000))

  let totalRecords = 0
  try {
    const res = await api.getAllPosts(1, 1)
    totalRecords = Number(res?.totalRecords || 0)
  } catch {
    totalRecords = 0
  }

  const totalPages = totalRecords > 0 ? Math.ceil(totalRecords / per) : 1

  const entries = Array.from({ length: totalPages }, (_, idx) => {
    const page = idx + 1
    return `  <sitemap>\n    <loc>${siteUrl}/sitemap-videos.xml?page=${page}&per=${per}</loc>\n    <lastmod>${currentDate}</lastmod>\n  </sitemap>`
  }).join('\n')

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`

  return new NextResponse(sitemapIndex, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
