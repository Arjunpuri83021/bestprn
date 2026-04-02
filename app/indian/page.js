import { api } from '../lib/api'
import { fetchSeoMeta } from '../lib/seoMeta'
import VideoCard from '../components/VideoCard'
import Pagination from '../components/Pagination'

export const revalidate = 60

export async function generateMetadata() {
  const fallback = {
    title: 'bestprn Desi49 SxyPrn & BF Sex Videos | IndianGaySite on bestprn',
    description: 'desi 52 com desi 49 com dehati sex dasi sex blueflim boyfriendtv com bollywood sex bf sexy indiangaysite sxyprn bf hindi video bf hindi movie banglaxx | bestprn',
    alternates: { canonical: '/indian' },
  }

  const meta = await fetchSeoMeta('/indian')
  if (!meta) return fallback

  return {
    title: meta.metaTitle || fallback.title,
    description: meta.metaDescription || fallback.description,
    alternates: { canonical: meta.pagePath || '/indian' },
    openGraph: {
      title: meta.ogTitle || meta.metaTitle || fallback.title,
      description: meta.ogDescription || meta.metaDescription || fallback.description,
      url: meta.pagePath || '/indian',
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
function generateIndianContent(videos, totalRecords, totalPages) {
  // Brand-salted variant to differentiate bestprn output
  const brandSalt = 'bestprn'.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const seed = 'indian'.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const variant = (seed + brandSalt) % 5
  const prefaces = [
    'bestprn editors curate Indian content for clarity and speed.',
    'On bestprn, Indian is organized with clean UX and fast load.',
    'This bestprn Indian shelf balances variety with lightweight design.',
    'bestprn prioritizes smooth playback and clutter‑free layout here.',
    'Our Indian collection is tuned for quick discovery on bestprn.'
  ]
  const streamingPhrases = [
    'Enjoy uninterrupted HD streaming on any device.',
    'Playback starts fast with minimal buffering.',
    'Adaptive streams keep viewing smooth.',
    'Mobile‑first performance for fluid scrubbing.',
    'Clear visuals on efficient, lightweight pages.'
  ]
  // Extract video titles
  const videoTitles = videos.slice(0, 5).map(v => v.titel || v.title).filter(Boolean)

  // Extract keywords from titles
  const titleKeywords = videoTitles.map(title => {
    const words = title.toLowerCase().split(/[\s-]+/)
    const skipWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during']
    return words.filter(w => w.length > 3 && !skipWords.includes(w)).slice(0, 3)
  }).flat().filter((v, i, a) => a.indexOf(v) === i).slice(0, 5)

  // Meta keywords from page metadata
  const metaKeywords = ['desi', 'indiangaysite', 'sxyprn', 'dehati', 'bollywood', 'hindi', 'banglaxx']

  // Build content mentions
  let titleMention = ''
  if (titleKeywords.length > 0) {
    titleMention = ` Popular themes include ${titleKeywords.slice(0, 3).join(', ')} content.`
  }

  let metaMention = ''
  if (metaKeywords.length > 0) {
    metaMention = ` The collection features ${metaKeywords.slice(0, 4).join(', ')}, and other desi categories.`
  }

  let exampleMention = ''
  if (videoTitles.length > 0) {
    const firstTitle = videoTitles[0].length > 60 ? videoTitles[0].substring(0, 60) + '...' : videoTitles[0]
    exampleMention = ` Current page includes videos like "${firstTitle}" among others.`
  }

  const base = {
    intro: `Explore ${totalRecords}+ Indian desi videos featuring authentic South Asian content in high definition. This collection celebrates Indian performers across various scenarios, from traditional desi settings to modern productions. Our Indian category showcases the diversity and sensuality of the subcontinent with content ranging from amateur homemade recordings to professional studio productions.`,
    details: `The Indian video library encompasses desi performers in solo, duo, and group scenarios. Content includes Bollywood-inspired productions, village-themed dehati content, and urban Indian scenarios.${metaMention}${titleMention} Videos maintain cultural authenticity while delivering quality entertainment with proper production values.`,
    navigation: `Browse through ${totalPages} pages of Indian content, with 16 videos per page organized for easy exploration. The collection is regularly updated with new desi releases, balancing popular Indian favorites with fresh content.${exampleMention}`,
    closing: `All Indian videos stream free in HD quality without registration requirements. Content is optimized for desktop and mobile viewing with adaptive playback, ensuring smooth streaming of desi content across all devices and connection speeds worldwide.`
  }
  return {
    ...base,
    intro: `${prefaces[variant]} ${base.intro}`,
    closing: `${base.closing} ${streamingPhrases[variant]}`
  }
}

export default async function IndianPage({ searchParams }) {
  const page = Number(searchParams?.page || 1)
  const res = await api.getIndians(page, 16).catch(() => ({ data: [], records: [], totalPages: 1, totalRecords: 0 }))
  const list = res.records || res.data || []
  const totalPages = res.totalPages || (res.totalRecords ? Math.max(1, Math.ceil(Number(res.totalRecords) / 16)) : 1)
  const totalRecords = res.totalRecords || 0

  // Fetch custom content from admin (page 1 only)
  let customContent = null
  if (page === 1) {
    try { customContent = await api.getCustomContent('indian', 'indian') } catch { }
  }

  // Generate unique content for page 1 (fallback)
  const content = page === 1 && !customContent ? generateIndianContent(list, totalRecords, totalPages) : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Indian Videos</h1>
        <p className="text-gray-400 mt-1 text-sm">Showing page {page} of {totalPages} ({totalRecords} total videos)</p>
      </div>

      {/* Video Grid */}
      <div className="grid video-grid">
        {list.map((v, idx) => (
          <VideoCard key={v._id || idx} video={v} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination basePath="/indian?" currentPage={page} totalPages={totalPages} />

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
          <h2 className="text-xl font-semibold mb-4">About Indian Desi Videos</h2>
          <p>{content.intro}</p>
          <p>{content.details}</p>
          <p>{content.navigation}</p>
          <p>{content.closing}</p>
        </div>
      )}
    </div>
  )
}
