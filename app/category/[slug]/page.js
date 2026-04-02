import { api } from '../../lib/api'
import { fetchSeoMeta } from '../../lib/seoMeta'
import VideoCard from '../../components/VideoCard'
import Pagination from '../../components/Pagination'

export const revalidate = 60

const categoryTitles = {
  'chochox': 'Chochox',
  'scout69': 'Scout69',
  'comxxx': 'Comxxx',
  'lesbify': 'Lesbify',
  'milfnut': 'MilfNut',
  'badwap': 'Badwap',
  'sex-sister': 'Sex Sister',
  'sex18': 'Sex18',
  'desi49': 'Desi49',
  'dehati-sex': 'Dehati Sex',
  'boobs-pressing': 'Boobs Pressing',
  'blueflim': 'Blue Film',
  'aunt-sex': 'Aunt Sex',
  'famili-sex-com': 'Family Sex',
  'teen-sex': 'Teen Sex',
  'small-tits': 'Small Tits',
  'fullporner': 'Fullporner',
}

// Map slug -> search keyword (from legacy components)
const categorySearch = {
  'badwap': 'bad',
  'scout69': 'big',
  'blueflim': 'porn',
  'lesbify': 'lesbian',
  'famili-sex-com': 'family',
  'sex-sister': 'sis',
  'sex18': 'room',
  'dehati-sex': 'indian',
  'boobs-pressing': 'boobs',
  'aunt-sex': 'mom',
  'teen-sex': 'teen',
  'small-tits': 'tits',
  'comxxx': 'step',
  'chochox': 'ass',
  'milfnut': 'milf',
  'desi49': 'desi',
  'fullporner': 'girl',
}

// Legacy-like meta templates per category
const categoryMeta = {
  'badwap': {
    title: (page) => `bestprn badwap Videos page ${page} - badwap xvedeo`,
    desc: 'Explore a collection of premium badwap videos on bestprn. Enjoy handpicked, high-quality content filtered for your preferences.',
  },
  'blueflim': {
    title: (page) => `bestprn Blueflim Videos Page ${page} – Watch HD videos online`,
    desc: 'Explore a collection of premium Blueflim videos on bestprn. Enjoy handpicked, high-quality content filtered for your preferences.',
  },
  'scout69': {
    title: (page) => `bestprn Scout69 Videos page ${page} - bad wap wwwxxx xvedeo`,
    desc: 'Explore a collection of premium Scout69 Big boobs big dick videos on bestprn. Enjoy handpicked, high-quality content filtered for your preferences.',
  },
  'lesbify': {
    title: (page) => `bestprn Lesbify Videos page ${page} - xxxhd,wwwsexcom videos`,
    desc: 'Explore a collection of premium lesbian videos on bestprn. Enjoy handpicked, high-quality content filtered for your preferences.',
  },
  'famili-sex-com': {
    title: (page) => `bestprn famili sex com page ${page} - step family xvedeo`,
    desc: 'Explore a collection of premium famili sex com videos on bestprn. Enjoy handpicked, high-quality content filtered for your preferences.',
  },
  'boobs-pressing': {
    title: (page) => `bestprn Boobs Pressing page ${page} Videos – Watch HD clips now`,
    desc: 'Explore a collection of premium boobs pressing videos on bestprn. Enjoy handpicked, high-quality content filtered for your preferences.',
  },
  'small-tits': {
    title: (page) => `bestprn Small Tits sex Videos page ${page} - 4K Pornstar 3pornstar`,
    desc: 'Explore a collection of premium SmallTits videos. Enjoy handpicked, high-quality content filtered for your preferences.',
  },
  'sex18': {
    title: (page) => `bestprn sex18 Videos page ${page} - xxxhd,wwwsexcom videos`,
    desc: 'Explore a collection of premium sex18 videos on bestprn. Enjoy handpicked, high-quality content filtered for your preferences.',
  },
  'desi49': {
    title: (page) => `bestprn Desi49 Sex Videos page ${page} – Watch hot desi clips in HD`,
    desc: 'Explore a collection of premium desi49 videos on bestprn. Enjoy handpicked, high-quality content filtered for your preferences.',
  },
  'dehati-sex': {
    title: (page) => `bestprn Dehati Videos page ${page} – Watch rural desi clips in HD`,
    desc: 'Explore a collection of premium Milf videos on Dehati. Enjoy handpicked, high-quality content filtered for your preferences.',
  },
  'chochox': {
    title: (page) => `bestprn chochox Videos page ${page} – Watch Cartoon porn clips in HD`,
    desc: 'Explore a collection of premium chochox videos on bestprn. Enjoy handpicked, high-quality content filtered for your preferences.',
  },
  'comxxx': {
    title: (page) => `bestprn comxxx Videos Page ${page} – Watch HD videos online`,
    desc: 'Explore a collection of premium comxxx videos on bestprn. Enjoy handpicked, high-quality content filtered for your preferences.',
  },
  'milfnut': {
    title: (page) => `bestprn MilfNut Videos page ${page} - milf300 wwwxxx`,
    desc: 'Explore a collection of premium MilfNut videos on bestprn. Enjoy handpicked, high-quality content filtered for your preferences.',
  },
  'fullporner': {
    title: (page) => `bestprn fullporner Videos page ${page} - bad wap wwwxxx xvedeo`,
    desc: 'Explore a collection of premium fullporner Big boobs big dick videos on bestprn. Enjoy handpicked, high-quality content filtered for your preferences.',
  },
  'aunt-sex': {
    title: (page) => `bestprn Aunt Sex Videos page ${page} - milf300 wwwxxx`,
    desc: 'Explore a collection of premium Aunt Sex videos on bestprn. Enjoy handpicked, high-quality content filtered for your preferences.',
  },
  'teen-sex': {
    title: (page) => `bestprn Teen Sex Videos page ${page}`,
    desc: 'Explore a collection of premium Teen sex videos on bestprn. Enjoy handpicked, high-quality content filtered for your preferences.',
  },
}

