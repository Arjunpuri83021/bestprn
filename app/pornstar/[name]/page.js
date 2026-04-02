import { api } from '../../lib/api'
import { fetchSeoMeta } from '../../lib/seoMeta'
import VideoCard from '../../components/VideoCard'
import Pagination from '../../components/Pagination'

export const revalidate = 60

export async function generateMetadata({ params, searchParams }) {
  const name = decodeURIComponent(params.name)
  const page = Number(searchParams?.page || 1)
  const displayName = name.replace(/-/g, ' ')
  const fallbackTitle = `bestprn - ${displayName} xvids porno missax trisha paytas porn`
  const fallbackDescription = `sexy movie super movie ${displayName}. chinese family sex huge tits Porn Videos big natural boobs download vporn sex videos`

  const basePath = `/pornstar/${params.name}`
  const seoMeta = await fetchSeoMeta(basePath)
  const title = seoMeta?.metaTitle || fallbackTitle
  const description = seoMeta?.metaDescription || fallbackDescription

  const canonicalBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://bestprn.com'
  const canonical = `${canonicalBase}${basePath}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: seoMeta?.ogTitle || seoMeta?.metaTitle || title,
      description: seoMeta?.ogDescription || seoMeta?.metaDescription || description,
      url: canonical,
      type: 'profile',
      images: seoMeta?.ogImage ? [{ url: seoMeta.ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: seoMeta?.metaTitle || title,
      description: seoMeta?.metaDescription || description,
      images: seoMeta?.ogImage ? [seoMeta.ogImage] : undefined,
    },
  }
}

async function getData(name, page) {
  const res = await api.getPornstarVideos(name, page, 16).catch(() => ({ records: [], data: [], totalPages: 1, totalRecords: 0 }))
  return { list: res.records || res.data || [], totalPages: res.totalPages || 1, totalRecords: res.totalRecords || 0 }
}

async function getCustomContent(name) {
  try {
    return await api.getCustomContent('pornstar', name)
  } catch {
    return null
  }
}

// Generate unique content based on performer and actual videos
function generatePerformerContent(name, totalRecords, totalPages, videos) {
  const displayName = name.replace(/-/g, ' ')

  // Extract data from actual videos on page
  const videoTitles = videos.slice(0, 5).map(v => v.titel || v.title).filter(Boolean)
  const allTags = [...new Set(videos.flatMap(v => v.tags || []).filter(Boolean))].slice(0, 10)

  // Fix: Calculate average views properly (convert string to number if needed)
  const validVideos = videos.filter(v => v.views && !isNaN(Number(v.views)))
  const avgViews = validVideos.length > 0
    ? Math.round(validVideos.reduce((sum, v) => sum + Number(v.views), 0) / validVideos.length)
    : 0

  // Fix: Calculate average duration properly (convert string to number if needed)
  const validDurations = videos.filter(v => v.minutes && !isNaN(Number(v.minutes)))
  const avgDuration = validDurations.length > 0
    ? Math.round(validDurations.reduce((sum, v) => sum + Number(v.minutes), 0) / validDurations.length)
    : 0

  const coPerformers = [...new Set(videos.flatMap(v => (v.name || []).filter(n => n.toLowerCase() !== name.toLowerCase())))].slice(0, 5)

  // Extract keywords from video titles for content generation
  const titleKeywords = videoTitles.map(title => {
    const words = title.toLowerCase().split(/[\s-]+/)
    const skipWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during']
    return words.filter(w => w.length > 3 && !skipWords.includes(w)).slice(0, 3)
  }).flat().filter((v, i, a) => a.indexOf(v) === i).slice(0, 5)

  // Generate seed for consistent variation (salted by brand to differ from other sites)
  const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const brandSalt = 'bestprn'.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const variant = (seed + brandSalt) % 5

  const getIntro = () => {
    // Fixed view text calculation
    let viewText = 'featuring both popular favorites and newer releases'
    if (avgViews > 0) {
      if (avgViews > 1000000) {
        viewText = `with videos averaging over ${(avgViews / 1000000).toFixed(1)}M views`
      } else if (avgViews > 100000) {
        viewText = `with content averaging ${(avgViews / 1000).toFixed(0)}K views per video`
      } else if (avgViews > 10000) {
        viewText = `with videos averaging ${(avgViews / 1000).toFixed(1)}K views`
      } else if (avgViews > 1000) {
        viewText = `with content averaging ${(avgViews / 1000).toFixed(1)}K views per video`
      } else if (avgViews > 100) {
        viewText = `with an average of ${avgViews} views per video`
      }
    }

    return [
      `Explore ${totalRecords}+ videos featuring ${displayName} in high definition. This collection showcases diverse performances ${viewText}, demonstrating strong viewer engagement and content quality.`,
      `Watch ${totalRecords}+ ${displayName} videos spanning various categories and scenarios. The collection includes ${viewText}, reflecting the performer's popularity and appeal.`,
      `Discover ${totalRecords}+ scenes starring ${displayName} across multiple genres. This extensive library features content ${viewText}, offering something for every preference.`,
      `Browse ${totalRecords}+ ${displayName} videos in crystal-clear HD quality. The performer's work ${viewText} showcases consistent audience interest and satisfaction.`,
      `Access ${totalRecords}+ videos featuring ${displayName} in diverse scenarios and settings. Content ${viewText} indicates strong viewer reception and repeat engagement.`
    ][variant]
  }

  const getDetails = () => {
    // Build category mentions from actual videos
    let categoryMention = ''
    if (allTags.length > 0) {
      const formattedTags = allTags.slice(0, 6).map(t => t.replace(/-/g, ' '))
      if (allTags.length <= 3) {
        categoryMention = ` ${displayName}'s content on this page includes ${formattedTags.join(', ')} scenes.`
      } else {
        categoryMention = ` This page features ${displayName} in ${formattedTags.slice(0, 3).join(', ')}, ${formattedTags.slice(3, 5).join(', ')}${allTags.length > 5 ? `, and ${allTags.length - 5} other categories` : ''}.`
      }
    }

    // Build co-performer mentions
    let coPerformerMention = ''
    if (coPerformers.length > 0) {
      const formattedCoPerformers = coPerformers.map(p => p.replace(/-/g, ' '))
      if (coPerformers.length === 1) {
        coPerformerMention = ` Featured pairings include scenes with ${formattedCoPerformers[0]}.`
      } else if (coPerformers.length === 2) {
        coPerformerMention = ` This page includes collaborations with ${formattedCoPerformers[0]} and ${formattedCoPerformers[1]}.`
      } else {
        coPerformerMention = ` Co-stars on this page include ${formattedCoPerformers[0]}, ${formattedCoPerformers[1]}${coPerformers.length > 2 ? `, and ${coPerformers.length - 2} other performers` : ''}.`
      }
    }

    // Build duration mention
    let durationMention = ''
    if (avgDuration > 0) {
      durationMention = avgDuration > 30
        ? ` Videos average ${avgDuration} minutes, providing substantial content with proper scene development.`
        : avgDuration > 15
          ? ` Scenes average ${avgDuration} minutes, offering well-paced content without unnecessary padding.`
          : ` Content averages ${avgDuration} minutes, focusing on core action with efficient pacing.`
    }

    // Build title-based content mention
    let titleContentMention = ''
    if (titleKeywords.length > 0) {
      titleContentMention = ` Popular themes in ${displayName}'s videos include ${titleKeywords.slice(0, 3).join(', ')} scenarios.`
    }

    const baseDetails = [
      `${displayName}'s performances span professional studio productions and select collaborations. Each video showcases the performer's range and on-screen presence across different scenarios.`,
      `The collection features ${displayName} in both leading and ensemble roles. Content includes solo performances, duo scenes, and group scenarios with varying production styles.`,
      `${displayName}'s work encompasses mainstream productions and niche content. Videos maintain high technical standards with professional lighting, camera work, and audio quality.`,
      `This ${displayName} library includes content from established studios and independent producers. The performer's versatility is evident across different genres and scene types.`,
      `${displayName}'s catalog represents diverse content from various sources. Productions range from high-budget studio releases to intimate, focused performances.`
    ][variant]

    return baseDetails + categoryMention + coPerformerMention + durationMention + titleContentMention
  }

  const getNavigation = () => {
    // Add example video title
    let exampleMention = ''
    if (videoTitles.length > 0) {
      const firstTitle = videoTitles[0].length > 60 ? videoTitles[0].substring(0, 60) + '...' : videoTitles[0]
      exampleMention = ` Current page includes videos like "${firstTitle}"${videoTitles.length > 1 ? ' among other scenes' : ''}.`
    }

    const baseNav = [
      `Navigate ${totalPages} pages of ${displayName} content, with 16 videos per page organized for easy browsing. Use pagination controls to explore the complete collection.`,
      `Browse through ${totalPages} pages featuring 16 ${displayName} videos each. The pagination system enables efficient navigation through the entire catalog.`,
      `Explore ${totalPages} pages of ${displayName} scenes, each displaying 16 thumbnails with preview details. Content is continuously updated with new releases.`,
      `Access ${totalPages} pages of ${displayName} videos with 16 scenes per page. The collection is organized to showcase variety across different pages.`,
      `The ${displayName} collection spans ${totalPages} pages with 16 high-quality videos each. Page navigation allows discovery throughout the extensive library.`
    ][variant]

    return baseNav + exampleMention
  }

  const getClosing = () => {
    return [
      `All ${displayName} videos stream free in HD quality without registration requirements. Content is optimized for desktop and mobile viewing with adaptive playback.`,
      `Watch ${displayName} content instantly with free streaming in high definition. Videos play smoothly across all modern browsers and mobile devices.`,
      `Stream ${displayName} videos for free with no hidden fees or subscription requirements. Content delivers in HD quality with minimal buffering on any device.`,
      `${displayName} videos are available for immediate free streaming in HD quality. The platform supports seamless playback on desktop, tablet, and smartphone devices.`,
      `Enjoy ${displayName} content with unlimited free streaming in high definition. No account creation needed for viewing, with full mobile and desktop compatibility.`
    ][variant]
  }

  return {
    intro: getIntro(),
    details: getDetails(),
    navigation: getNavigation(),
    closing: getClosing()
  }
}

