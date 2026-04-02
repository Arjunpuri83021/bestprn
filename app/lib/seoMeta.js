const DEFAULT_SITE = 'freshprn'

export async function fetchSeoMeta(pathname, site = DEFAULT_SITE) {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:5000').replace(/\/$/, '')
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`

  try {
    const res = await fetch(
      `${apiBase}/seo-meta/path/${encodeURIComponent(cleanPath)}?site=${encodeURIComponent(site)}`,
      { cache: 'no-store' }
    )

    if (!res.ok) return null
    const data = await res.json().catch(() => null)
    return data?.seoMeta || null
  } catch {
    return null
  }
}
