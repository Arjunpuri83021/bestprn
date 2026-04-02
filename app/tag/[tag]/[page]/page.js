import { api } from '../../../lib/api'
import VideoCard from '../../../components/VideoCard'
import Pagination from '../../../components/Pagination'

export const revalidate = 60

export async function generateMetadata({ params }) {
  const tag = decodeURIComponent(params.tag)
  const page = Number(params.page || 1)
  const titleTag = tag.replace(/-/g, ' ')
  const title = page > 1 ? `${titleTag} Videos - Page ${page}` : `${titleTag} Videos`
  const description = page > 1
    ? `Watch ${titleTag} videos - Page ${page}. Explore premium ${titleTag} content updated daily.`
    : `Watch the best ${titleTag} videos. Explore premium ${titleTag} content updated daily.`

  const canonicalBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://bestprn.com'
  const canonical = page > 1
    ? `${canonicalBase}/tag/${params.tag}/${page}`
    : `${canonicalBase}/tag/${params.tag}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
  }
}

async function getData(tag, page) {
  const list = await api.getPostsByTag(tag, page, 16).catch(() => ({ data: [], records: [], totalPages: 1, totalRecords: 0 }))
  const items = list.data || list.records || []
  const totalPages = list.totalPages || 1
  const totalRecords = list.totalRecords || items.length || 0
  return { list: items, totalPages, totalRecords }
}

export default async function TagPageWithNumber({ params }) {
  const tag = decodeURIComponent(params.tag)
  const page = Number(params.page || 1)
  const { list, totalPages, totalRecords } = await getData(tag, page)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold capitalize">{tag.replace(/-/g, ' ')} Videos</h1>
        <p className="text-gray-400 mt-1 text-sm">Showing page {page} of {totalPages} ({totalRecords} total videos)</p>
      </div>

      <div className="grid video-grid">
        {list.map((v, idx) => (
          <VideoCard key={v._id || idx} video={v} />
        ))}
      </div>

      <Pagination basePath={`/tag/${params.tag}`} currentPage={page} totalPages={totalPages} />
    </div>
  )
}
