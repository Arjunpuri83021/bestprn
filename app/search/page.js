import { api } from '../lib/api'
import { fetchSeoMeta } from '../lib/seoMeta'
import VideoCard from '../components/VideoCard'
import Pagination from '../components/Pagination'

export const revalidate = 30

function capitalize(str = '') {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export async function generateMetadata({ searchParams }) {
  const q = searchParams?.q || ''
  const page = Number(searchParams?.page || 1)
  let total = 0
  if (q) {
    try {
      const res = await api.searchPosts(q, page, 16)
      total = res?.totalRecords || 0
    } catch (_) {}
  }

  const fallbackTitle = q
    ? `${capitalize(q)} Best porn videos${page > 1 ? ` - Page ${page}` : ''}`
    : 'Search'
  const fallbackDescription = q
    ? `Showing results for ${q} porn videos — total ${total} results${page > 1 ? `, page ${page}` : ''}.`
    : 'Search videos on bestprn.'

  const meta = await fetchSeoMeta('/search')
  const title = meta?.metaTitle || fallbackTitle
  const description = meta?.metaDescription || fallbackDescription

  const canonicalBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://bestprn.com'
  const canonical = q
    ? `${canonicalBase}/search?q=${encodeURIComponent(q)}${page > 1 ? `&page=${page}` : ''}`
    : `${canonicalBase}/search`

  return {
    title,
    description,
    alternates: { canonical },
    keywords: q ? [`${q} porn videos`, `${q} sex videos`, `${q} xxx`, 'free porn', 'best porn videos'] : undefined,
    openGraph: {
      title: meta?.ogTitle || meta?.metaTitle || title,
      description: meta?.ogDescription || meta?.metaDescription || description,
      url: canonical,
      type: 'website',
      images: meta?.ogImage ? [{ url: meta.ogImage }] : undefined,
    },
    twitter: meta ? {
      card: 'summary_large_image',
      title: meta.metaTitle || title,
      description: meta.metaDescription || description,
      images: meta.ogImage ? [meta.ogImage] : undefined,
    } : undefined,
  }
}

export default async function SearchPage({ searchParams }) {
  const q = searchParams?.q || ''
  const page = Number(searchParams?.page || 1)

  let data = { records: [], totalPages: 1, totalRecords: 0 }
  if (q) {
    data = await api.searchPosts(q, page, 16).catch(() => ({ records: [], totalPages: 1, totalRecords: 0 }))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold mb-6">{q ? `${capitalize(q)} Best porn videos` : 'Search'}</h1>

      <div className="mb-4 text-gray-300">
        {q ? (
          <>
            Showing results for <span className="text-white font-medium">{q} porn videos</span>
            {typeof data.totalRecords === 'number' ? ` — total ${data.totalRecords} results` : ''}
          </>
        ) : (
          <span>Enter a keyword in the search bar to find videos.</span>
        )}
      </div>

      <div className="grid video-grid">
        {(data.records || []).map((v, idx) => (
          <VideoCard key={v._id || idx} video={v} />
        ))}
      </div>

      {q && (
        <Pagination basePath={`/search?q=${encodeURIComponent(q)}`} currentPage={page} totalPages={data.totalPages || 1} />
      )}
    </div>
  )
}
