import './globals.css'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import AppFrame from './components/AppFrame'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    default: 'bestprn - Free HD Adult Videos',
    template: '%s | bestprn'
  },
  description: 'Stream free HD adult videos featuring trending categories and top stars. Fresh content added daily for a fast, clean experience.',
  keywords: 'free porn, hd porn videos, adult videos, streaming',
  authors: [{ name: 'bestprn' }],
  creator: 'bestprn',
  publisher: 'bestprn',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://bestprn.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://bestprn.com',
    siteName: 'bestprn',
    title: 'bestprn - Free HD Adult Videos',
    description: 'Stream free HD adult videos featuring trending categories and top stars. Fresh content added daily.',
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
    title: 'bestprn - Free HD Adult Videos',
    description: 'Stream free HD adult videos featuring trending categories and top stars. Fresh content added daily.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'Nd478aVmvficVwgJECSy12PcyVUrXxjVaJxwRcLTUhs',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="shortcut icon" href="/icon.svg" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RCK9STX7KT"
          strategy="afterInteractive"
        />
        <Script id="ga-gtag" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-RCK9STX7KT');`}
        </Script>
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <AppFrame>
          {children}
        </AppFrame>
        {/* Global Ad Scripts */}
      </body>
    </html>
  )
}