export async function generateMetadata({ params, searchParams }) {
  const slug = params.slug
  const page = Number(searchParams?.page || 1)
  const titleBase = categoryTitles[slug] || slug.replace(/-/g, ' ')
  const meta = categoryMeta[slug]
  const basePath = `/category/${slug}`

  const fallbackTitle = meta ? meta.title(page) : (page > 1 ? `${titleBase} Videos - Page ${page}` : `${titleBase} Videos`)
  const fallbackDescription = meta ? meta.desc : `Watch ${titleBase} videos on bestprn${page > 1 ? ` - Page ${page}` : ''}.`

  const seoMeta = await fetchSeoMeta(basePath)
  const baseTitle = seoMeta?.metaTitle || fallbackTitle
  const baseDescription = seoMeta?.metaDescription || fallbackDescription
  const title = page > 1 ? `${baseTitle} - Page ${page}` : baseTitle
  const description = page > 1 ? `${baseDescription} (Page ${page})` : baseDescription

  const canonicalBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://bestprn.com'
  const canonical = page > 1 ? `${canonicalBase}${basePath}/${page}` : `${canonicalBase}${basePath}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: seoMeta ? {
      title: seoMeta.ogTitle || seoMeta.metaTitle || title,
      description: seoMeta.ogDescription || seoMeta.metaDescription || description,
      url: canonical,
      type: 'website',
      images: seoMeta.ogImage ? [{ url: seoMeta.ogImage }] : undefined,
    } : undefined,
    twitter: seoMeta ? {
      card: 'summary_large_image',
      title: seoMeta.metaTitle || title,
      description: seoMeta.metaDescription || description,
      images: seoMeta.ogImage ? [seoMeta.ogImage] : undefined,
    } : undefined,
  }
}

// Generate unique static content for each category
function getCategoryContent(slug, titleBase, totalRecords, totalPages) {
  // Brand-salted variant so bestprn output differs from similar templates
  const brandSalt = 'bestprn'.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const seed = String(slug).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const variant = (seed + brandSalt) % 5
  const prefaces = [
    `bestprn editors curate this section for clarity and speed — tailored for ${titleBase}.`,
    `On bestprn, ${titleBase} is organized with clean UX and fast load so you get to playback quicker.`,
    `This bestprn ${titleBase} collection balances variety with a lightweight design for quick browsing.`,
    `bestprn prioritizes smooth playback and a clutter‑free layout across the ${titleBase} catalog.`,
    `Our ${titleBase} shelf on bestprn is tuned for discovery with crisp categories and swift navigation.`
  ]
  const streamingPhrases = [
    'Enjoy uninterrupted HD streaming on any device.',
    'Playback is optimized for quick start and minimal buffering.',
    'Streams adapt to your connection for smooth viewing.',
    'Mobile‑first performance delivers fast starts and fluid scrubbing.',
    'Experience clear visuals with efficient, lightweight pages.'
  ]
  const contentMap = {
    'badwap': {
      intro: `Explore ${totalRecords}+ Badwap videos featuring diverse content from various creators. This collection includes high-quality scenes with professional production values and authentic amateur contributions. Badwap content spans multiple genres and scenarios, offering viewers a comprehensive selection of entertainment options.`,
      details: `Our Badwap library encompasses both studio productions and user-generated content. Videos are organized by popularity and upload date, making it easy to discover trending content and new releases. The collection features performers from different backgrounds, ensuring variety in every browsing session. Content ranges from solo performances to elaborate multi-performer scenarios.`,
      navigation: `Browse through ${totalPages} pages of Badwap content, with 16 videos per page. The pagination system allows efficient exploration of the entire catalog. Videos are curated to maintain quality standards while offering diverse viewing options across different preferences and interests.`,
      closing: `All Badwap videos stream free in HD quality without registration requirements. Content is optimized for both desktop and mobile viewing, with adaptive playback ensuring smooth streaming across all devices and connection speeds.`
    },
    'scout69': {
      intro: `Discover ${totalRecords}+ Scout69 videos showcasing big boobs and big dick content in high definition. This specialized collection focuses on performers with enhanced physical attributes, delivering content that emphasizes visual appeal and physical performance. Scout69 videos feature both professional productions and select amateur content.`,
      details: `The Scout69 category highlights content with specific physical characteristics that appeal to dedicated audiences. Videos maintain high production standards with proper lighting and camera work that showcases performers' attributes effectively. Content includes solo showcases, duo scenes, and group scenarios, all emphasizing the category's defining features.`,
      navigation: `Navigate ${totalPages} pages featuring 16 Scout69 videos each. The collection is continuously updated with new releases featuring performers who match the category criteria. Use pagination controls to explore the full range of available content.`,
      closing: `Stream Scout69 content instantly with free HD playback. Videos are accessible on all modern browsers and mobile devices, with no account creation required for viewing.`
    },
    'lesbify': {
      intro: `Watch ${totalRecords}+ Lesbify lesbian videos featuring authentic chemistry between female performers. This collection celebrates girl-on-girl content across various scenarios and settings, from sensual encounters to intense passionate scenes. Lesbify videos showcase diverse pairings and scenarios within the lesbian category.`,
      details: `Our Lesbify library includes content ranging from romantic encounters to explicit action, featuring performers of various backgrounds and experience levels. Videos capture genuine connections and passionate interactions, with production values ranging from professional studio work to intimate amateur recordings. The collection emphasizes authentic chemistry and natural performances.`,
      navigation: `Explore ${totalPages} pages of Lesbify content, each displaying 16 lesbian videos. The catalog includes both trending favorites and new releases, organized for easy discovery. Pagination allows thorough browsing of the extensive collection.`,
      closing: `Enjoy Lesbify videos with unlimited free streaming in high definition. Content plays smoothly across desktop, tablet, and smartphone devices without registration requirements.`
    },
    'milfnut': {
      intro: `Experience ${totalRecords}+ MilfNut videos featuring experienced mature performers. This collection showcases MILF content with performers who bring years of expertise and confidence to their scenes. MilfNut videos span various scenarios from domestic settings to professional productions, all featuring mature talent.`,
      details: `The MilfNut category highlights seasoned performers known for their experience and screen presence. Content includes solo performances, duo scenes with younger partners, and group scenarios. Videos maintain professional production standards while capturing the unique appeal of mature performers. The collection features both established MILF stars and emerging mature talent.`,
      navigation: `Browse ${totalPages} pages of MilfNut content with 16 videos per page. The collection balances popular MILF favorites with newer additions, ensuring fresh content alongside proven performers. Use page navigation to discover the full range of mature content available.`,
      closing: `Stream MilfNut videos free in HD quality on any device. Content is optimized for smooth playback without downloads or account requirements.`
    },
    'desi49': {
      intro: `Discover ${totalRecords}+ Desi49 videos celebrating South Asian beauty and sensuality. This collection features desi performers in various scenarios, from traditional settings to modern productions. Desi49 content showcases the unique appeal of Indian and Pakistani performers across multiple genres.`,
      details: `Our Desi49 library encompasses authentic desi content with performers from the Indian subcontinent. Videos range from amateur homemade recordings to professional studio productions, all maintaining cultural authenticity while delivering quality entertainment. Content includes solo performances, couples, and group scenarios featuring desi talent.`,
      navigation: `Navigate ${totalPages} pages featuring 16 Desi49 videos each. The collection is regularly updated with new desi content, balancing popular favorites with fresh releases. Pagination enables comprehensive browsing of the entire desi catalog.`,
      closing: `Watch Desi49 content instantly with free HD streaming. Videos play seamlessly on all devices without registration, optimized for viewers worldwide.`
    },
    'dehati-sex': {
      intro: `Explore ${totalRecords}+ Dehati Sex videos featuring rural and village-themed desi content. This collection focuses on authentic dehati scenarios with performers in traditional and rural settings. Dehati Sex videos capture the unique appeal of village-based content with genuine cultural elements.`,
      details: `The Dehati Sex category specializes in rural Indian content, featuring scenarios set in village environments and traditional settings. Videos emphasize authenticity with performers portraying rural characters and situations. Content ranges from amateur village recordings to professionally produced dehati-themed scenes, all maintaining cultural context.`,
      navigation: `Browse through ${totalPages} pages of Dehati Sex content, with 16 videos per page organized for easy exploration. The collection includes both classic dehati favorites and new village-themed releases.`,
      closing: `Stream Dehati Sex videos free in HD quality across all devices. Content is accessible without registration, optimized for smooth playback.`
    },
    'boobs-pressing': {
      intro: `Watch ${totalRecords}+ Boobs Pressing videos focusing on breast play and fondling content. This specialized collection features scenes emphasizing breast attention, from gentle caressing to intense groping. Boobs Pressing videos showcase performers with various breast sizes in scenarios centered on breast stimulation.`,
      details: `Our Boobs Pressing library highlights content where breast play takes center stage. Videos feature performers with different breast sizes and types, from natural to enhanced. Content includes solo breast play, partner fondling, and scenarios where breast stimulation is the primary focus. Production values range from amateur POV to professional multi-angle coverage.`,
      navigation: `Explore ${totalPages} pages featuring 16 Boobs Pressing videos each. The collection is organized to showcase variety in breast types and pressing scenarios. Use pagination to discover the full range of breast-focused content.`,
      closing: `Enjoy Boobs Pressing videos with free HD streaming on any device. No registration required, with content optimized for smooth playback.`
    },
    'blueflim': {
      intro: `Discover ${totalRecords}+ Blue Film videos featuring classic and contemporary adult content. This collection encompasses a wide range of blue film material from various eras and styles. Blue Film videos include both vintage classics and modern productions, offering diverse viewing options.`,
      details: `The Blue Film category spans multiple decades of adult entertainment, featuring content from different production eras and styles. Videos include classic blue films with retro aesthetics alongside contemporary productions. The collection showcases various genres within the blue film category, from softcore to explicit content, maintaining historical and entertainment value.`,
      navigation: `Navigate ${totalPages} pages of Blue Film content with 16 videos per page. The catalog balances vintage classics with modern blue film productions, organized for easy browsing and discovery.`,
      closing: `Stream Blue Film videos free in available quality across all devices. Content is accessible without registration, optimized for various connection speeds.`
    },
    'sex-sister': {
      intro: `Explore ${totalRecords}+ Sex Sister videos featuring step-sibling and family roleplay scenarios. This collection focuses on taboo-themed content with performers portraying step-sister characters. Sex Sister videos emphasize forbidden attraction and family dynamic scenarios.`,
      details: `Our Sex Sister library specializes in step-sibling roleplay content where performers portray step-sisters in various scenarios. Videos feature storylines involving forbidden attraction, secret encounters, and family dynamic situations. Content ranges from subtle tension to explicit encounters, all within the step-sibling fantasy framework. Production values vary from amateur POV to professional narrative-driven scenes.`,
      navigation: `Browse ${totalPages} pages featuring 16 Sex Sister videos each. The collection includes popular step-sister scenarios and new roleplay releases, organized for easy exploration of the category.`,
      closing: `Watch Sex Sister content free in HD quality on any device. Streaming is instant without registration requirements, optimized for smooth playback.`
    },
    'sex18': {
      intro: `Watch ${totalRecords}+ Sex18 videos featuring young adult performers in their prime. This collection showcases legal 18+ performers in various scenarios and settings. Sex18 videos emphasize youthful energy and fresh talent, all with proper age verification.`,
      details: `The Sex18 category features verified 18+ performers bringing youthful enthusiasm to their scenes. Content includes first-time scenarios, college-themed productions, and young adult situations. All performers are age-verified legal adults, with videos maintaining professional production standards while capturing youthful appeal. The collection spans solo performances, duo scenes, and group scenarios.`,
      navigation: `Explore ${totalPages} pages of Sex18 content, each displaying 16 videos featuring young adult performers. The catalog is regularly updated with new 18+ talent while maintaining strict age verification standards.`,
      closing: `Stream Sex18 videos free in HD quality across all devices. Content is accessible without registration, with all performers verified as legal adults.`
    },
    'aunt-sex': {
      intro: `Discover ${totalRecords}+ Aunt Sex videos featuring mature woman roleplay scenarios. This collection focuses on aunt-nephew fantasy content with performers portraying older female relatives. Aunt Sex videos emphasize age-gap dynamics and forbidden family attraction themes.`,
      details: `Our Aunt Sex library specializes in mature woman roleplay where performers portray aunt characters in various scenarios. Videos feature storylines involving older woman seduction, forbidden family dynamics, and age-gap attractions. Content showcases experienced performers in aunt roles, with scenarios ranging from subtle seduction to explicit encounters. Production styles vary from amateur POV to professionally scripted scenes.`,
      navigation: `Navigate ${totalPages} pages featuring 16 Aunt Sex videos each. The collection balances popular aunt roleplay scenarios with new releases, organized for easy category exploration.`,
      closing: `Enjoy Aunt Sex content with free HD streaming on any device. No registration required, with content optimized for smooth playback.`
    },
    'teen-sex': {
      intro: `Experience ${totalRecords}+ Teen Sex videos featuring youthful 18+ performers. This collection showcases legal teen-aged adults in various scenarios, all with proper age documentation. Teen Sex videos emphasize fresh faces and energetic performances from verified young adult performers.`,
      details: `The Teen Sex category features age-verified 18+ performers in teen-themed scenarios. Content includes college settings, first-time situations, and young adult scenarios. All performers are verified legal adults despite youthful appearance, with videos maintaining high production standards. The collection spans various teen-themed genres from innocent scenarios to explicit content.`,
      navigation: `Browse ${totalPages} pages of Teen Sex content with 16 videos per page. The catalog features verified 18+ performers in teen-themed scenarios, regularly updated with new young adult talent.`,
      closing: `Stream Teen Sex videos free in HD quality on all devices. Content is accessible without registration, with strict age verification ensuring all performers are legal adults.`
    },
    'small-tits': {
      intro: `Watch ${totalRecords}+ Small Tits videos featuring petite-breasted performers. This collection celebrates performers with smaller breast sizes across various scenarios. Small Tits videos showcase natural beauty and performers who embrace their petite physiques.`,
      details: `Our Small Tits library highlights performers with naturally small breasts in diverse content types. Videos feature petite-breasted performers in solo, duo, and group scenarios, emphasizing natural beauty over enhancement. Content ranges from amateur recordings to professional productions, all celebrating smaller breast aesthetics. The collection includes various body types and performer backgrounds.`,
      navigation: `Explore ${totalPages} pages featuring 16 Small Tits videos each. The collection showcases petite-breasted performers across different scenarios and production styles, organized for easy browsing.`,
      closing: `Enjoy Small Tits content with free HD streaming on any device. No registration required, with content optimized for smooth playback.`
    },
    'comxxx': {
      intro: `Discover ${totalRecords}+ Comxxx videos featuring step-family and household roleplay scenarios. This collection focuses on family dynamic fantasies with performers portraying various household relationships. Comxxx videos emphasize forbidden attractions and domestic scenarios.`,
      details: `The Comxxx category specializes in step-family roleplay content with performers in various household relationship scenarios. Videos feature storylines involving step-parents, step-siblings, and other domestic dynamics. Content ranges from subtle tension to explicit encounters, all within family fantasy frameworks. Production values vary from amateur homemade aesthetics to professional narrative-driven scenes.`,
      navigation: `Navigate ${totalPages} pages of Comxxx content with 16 videos per page. The collection includes popular step-family scenarios and new household roleplay releases, organized for comprehensive browsing.`,
      closing: `Stream Comxxx videos free in HD quality across all devices. Content is accessible without registration, optimized for smooth playback.`
    },
    'chochox': {
      intro: `Explore ${totalRecords}+ Chochox videos featuring animated and cartoon-style adult content. This collection includes hentai, animated parodies, and cartoon-themed productions. Chochox videos offer animated alternatives to live-action content across various genres.`,
      details: `Our Chochox library encompasses animated adult content from various sources and styles. Videos include Japanese hentai, Western animated parodies, and original cartoon productions. Content spans multiple animation styles and genres, from romantic scenarios to explicit action. The collection features both 2D and 3D animated content with varying production qualities.`,
      navigation: `Browse ${totalPages} pages featuring 16 Chochox videos each. The catalog includes diverse animated content styles and genres, organized for easy exploration of cartoon-themed material.`,
      closing: `Watch Chochox content free in available quality on any device. Streaming is instant without registration, optimized for animated content playback.`
    },
    'fullporner': {
      intro: `Experience ${totalRecords}+ Fullporner videos featuring comprehensive adult content across all categories. This collection offers diverse material from various genres and performers. Fullporner videos span multiple content types, providing extensive viewing options.`,
      details: `The Fullporner category encompasses broad adult content across multiple genres and styles. Videos include solo performances, duo scenes, group scenarios, and specialty content. The collection features performers from various backgrounds and experience levels, with production values ranging from amateur to professional studio work. Content is organized to provide maximum variety and viewing options.`,
      navigation: `Explore ${totalPages} pages of Fullporner content with 16 videos per page. The extensive catalog covers multiple genres and performer types, organized for comprehensive browsing and discovery.`,
      closing: `Stream Fullporner videos free in HD quality on all devices. Content is accessible without registration, optimized for smooth playback across various connection speeds.`
    },
    'famili-sex-com': {
      intro: `Discover ${totalRecords}+ Family Sex videos featuring household and step-family roleplay scenarios. This collection focuses on family dynamic fantasies with performers portraying various familial relationships. Family Sex videos emphasize taboo attractions and domestic situations.`,
      details: `Our Family Sex library specializes in step-family roleplay content where performers portray various household relationships. Videos feature storylines involving step-parents, step-siblings, and extended family dynamics. Content ranges from tension-building scenarios to explicit encounters, all within family fantasy frameworks. Production styles include amateur POV perspectives and professionally scripted narrative scenes.`,
      navigation: `Navigate ${totalPages} pages featuring 16 Family Sex videos each. The collection includes popular family roleplay scenarios and new household dynamic releases, organized for easy category exploration.`,
      closing: `Enjoy Family Sex content with free HD streaming on any device. No registration required, with content optimized for smooth playback.`
    },
  }

  const base = contentMap[slug] || {
    intro: `Explore ${totalRecords}+ ${titleBase} videos in high definition. This collection features diverse content from various performers and studios, updated regularly with new releases. ${titleBase} videos span multiple scenarios and production styles, offering comprehensive viewing options.`,
    details: `Our ${titleBase} library encompasses both professional studio productions and select amateur contributions. Videos are organized by popularity and upload date, making content discovery straightforward. The collection features performers at various experience levels, ensuring variety across different preferences and interests.`,
    navigation: `Browse through ${totalPages} pages of ${titleBase} content, with 16 videos per page. The pagination system allows efficient exploration of the entire catalog. Videos are curated to maintain quality standards while offering diverse viewing options.`,
    closing: `All ${titleBase} videos stream free in HD quality without registration requirements. Content is optimized for desktop and mobile viewing, with adaptive playback ensuring smooth streaming across all devices.`
  }

  const intro = `${prefaces[variant]} ${base.intro}`
  const closing = `${base.closing} ${streamingPhrases[variant]}`
  return { ...base, intro, closing }
}

async function getCustomContent(slug) {
  try {
    return await api.getCustomContent('category', slug)
  } catch {
    return null
  }
}

export default async function CategoryPage({ params, searchParams }) {
  const slug = params.slug
  const page = Number(params.page || searchParams?.page || 1)
  const query = categorySearch[slug] || slug.replace(/-/g, ' ')
  const data = await api.searchPosts(query, page, 16, '').catch(() => ({ records: [], totalPages: 1, totalRecords: 0 }))
  const titleBase = categoryTitles[slug] || slug.replace(/-/g, ' ')
  
  const customContent = page === 1 ? await getCustomContent(slug) : null

  // Generate unique content for page 1 (fallback)
  const content = page === 1 && !customContent ? getCategoryContent(slug, titleBase, data.totalRecords || 0, data.totalPages || 1) : null
  
  // Build small dynamic highlights from current page data (unique per page load)
  const records = Array.isArray(data.records) ? data.records : []
  const samplePerformers = [...new Set(records.flatMap(v => Array.isArray(v.name) ? v.name : []).filter(Boolean))]
    .slice(0, 5)
    .map(n => n.replace(/-/g, ' '))
  const sampleTags = [...new Set(records.flatMap(v => Array.isArray(v.tags) ? v.tags : []).filter(Boolean))]
    .slice(0, 6)
    .map(t => t.replace(/-/g, ' '))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{titleBase} Videos</h1>
        <p className="text-gray-400 mt-1 text-sm">Showing page {page} of {data.totalPages || 1} ({data.totalRecords || 0} total videos)</p>
      </div>
      
      {/* Video Grid - Shows First */}
      <div className="grid video-grid">
        {(data.records || []).map((v, idx) => (
          <VideoCard key={v._id || idx} video={v} />
        ))}
      </div>
      
      {/* Pagination */}
      <Pagination basePath={`/category/${slug}`} currentPage={page} totalPages={data.totalPages || 1} />
      
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
          <h2 className="text-xl font-semibold mb-4">About {titleBase} Videos</h2>
          <p>{content.intro}</p>
          <p>{content.details}</p>
          <p>{content.navigation}</p>
          <p>{content.closing}</p>
          {(samplePerformers.length > 0 || sampleTags.length > 0) && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <h3 className="text-lg font-semibold mb-2">Highlights on this page</h3>
              {samplePerformers.length > 0 && (
                <p className="text-sm text-gray-300"><span className="text-gray-400">Performers:</span> {samplePerformers.join(', ')}</p>
              )}
              {sampleTags.length > 0 && (
                <p className="text-sm text-gray-300"><span className="text-gray-400">Popular tags:</span> {sampleTags.join(', ')}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
