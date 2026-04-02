'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Logo from './Logo'
import { useRouter, usePathname } from 'next/navigation'

import { Search, Menu, X, Home, Star, Film, TrendingUp, Clock, Heart, Flame } from 'lucide-react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [allTags, setAllTags] = useState([])
  const [allStars, setAllStars] = useState([])
  const router = useRouter()

  const navigationItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Stars', href: '/pornstars', icon: Star },
    { name: 'Indian', href: '/indian', icon: Film },
    { name: 'Hijabi', href: '/hijabi', icon: Film },
    { name: 'New Videos', href: '/new-videos', icon: Clock },
    { name: 'Popular', href: '/top-videos', icon: TrendingUp },
    { name: 'Categories', href: '/tags', icon: Film },
  ]

  const categories = [
    { name: 'Scout69', href: '/category/scout69' },
    { name: 'Lesbify', href: '/category/lesbify' },
    { name: 'MilfNut', href: '/category/milfnut' },
    { name: 'Desi49', href: '/category/desi49' },
    { name: 'Teen Sex', href: '/category/teen-sex' },
    { name: 'Family Sex', href: '/category/famili-sex-com' },
    { name: 'Blue Film', href: '/category/blueflim' },
    { name: 'Small Tits', href: '/category/small-tits' },
  ]

  // Preload tags and stars once
  useEffect(() => {
    // Prefer explicit env var; otherwise use current origin in browser.
    const API_BASE = (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim())
      ? process.env.NEXT_PUBLIC_API_URL.trim().replace(/\/$/, '')
      : (typeof window !== 'undefined' ? window.location.origin.replace(/\/$/, '') : '')
    const load = async () => {
      try {
        const [tagsRes, starsRes] = await Promise.all([
          fetch(`${API_BASE}/tags?limit=500`),
          fetch(`${API_BASE}/pornstars?limit=500`),
        ])
        if (tagsRes.ok && (tagsRes.headers.get('content-type') || '').includes('application/json')) {
          const td = await tagsRes.json()
          const rawTags = (td.tags || []).map(t => (typeof t === 'string' ? t : (t.name || ''))).filter(Boolean)
          // Dedupe tags by normalized key (lowercase + trimmed)
          const tagMap = new Map()
          rawTags.forEach(tag => {
            const key = tag.toLowerCase().trim()
            if (!key) return
            if (!tagMap.has(key)) tagMap.set(key, tag)
          })
          setAllTags(Array.from(tagMap.values()))
        }
        if (starsRes.ok && (starsRes.headers.get('content-type') || '').includes('application/json')) {
          const sd = await starsRes.json()
          // Dedupe stars by normalized key (lowercase, hyphen/space-insensitive)
          const starMap = new Map()
          ;(sd.pornstars || []).forEach(star => {
            const nm = (star?.name || '').trim()
            if (!nm) return
            const display = nm.replace(/-/g, ' ').trim()
            const key = display.toLowerCase()
            if (!starMap.has(key)) starMap.set(key, display)
          })
          setAllStars(Array.from(starMap.values()))
        }
      } catch (e) {
        console.error('Suggestion preload failed', e)
      }
    }
    load()
  }, [])

  // Filter suggestions on input
  useEffect(() => {
    const q = searchQuery.trim()
    if (q.length === 0) {
      setSearchSuggestions([])
      setShowSuggestions(false)
      return
    }
    const ql = q.toLowerCase()
    const tagSuggestions = allTags
      .filter(tag => tag?.toLowerCase().includes(ql))
      .slice(0, 5)
      .map(tag => ({ type: 'tag', name: tag, href: `/tag/${slugify(tag)}` }))
    const starSuggestions = allStars
      .filter(star => star?.toLowerCase().includes(ql))
      .slice(0, 5)
      .map(star => ({ type: 'pornstar', name: displayText(star), href: `/pornstar/${slugify(star)}` }))
    // Final dedupe by href to avoid any residual duplicates
    const seen = new Set()
    const combined = [...tagSuggestions, ...starSuggestions].filter(s => {
      if (seen.has(s.href)) return false
      seen.add(s.href)
      return true
    }).slice(0, 8)
    setSearchSuggestions(combined)
    setShowSuggestions(combined.length > 0)
  }, [searchQuery, allTags, allStars])

  // Helpers like legacy
  const slugify = (text) => text?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const displayText = (text) => text?.replace(/-/g, ' ')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSuggestions(false)
      setSearchQuery('')
    }
  }

  const handleSuggestionClick = (suggestion) => {
    router.push(suggestion.href)
    setShowSuggestions(false)
    setSearchQuery('')
    setIsMobileSearchOpen(false)
  }

  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 text-white bg-gradient-to-r from-[#1a0a0e] to-[#2d1218] border-b border-red-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-1 px-1.5 py-1 ${isActive ? 'text-white border-b-2 border-red-500' : 'text-gray-300 hover:text-red-400 hover:border-red-400/50'} transition-colors nav-link`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center relative">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search videos, stars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-64 px-4 py-2 pl-10 bg-white/5 border border-red-900/30 rounded-lg focus:outline-none focus:border-red-500 placeholder:text-gray-400 transition-colors duration-200"
              />
              <Search className="absolute left-3 top-2.5 text-red-400" size={16} />
              
              {/* Search Suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a0a0e] border border-red-900/30 rounded-lg shadow-lg shadow-red-900/20 max-h-64 overflow-y-auto z-50">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-2 hover:bg-red-900/20 transition-colors duration-200"
                    >
                      {suggestion.name}
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* Mobile actions */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className="p-2 rounded-lg hover:bg-red-900/20 transition-colors duration-200"
              aria-label="Open search"
            >
              <Search size={22} className="text-red-400" />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-red-900/20 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} className="text-red-400" /> : <Menu size={24} className="text-red-400" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-red-900/30">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search videos, stars..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 bg-white/5 border border-red-900/30 rounded-lg focus:outline-none focus:border-red-500"
                />
                <Search className="absolute left-3 top-2.5 text-red-400" size={16} />
              </div>
            </form>

            {/* Mobile Navigation Items */}
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-red-900/20 transition-colors duration-200"
                  >
                    <Icon size={20} className="text-red-400" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              {/* Mobile Categories */}
              <div className="px-4 py-2">
                <h3 className="text-sm font-semibold text-red-400 mb-2">Categories</h3>
                <div className="space-y-1 ml-4">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-1 hover:text-red-400 transition-colors duration-200"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#1a0a0e] to-[#2d1218] z-[60] border-b border-red-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <form onSubmit={(e) => { handleSearch(e); setIsMobileSearchOpen(false) }} className="relative">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search videos, stars..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="w-full px-4 py-2 pl-10 bg-white/5 border border-red-900/30 rounded-lg focus:outline-none focus:border-red-500"
                  />
                  <Search className="absolute left-3 top-2.5 text-red-400" size={16} />
                </form>
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a0a0e] border border-red-900/30 rounded-lg shadow-lg shadow-red-900/20 max-h-64 overflow-y-auto z-[70]">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-2 hover:bg-red-900/20 transition-colors duration-200"
                      >
                        {suggestion.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="p-2 rounded-lg hover:bg-red-900/20 transition-colors duration-200"
                aria-label="Close search"
              >
                <X size={22} className="text-red-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
