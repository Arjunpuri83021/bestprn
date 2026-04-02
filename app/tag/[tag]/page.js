import Link from 'next/link'
import { api } from '../../lib/api'
import { fetchSeoMeta } from '../../lib/seoMeta'
import VideoCard from '../../components/VideoCard'
import Pagination from '../../components/Pagination'

export async function generateMetadata({ params, searchParams }) {
  const tag = decodeURIComponent(params.tag)
  const page = Number(searchParams?.page || 1)
  const titleTag = tag.replace(/-/g, ' ')
  // Fetch minimal data to enrich meta (total count + first image)
  let totalRecords = 0
  let totalPages = 1
  let ogImage = null
  try {
    const res = await api.getPostsByTag(tag, 1, 1)
    const first = (res?.records || res?.data || [])[0]
    totalRecords = Number(res?.totalRecords || 0)
    totalPages = Number(res?.totalPages || 1)
    ogImage = first?.imageUrl || null
  } catch {}

  const fallbackBaseTitle = `${titleTag} Porn Videos`
  const fallbackTitle = page > 1
    ? `${fallbackBaseTitle} – Page ${page} | bestprn`
    : `${fallbackBaseTitle} – Free ${titleTag} Sex in HD | bestprn`

  const fallbackDescription = page > 1
    ? `Browse page ${page}${totalPages ? ` of ${totalPages}` : ''} for the best ${titleTag} porn videos in HD on bestprn. Free streaming, updated daily.${totalRecords ? ` ${totalRecords}+ videos available.` : ''}`
    : `Watch the best ${titleTag} porn videos in HD on bestprn. Free streaming, updated daily.${totalRecords ? ` ${totalRecords}+ videos available.` : ''}`

  const basePath = `/tag/${params.tag}`
  const seoMeta = await fetchSeoMeta(basePath)
  const baseTitle = seoMeta?.metaTitle || fallbackBaseTitle
  const baseDescription = seoMeta?.metaDescription || fallbackDescription
  const title = page > 1 ? `${baseTitle} – Page ${page}` : baseTitle
  const description = page > 1 ? `${baseDescription} (Page ${page})` : baseDescription

  const canonicalBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://bestprn.com'
  const canonical = page > 1
    ? `${canonicalBase}/tag/${params.tag}/${page}`
    : `${canonicalBase}/tag/${params.tag}`

  return {
    title,
    description,
    alternates: { canonical },
    keywords: [
      `${titleTag} porn`, `${titleTag} sex videos`, `${titleTag} hd`, `${titleTag} xxx`,
      'bestprn', 'free porn', 'hd porn videos'
    ],
    robots: {
      index: true,
      follow: true,
      maxImagePreview: 'large',
      maxSnippet: -1,
      maxVideoPreview: -1,
    },
    openGraph: {
      title: seoMeta?.ogTitle || seoMeta?.metaTitle || title,
      description: seoMeta?.ogDescription || seoMeta?.metaDescription || description,
      url: canonical,
      type: 'website',
      images: (seoMeta?.ogImage || ogImage) ? [{ url: seoMeta?.ogImage || ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: seoMeta?.metaTitle || title,
      description: seoMeta?.metaDescription || description,
      images: (seoMeta?.ogImage || ogImage) ? [seoMeta?.ogImage || ogImage] : undefined,
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

async function getCustomContent(tag) {
  try {
    return await api.getCustomContent('tag', tag)
  } catch {
    return null
  }
}

// Generate unique content based on tag and actual videos
function generateTagContent(tag, totalRecords, totalPages, page, videos) {
  const tagName = tag.replace(/-/g, ' ')
  const tagLower = tag.toLowerCase()
  
  // Extract data from actual videos on page
  const videoTitles = videos.slice(0, 5).map(v => v.titel || v.title).filter(Boolean)
  const performers = [...new Set(videos.flatMap(v => v.name || []).filter(Boolean))].slice(0, 5)
  const allTags = [...new Set(videos.flatMap(v => v.tags || []).filter(Boolean))].slice(0, 8)
  
  // Fix: Calculate average views properly (convert string to number if needed)
  const validVideos = videos.filter(v => v.views && !isNaN(Number(v.views)))
  const avgViews = validVideos.length > 0 
    ? Math.round(validVideos.reduce((sum, v) => sum + Number(v.views), 0) / validVideos.length) 
    : 0
  
  // Extract keywords from video titles for content generation
  const titleKeywords = videoTitles.map(title => {
    // Extract meaningful words (skip common words)
    const words = title.toLowerCase().split(/[\s-]+/)
    const skipWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during']
    return words.filter(w => w.length > 3 && !skipWords.includes(w)).slice(0, 3)
  }).flat().filter((v, i, a) => a.indexOf(v) === i).slice(0, 5)
  
  // Generate seed for consistent variation (salted by brand to differ from other sites)
  const seed = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const brandSalt = 'bestprn'.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const variant = (seed + brandSalt) % 5
  
  // Tag-specific content patterns
  const getIntro = () => {
    if (tagLower.includes('amateur')) {
      return [
        `Discover ${totalRecords}+ authentic amateur ${tagName} videos featuring real people in genuine scenarios. Our collection showcases unscripted content that captures natural chemistry and spontaneous moments.`,
        `Browse through ${totalRecords}+ amateur ${tagName} scenes with authentic performances from real enthusiasts. This category emphasizes genuine passion over professional production.`,
        `Explore our extensive library of ${totalRecords}+ amateur ${tagName} content, featuring everyday people sharing their intimate moments in high definition.`,
        `Watch ${totalRecords}+ authentic amateur ${tagName} videos that prioritize real chemistry and natural interactions over scripted scenarios.`,
        `Our amateur ${tagName} collection features ${totalRecords}+ videos of genuine content from real people, offering an authentic viewing experience.`
      ][variant]
    }
    
    if (tagLower.includes('milf')) {
      return [
        `Experience ${totalRecords}+ videos featuring experienced performers in our ${tagName} category. This collection showcases mature talent with years of expertise.`,
        `Browse ${totalRecords}+ ${tagName} scenes starring seasoned performers who bring confidence and skill to every video.`,
        `Discover ${totalRecords}+ ${tagName} videos featuring mature performers known for their experience and captivating screen presence.`,
        `Watch ${totalRecords}+ ${tagName} scenes with experienced talent delivering professional performances in high definition.`,
        `Our ${tagName} collection includes ${totalRecords}+ videos showcasing mature performers with established careers and devoted fanbases.`
      ][variant]
    }
    
    if (tagLower.includes('teen') || tagLower.includes('young')) {
      return [
        `Explore ${totalRecords}+ ${tagName} videos featuring youthful performers in their prime. All content features legal adults 18+ in age-verified productions.`,
        `Browse ${totalRecords}+ ${tagName} scenes with energetic young performers bringing fresh enthusiasm to every video. All performers are verified 18+.`,
        `Discover ${totalRecords}+ ${tagName} videos showcasing youthful talent in professional productions. Age verification ensures all performers are legal adults.`,
        `Watch ${totalRecords}+ ${tagName} content featuring young performers 18+ in high-quality productions with proper age documentation.`,
        `Our ${tagName} category features ${totalRecords}+ videos with youthful performers, all verified as legal adults in compliance with regulations.`
      ][variant]
    }
    
    if (tagLower.includes('anal')) {
      return [
        `Browse ${totalRecords}+ ${tagName} videos featuring skilled performers in this specialized category. Our collection includes both professional and amateur content.`,
        `Explore ${totalRecords}+ ${tagName} scenes with experienced performers who specialize in this content type, filmed in high definition.`,
        `Discover ${totalRecords}+ ${tagName} videos showcasing performers with expertise in this category, updated regularly with new releases.`,
        `Watch ${totalRecords}+ ${tagName} content from various studios and independent creators, offering diverse perspectives on this popular category.`,
        `Our ${tagName} collection features ${totalRecords}+ videos with performers known for their work in this specialized content area.`
      ][variant]
    }
    
    if (tagLower.includes('blowjob') || tagLower.includes('oral')) {
      return [
        `Experience ${totalRecords}+ ${tagName} videos showcasing skilled oral performances from talented performers across various styles and settings.`,
        `Browse ${totalRecords}+ ${tagName} scenes featuring expert techniques and passionate performances captured in crystal-clear HD quality.`,
        `Discover ${totalRecords}+ ${tagName} videos with performers demonstrating their oral expertise in both professional and amateur productions.`,
        `Watch ${totalRecords}+ ${tagName} content ranging from sensual to intense, featuring diverse performers and production styles.`,
        `Our ${tagName} category includes ${totalRecords}+ videos showcasing oral skills from performers across the industry spectrum.`
      ][variant]
    }
    
    if (tagLower.includes('lesbian')) {
      return [
        `Explore ${totalRecords}+ ${tagName} videos featuring authentic chemistry between female performers in various scenarios and settings.`,
        `Browse ${totalRecords}+ ${tagName} scenes showcasing genuine connections and passionate interactions between women performers.`,
        `Discover ${totalRecords}+ ${tagName} videos with diverse pairings and scenarios, from sensual to intense girl-on-girl action.`,
        `Watch ${totalRecords}+ ${tagName} content featuring female performers in both scripted and spontaneous scenarios.`,
        `Our ${tagName} collection features ${totalRecords}+ videos celebrating female-female chemistry in high-definition productions.`
      ][variant]
    }
    
    if (tagLower.includes('asian') || tagLower.includes('ebony') || tagLower.includes('latina') || tagLower.includes('indian')) {
      return [
        `Discover ${totalRecords}+ ${tagName} videos celebrating diverse beauty and talent from performers of various backgrounds.`,
        `Browse ${totalRecords}+ ${tagName} scenes featuring performers who bring unique cultural perspectives to their work.`,
        `Explore ${totalRecords}+ ${tagName} videos showcasing talented performers in both mainstream and niche productions.`,
        `Watch ${totalRecords}+ ${tagName} content from performers across the globe, offering diverse styles and approaches.`,
        `Our ${tagName} category features ${totalRecords}+ videos highlighting the beauty and talent of diverse performers.`
      ][variant]
    }
    
    // Default intro for other tags
    return [
      `Browse our collection of ${totalRecords}+ ${tagName} videos in high definition. This category features diverse content from various performers and studios, updated regularly with new releases.`,
      `Explore ${totalRecords}+ ${tagName} videos spanning professional productions and amateur content. Our collection is curated to provide variety and quality.`,
      `Discover ${totalRecords}+ ${tagName} scenes from established studios and independent creators. This category offers something for every preference.`,
      `Watch ${totalRecords}+ ${tagName} videos featuring performers from across the industry. Our collection includes both trending and classic content.`,
      `Our ${tagName} category features ${totalRecords}+ videos carefully organized for easy browsing. Content ranges from mainstream to niche productions.`
    ][variant]
  }
  
  const getDetails = () => {
    // Build performer mention
    let performerMention = ''
    if (performers.length > 0) {
      const formattedPerformers = performers.map(p => p.replace(/-/g, ' '))
      if (performers.length === 1) {
        performerMention = ` Featured performers include ${formattedPerformers[0]}.`
      } else if (performers.length === 2) {
        performerMention = ` Popular performers in this collection include ${formattedPerformers[0]} and ${formattedPerformers[1]}.`
      } else {
        performerMention = ` This page features content from ${formattedPerformers[0]}, ${formattedPerformers[1]}, ${formattedPerformers[2]}${performers.length > 3 ? `, and ${performers.length - 3} other performers` : ''}.`
      }
    }
    
    // Build related tags mention
    let tagsMention = ''
    if (allTags.length > 2) {
      const formattedTags = allTags.slice(0, 5).map(t => t.replace(/-/g, ' '))
      tagsMention = ` Related categories include ${formattedTags.slice(0, 3).join(', ')}${allTags.length > 3 ? `, and ${formattedTags.slice(3, 5).join(', ')}` : ''}.`
    }
    
    // Build views mention (fixed calculation)
    let viewsMention = ''
    if (avgViews > 0) {
      if (avgViews > 1000000) {
        viewsMention = ` Videos in this category average over ${(avgViews / 1000000).toFixed(1)}M views, indicating exceptional viewer interest.`
      } else if (avgViews > 100000) {
        viewsMention = ` Content averages ${(avgViews / 1000).toFixed(0)}K views per video, showing strong popularity.`
      } else if (avgViews > 10000) {
        viewsMention = ` Videos average ${(avgViews / 1000).toFixed(1)}K views, indicating solid viewer engagement.`
      } else if (avgViews > 1000) {
        viewsMention = ` Content averages ${(avgViews / 1000).toFixed(1)}K views per video.`
      } else if (avgViews > 100) {
        viewsMention = ` Videos receive an average of ${avgViews} views each.`
      } else {
        viewsMention = ` This collection includes both popular favorites and newer additions.`
      }
    }
    
    // Build title-based content mention
    let titleContentMention = ''
    if (titleKeywords.length > 0) {
      titleContentMention = ` Popular themes in this collection include ${titleKeywords.slice(0, 3).join(', ')} content.`
    }
    
    const baseDetails = [
      `This ${tagName} section includes content ranging from professional studio productions to authentic amateur scenes. Each video is carefully categorized and tagged to help you find exactly what you're looking for.`,
      `Our ${tagName} library encompasses both high-budget professional content and genuine amateur contributions. Videos are organized by popularity, upload date, and viewer ratings.`,
      `The ${tagName} category showcases content from multiple sources including major studios, independent producers, and amateur contributors. Each video maintains high technical standards with HD quality.`,
      `Within the ${tagName} section, you'll find videos featuring solo performances, couples, and group scenarios. Production values range from professional multi-camera setups to intimate homemade recordings.`,
      `This ${tagName} collection represents a curated selection from thousands of submissions. Videos feature diverse performers, settings, and scenarios within the category theme.`
    ][variant]
    
    return baseDetails + performerMention + tagsMention + viewsMention + titleContentMention
  }
  
  const getNavigation = () => {
    // Add example video titles if available
    let exampleMention = ''
    if (videoTitles.length > 0) {
      const firstTitle = videoTitles[0].length > 60 ? videoTitles[0].substring(0, 60) + '...' : videoTitles[0]
      exampleMention = ` Current page includes videos like "${firstTitle}"${videoTitles.length > 1 ? ' among others' : ''}.`
    }
    
    const baseNav = [
      `Browse through ${totalPages} pages of ${tagName} content, with 16 carefully selected videos per page. Use the pagination controls below to explore the full collection.`,
      `Navigate ${totalPages} pages featuring 16 ${tagName} videos each. The pagination system allows easy browsing of the entire catalog.`,
      `Explore ${totalPages} pages of ${tagName} videos, each page displaying 16 thumbnails with preview information. The collection is continuously updated with new content.`,
      `The ${tagName} category spans ${totalPages} pages with 16 videos per page for optimal browsing. Use page navigation to discover content throughout the collection.`,
      `Access ${totalPages} pages of ${tagName} content, each featuring 16 high-quality videos. The pagination system ensures smooth navigation through the extensive library.`
    ][variant]
    
    return baseNav + exampleMention
  }
  
  const getClosing = () => {
    return [
      `All ${tagName} videos are available for free streaming in HD quality. No registration required to watch, though creating an account enables features like favorites and playlists. Content is optimized for desktop and mobile viewing.`,
      `Stream ${tagName} content instantly without downloads or registration. Videos play in HD quality with adaptive streaming for your connection speed. The platform supports all modern browsers and mobile devices.`,
      `Watch ${tagName} videos for free with no hidden fees or subscription requirements. Content streams in high definition with minimal buffering. The site is optimized for both desktop computers and mobile devices.`,
      `Access ${tagName} content immediately with free streaming in HD quality. Videos are hosted on reliable servers for smooth playback. The platform works seamlessly across devices and screen sizes.`,
      `Enjoy ${tagName} videos with free, unlimited streaming in high definition. No account creation necessary for basic viewing. Content is accessible on desktop, tablet, and smartphone devices.`
    ][variant]
  }
  
  return {
    intro: getIntro(),
    details: getDetails(),
    navigation: getNavigation(),
    closing: getClosing()
  }
}

export default async function TagPage({ params, searchParams }) {
  const tag = decodeURIComponent(params.tag)
  const page = Number(params.page || searchParams?.page || 1)
  const { list, totalPages, totalRecords } = await getData(tag, page)
  
  const customContent = page === 1 ? await getCustomContent(tag) : null

  // Generate unique content for page 1 using actual videos (fallback)
  const content = page === 1 && !customContent ? generateTagContent(tag, totalRecords, totalPages, page, list) : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold capitalize">{tag.replace(/-/g, ' ')} Sex Videos</h1>
        <p className="text-gray-400 mt-1 text-sm">Showing page {page} of {totalPages} ({totalRecords} total videos)</p>
      </div>

      {/* Video Grid - Shows First */}
      <div className="grid video-grid">
        {list.map((v, idx) => (
          <VideoCard key={v._id || idx} video={v} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination basePath={`/tag/${params.tag}`} currentPage={page} totalPages={totalPages} />

      {customContent && customContent.isActive && (
        <div className="mt-8 text-gray-300 leading-relaxed space-y-4 bg-gray-800/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{customContent.title}</h2>
          <div
            className="custom-content-display"
            dangerouslySetInnerHTML={{ __html: String(customContent.content || '').replace(/\n/g, '<br>') }}
          />
        </div>
      )}

      {/* Fallback to generated content if no custom content */}
      {!customContent && content && (
        <div className="mt-8 text-gray-300 leading-relaxed space-y-4 bg-gray-800/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">About {tag.replace(/-/g, ' ')} Sex Videos</h2>
          <p>{content.intro}</p>
          <p>{content.details}</p>
          <p>{content.navigation}</p>
          <p>{content.closing}</p>
        </div>
      )}
    </div>
  )
}
