import Link from 'next/link'
import { api } from '../lib/api'
import { fetchSeoMeta } from '../lib/seoMeta'
import VideoCard from '../components/VideoCard'
import Pagination from '../components/Pagination'

export const revalidate = 60

export async function generateMetadata() {
  const fallback = {
    title: 'bestprn popular videos — most liked and trending',
    description: 'Explore most-liked HD porn videos on bestprn. Trending categories and top stars with daily updates for fast, clean streaming.',
    alternates: { canonical: '/most-liked' },
  }

  const meta = await fetchSeoMeta('/most-liked')
  if (!meta) return fallback

  return {
    title: meta.metaTitle || fallback.title,
    description: meta.metaDescription || fallback.description,
    alternates: { canonical: meta.pagePath || '/most-liked' },
    openGraph: {
      title: meta.ogTitle || meta.metaTitle || fallback.title,
      description: meta.ogDescription || meta.metaDescription || fallback.description,
      url: meta.pagePath || '/most-liked',
      type: 'website',
      images: meta.ogImage ? [{ url: meta.ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.metaTitle || fallback.title,
      description: meta.metaDescription || fallback.description,
      images: meta.ogImage ? [meta.ogImage] : undefined,
    },
  }
}

// Generate unique content from videos and meta keywords
function generatePopularContent(videos, totalRecords, totalPages) {
  const videoTitles = videos.slice(0, 5).map(v => v.titel || v.title).filter(Boolean)
  const titleKeywords = videoTitles.map(title => {
    const words = title.toLowerCase().split(/[\s-]+/)
    const skipWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from']
    return words.filter(w => w.length > 3 && !skipWords.includes(w)).slice(0, 3)
  }).flat().filter((v, i, a) => a.indexOf(v) === i).slice(0, 5)
  
  const metaKeywords = ['badwap', 'xmoviesforyou', 'aunty', 'sister', 'tiktits', 'boobs']
  
  let titleMention = titleKeywords.length > 0 ? ` Most-liked content features ${titleKeywords.slice(0, 3).join(', ')} themes.` : ''
  let metaMention = ` The collection includes popular content from ${metaKeywords.slice(0, 4).join(', ')}, and other trending sources.`
  let exampleMention = videoTitles.length > 0 ? ` Most popular videos include "${videoTitles[0].substring(0, 60)}..." among others.` : ''
  
  return {
    intro: `Explore ${totalRecords}+ most-liked videos featuring the most popular content across all categories. This collection showcases videos with the highest like counts and viewer engagement.`,
    details: `The Popular Videos library features content that has received the most likes from our community.${metaMention}${titleMention} Videos are ranked by like counts and engagement metrics.`,
    navigation: `Browse through ${totalPages} pages of popular content, with 16 videos per page organized by popularity.${exampleMention}`,
    closing: `All popular videos stream free in HD quality without registration requirements. Content is optimized for desktop and mobile viewing.`
  }
}

export default async function PopularPage({ searchParams }) {
  const page = Number(searchParams?.page || 1)
  const data = await api.getPopularVideos(page, 16).catch(() => ({ records: [], totalPages: 1, totalRecords: 0 }))
  const list = data.records || []
  const totalRecords = data.totalRecords || 0
  const content = page === 1 ? generatePopularContent(list, totalRecords, data.totalPages || 1) : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Popular Videos</h1>
        <p className="text-gray-400 mt-1 text-sm">Showing page {page} of {data.totalPages || 1} ({totalRecords} total videos)</p>
      </div>
      <div className="grid video-grid">
        {list.map((v, idx) => (
          <VideoCard key={v._id || idx} video={v} />
        ))}
      </div>
      <Pagination basePath="/most-liked" currentPage={page} totalPages={data.totalPages || 1} />
      {content && (
        <div className="mt-8 text-gray-300 leading-relaxed space-y-4 bg-gray-800/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">About Popular Videos</h2>
          <p>{content.intro}</p>
          <p>{content.details}</p>
          <p>{content.navigation}</p>
          <p>{content.closing}</p>
        </div>
      )}
    </div>
  )
}
