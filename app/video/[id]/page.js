import { api } from '../../lib/api'
import Link from 'next/link'
import VideoRedirect from '../../components/VideoRedirect'
import VideoCard from '../../components/VideoCard'
import Pagination from '../../components/Pagination'
import VideoDescription from '../../components/VideoDescription'
import Comments from '../../components/Comments'
import VideoSectionsClient from './VideoSectionsClient'

export const revalidate = 60

function extractMongoId(maybe) {
  if (!maybe || typeof maybe !== 'string') return maybe
  const m = maybe.match(/[a-f0-9]{24}/i)
  return m ? m[0] : maybe
}

function slugify(str = '') {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export async function generateMetadata({ params }) {
  const raw = params.id
  const id = extractMongoId(raw)
  let video
  try {
    video = await api.getVideoById(id)
  } catch (e) {
    // ignore
  }

  const title = video?.titel || video?.title || 'Video'
  
  // Enhanced SEO description with more detail
  let description = video?.desc || video?.metatitel || ''
  if (!description || description.length < 100) {
    const performers = Array.isArray(video?.name) && video.name.length > 0 
      ? ` featuring ${video.name.slice(0, 2).join(' and ')}` 
      : ''
    const categories = Array.isArray(video?.tags) && video.tags.length > 0 
      ? ` in ${video.tags.slice(0, 3).join(', ')}` 
      : ''
    const duration = video?.minutes ? ` This ${video.minutes} minute` : ' This'
    description = `Watch ${title}${performers}${categories} on bestprn.${duration} premium HD video offers high-quality entertainment with smooth streaming. Explore thousands of videos across multiple categories and discover your favorites on bestprn.com - free HD adult videos refreshed daily.`
  }
  
  const canonicalBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://bestprn.com'
  const titleSlug = slugify(title)
  const canonical = `${canonicalBase}/video/${id}${titleSlug ? `-${titleSlug}` : ''}`
  const imageUrl = video?.imageUrl || `${canonicalBase}/og-image.jpg`

  // Generate comprehensive keywords
  const keywords = [
    ...(Array.isArray(video?.tags) ? video.tags : []),
    ...(Array.isArray(video?.name) ? video.name : []),
    'bestprn', 'premium video', 'adult entertainment'
  ].filter(Boolean).join(', ')

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'bestprn',
      type: 'video.other',
      locale: 'en_US',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
      videos: video?.iframeUrl ? [
        {
          url: video.iframeUrl,
          width: 1280,
          height: 720,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@bestprn',
    },
    other: {
      'video:duration': video?.minutes ? `${video.minutes * 60}` : undefined,
      'video:release_date': video?.createdAt || undefined,
    }
  }
}

export default async function VideoDetailPage({ params, searchParams }) {
  const raw = params.id
  const id = extractMongoId(raw)
  let video = null
  try {
    video = await api.getVideoById(id)
  } catch (e) {
    // ignore
  }

  if (!video) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-semibold mb-4">Video not found</h1>
        <Link className="text-red-400 hover:text-red-300" href="/">Go back home</Link>
      </div>
    )
  }

  // Helper function to format tag/name display (replace hyphens with spaces)
  const formatDisplay = (text) => {
    if (!text) return text
    return text.replace(/-/g, ' ')
  }

  // Extract key themes from description for content generation
  const extractDescThemes = (desc) => {
    if (!desc || desc.length < 20) return null
    
    // Clean and process desc
    const cleanDesc = desc.toLowerCase()
    
    // Extract key phrases and themes
    const themes = []
    
    // Check for action keywords
    const actionKeywords = ['watch', 'online', 'stream', 'download', 'enjoy', 'experience']
    const hasAction = actionKeywords.some(kw => cleanDesc.includes(kw))
    
    // Check for quality keywords  
    const qualityKeywords = ['hd', 'high quality', '1080p', '720p', 'full hd', 'crystal clear']
    const quality = qualityKeywords.find(kw => cleanDesc.includes(kw)) || 'HD'
    
    // Check for duration
    const durationMatch = desc.match(/(\d+:\d+)/)
    const duration = durationMatch ? durationMatch[1] : video.minutes
    
    // Extract unique parts (remove common phrases)
    let uniquePart = desc
      .replace(/watch online porn video/gi, '')
      .replace(/in high quality and download for free on/gi, 'on')
      .replace(/duration:/gi, '')
      .replace(/in this movie:/gi, 'featuring')
      .trim()
    
    return {
      hasAction,
      quality,
      duration,
      uniquePart: uniquePart.slice(0, 120),
      originalDesc: desc
    }
  }
  
  // Generate content opening based on desc, tags, and stars
  const generateContentOpening = (desc, tags, stars, contentVariant) => {
    const themes = extractDescThemes(desc)
    const firstTag = tags[0] || ''
    const firstStar = stars[0] || ''
    const secondStar = stars[1] || ''
    const formattedStars = stars.map(s => formatDisplay(s)).join(' and ')
    
    // If we have a good description, use it as the base
    if (themes && desc.length > 50 && !desc.includes(video.titel)) {
      const descOpenings = [
        `${desc} This ${firstTag || 'premium'} production${stars.length > 0 ? ` features ${formattedStars}` : ''} and delivers the quality you expect from bestprn.`,
        `Experience this exclusive content: ${desc} ${stars.length > 0 ? `Starring ${formattedStars}.` : ''} Stream now in ${themes.quality} on bestprn.`,
        `${stars.length > 0 ? `${formatDisplay(firstStar)}${secondStar ? ` and ${formatDisplay(secondStar)}` : ''} bring their best in this scene.` : 'Premium content awaits.'} ${desc} Available exclusively on bestprn.`,
        `${desc} ${stars.length > 0 ? `Watch ${formattedStars} in action` : 'Enjoy this video'} with ${firstTag ? `intense ${firstTag} moments` : 'professional production values'}.`,
        `Looking for quality ${firstTag || 'adult'} content? ${desc} ${stars.length > 0 ? `Featuring ${formattedStars}.` : ''} Stream instantly on bestprn.`
      ]
      return descOpenings[contentVariant % descOpenings.length]
    }
    
    // Fallback to generated content using desc themes
    const fallbackOpenings = [
      `${stars.length > 0 ? formatDisplay(firstStar) : 'This video'} delivers ${firstTag ? `authentic ${firstTag} action` : 'premium entertainment'}${stars.length > 1 ? ` alongside ${formatDisplay(secondStar)}` : ''}. ${themes ? themes.uniquePart : video.titel || 'This scene'} brings the heat with professional production quality on bestprn.`,
      `Get ready for ${firstTag ? `intense ${firstTag}` : 'premium'} content${stars.length > 0 ? ` starring ${formattedStars}` : ''}. ${themes?.uniquePart || 'This exclusive scene'} offers ${themes?.quality || 'HD'} quality that exceeds expectations.`,
      `${stars.length > 0 ? `${formatDisplay(firstStar)}${secondStar ? ` and ${formatDisplay(secondStar)}` : ''} showcase` : 'Experience'} ${firstTag ? `expert-level ${firstTag}` : 'captivating'} performances${themes ? ` in this ${themes.duration || video.minutes || 'full-length'} production` : ''}. ${themes?.uniquePart || ''}`,
      `${firstTag ? `A masterclass in ${firstTag} entertainment` : 'Premium content'} awaits${stars.length > 0 ? ` with ${formattedStars}` : ''}. ${themes ? themes.uniquePart : 'High-definition quality with professional cinematography'} on bestprn.`,
      `Discover ${firstTag ? `top-tier ${firstTag}` : 'quality'} content${stars.length > 0 ? ` featuring ${formattedStars}` : ''}. ${themes?.uniquePart || 'Stream instantly in crystal-clear quality'} exclusively on bestprn.`
    ]
    
    return fallbackOpenings[contentVariant % fallbackOpenings.length]
  }

  // Generate unique seed based on video ID for consistent but varied content
  const videoSeed = (video._id || id).toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  // Brand salt ensures bestprn produces different variants than other sites using similar templates
  const brandSalt = 'bestprn'.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const contentVariant = (videoSeed + brandSalt) % 5 // 5 different content variations

  
  // Tag-specific content generator
  const generateTagSpecificContent = (tags, performerName) => {
    if (!Array.isArray(tags) || tags.length === 0) return ''
    
    // Parse tags - handle both array of tags and concatenated strings
    let parsedTags = []
    for (const tag of tags) {
      if (typeof tag === 'string') {
        // Check if tag is concatenated (no spaces, multiple words)
        if (tag.length > 15 && !tag.includes(' ') && !tag.includes('-')) {
          // Try to split concatenated tags by known keywords
          const knownTags = ['doggystyle', 'missionary', 'cowgirl', 'reverse', 'amateur', 'professional', 
                            'milf', 'teen', 'bbw', 'petite', 'blonde', 'brunette', 'redhead',
                            'blowjob', 'deepthroat', 'anal', 'creampie', 'facial', 'cumshot',
                            'pov', 'outdoor', 'public', 'hardcore', 'softcore', 'threesome',
                            'gangbang', 'lesbian', 'solo', 'asian', 'ebony', 'latina', 'indian',
                            'bigtits', 'bigass', 'busty', 'sexy', 'babe', 'homemade']
          
          let remainingTag = tag.toLowerCase()
          const foundTags = []
          
          for (const knownTag of knownTags) {
            if (remainingTag.includes(knownTag)) {
              foundTags.push(knownTag)
              remainingTag = remainingTag.replace(knownTag, '')
            }
          }
          
          if (foundTags.length > 0) {
            parsedTags.push(...foundTags)
          } else {
            parsedTags.push(tag.toLowerCase())
          }
        } else {
          parsedTags.push(tag.toLowerCase())
        }
      }
    }
    
    const tagDescriptions = {
        // Position-based tags - bestprn unique descriptions
      'doggystyle': [
        `delivers intense backdoor action${performerName ? ` starring ${performerName}` : ''}`,
        `features passionate from-behind scenes${performerName ? ` with ${performerName}` : ''}`,
        `includes thrilling rear-entry positions${performerName ? ` performed by ${performerName}` : ''}`,
        `showcases steamy doggy-style moments${performerName ? ` featuring ${performerName}` : ''}`
      ],
      'missionary': [
        `captures intimate face-to-face moments${performerName ? ` with ${performerName}` : ''}`,
        `presents classic passionate scenes${performerName ? ` starring ${performerName}` : ''}`,
        `features sensual missionary encounters${performerName ? ` with ${performerName}` : ''}`
      ],
      'cowgirl': [
        `showcases exciting rider-on-top action${performerName ? ` by ${performerName}` : ''}`,
        `features intense woman-on-top scenes${performerName ? ` with ${performerName}` : ''}`,
        `includes wild cowgirl riding sequences${performerName ? ` starring ${performerName}` : ''}`
      ],
      'reverse cowgirl': [
        `displays thrilling reverse riding action${performerName ? ` with ${performerName}` : ''}`,
        `features hot backward-facing scenes${performerName ? ` performed by ${performerName}` : ''}`
      ],
      
      // Experience level tags
      'amateur': [
        `stars an authentic amateur performer${performerName ? ` - ${performerName}` : ''}`,
        `features genuine amateur content${performerName ? ` with ${performerName}` : ''}`,
        `showcases real amateur action${performerName ? ` starring ${performerName}` : ''}`,
        `presents natural amateur scenes${performerName ? ` featuring ${performerName}` : ''}`
      ],
      'professional': [
        `stars a professional performer${performerName ? ` - ${performerName}` : ''}`,
        `features expert professional content${performerName ? ` with ${performerName}` : ''}`
      ],
      
      // Body type tags
      'milf': [
        `stars an experienced MILF${performerName ? ` - ${performerName}` : ''}`,
        `features a stunning MILF performer${performerName ? ` named ${performerName}` : ''}`,
        `showcases a gorgeous MILF${performerName ? ` - ${performerName}` : ''}`,
        `presents a sexy mature woman${performerName ? ` - ${performerName}` : ''}`
      ],
      'teen': [
        `features a young performer${performerName ? ` - ${performerName}` : ''}`,
        `stars a petite teen${performerName ? ` named ${performerName}` : ''}`,
        `showcases youthful energy${performerName ? ` with ${performerName}` : ''}`
      ],
      'bbw': [
        `stars a beautiful BBW${performerName ? ` - ${performerName}` : ''}`,
        `features a curvy performer${performerName ? ` named ${performerName}` : ''}`,
        `showcases a voluptuous beauty${performerName ? ` - ${performerName}` : ''}`
      ],
      'petite': [
        `features a petite performer${performerName ? ` - ${performerName}` : ''}`,
        `stars a small-framed beauty${performerName ? ` named ${performerName}` : ''}`
      ],
      
      // Physical features
      'big tits': [
        `showcases impressive natural assets${performerName ? ` on ${performerName}` : ''}`,
        `features busty action${performerName ? ` with ${performerName}` : ''}`,
        `highlights voluptuous curves${performerName ? ` of ${performerName}` : ''}`
      ],
      'big ass': [
        `displays a perfect booty${performerName ? ` belonging to ${performerName}` : ''}`,
        `features amazing curves${performerName ? ` on ${performerName}` : ''}`,
        `showcases a stunning backside${performerName ? ` of ${performerName}` : ''}`
      ],
      'blonde': [
        `stars a gorgeous blonde${performerName ? ` - ${performerName}` : ''}`,
        `features a stunning blonde performer${performerName ? ` named ${performerName}` : ''}`
      ],
      'brunette': [
        `stars a beautiful brunette${performerName ? ` - ${performerName}` : ''}`,
        `features a sexy dark-haired performer${performerName ? ` named ${performerName}` : ''}`
      ],
      'redhead': [
        `showcases a fiery redhead${performerName ? ` - ${performerName}` : ''}`,
        `stars a stunning red-haired beauty${performerName ? ` named ${performerName}` : ''}`
      ],
      
      // Action tags
      'blowjob': [
        `includes expert oral action${performerName ? ` by ${performerName}` : ''}`,
        `features skilled oral performance${performerName ? ` from ${performerName}` : ''}`,
        `showcases passionate oral scenes${performerName ? ` with ${performerName}` : ''}`
      ],
      'deepthroat': [
        `displays impressive deepthroat skills${performerName ? ` by ${performerName}` : ''}`,
        `features intense deepthroat action${performerName ? ` from ${performerName}` : ''}`
      ],
      'anal': [
        `includes intense anal action${performerName ? ` with ${performerName}` : ''}`,
        `features hardcore anal scenes${performerName ? ` starring ${performerName}` : ''}`,
        `showcases passionate anal play${performerName ? ` featuring ${performerName}` : ''}`
      ],
      'creampie': [
        `culminates in a hot creampie finish${performerName ? ` for ${performerName}` : ''}`,
        `ends with an intense creampie${performerName ? ` inside ${performerName}` : ''}`,
        `features a satisfying creampie conclusion${performerName ? ` with ${performerName}` : ''}`
      ],
      'facial': [
        `finishes with a messy facial${performerName ? ` on ${performerName}` : ''}`,
        `culminates in a hot facial scene${performerName ? ` for ${performerName}` : ''}`
      ],
      'cumshot': [
        `ends with an explosive finish${performerName ? ` for ${performerName}` : ''}`,
        `features a powerful climax scene${performerName ? ` with ${performerName}` : ''}`
      ],
      
      // Setting tags
      'pov': [
        `filmed in immersive POV perspective${performerName ? ` with ${performerName}` : ''}`,
        `shot in first-person POV style${performerName ? ` featuring ${performerName}` : ''}`,
        `captured in intimate POV angles${performerName ? ` starring ${performerName}` : ''}`
      ],
      'outdoor': [
        `filmed in an exciting outdoor location${performerName ? ` with ${performerName}` : ''}`,
        `shot in a daring outdoor setting${performerName ? ` featuring ${performerName}` : ''}`
      ],
      'public': [
        `filmed in a risky public location${performerName ? ` with ${performerName}` : ''}`,
        `shot in a daring public setting${performerName ? ` starring ${performerName}` : ''}`
      ],
      
      // Scenario tags
      'hardcore': [
        `delivers intense hardcore action${performerName ? ` with ${performerName}` : ''}`,
        `features rough and passionate scenes${performerName ? ` starring ${performerName}` : ''}`,
        `showcases extreme hardcore content${performerName ? ` featuring ${performerName}` : ''}`
      ],
      'softcore': [
        `presents sensual softcore content${performerName ? ` with ${performerName}` : ''}`,
        `features gentle and erotic scenes${performerName ? ` starring ${performerName}` : ''}`
      ],
      'threesome': [
        `features an exciting threesome${performerName ? ` including ${performerName}` : ''}`,
        `showcases a hot three-way action${performerName ? ` with ${performerName}` : ''}`
      ],
      'gangbang': [
        `presents an intense gangbang scene${performerName ? ` featuring ${performerName}` : ''}`,
        `showcases multiple partners${performerName ? ` with ${performerName}` : ''}`
      ],
      'lesbian': [
        `features passionate girl-on-girl action${performerName ? ` with ${performerName}` : ''}`,
        `showcases intimate lesbian scenes${performerName ? ` starring ${performerName}` : ''}`
      ],
      'solo': [
        `stars a solo performance${performerName ? ` by ${performerName}` : ''}`,
        `features intimate solo action${performerName ? ` from ${performerName}` : ''}`
      ],
      
      // Ethnicity tags
      'asian': [
        `stars an exotic Asian performer${performerName ? ` - ${performerName}` : ''}`,
        `features a beautiful Asian beauty${performerName ? ` named ${performerName}` : ''}`
      ],
      'ebony': [
        `showcases a stunning ebony performer${performerName ? ` - ${performerName}` : ''}`,
        `stars a gorgeous black beauty${performerName ? ` named ${performerName}` : ''}`
      ],
      'latina': [
        `features a spicy Latina${performerName ? ` - ${performerName}` : ''}`,
        `stars a passionate Latina performer${performerName ? ` named ${performerName}` : ''}`
      ],
      'indian': [
        `showcases an exotic Indian beauty${performerName ? ` - ${performerName}` : ''}`,
        `features a stunning Indian performer${performerName ? ` named ${performerName}` : ''}`
      ],
      
      // Additional descriptive tags
      'busty': [
        `showcases a busty performer${performerName ? ` - ${performerName}` : ''}`,
        `features impressive curves${performerName ? ` on ${performerName}` : ''}`,
        `highlights a well-endowed beauty${performerName ? ` - ${performerName}` : ''}`
      ],
      'sexy': [
        `stars a sexy performer${performerName ? ` - ${performerName}` : ''}`,
        `features an incredibly attractive${performerName ? ` ${performerName}` : ' performer'}`
      ],
      'babe': [
        `showcases a stunning babe${performerName ? ` - ${performerName}` : ''}`,
        `features a gorgeous performer${performerName ? ` named ${performerName}` : ''}`
      ],
      'homemade': [
        `presents authentic homemade content${performerName ? ` with ${performerName}` : ''}`,
        `features genuine homemade footage${performerName ? ` starring ${performerName}` : ''}`,
        `showcases real homemade action${performerName ? ` featuring ${performerName}` : ''}`
      ],
      'bigtits': [
        `showcases impressive natural assets${performerName ? ` on ${performerName}` : ''}`,
        `features busty action${performerName ? ` with ${performerName}` : ''}`
      ],
      'bigass': [
        `displays a perfect booty${performerName ? ` belonging to ${performerName}` : ''}`,
        `features amazing curves${performerName ? ` on ${performerName}` : ''}`
      ]
    }
    
    // Find matching tags and generate descriptions
    const descriptions = []
    for (const tag of parsedTags.slice(0, 3)) { // Use first 3 parsed tags
      const tagLower = tag.toLowerCase().trim()
      if (tagDescriptions[tagLower]) {
        const variants = tagDescriptions[tagLower]
        const selectedVariant = variants[videoSeed % variants.length]
        descriptions.push(selectedVariant)
      }
    }
    
    return descriptions.length > 0 ? descriptions.join(', ') : ''
  }
  
  // Natural language variations for endings - bestprn specific
  const streamingPhrases = [
    'Experience instant streaming on bestprn with zero buffering.',
    'Watch in crystal clear HD with fast load times on bestprn.',
    'Stream seamlessly on any device without interruptions.',
    'Enjoy premium playback quality optimized for bestprn.',
    'Access high-speed streaming through bestprn\'s optimized servers.'
  ]
  
  const explorePhrases = [
    `Browse bestprn\'s extensive ${video.tags?.[0] || 'video'} collection for more content.`,
    `Discover more ${video.tags?.[0] || 'premium'} videos in bestprn\'s curated library.`,
    `Find similar content in bestprn\'s ${video.tags?.[0] || 'category'} section.`,
    `Explore bestprn for additional ${video.tags?.[0] || 'handpicked'} videos you\'ll enjoy.`,
    `Check out bestprn\'s related ${video.tags?.[0] || 'content'} recommendations below.`
  ]
  
  // Generate tag-specific content
  const performerName = Array.isArray(video.name) && video.name.length > 0 ? video.name[0] : null
  const tagSpecificContent = generateTagSpecificContent(video.tags, performerName)
  
  // Build a short intro (max ~180 chars) for the summary preview
  const buildIntro = () => {
    const titleText = video.titel || video.title || 'Video'
    const star = Array.isArray(video.name) && video.name.length > 0 ? formatDisplay(video.name[0]) : ''
    const primaryTag = Array.isArray(video.tags) && video.tags.length > 0 ? formatDisplay(video.tags[0]) : ''
    let base = (video.desc && video.desc.length > 40) ? video.desc : `Watch ${titleText}${star ? ` with ${star}` : ''}${primaryTag ? ` — ${primaryTag}` : ''} on bestprn.`
    if (!video.desc && video.minutes) base += ` ${video.minutes} min HD.`
    base = String(base).replace(/\s+/g, ' ').trim()
    if (base.length <= 180) return base
    const trimmed = base.slice(0, 180)
    return trimmed.replace(/[,;:]?\s+\S*$/, '') + '…'
  }
  const introText = buildIntro()

  // Determine tags list for related videos
  const videoTags = Array.isArray(video.tags) ? video.tags.filter(Boolean) : []

  // Related videos with pagination from query param `page`
  const relatedPage = Number(searchParams?.page || 1)

  // Strategy: fetch top N from each tag, merge, de-duplicate, sort, then paginate locally
  let mergedRelated = []
  if (videoTags.length > 0) {
    try {
      const perTagLimit = 50 // adjust if needed
      const results = await Promise.all(
        videoTags.map((t) => api.getPostsByTag(t, 1, perTagLimit).catch(() => ({ records: [], data: [] })))
      )
      const combined = results.flatMap(r => r.records || r.data || [])
      // De-duplicate by _id and exclude current video
      const uniqMap = new Map()
      for (const item of combined) {
        const idStr = String(item._id || '')
        if (!idStr || idStr === String(video._id || id)) continue
        if (!uniqMap.has(idStr)) uniqMap.set(idStr, item)
      }
      mergedRelated = Array.from(uniqMap.values())
      // Sort by createdAt desc if present, else by views desc
      mergedRelated.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
        if (aTime !== 0 || bTime !== 0) return bTime - aTime
        return (b.views || 0) - (a.views || 0)
      })
    } catch (e) {}
  }

  const pageSize = 16
  const totalRelated = mergedRelated.length
  const totalRelatedPages = Math.max(1, Math.ceil(totalRelated / pageSize))
  const pagedRelated = mergedRelated.slice((relatedPage - 1) * pageSize, relatedPage * pageSize)

  // Enhanced Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.titel || video.title || 'Video',
    "description": video.desc || video.metatitel || 'Watch premium video on bestprn',
    "thumbnailUrl": video.imageUrl || '',
    "uploadDate": video.createdAt || new Date().toISOString(),
    "duration": video.minutes ? `PT${video.minutes}M` : undefined,
    "contentUrl": video.link || '',
    "embedUrl": video.iframeUrl || undefined,
    "publisher": {
      "@type": "Organization",
      "name": "bestprn",
      "logo": {
        "@type": "ImageObject",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bestprn.com'}/logo.png`
      }
    },
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": { "@type": "WatchAction" },
      "userInteractionCount": video.views || 0
    },
    ...(Array.isArray(video.name) && video.name.length > 0 && {
      "actor": video.name.map(name => ({
        "@type": "Person",
        "name": name
      }))
    }),
    ...(Array.isArray(video.tags) && video.tags.length > 0 && {
      "genre": video.tags.slice(0, 5),
      "keywords": video.tags.join(', ')
    }),
    "inLanguage": "en",
    "isFamilyFriendly": false,
    "contentRating": "adult"
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {relatedPage === 1 && (
          <>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">{video.titel || 'Video'}</h1>

            {/* Dummy player section with redirect on play click */}
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/30 ring-1 ring-white/10">
              <VideoRedirect link={video.link} imageUrl={video.imageUrl} title={video.titel} video={video} />
            </div>

            {/* Quick stats */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-gray-200">
                <span className="mr-2 h-2 w-2 rounded-full bg-emerald-400" />
                {video.minutes || 'N/A'} min
              </span>
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-gray-200">
                <span className="mr-2 h-2 w-2 rounded-full bg-red-400" />
                {Number(video.views || 0).toLocaleString()} views
              </span>
              {Array.isArray(video.createdAt) ? null : (
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-gray-200">
                  <span className="mr-2 h-2 w-2 rounded-full bg-red-400" />
                  HD Quality
                </span>
              )}
            </div>

            {/* Stars section - moved to be above tags */}
            {Array.isArray(video.name) && video.name.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Stars</h3>
                <div className="flex flex-wrap gap-2">
                  {video.name.map((n, i) => (
                    <Link
                      key={i}
                      className="inline-flex items-center rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-pink-300 hover:bg-pink-500/20 transition-colors"
                      href={`/pornstar/${n}`}
                    >
                      <span className="mr-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </span>
                      {n.replace(/-/g, ' ')}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {/* Tags section - original position */}
            {Array.isArray(video.tags) && video.tags.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {video.tags.slice(0, 20).map((t, i) => (
                    <Link
                      key={i}
                      className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-red-300 hover:bg-red-500/20 transition-colors"
                      href={`/tag/${t.toLowerCase().replace(/\s+/g,'-')}`}
                    >
                      {t.replace(/-/g, ' ')}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <VideoSectionsClient
              videoDetails={
                <>
                  <VideoDescription title={`About ${video.titel || 'This Video'}`}>
                    <div className="text-gray-300 leading-relaxed space-y-4">
                      {/* Description-First Creative Content - Extended */}
                      <p className="text-lg font-medium text-gray-200">
                        {(() => {
                          const tags = video.tags || [];
                          const stars = video.name || [];
                          const desc = video.desc || '';
                          
                          // Use the new desc-based content generator
                          return generateContentOpening(desc, tags, stars, contentVariant);
                        })()}
                      </p>

                      {/* Production Quality & Technical Details */}
                      <div className="bg-gradient-to-r from-red-900/20 to-pink-900/20 rounded-lg p-4 border-l-4 border-red-500">
                        <h4 className="text-red-400 font-semibold mb-2 text-sm uppercase tracking-wide">
                          {['Production Quality', 'Technical Excellence', 'Video Standards', 'HD Experience', 'Premium Quality'][contentVariant]}
                        </h4>
                        <p className="text-gray-300">
                          {(() => {
                            const minutes = video.minutes || 'full-length';
                            const quality = video.imageUrl?.includes('hd') || video.imageUrl?.includes('1080') ? '1080p Full HD' : 'High Definition';
                            const tags = video.tags || [];
                            
                            return `This ${minutes}-minute production features ${quality} video quality with professional cinematography. ${tags.length > 0 ? `The ${tags[0]} scenes are captured with expert camera work and optimal lighting to enhance your viewing experience.` : 'Shot with professional-grade equipment for the best visual clarity.'} Audio quality matches the visual excellence, ensuring immersive sound throughout. Bestprn maintains strict quality standards for all uploaded content.`;
                          })()}
                        </p>
                      </div>

                      {/* Scene Context & What to Expect */}
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <h4 className="text-pink-400 font-semibold mb-2 text-sm uppercase tracking-wide">
                          {['What to Expect', 'Scene Preview', 'Inside This Video', 'Content Preview', 'Watch Guide'][contentVariant]}
                        </h4>
                        <p className="text-gray-300">
                          {(() => {
                            const tags = video.tags || [];
                            const stars = video.name || [];
                            const mainTag = tags[0] || 'premium';
                            const secondaryTag = tags[1] || 'entertainment';
                            
                            let expectation = `Prepare for an engaging ${mainTag} experience`;
                            
                            if (stars.length > 0) {
                              expectation += ` featuring ${stars.map(s => formatDisplay(s)).join(' and ')}`;
                            }
                            
                            expectation += `. `;
                            
                            if (tags.length > 1) {
                              expectation += ` You'll notice the blend of ${mainTag} and ${secondaryTag} elements throughout.`;
                            }
                            
                            expectation += ` ${['Multiple camera angles ensure you miss nothing', 'Close-up shots capture every detail', 'Wide shots establish the full scene', 'Dynamic camera work keeps it engaging', 'Professional editing maintains the pace'][contentVariant]}. The runtime of ${video.minutes || 'optimal length'} minutes is perfectly balanced - not too short to feel rushed, not too long to lose interest.`;
                            
                            return expectation;
                          })()}
                        </p>
                      </div>

                      {/* Tags & Stars Blend - Enhanced */}
                      <div className="bg-gray-800/50 rounded-lg p-4 border-l-4 border-pink-500">
                        <h4 className="text-pink-400 font-semibold mb-2 text-sm uppercase tracking-wide">
                          {['Content Mix', 'What Inside', 'Scene Elements', 'Video Breakdown', 'Details'][contentVariant]}
                        </h4>
                        <p className="text-gray-300">
                          {(() => {
                            const tags = video.tags || [];
                            const stars = video.name || [];
                            const tagCount = tags.length;
                            const starCount = stars.length;
                            
                            let description = '';
                            
                            if (tagCount > 0 && starCount > 0) {
                              description = `This video combines ${tagCount} carefully selected tag${tagCount > 1 ? 's' : ''} including ${tags.slice(0, 3).map(t => formatDisplay(t)).join(', ')}${tagCount > 3 ? ` and ${tagCount - 3} more` : ''}. Featured performer${starCount > 1 ? 's' : ''} ${stars.map(s => formatDisplay(s)).join(' and ')} bring ${starCount > 1 ? 'their unique chemistry' : 'their exceptional talent'} to create a memorable viewing experience.`;
                            } else if (tagCount > 0) {
                              description = `Tagged across ${tagCount} categories: ${tags.map(t => formatDisplay(t)).join(', ')}. The primary ${tags[0]} theme runs throughout the video, complemented by ${tagCount > 1 ? tags.slice(1, 3).join(' and ') : 'professional production values'}.`;
                            } else if (starCount > 0) {
                              description = `Starring ${stars.map(s => formatDisplay(s)).join(' and ')}. ${starCount > 1 ? 'Their combined presence and chemistry' : 'Their solo performance'} drives this ${video.minutes || 'engaging'}-minute production from start to finish.`;
                            } else {
                              description = 'Premium HD content with professional production quality throughout. Every frame is optimized for the best viewing experience on bestprn.';
                            }
                            
                            return description;
                          })()}
                        </p>
                      </div>

                      {/* Star-Specific Content - Extended */}
                      {Array.isArray(video.name) && video.name.length > 0 && (
                        <div className="bg-gradient-to-r from-pink-900/20 to-red-900/20 rounded-lg p-4">
                          <h4 className="text-pink-400 font-semibold mb-2 text-sm uppercase tracking-wide">About the Performers</h4>
                          <p className="text-gray-300">
                            {video.name.length === 1 ? (
                              `${formatDisplay(video.name[0])} takes center stage in this scene, delivering a captivating solo performance that showcases their expertise in ${Array.isArray(video.tags) && video.tags.length > 0 ? formatDisplay(video.tags[0]) : 'the featured genre'} content. Known for their engaging screen presence, ${formatDisplay(video.name[0])} maintains viewer attention throughout the ${video.minutes || 'full'} minutes. Their experience in the industry is evident in the natural flow and authentic reactions captured on camera. Fans of ${Array.isArray(video.tags) && video.tags.length > 0 ? formatDisplay(video.tags[0]) : 'quality adult'} content will appreciate the dedication to craft displayed here.`
                            ) : (
                              `${video.name.map((n, i) => {
                                if (i === 0) return formatDisplay(n);
                                if (i === video.name.length - 1) return ` and ${formatDisplay(n)}`;
                                return `, ${formatDisplay(n)}`;
                              }).join('')} come together in this scene, creating ${video.name.length === 2 ? 'a dynamic duo' : 'an ensemble performance'} that elevates the entire production. ${Array.isArray(video.tags) && video.tags.length > 0 ? `Their combined energy brings the ${formatDisplay(video.tags[0])} action to life with remarkable authenticity.` : 'Their on-screen chemistry is immediately apparent and drives the narrative forward.'} Each performer contributes their unique style, resulting in a scene that feels both professional and genuinely passionate. The interaction between ${video.name.slice(0, 2).map(n => formatDisplay(n)).join(' and ')} feels natural and unscripted, adding to the overall appeal.`
                            )}
                          </p>
                        </div>
                      )}

                      {/* Tag-Specific Highlights - Extended */}
                      {Array.isArray(video.tags) && video.tags.length > 0 && (
                        <div>
                          <h4 className="text-red-400 font-semibold mb-2 text-sm uppercase tracking-wide">Category Highlights</h4>
                          <p className="text-gray-300">
                            {(() => {
                              const tags = video.tags;
                              let highlightText = `This video excels in the ${formatDisplay(tags[0])} category`;
                              
                              if (tags.length > 1) {
                                highlightText += `, while also incorporating elements of ${formatDisplay(tags[1])}`;
                                if (tags.length > 2) {
                                  highlightText += ` and ${formatDisplay(tags[2])}`;
                                }
                              }
                              
                              highlightText += `. `;
                              
                              // Add specific descriptions for top tags
                              const specificDescs = tags.slice(0, 3).map(tag => {
                                const tagLower = tag.toLowerCase();
                                if (['doggystyle', 'cowgirl', 'missionary'].some(pos => tagLower.includes(pos))) {
                                  return `the ${tag} positioning is executed with precision`;
                                } else if (['pov', 'closeup', 'close-up'].some(style => tagLower.includes(style))) {
                                  return `intimate ${tag} camera angles bring you closer to the action`;
                                } else if (['creampie', 'facial', 'cumshot', 'blowjob'].some(finish => tagLower.includes(finish))) {
                                  return `intense ${tag} moments are captured in vivid detail`;
                                } else if (['anal', 'hardcore', 'rough'].some(intense => tagLower.includes(intense))) {
                                  return `passionate ${tag} sequences showcase raw energy`;
                                } else if (['lesbian', 'threesome', 'group'].some(group => tagLower.includes(group))) {
                                  return `exciting ${tag} dynamics create memorable scenes`;
                                } else if (['teen', 'milf', 'mature'].some(age => tagLower.includes(age))) {
                                  return `${tag} appeal is prominently featured`;
                                } else if (['homemade', 'amateur'].some(type => tagLower.includes(type))) {
                                  return `authentic ${tag} charm adds realism`;
                                } else {
                                  return `engaging ${tag} content keeps viewers invested`;
                                }
                              });
                              
                              if (specificDescs.length > 0) {
                                highlightText += `Specifically, ${specificDescs.join(', ')}. `;
                              }
                              
                              if (tags.length > 3) {
                                highlightText += `Additional categories include ${tags.slice(3, 5).map(t => formatDisplay(t)).join(' and ')}${tags.length > 5 ? ` and ${tags.length - 5} more tags` : ''}, ensuring comprehensive coverage of popular themes. `;
                              }
                              
                              highlightText += `This thoughtful combination makes the video a standout addition to bestprn's ${tags[0]} collection.`;
                              
                              return highlightText;
                            })()}
                          </p>
                        </div>
                      )}

                      {/* Why Watch This */}
                      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-lg p-4 border-l-4 border-red-400">
                        <h4 className="text-red-400 font-semibold mb-2 text-sm uppercase tracking-wide">
                          {['Why Watch This', 'Key Reasons', 'What Makes It Special', 'Standout Features', 'Why You Will Love It'][contentVariant]}
                        </h4>
                        <ul className="text-gray-300 space-y-1 text-sm">
                          {(() => {
                            const reasons = [
                              [`✓ ${video.minutes || 'Full-length'} minutes of uninterrupted entertainment`, `✓ ${Array.isArray(video.tags) && video.tags.length > 0 ? formatDisplay(video.tags[0]) : 'Premium'} content in crystal-clear quality`, `✓ ${Array.isArray(video.name) && video.name.length > 0 ? formatDisplay(video.name[0]) + (video.name.length > 1 ? ' and co-stars' : '') : 'Professional performer'} at their best`, '✓ Fast streaming with no buffering on bestprn', '✓ Mobile-optimized for viewing on any device'],
                              [`✓ Expert-level ${Array.isArray(video.tags) && video.tags.length > 0 ? formatDisplay(video.tags[0]) : 'adult'} production values`, '✓ HD quality that captures every detail', `✓ ${Array.isArray(video.views) || video.views > 0 ? video.views.toLocaleString() + ' viewers cannot be wrong' : 'Trending content on bestprn'}`, '✓ Compatible with all modern browsers and devices', `✓ Part of bestprn's curated ${Array.isArray(video.tags) && video.tags.length > 0 ? video.tags[0] : 'premium'} collection`],
                              ['✓ Professional camera work and lighting', `✓ ${video.minutes || 'Optimal'} minute runtime - perfect for full viewing`, `✓ Features genuine ${Array.isArray(video.tags) && video.tags.length > 0 ? formatDisplay(video.tags[0]) : 'adult'} action`, '✓ Regular quality checks ensure best experience', '✓ No advertisements interrupting your viewing'],
                              [`✓ Top-rated ${Array.isArray(video.tags) && video.tags.length > 0 ? formatDisplay(video.tags[0]) : 'content'} on the platform`, `✓ Starring ${Array.isArray(video.name) && video.name.length > 0 ? formatDisplay(video.name[0]) : 'industry professionals'}`, '✓ Multiple streaming quality options available', '✓ Secure and private viewing environment', '✓ Added to bestprn based on user demand'],
                              ['✓ Curated by bestprn quality team', `✓ ${Array.isArray(video.tags) && video.tags.length > 1 ? 'Combines ' + formatDisplay(video.tags[0]) + ' with ' + formatDisplay(video.tags[1]) : 'Unique content mix'}`, '✓ Regular updates keep the library fresh', '✓ Easy navigation to related videos', '✓ Watch history synchronization across devices']
                            ];
                            
                            return reasons[contentVariant].map((reason, idx) => (
                              <li key={idx}>{reason}</li>
                            ));
                          })()}
                        </ul>
                      </div>

                      {/* Streaming & Quality Info */}
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {(() => {
                          const minutes = video.minutes ? `${video.minutes} minutes` : 'Full-length';
                          const views = video.views > 0 ? `${video.views.toLocaleString()} users have already watched` : 'Join thousands of viewers';
                          const tags = video.tags || [];
                          
                          return `${minutes} of HD content awaits you on bestprn. ${views} and enjoyed this ${tags.length > 0 ? formatDisplay(tags[0]) : 'premium'} video. Our platform uses advanced streaming technology to deliver buffer-free playback regardless of your connection speed. The video is encoded in multiple formats to ensure compatibility with smartphones, tablets, desktops, and smart TVs. Bestprn's infrastructure is optimized for adult content delivery, meaning you get faster load times and smoother playback compared to generic video hosts. ${tags.length > 0 ? `If you enjoy ${formatDisplay(tags[0])} content, this video will exceed your expectations.` : 'Experience the difference of a specialized platform.'}`;
                        })()}
                      </p>

                      {/* Related Suggestions */}
                      {Array.isArray(video.tags) && video.tags.length > 0 && (
                        <p className="text-sm text-gray-400">
                          <span className="text-red-400 font-medium">If you enjoyed this:</span>{' '}
                          {(() => {
                            const tags = video.tags;
                            const mainTag = tags[0];
                            const secondaryTag = tags[1];
                            
                            let suggestion = `Explore more ${formatDisplay(mainTag)} videos in our extensive collection. `;
                            
                            if (secondaryTag) {
                              suggestion += `You might also appreciate our ${formatDisplay(secondaryTag)} section, which features similar high-quality content. `;
                            }
                            
                            if (tags.length > 2) {
                              suggestion += `Our ${formatDisplay(tags[2])} and ${formatDisplay(tags[3] || tags[0])} categories offer related themes with the same production values.`;
                            }
                            
                            suggestion += ` Bestprn regularly updates these sections with fresh ${mainTag} content, so check back often for new additions.`;
                            
                            return suggestion;
                          })()}
                        </p>
                      )}

                      {/* Closing Call - Extended */}
                      <p className="text-sm italic text-gray-400 border-t border-gray-700 pt-3 mt-3">
                        "{['Perfect for fans of', 'Must-watch for', 'Essential viewing for', 'Top pick for', 'Highly recommended for'][contentVariant]} {Array.isArray(video.tags) && video.tags.length > 0 ? formatDisplay(video.tags[0]) : 'premium'} content on bestprn. This {video.minutes || 'quality'} minute production {Array.isArray(video.name) && video.name.length > 0 ? `featuring ${video.name.map(s => formatDisplay(s)).join(' and ')}` : 'delivers exactly what you are looking for'} represents the best of our {Array.isArray(video.tags) && video.tags.length > 0 ? video.tags[0] : 'adult'} collection. Stream now in full HD and discover why thousands choose bestprn for their entertainment needs."
                      </p>
                    </div>
                  </VideoDescription>
                </>
              }
            />
          </>
        )}
        {/* Related Videos */}
        {videoTags.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Related Videos</h2>
              <div className="text-sm text-gray-400">{totalRelated} results</div>
            </div>
            <div className="grid video-grid">
              {pagedRelated.map((v, idx) => (
                <VideoCard key={v._id || idx} video={v} />
              ))}
            </div>
            <Pagination basePath={`/video/${id}-${slugify(video?.titel || video?.title || '')}?`} currentPage={relatedPage} totalPages={totalRelatedPages} />
          </div>
        )}
      </div>
    </>
  )
}