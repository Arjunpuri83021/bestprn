import Link from 'next/link'
import { api } from '../lib/api'
import { fetchSeoMeta } from '../lib/seoMeta'

export const revalidate = 300

export async function generateMetadata() {
  const fallback = {
    title: 'Best All Porn Tags - Browse by Category | bestprn',
    description: 'Browse all porn video tags and categories on bestprn. Find your favorite adult content by tag - organized alphabetically for easy navigation.',
    alternates: { canonical: '/tags' },
  }

  const meta = await fetchSeoMeta('/tags')
  if (!meta) return fallback

  return {
    title: meta.metaTitle || fallback.title,
    description: meta.metaDescription || fallback.description,
    alternates: { canonical: meta.pagePath || '/tags' },
    openGraph: {
      title: meta.ogTitle || meta.metaTitle || fallback.title,
      description: meta.ogDescription || meta.metaDescription || fallback.description,
      url: meta.pagePath || '/tags',
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

const LETTERS = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')]

function toSlug(s) {
  return (s || '').toString().toLowerCase().trim().replace(/\s+/g, '-')
}

function getFirstLetter(tagName) {
  const ch = (tagName || '').toString().trim().charAt(0).toUpperCase()
  return ch >= 'A' && ch <= 'Z' ? ch : '#'
}

export default async function TagsPage({ searchParams }) {
  const selectedLetter = (searchParams?.letter || '').toString().toUpperCase()
  const search = searchParams?.q || ''

  // Fetch a large set of tags server-side and group locally for fast UX
  const data = await api.getTags(1, 1000, search).catch(() => ({ tags: [] }))
  const tagsRaw = (data.tags || []).map(t => {
    if (typeof t === 'string') {
      return { name: t, slug: toSlug(t), count: 0 }
    }
    return {
      name: t?.name || t?.originalTag || '',
      slug: t?.slug || toSlug(t?.name || t?.originalTag || ''),
      count: t?.count || t?.total || 0,
    }
  })

  // Deduplicate by normalized slug (case/whitespace-insensitive)
  const tagMap = new Map()
  for (const t of tagsRaw) {
    const key = toSlug(t.name || t.slug)
    if (!key) continue
    if (!tagMap.has(key)) {
      tagMap.set(key, { name: t.name, slug: key, count: Number(t.count) || 0 })
    } else {
      const prev = tagMap.get(key)
      // Merge counts (sum), keep the first readable name
      tagMap.set(key, { name: prev.name || t.name, slug: key, count: (Number(prev.count) || 0) + (Number(t.count) || 0) })
    }
  }
  const tags = Array.from(tagMap.values())

  // Group tags by first letter
  const grouped = tags.reduce((acc, t) => {
    const letter = getFirstLetter(t.name)
    acc[letter] = acc[letter] || []
    acc[letter].push(t)
    return acc
  }, {})

  // If a letter is selected, only keep that group
  const lettersToShow = selectedLetter && LETTERS.includes(selectedLetter) ? [selectedLetter] : LETTERS

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">All Tags</h1>
        {/* Quick search placeholder (optional) */}
      </div>

      {/* Alphabet Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {LETTERS.map((L) => (
          <Link
            key={L}
            href={L === selectedLetter ? '/tags' : `/tags?letter=${L}`}
            className={`px-3 py-1 rounded-md border text-sm ${L === selectedLetter ? 'bg-gradient-to-r from-red-600 to-pink-600 border-red-500 text-white font-semibold shadow-lg shadow-red-500/30' : 'text-white border-red-900/30 hover:border-red-500 hover:bg-red-900/20 transition-all'}`}
          >
            {L}
          </Link>
        ))}
      </div>

      {/* Grouped Tag Sections */}
      <div className="space-y-10">
        {lettersToShow.map((L) => (
          (grouped[L] && grouped[L].length > 0) ? (
            <section key={L}>
              <h2 className="text-xl font-semibold mb-4">{L}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {grouped[L]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((tag) => (
                    <Link
                      key={tag.slug}
                      href={`/tag/${tag.slug}`}
                      className="bg-gradient-to-br from-gray-800 to-gray-900 hover:from-red-900/30 hover:to-pink-900/30 border border-red-900/20 hover:border-red-500/50 text-gray-200 hover:text-white text-sm px-3 py-2 rounded-md text-center transition-all duration-200"
                    >
                      {tag.name}
                      {tag.count ? <span className="text-gray-400"> ({tag.count})</span> : null}
                    </Link>
                  ))}
              </div>
            </section>
          ) : null
        ))}
      </div>
    </div>
  )
}
