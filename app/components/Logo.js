'use client'

import Link from 'next/link'

export default function Logo({ href = '/', size = 'md', subtitle = true }) {
  // Sizes for the text and emblem
  const sizes = {
    sm: { emblem: 28, title: 'text-lg', subtitle: 'text-[9px]' },
    md: { emblem: 36, title: 'text-xl', subtitle: 'text-[10px]' },
    lg: { emblem: 44, title: 'text-2xl', subtitle: 'text-[11px]' },
  }
  const s = sizes[size] || sizes.md

  return (
    <Link href={href} className="flex items-center space-x-2 select-none">
      {/* Emblem: Stylized BP with flame effect */}
      <svg
        width={s.emblem}
        height={s.emblem}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-glow"
        aria-label="bestprn logo"
      >
        <defs>
          <linearGradient id="flameRed" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7f1d1d"/>
            <stop offset="50%" stopColor="#dc2626"/>
            <stop offset="100%" stopColor="#fbbf24"/>
          </linearGradient>
          <linearGradient id="hotPink" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899"/>
            <stop offset="50%" stopColor="#f472b6"/>
            <stop offset="100%" stopColor="#fbcfe8"/>
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>
        
        {/* Background circle with flame gradient */}
        <circle cx="32" cy="32" r="30" fill="url(#flameRed)"/>
        
        {/* Inner circle */}
        <circle cx="32" cy="32" r="26" fill="#1a0a0e"/>
        
        {/* BP Letters */}
        <text x="12" y="42" fontSize="28" fontWeight="900" fill="url(#hotPink)" fontFamily="Arial, sans-serif">B</text>
        <text x="30" y="42" fontSize="28" fontWeight="900" fill="white" fontFamily="Arial, sans-serif">P</text>
        
        {/* Flame accent */}
        <path d="M32 4 Q36 12 32 16 Q28 12 32 4" fill="#fbbf24" opacity="0.9"/>
      </svg>

      {/* Wordmark */}
      <div className="leading-tight">
        <div className={`${s.title} font-black tracking-tight`}> 
          <span className="bg-gradient-to-r from-red-600 via-red-500 to-amber-400 bg-clip-text text-transparent">BEST</span>
          <span className="bg-gradient-to-r from-pink-500 via-pink-400 to-rose-400 bg-clip-text text-transparent">PRN</span>
        </div>
        {subtitle && (
          <div className={`${s.subtitle} text-red-300/60 tracking-[0.2em] -mt-0.5 font-medium`}>
            BESTPRN.COM
          </div>
        )}
      </div>
    </Link>
  )
}