export default async function PornstarPage({ params, searchParams }) {
  const name = decodeURIComponent(params.name)
  const page = Number(params.page || searchParams?.page || 1)
  const { list, totalPages, totalRecords } = await getData(name, page)

  // Fetch custom content from admin (page 1 only)
  const customContent = page === 1 ? await getCustomContent(params.name) : null

  // Generate unique content for page 1 using actual videos (fallback if no custom content)
  const content = page === 1 && !customContent ? generatePerformerContent(name, totalRecords, totalPages, list) : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold capitalize">{name.replace(/-/g, ' ')} Porn Videos</h1>
        <p className="text-gray-400 mt-1 text-sm">Showing page {page} of {totalPages} ({totalRecords} total videos)</p>
      </div>

      {/* Video Grid - Shows First */}
      <div className="grid video-grid">
        {list.map((v, idx) => (
          <VideoCard key={v._id || idx} video={v} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination basePath={`/pornstar/${params.name}`} currentPage={page} totalPages={totalPages} />

      {/* Custom content from admin - shows first if available */}
      {customContent && customContent.isActive && (
        <div className="mt-8 text-gray-300 leading-relaxed space-y-4 bg-gray-800/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{customContent.title}</h2>
          <div
            className="custom-content-display"
            dangerouslySetInnerHTML={{ __html: String(customContent.content || '').replace(/\n/g, '<br>') }}
          />
        </div>
      )}

      {/* Fallback: Auto-generated content if no custom content */}
      {!customContent && content && (
        <div className="mt-8 text-gray-300 leading-relaxed space-y-4 bg-gray-800/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">About {name.replace(/-/g, ' ')} Videos</h2>
          <p>{content.intro}</p>
          <p>{content.details}</p>
          <p>{content.navigation}</p>
          <p>{content.closing}</p>
        </div>
      )}
    </div>
  )
}
