import { api } from '../lib/api'
import VideoCard from '../components/VideoCard'
import Pagination from '../components/Pagination'

export const revalidate = 60

export const metadata = {
  title: 'Hijabi Videos',
  description: 'Watch Hijabi videos on bestprn with high-quality streaming.',
  alternates: { canonical: '/hijabi' },
}

// Generate unique content from videos
function generateHijabiContent(videos, totalRecords, totalPages) {
  // Brand-salted variant to differentiate bestprn output
  const brandSalt = 'bestprn'.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const seed = 'hijabi'.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const variant = (seed + brandSalt) % 5
  const prefaces = [
    'bestprn editors curate Hijabi content for clarity and speed.',
    'On bestprn, Hijabi is organized with clean UX and fast load.',
    'This bestprn Hijabi shelf balances variety with lightweight design.',
    'bestprn prioritizes smooth playback and a clutter‑free layout here.',
    'Our Hijabi collection is tuned for quick discovery on bestprn.'
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
    titleMention = ` Popular themes include ${titleKeywords.slice(0, 3).join(', ')} scenarios.`
  }

  let exampleMention = ''
  if (videoTitles.length > 0) {
    const firstTitle = videoTitles[0].length > 60 ? videoTitles[0].substring(0, 60) + '...' : videoTitles[0]
    exampleMention = ` Current page includes videos like "${firstTitle}" among others.`
  }

  const base = {
    intro: `Explore ${totalRecords}+ Hijabi videos featuring Muslim women in traditional and modern settings. This collection celebrates modest beauty with performers wearing hijab and Islamic attire across various scenarios. Our Hijabi category showcases the unique appeal of covered beauty, from traditional modest settings to intimate private moments.`,
    details: `The Hijabi video library encompasses performers in traditional Islamic dress across solo, duo, and group scenarios. Content ranges from fully modest presentations to intimate private settings, respecting cultural context while delivering quality entertainment.${titleMention} Videos feature performers from various Muslim backgrounds with authentic cultural representation.`,
    navigation: `Browse through ${totalPages} pages of Hijabi content, with 16 videos per page organized for easy exploration. The collection is regularly updated with new releases featuring Muslim performers in hijab and traditional attire.${exampleMention}`,
    closing: `All Hijabi videos stream free in HD quality without registration requirements. Content is optimized for desktop and mobile viewing with adaptive playback, ensuring smooth streaming across all devices worldwide.`
  }
  return {
    ...base,
    intro: `${prefaces[variant]} ${base.intro}`,
    closing: `${base.closing} ${streamingPhrases[variant]}`
  }
}

export default async function HijabiPage({ searchParams }) {
  const page = Number(searchParams?.page || 1)
  const res = await api.getHijabi(page, 16).catch(() => ({ data: [], records: [], totalPages: 1, totalRecords: 0 }))
  const listRaw = Array.isArray(res) ? res : (res.data || res.records || res.hijabi || [])
  const list = Array.isArray(listRaw) ? listRaw : []
  const totalPages = (res.totalPages || (res.totalRecords ? Math.max(1, Math.ceil(Number(res.totalRecords) / 16)) : 1)) || 1
  const totalRecords = res.totalRecords || 0

  // Fetch custom content from admin (page 1 only)
  let customContent = null
  if (page === 1) {
    try { customContent = await api.getCustomContent('hijabi', 'hijabi') } catch { }
  }

  const content = page === 1 && !customContent ? generateHijabiContent(list, totalRecords, totalPages) : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Hijabi Videos</h1>
        <p className="text-gray-400 mt-1 text-sm">Showing page {page} of {totalPages} ({totalRecords} total videos)</p>
      </div>

      <div className="grid video-grid">
        {list.map((v, idx) => (
          <VideoCard key={v._id || idx} video={v} />
        ))}
      </div>

      <Pagination basePath="/hijabi?" currentPage={page} totalPages={totalPages} />

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
          <h2 className="text-xl font-semibold mb-4">About Hijabi Videos</h2>
          <p>{content.intro}</p>
          <p>{content.details}</p>
          <p>{content.navigation}</p>
          <p>{content.closing}</p>
        </div>
      )}
    </div>
  )
}
