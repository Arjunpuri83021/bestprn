import { NextResponse } from 'next/server'
import { toSlug } from './app/lib/slug'

function normalizeSegments(pathname) {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length < 2) return null

  const section = segments[0]
  if (section !== 'tag' && section !== 'pornstar') return null

  const rawValue = decodeURIComponent(segments[1] || '')
  const canonicalValue = toSlug(rawValue)

  if (!canonicalValue) return null

  const hasPage = segments.length >= 3 && /^\d+$/.test(String(segments[2]))
  const page = hasPage ? String(segments[2]) : null

  return { section, canonicalValue, page }
}

export function middleware(req) {
  const { pathname, search } = req.nextUrl

  const info = normalizeSegments(pathname)
  if (!info) return NextResponse.next()

  const targetPath = info.page
    ? `/${info.section}/${info.canonicalValue}/${info.page}`
    : `/${info.section}/${info.canonicalValue}`

  if (pathname === targetPath) return NextResponse.next()

  const url = req.nextUrl.clone()
  url.pathname = targetPath
  url.search = search

  return NextResponse.redirect(url, 301)
}

export const config = {
  matcher: ['/tag/:path*', '/pornstar/:path*'],
}
