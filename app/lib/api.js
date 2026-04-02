function getApiBase() {
  const envBase = (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '').trim().replace(/\/$/, '')
  if (envBase) return envBase
  // Client-side: use current origin
  if (typeof window !== 'undefined') {
    return window.location.origin.replace(/\/$/, '')
  }
  // Server-side fallback: use public site URL or prod domain
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://bestprn.com').replace(/\/$/, '')
}

async function request(path, { method = 'GET', headers = {}, body } = {}) {
  const base = getApiBase()
  const url = path.startsWith('http') ? path : `${base}${path}`

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    // Always fetch fresh data on server for SSR, cache can be tuned later
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API error ${res.status}: ${text}`)
  }

  // Try JSON first, fallback to text
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return res.json()
  }
  return res.text()
}

// Special no-cache request for dynamic admin content
async function requestNoCache(path, { method = 'GET', headers = {}, body } = {}) {
  const base = getApiBase()
  const url = path.startsWith('http') ? path : `${base}${path}`

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: 'no-store', // Always fresh — no caching for admin-managed content
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API error ${res.status}: ${text}`)
  }

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return res.json()
  }
  return res.text()
}

export const api = {
  // Videos
  getNewVideos: (page = 1, limit = 16) => request(`/getnewVideos?page=${page}&limit=${limit}`),
  getPopularVideos: (page = 1, limit = 16) => request(`/getpopularVideos?page=${page}&limit=${limit}`),
  getTopRated: (page = 1, limit = 16) => request(`/getTopRate?page=${page}&limit=${limit}`),
  getVideoById: (id) => request(`/getVideo/${id}`, { method: 'POST' }),

  // Tags
  getTags: (page = 1, limit = 30, search = '') => request(`/tags?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),
  getPostsByTag: (tag, page = 1, limit = 16) => request(`/tags/${encodeURIComponent(tag)}/posts?page=${page}&limit=${limit}`),
  getTagMetadata: (tag) => request(`/tags/${encodeURIComponent(tag)}/metadata`),
  getFooterTags: () => request('/footer/tags'),

  // Pornstars
  getAllPornstars: (page = 1, limit = 30, search = '', letter = '') => request(`/pornstars?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&letter=${encodeURIComponent(letter)}`),
  getPornstarVideos: (name, page = 1, limit = 16) => request(`/pornstar/${encodeURIComponent(name)}?page=${page}&limit=${limit}`),
  getFooterPornstars: () => request('/footer/pornstars'),

  // Categories
  getIndians: (page = 1, limit = 16) => request(`/getindians?page=${page}&limit=${limit}`),
  getHijabi: (page = 1, limit = 16) => request(`/getHijabi?page=${page}&limit=${limit}`),

  // Search (paginated)
  searchPosts: (query, page = 1, limit = 16, category = '') =>
    request(`/getpostdata?search=${encodeURIComponent(query)}&page=${page}&limit=${limit}&category=${encodeURIComponent(category)}`),

  // All posts (homepage pagination)
  getAllPosts: (page = 1, limit = 16) => request(`/getpostdata?page=${page}&limit=${limit}`),

  // Views update
  updateViews: (id, currentViews = 0) => request(`/updateviews/${id}`, {
    method: 'POST',
    body: { views: currentViews + 1 }
  }),
  updateRvViews: (id, currentViews = 0) => request(`/rvupdateviews/${id}`, {
    method: 'POST',
    body: { views: currentViews + 1 }
  }),

  // Custom Content — no-store cache so admin changes show instantly
  getCustomContent: (pageType, slug) => requestNoCache(`/custom-content/${pageType}/${slug}?site=bestprn`),
  getAllCustomContent: (page = 1, limit = 20, pageType = '') => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
    if (pageType) params.append('pageType', pageType)
    params.append('site', 'bestprn')
    return request(`/custom-content?${params}`)
  },
  createCustomContent: (data) => request('/custom-content', { method: 'POST', body: { ...data, site: 'bestprn' } }),
  updateCustomContent: (id, data) => request(`/custom-content/${id}?site=bestprn`, { method: 'PUT', body: data }),
  deleteCustomContent: (id) => request(`/custom-content/${id}?site=bestprn`, { method: 'DELETE' }),
  toggleCustomContentStatus: (id) => request(`/custom-content/${id}/toggle?site=bestprn`, { method: 'PATCH' }),
}

