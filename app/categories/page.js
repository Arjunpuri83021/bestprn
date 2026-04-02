import Link from 'next/link'
import { fetchSeoMeta } from '../lib/seoMeta'

export async function generateMetadata() {
  const fallback = {
    title: 'Categories',
    description: 'Browse video categories on bestprn.',
    alternates: { canonical: '/categories' },
  }

  const meta = await fetchSeoMeta('/categories')
  if (!meta) return fallback

  return {
    title: meta.metaTitle || fallback.title,
    description: meta.metaDescription || fallback.description,
    alternates: { canonical: meta.pagePath || '/categories' },
    openGraph: {
      title: meta.ogTitle || meta.metaTitle || fallback.title,
      description: meta.ogDescription || meta.metaDescription || fallback.description,
      url: meta.pagePath || '/categories',
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

const categories = [
  { name: 'Indian', href: '/indian' },
  { name: 'Hijabi', href: '/muslim' },
  { name: 'Scout69', href: '/category/scout69' },
  { name: 'Lesbify', href: '/category/lesbify' },
  { name: 'MilfNut', href: '/category/milfnut' },
  { name: 'Desi49', href: '/category/desi49' },
  { name: 'Teen Sex', href: '/category/teen-sex' },
  { name: 'Family Sex', href: '/category/famili-sex-com' },
  { name: 'Blue Film', href: '/category/blueflim' },
  { name: 'Small Tits', href: '/category/small-tits' },
]

export default function CategoriesIndexPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold mb-6">Categories</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm px-4 py-3 rounded-md text-center transition-colors duration-200"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
