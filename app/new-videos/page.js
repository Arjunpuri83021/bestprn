import { api } from '../lib/api'
import { fetchSeoMeta } from '../lib/seoMeta'
import VideoCard from '../components/VideoCard'
import Pagination from '../components/Pagination'

export const revalidate = 60

export async function generateMetadata() {
  const fallback = {
    title: 'New Videos',
    description: 'Watch the latest new videos on bestprn with high-quality streaming.',
    alternates: { canonical: '/new-videos' },
  }

  const meta = await fetchSeoMeta('/new-videos')
  if (!meta) return fallback

  return {
    title: meta.metaTitle || fallback.title,
    description: meta.metaDescription || fallback.description,
    alternates: { canonical: meta.pagePath || '/new-videos' },
    openGraph: {
      title: meta.ogTitle || meta.metaTitle || fallback.title,
      description: meta.ogDescription || meta.metaDescription || fallback.description,
      url: meta.pagePath || '/new-videos',
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

// Generate unique content from videos
function generateNewVideosContent(videos, totalRecords, totalPages) {
  // Brand-salted variant to differentiate bestprn output
  const brandSalt = 'bestprn'.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const seed = 'new-videos'.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const variant = (seed + brandSalt) % 5
  const prefaces = [
    'bestprn surfaces brand-new uploads with a clean, fast layout.',
    'On bestprn, new videos load quickly with uncluttered design.',
    'This bestprn feed is tuned for quick discovery and speed.',
    'bestprn prioritizes instant playback for the latest releases.',
    'Our new uploads page is optimized for smooth browsing on bestprn.'
  ]
  const streamingPhrases = [
    'Enjoy uninterrupted HD streaming on any device.',
    'Playback starts fast with minimal buffering.',
    'Adaptive streams keep viewing smooth.',
    'Mobile‑first performance for fluid scrubbing.',
    'Clear visuals on efficient, lightweight pages.'
  ]
  const videoTitles = videos.slice(0, 5).map(v => v.titel || v.title).filter(Boolean)

  const titleKeywords = videoTitles.map(title => {
    const words = title.toLowerCase().split(/[\s-]+/)
    const skipWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during']
    return words.filter(w => w.length > 3 && !skipWords.includes(w)).slice(0, 3)
  }).flat().filter((v, i, a) => a.indexOf(v) === i).slice(0, 5)

  let titleMention = ''
  if (titleKeywords.length > 0) {
    titleMention = ` Recent uploads feature ${titleKeywords.slice(0, 3).join(', ')} themes.`
  }

  let exampleMention = ''
  if (videoTitles.length > 0) {
    const firstTitle = videoTitles[0].length > 60 ? videoTitles[0].substring(0, 60) + '...' : videoTitles[0]
    exampleMention = ` Latest additions include videos like "${firstTitle}" among others.`
  }

  const base = {
    intro: `Explore ${totalRecords}+ newest videos uploaded to our platform in high definition. This collection features the latest releases across all categories, updated daily with fresh content from various performers and studios. Our New Videos section ensures you never miss the most recent additions to our extensive library.`,
    details: `The New Videos library showcases the latest uploads across multiple genres and categories. Content includes fresh releases from established performers, debut videos from new talent, and recent productions from various studios.${titleMention} Videos are sorted by upload date with the newest content appearing first, ensuring you always see the latest additions.`,
    navigation: `Browse through ${totalPages} pages of new content, with 16 videos per page organized chronologically. The collection updates daily with fresh uploads, making it easy to discover the latest releases across all categories and performers.${exampleMention}`,
    closing: `All new videos stream free in HD quality without registration requirements. Content is optimized for desktop and mobile viewing with adaptive playback, ensuring smooth streaming of the latest releases across all devices.`
  }
  return {
    ...base,
    intro: `${prefaces[variant]} ${base.intro}`,
    closing: `${base.closing} ${streamingPhrases[variant]}`
  }
}

export default async function NewVideosPage({ searchParams }) {
  const page = Number(searchParams?.page || 1)
  const res = await api.getNewVideos(page, 16).catch(() => ({ data: [], records: [], videos: [], totalPages: 1, totalRecords: 0 }))
  const list = res.records || res.data || res.videos || []
  const totalPages = res.totalPages || (res.totalRecords ? Math.max(1, Math.ceil(Number(res.totalRecords) / 16)) : 1)
  const totalRecords = res.totalRecords || 0

  // Fetch custom content from admin (page 1 only)
  let customContent = null
  if (page === 1) {
    try { customContent = await api.getCustomContent('new-videos', 'new-videos') } catch { }
  }

  const content = page === 1 && !customContent ? generateNewVideosContent(list, totalRecords, totalPages) : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">New Videos</h1>
        <p className="text-gray-400 mt-1 text-sm">Showing page {page} of {totalPages} ({totalRecords} total videos)</p>
      </div>

      <div className="grid video-grid">
        {list.map((v, idx) => (
          <VideoCard key={v._id || idx} video={v} />
        ))}
      </div>

      <Pagination basePath="/new-videos?" currentPage={page} totalPages={totalPages} />

      {/* Custom content from admin */}
      {customContent && customContent.isActive && (
        <div className="mt-8 text-gray-300 leading-relaxed space-y-4 bg-gray-800/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{customContent.title}</h2>
          <div
            className="custom-content-display"
            dangerouslySetInnerHTML={{ __html: String(customContent.content || '').replace(/\n/g, '<br>') }}
          />
        </div>
      )}

      {/* Fallback: Auto-generated content */}
      {!customContent && content && (
        <div className="mt-8 text-gray-300 leading-relaxed space-y-4 bg-gray-800/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">About New Videos</h2>
          <p>{content.intro}</p>
          <p>{content.details}</p>
          <p>{content.navigation}</p>
          <p>{content.closing}</p>
        </div>
      )}
    </div>
  )
}
