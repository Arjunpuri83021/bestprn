import Link from 'next/link'
import { api } from '../lib/api'
import { fetchSeoMeta } from '../lib/seoMeta'
import Pagination from '../components/Pagination'
import Image from 'next/image'

export const revalidate = 60

export async function generateMetadata() {
  const fallback = {
    title: 'bestprn Adult Actress 3Pornstar 4K Pornstar Black Pornstars | bestprn',
    description: 'A list of top-rated adult actresses and pornstars, including black pornstars and 4K-rated performers.',
    alternates: { canonical: '/pornstars' },
  }

  const meta = await fetchSeoMeta('/pornstars')
  if (!meta) return fallback

  return {
    title: meta.metaTitle || fallback.title,
    description: meta.metaDescription || fallback.description,
    alternates: { canonical: meta.pagePath || '/pornstars' },
    openGraph: {
      title: meta.ogTitle || meta.metaTitle || fallback.title,
      description: meta.ogDescription || meta.metaDescription || fallback.description,
      url: meta.pagePath || '/pornstars',
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

function toSlug(s) {
  return (s || '').toString().toLowerCase().trim().replace(/\s+/g, '-')
}

export default async function PornstarsPage({ searchParams }) {
  const page = Number(searchParams?.page || 1)
  const letter = (searchParams?.letter || '').toString().toUpperCase()

  const res = await api.getAllPornstars(page, 30, '', letter).catch(() => ({ pornstars: [], pagination: { totalPages: 1 } }))
  const stars = res.pornstars || []
  const totalPages = (res.pagination && res.pagination.totalPages) || res.totalPages || 1

  // Fetch first video image for each star (server-side)
  const images = await Promise.all(
    stars.map(async (s) => {
      try {
        const vids = await api.getPornstarVideos(s.name, 1, 1)
        const first = (vids.records || vids.data || vids.videos || [])[0]
        return first?.imageUrl || null
      } catch {
        return null
      }
    })
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold mb-6">Pornstars</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {stars.map((star, idx) => (
          <Link
            key={idx}
            href={`/pornstar/${toSlug(star.slug || star.name || '')}`}
            className="bg-gray-800 rounded-lg p-3 text-center hover:bg-gray-700 transition-colors duration-200"
          >
            <div className="w-full aspect-square relative rounded-md overflow-hidden bg-gray-700 mb-2">
              {images[idx] ? (
                <Image
                  src={images[idx]}
                  alt={star.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 200px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-2xl text-gray-400">
                  {(star.name || '?').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="text-sm text-white font-medium truncate">{star.name}</div>
          </Link>
        ))}
      </div>

      <Pagination basePath={`/pornstars${letter ? `?letter=${letter}` : ''}${letter ? '&' : '?'}sort=az`} currentPage={page} totalPages={totalPages} />
    </div>
  )
}
