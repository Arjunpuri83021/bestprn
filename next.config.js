/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  basePath: '',
  assetPrefix: isProd ? (process.env.NEXT_PUBLIC_ASSET_PREFIX || '/') : '',
  images: {
    // Add ALL production image hosts here (API/CDN/external)
    remotePatterns: [
      { protocol: 'https', hostname: 'bestprn.com' },
      { protocol: 'https', hostname: 'freshporno.org' },
      { protocol: 'https', hostname: 'api.majehimaje.life' },
      // { protocol: 'https', hostname: 'your-api-host.com' },
      // { protocol: 'https', hostname: 'your-cdn.com' },
    ],
    // Keep unoptimized if you are serving original images without Next/image optimization
    unoptimized: true,
  },
  async rewrites() {
    // In production, do NOT rewrite /api to localhost
    if (isProd) return []

    // Development-only API proxy to local backend
    const devOrigin = process.env.DEV_API_ORIGIN || 'http://localhost:5000'
    return [
      {
        source: '/api/:path*',
        destination: `${devOrigin}/:path*`,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
