import { api } from '../lib/api'
import { fetchSeoMeta } from '../lib/seoMeta'
import VideoCard from '../components/VideoCard'
import Pagination from '../components/Pagination'

export const revalidate = 60

export async function generateMetadata() {
  const fallback = {
    title: 'bestprn scout69 porndish hitbdsm pornwild tubsexer pornhits pornhut | bestprn',
    description: 'pornmz pornwild hitbdsm freesexyindians milf300 sex18 desi49 wwwxxx xvedeo sex sister freeomovie 3gp king aunty sex adelt movies bf full hd bigfucktv | bestprn',
    alternates: { canonical: '/top-videos' },
  }

  const meta = await fetchSeoMeta('/top-videos')
  if (!meta) return fallback

  return {
    title: meta.metaTitle || fallback.title,
    description: meta.metaDescription || fallback.description,
    alternates: { canonical: meta.pagePath || '/top-videos' },
    openGraph: {
      title: meta.ogTitle || meta.metaTitle || fallback.title,
      description: meta.ogDescription || meta.metaDescription || fallback.description,
      url: meta.pagePath || '/top-videos',
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
function generateTopVideosContent(videos, totalRecords, totalPages) {
  // Brand-salted variant to differentiate bestprn output
  const brandSalt = 'bestprn'.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const seed = 'top-videos'.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const variant = (seed + brandSalt) % 5
  const prefaces = [
    'bestprn ranks top videos with a lean, fast interface.',
    'On bestprn, Top Videos emphasizes speed and clarity.',
    'This bestprn Top section balances quality with quick browsing.',
    'bestprn prioritizes instant playback for highly‑rated content.',
    'Our Top Videos feed is tuned for smooth, fast discovery.'
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

  const metaKeywords = ['scout69', 'porndish', 'hitbdsm', 'pornwild', 'tubsexer', 'pornhits', 'milf300', 'freesexyindians']

  let titleMention = ''
  if (titleKeywords.length > 0) {
    titleMention = ` Top-rated content features ${titleKeywords.slice(0, 3).join(', ')} themes.`
  }

  let metaMention = ''
  if (metaKeywords.length > 0) {
    metaMention = ` The collection includes premium content from ${metaKeywords.slice(0, 4).join(', ')}, and other top sources.`
  }

  let exampleMention = ''
  if (videoTitles.length > 0) {
    const firstTitle = videoTitles[0].length > 60 ? videoTitles[0].substring(0, 60) + '...' : videoTitles[0]
    exampleMention = ` Highest-rated videos include "${firstTitle}" among others.`
  }

  const base = {
    intro: `Explore ${totalRecords}+ top-rated videos featuring the highest-quality content across all categories. This collection showcases videos with the best viewer ratings, ensuring you access only the most popular and well-received content. Our Top Rated section highlights videos that have earned exceptional ratings from our community.`,
    details: `The Top Rated video library features content that has received the highest viewer ratings and engagement.${metaMention}${titleMention} Videos are ranked by user ratings and popularity metrics, ensuring the best content rises to the top. The collection spans multiple categories with only the highest-rated productions making the cut.`,
    navigation: `Browse through ${totalPages} pages of top-rated content, with 16 videos per page organized by rating. The collection is continuously updated as new videos earn high ratings, ensuring fresh highly-rated content alongside proven favorites.${exampleMention}`,
    closing: `All top-rated videos stream free in HD quality without registration requirements. Content is optimized for desktop and mobile viewing with adaptive playback, ensuring smooth streaming of the best-rated videos across all devices.`
  }
  return {
    ...base,
    intro: `${prefaces[variant]} ${base.intro}`,
    closing: `${base.closing} ${streamingPhrases[variant]}`
  }
}

export default async function TopVideosPage({ searchParams }) {
  const page = Number(searchParams?.page || 1)
  const res = await api.getTopRated(page, 16).catch(() => ({ records: [], data: [], videos: [], totalPages: 1, totalRecords: 0 }))
  const list = res.records || res.data || res.videos || []
  const totalPages = res.totalPages || (res.totalRecords ? Math.max(1, Math.ceil(Number(res.totalRecords) / 16)) : 1)
  const totalRecords = res.totalRecords || 0

  // Fetch custom content from admin (page 1 only)
  let customContent = null
  if (page === 1) {
    try { customContent = await api.getCustomContent('popular', 'popular') } catch { }
  }

  const content = page === 1 && !customContent ? generateTopVideosContent(list, totalRecords, totalPages) : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Top Rated Videos</h1>
        <p className="text-gray-400 mt-1 text-sm">Showing page {page} of {totalPages} ({totalRecords} total videos)</p>
      </div>

      <div className="grid video-grid">
        {list.map((v, idx) => (
          <VideoCard key={v._id || idx} video={v} />
        ))}
      </div>

      <Pagination basePath="/top-videos?" currentPage={page} totalPages={totalPages} />

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
          <h2 className="text-xl font-semibold mb-4">About Top Rated Videos</h2>
          <p>{content.intro}</p>
          <p>{content.details}</p>
          <p>{content.navigation}</p>
          <p>{content.closing}</p>
        </div>
      )}
    </div>
  )
}
