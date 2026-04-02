import { api } from '../lib/api'
import VideoCard from '../components/VideoCard'
import Pagination from '../components/Pagination'

export const revalidate = 60

export const metadata = {
  title: 'bestprn fsiblog df6 org df6org dinotube draftsex drtuber fsiblog com |',
  description: 'gekso fsiblog com fsiblog fry99 com english bf video elephant tube bad wap beeg hindi draftsex dinotube df6 org tiktits 3gp king icegay xxxhd sex18 imo sex | bestprn',
  alternates: { canonical: '/new-content' },
}

// Generate unique content from videos and meta keywords
function generateNewContentContent(videos, totalRecords, totalPages) {
  const videoTitles = videos.slice(0, 5).map(v => v.titel || v.title).filter(Boolean)
  
  const titleKeywords = videoTitles.map(title => {
    const words = title.toLowerCase().split(/[\s-]+/)
    const skipWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during']
    return words.filter(w => w.length > 3 && !skipWords.includes(w)).slice(0, 3)
  }).flat().filter((v, i, a) => a.indexOf(v) === i).slice(0, 5)
  
  const metaKeywords = ['fsiblog', 'df6org', 'dinotube', 'draftsex', 'drtuber', 'elephant', 'fry99', 'gekso']
  
  let titleMention = ''
  if (titleKeywords.length > 0) {
    titleMention = ` Latest uploads feature ${titleKeywords.slice(0, 3).join(', ')} themes.`
  }
  
  let metaMention = ''
  if (metaKeywords.length > 0) {
    metaMention = ` The collection includes fresh content from ${metaKeywords.slice(0, 4).join(', ')}, and other premium sources.`
  }
  
  let exampleMention = ''
  if (videoTitles.length > 0) {
    const firstTitle = videoTitles[0].length > 60 ? videoTitles[0].substring(0, 60) + '...' : videoTitles[0]
    exampleMention = ` Recent additions include videos like "${firstTitle}" among others.`
  }
  
  return {
    intro: `Explore ${totalRecords}+ newest content uploaded to our platform in high definition. This collection features the latest releases across all categories, updated daily with fresh videos from various performers and studios. Our New Content section ensures you never miss the most recent additions to our extensive video library.`,
    details: `The New Content library showcases the latest uploads across multiple genres and categories. Videos include fresh releases from established performers, debut content from new talent, and recent productions from various studios.${metaMention}${titleMention} Content is sorted by upload date with the newest videos appearing first, ensuring you always see the latest additions to our platform.`,
    navigation: `Browse through ${totalPages} pages of new content, with 16 videos per page organized chronologically by upload date. The collection updates daily with fresh uploads from various sources, making it easy to discover the latest releases across all categories and performers.${exampleMention}`,
    closing: `All new content streams free in HD quality without registration requirements. Videos are optimized for desktop and mobile viewing with adaptive playback, ensuring smooth streaming of the latest releases across all devices and connection speeds.`
  }
}

export default async function NewContentPage({ searchParams }) {
  const page = Number(searchParams?.page || 1)
  const res = await api.getNewVideos(page, 16).catch(() => ({ data: [], records: [], videos: [], totalPages: 1, totalRecords: 0 }))
  const list = res.records || res.data || res.videos || []
  const totalPages = res.totalPages || (res.totalRecords ? Math.max(1, Math.ceil(Number(res.totalRecords) / 16)) : 1)
  const totalRecords = res.totalRecords || 0
  
  // Generate unique content for page 1
  const content = page === 1 ? generateNewContentContent(list, totalRecords, totalPages) : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">New Content</h1>
        <p className="text-gray-400 mt-1 text-sm">Showing page {page} of {totalPages} ({totalRecords} total videos)</p>
      </div>
      
      {/* Video Grid */}
      <div className="grid video-grid">
        {list.map((v, idx) => (
          <VideoCard key={v._id || idx} video={v} />
        ))}
      </div>
      
      {/* Pagination */}
      <Pagination basePath="/new-content?" currentPage={page} totalPages={totalPages} />
      
      {/* Unique content section - Below videos, only on page 1 */}
      {content && (
        <div className="mt-8 text-gray-300 leading-relaxed space-y-4 bg-gray-800/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">About New Content</h2>
          <p>{content.intro}</p>
          <p>{content.details}</p>
          <p>{content.navigation}</p>
          <p>{content.closing}</p>
        </div>
      )}
    </div>
  )
}
