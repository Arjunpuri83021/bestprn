import Link from 'next/link'
import { api } from './lib/api'
import VideoCard from './components/VideoCard'
import Pagination from './components/Pagination'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://bestprn.com').replace(/\/$/, '')

  const baseMeta = {
    title: 'bestprn Free HD Adult Videos and XXXHD Porn',
    description:
      'bestprn brings fast, clean, free HD porn with trending categories and top stars. Daily updates, no fluff. Explore Indian, Teen, MILF, Lesbian, POV, Anal, and more in crisp HD.',
    alternates: { canonical: '/' },
    openGraph: {
      title: 'bestprn Free HD Adult Videos and XXXHD Porn',
      description:
        'bestprn brings fast, clean, free HD porn with trending categories and top stars. Daily updates, no fluff.',
      url: `${siteUrl}/`,
      siteName: 'bestprn',
      type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'bestprn - Free HD Adult Videos',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'bestprn Free HD Adult Videos and XXXHD Porn',
      description:
        'bestprn brings fast, clean, free HD porn with trending categories and top stars. Daily updates, no fluff.',
      images: ['/og-image.jpg'],
    },
  }

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:5000').replace(/\/$/, '')

  try {
    const res = await fetch(
      `${apiBase}/seo-meta/path/${encodeURIComponent('/')}` + `?site=${encodeURIComponent('bestprn')}`,
      { cache: 'no-store' }
    )

    if (!res.ok) return baseMeta

    const data = await res.json().catch(() => null)
    const m = data?.seoMeta
    if (!m) return baseMeta

    const pagePath = m.pagePath || '/'
    const fullUrl = `${siteUrl}${pagePath.startsWith('/') ? pagePath : `/${pagePath}`}`

    return {
      ...baseMeta,
      title: m.metaTitle || baseMeta.title,
      description: m.metaDescription || baseMeta.description,
      alternates: {
        canonical: pagePath,
      },
      openGraph: {
        ...baseMeta.openGraph,
        title: m.ogTitle || m.metaTitle || baseMeta.openGraph.title,
        description: m.ogDescription || m.metaDescription || baseMeta.openGraph.description,
        url: fullUrl,
        images: m.ogImage
          ? [
            {
              url: m.ogImage,
            },
          ]
          : baseMeta.openGraph.images,
      },
      twitter: {
        ...baseMeta.twitter,
        title: m.metaTitle || baseMeta.twitter.title,
        description: m.metaDescription || baseMeta.twitter.description,
      },
    }
  } catch (e) {
    return baseMeta
  }
}

async function getCustomContent() {
  try {
    return await api.getCustomContent('home', 'home')
  } catch {
    return null
  }
}

export default async function HomePage({ searchParams }) {
  const page = Number(searchParams?.page || 1)
  const limit = 16
  const res = await api.getAllPosts(page, limit).catch(() => ({ records: [], data: [], totalPages: 1, totalRecords: 0 }))
  const list = res.records || res.data || []
  const totalPages = res.totalPages || (res.totalRecords ? Math.max(1, Math.ceil(Number(res.totalRecords) / limit)) : 1)
  const totalRecords = res.totalRecords || list.length || 0

  // Build small, brand-unique content from live data (page 1 only)
  const buildHomeContent = () => {
    const titles = list.slice(0, 6).map(v => v.titel || v.title).filter(Boolean)
    const performers = [...new Set(list.flatMap(v => Array.isArray(v.name) ? v.name : []).filter(Boolean))]
      .slice(0, 6).map(n => n.replace(/-/g, ' '))
    const tags = [...new Set(list.flatMap(v => Array.isArray(v.tags) ? v.tags : []).filter(Boolean))]
      .slice(0, 8).map(t => t.replace(/-/g, ' '))
    const brandSalt = 'bestprn'.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
    const seed = (titles.join('') || 'fresh').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    const variant = (seed + brandSalt) % 5

    const intro = [
      `bestprn brings ${totalRecords}+ free HD videos across Indian, Teen, MILF, Lesbian, POV, Anal and more. Clean UI, fast load, no fluff — just the good stuff.`,
      `Discover ${totalRecords}+ crisply curated HD videos on bestprn. Simple design, fast playback, real categories you actually browse.`,
      `Your fast lane to ${totalRecords}+ HD videos. bestprn keeps it clean, quick, and focused on what you watch most.`,
      `Explore ${totalRecords}+ high‑quality scenes with smooth streaming and a clutter‑free interface tuned for speed.`,
      `bestprn highlights the best of ${totalRecords}+ HD videos with a streamlined experience that gets you watching sooner.`
    ][variant]

    let details = 'Content spans pro studio releases and authentic amateur uploads with proper categorization.'
    if (tags.length) details += ` Popular right now: ${tags.slice(0, 5).join(', ')}.`
    if (performers.length) details += ` Featuring ${performers.slice(0, 3).join(', ')}${performers.length > 3 ? ' and more' : ''}.`

    const navigation = `Browse page ${page} of ${totalPages} with ${limit} videos per page. Use pagination to jump through the newest additions first.`
    const closing = 'All videos stream free in HD with minimal buffering. Works great on mobile and desktop.'

    return { intro, details, navigation, closing, performers, tags }
  }
  const homeContent = page === 1 ? buildHomeContent() : null

  // Fetch custom content from admin (page 1 only)
  const customContent = page === 1 ? await getCustomContent() : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">bestprn Free HD Adult Videos and XXXHD Porn</h1>

      {/* All Videos (Newest first handled by API) */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">All Videos</h2>
        </div>
        <div className="grid video-grid">
          {list.map((v, idx) => (
            <VideoCard key={v._id || idx} video={v} priority={idx < 6} />
          ))}
        </div>
        <div className="mt-6">
          <Pagination basePath="/?" currentPage={page} totalPages={totalPages} />
        </div>
      </section>

      {/* Custom content from admin - priority over auto-generated */}
      {customContent && customContent.isActive && (
        <section className="mt-2 text-gray-300 leading-relaxed space-y-4 bg-gray-800/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">{customContent.title}</h2>
          <div
            className="custom-content-display"
            dangerouslySetInnerHTML={{ __html: String(customContent.content || '').replace(/\n/g, '<br>') }}
          />
        </section>
      )}

      {/* Fallback: Auto-generated content if no custom content */}
      {!customContent && homeContent && (
        <section className="mt-2 text-gray-300 leading-relaxed space-y-4 bg-gray-800/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Why bestprn</h2>
          <p>{homeContent.intro}</p>
          <p>{homeContent.details}</p>
          <p>{homeContent.navigation}</p>
          <p>{homeContent.closing}</p>
          {(homeContent.performers?.length || homeContent.tags?.length) ? (
            <div className="mt-2 border-t border-white/10 pt-3">
              {homeContent.performers?.length ? (
                <p className="text-sm"><span className="text-gray-400">Trending performers:</span> {homeContent.performers.join(', ')}</p>
              ) : null}
              {homeContent.tags?.length ? (
                <p className="text-sm"><span className="text-gray-400">Hot tags:</span> {homeContent.tags.join(', ')}</p>
              ) : null}
            </div>
          ) : null}
        </section>
      )}
    </div>
  )
}
