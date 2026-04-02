import { api } from '../lib/api'
import VideoCard from '../components/VideoCard'
import Pagination from '../components/Pagination'

export const revalidate = 60

export const metadata = {
  title: 'bestprn bp sexy video bravotube brazzers3x brezzar comxxx blueflim | bestprn',
  description: 'boobs kiss bravotube boobs pressing blueflim brazzers3x dasi sex dehati sex brezzar bfxxx comxxx bf sexy banglaxx beeg hindi blueflim auntymaza adult movies | bestprn',
  alternates: { canonical: '/muslim' },
}

// Generate unique content from videos and meta keywords
function generateMuslimContent(videos, totalRecords, totalPages) {
  const videoTitles = videos.slice(0, 5).map(v => v.titel || v.title).filter(Boolean)
  
  const titleKeywords = videoTitles.map(title => {
    const words = title.toLowerCase().split(/[\s-]+/)
    const skipWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during']
    return words.filter(w => w.length > 3 && !skipWords.includes(w)).slice(0, 3)
  }).flat().filter((v, i, a) => a.indexOf(v) === i).slice(0, 5)
  
  const metaKeywords = ['bravotube', 'brazzers', 'comxxx', 'blueflim', 'dehati', 'banglaxx']
  
  let titleMention = ''
  if (titleKeywords.length > 0) {
    titleMention = ` Popular themes include ${titleKeywords.slice(0, 3).join(', ')} content.`
  }
  
  let metaMention = ''
  if (metaKeywords.length > 0) {
    metaMention = ` The collection features content from ${metaKeywords.slice(0, 3).join(', ')}, and other premium sources.`
  }
  
  let exampleMention = ''
  if (videoTitles.length > 0) {
    const firstTitle = videoTitles[0].length > 60 ? videoTitles[0].substring(0, 60) + '...' : videoTitles[0]
    exampleMention = ` Current page includes videos like "${firstTitle}" among others.`
  }
  
  return {
    intro: `Explore ${totalRecords}+ Muslim videos featuring performers from Islamic backgrounds in various scenarios. This collection celebrates Muslim beauty and sensuality with content ranging from traditional modest settings to intimate private moments. Our Muslim category showcases diverse performers respecting cultural context while delivering quality entertainment.`,
    details: `The Muslim video library encompasses performers in both traditional and modern settings across solo, duo, and group scenarios.${metaMention}${titleMention} Content maintains cultural sensitivity while featuring performers from various Muslim backgrounds with authentic representation and professional production values.`,
    navigation: `Browse through ${totalPages} pages of Muslim content, with 16 videos per page organized for easy exploration. The collection is regularly updated with new releases featuring Muslim performers across different scenarios and settings.${exampleMention}`,
    closing: `All Muslim videos stream free in HD quality without registration requirements. Content is optimized for desktop and mobile viewing with adaptive playback, ensuring smooth streaming across all devices and connection speeds worldwide.`
  }
}

export default async function MuslimPage({ searchParams }) {
  const page = Number(searchParams?.page || 1)
  const res = await api.getHijabi(page, 16).catch(() => ({ data: [], records: [], totalPages: 1, totalRecords: 0 }))
  const listRaw = Array.isArray(res) ? res : (res.data || res.records || res.hijabi || [])
  const list = Array.isArray(listRaw) ? listRaw : []
  const totalPages = (res.totalPages || (res.totalRecords ? Math.max(1, Math.ceil(Number(res.totalRecords) / 16)) : 1)) || 1
  const totalRecords = res.totalRecords || 0
  
  const content = page === 1 ? generateMuslimContent(list, totalRecords, totalPages) : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Muslim Videos</h1>
        <p className="text-gray-400 mt-1 text-sm">Showing page {page} of {totalPages} ({totalRecords} total videos)</p>
      </div>
      
      <div className="grid video-grid">
        {list.map((v, idx) => (
          <VideoCard key={v._id || idx} video={v} />
        ))}
      </div>
      
      <Pagination basePath="/muslim?" currentPage={page} totalPages={totalPages} />
      
      {content && (
        <div className="mt-8 text-gray-300 leading-relaxed space-y-4 bg-gray-800/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">About Muslim Videos</h2>
          <p>{content.intro}</p>
          <p>{content.details}</p>
          <p>{content.navigation}</p>
          <p>{content.closing}</p>
        </div>
      )}
    </div>
  )
}
