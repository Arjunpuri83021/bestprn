'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Logo from './Logo'
import { Heart, Star, Film, Users } from 'lucide-react'
// Note: showing only static lists (no API fetch) per request

export default function Footer() {
  // Fallbacks to ensure footer is never empty
  const userStaticTags = [
    { name: 'Anal', slug: 'anal' },
    { name: 'Babe', slug: 'babe' },
    { name: 'BBC', slug: 'bbc' },
    { name: 'Blowjob', slug: 'blowjob' },
    { name: 'Doggystyle', slug: 'doggystyle' },
    { name: 'Cumshot Family', slug: 'cumshotfamily' },
    { name: 'MILF', slug: 'milf' },
    { name: 'Mom', slug: 'mom' },
    { name: 'Office', slug: 'office' },
    { name: 'School', slug: 'school' },
  ]
  const fallbackTags = [
    { name: 'Indian', slug: 'indian' },
    { name: 'Hijabi', slug: 'hijabi' },
    ...userStaticTags,
  ]

  const userStaticStars = [
    { name: 'Valentina Nappi', slug: 'valentina-nappi' },
    { name: 'Leah Gotti', slug: 'leah-gotti' },
    { name: 'Mia Malkova', slug: 'mia-malkova' },
    { name: 'Lulu Chu', slug: 'lulu-chu' },
    { name: 'Dani Daniels', slug: 'dani-daniels' },
    { name: 'Lana Rhoades', slug: 'lana-rhoades' },
    { name: 'Abella Danger', slug: 'abella-danger' },
    { name: 'Aubree Valentine', slug: 'aubree-valentine' },
    { name: 'Mia Khalifa', slug: 'mia-khalifa' },
  ]
  const fallbackStars = [
    ...userStaticStars,
    { name: 'Sunny Leone', slug: 'sunny-leone' },
    { name: 'Riley Reid', slug: 'riley-reid' },
    { name: 'Angela White', slug: 'angela-white' },
    { name: 'Ava Addams', slug: 'ava-addams' },
    { name: 'Johnny Sins', slug: 'johnny-sins' },
    { name: 'Gianna Michaels', slug: 'gianna-michaels' },
    { name: 'Nicole Aniston', slug: 'nicole-aniston' },
  ]

  // Use only static lists so content never changes after refresh
  const footerTags = userStaticTags
  const footerPornstars = userStaticStars
  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'New Videos', href: '/new-content' },
    { name: 'Popular Videos', href: '/most-liked' },
    { name: 'Pornstars', href: '/pornstars' },
    { name: 'Categories', href: '/tags' },
  ]

  // Categories aligned with hexmy/src/components/partials/Slider.js
  const sliderCategories = [
    'chochox',
    'scout69',
    'comxxx',
    'lesbify',
    'milfnut',
    'badwap',
    'sex sister',
    'sex18',
    'desi49',
    'dehati sex',
    'boobs pressing',
    'blueflim',
    'aunt sex',
    'famili sex com',
    'teen sex',
    'small tits',
    'fullporner',
  ]
  const categories = sliderCategories.map((name) => ({
    name,
    href: `/category/${name.toLowerCase().replace(/\s+/g, '-')}`,
  }))

  return (
    <footer className="text-white bg-gradient-to-b from-[#0b0b12] to-[#1a0a0e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div className="space-y-4">
            <Logo size="lg" />
            <p className="text-gray-400/90 text-sm leading-relaxed">
              Premium adult entertainment platform featuring high-quality videos from top performers worldwide.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm text-red-300/90">
                <Film size={16} className="text-red-400" />
                <span>HD Quality</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-pink-300/90">
                <Heart size={16} className="text-pink-400" />
                <span>Daily Updates</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-red-400 mb-1">Navigate</h3>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Film size={18} className="text-red-400" />
              <span>Quick Links</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-xs px-2 py-1 rounded-full border border-red-900/30 bg-red-900/10 hover:bg-red-900/20 hover:border-red-500/30 text-gray-200 transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-pink-400 mb-1">Browse</h3>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Users size={18} className="text-pink-400" />
              <span>Categories</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 12).map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="text-xs px-2 py-1 rounded-full border border-pink-900/30 bg-pink-900/10 hover:bg-pink-900/20 hover:border-pink-500/30 text-gray-200 transition-colors duration-200"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Tags */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-red-400 mb-1">Explore</h3>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Star size={18} className="text-red-400" />
              <span>Popular Tags</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {footerTags.slice(0, 8).map((tag, index) => (
                <Link
                  key={index}
                  href={`/tag/${tag.slug || tag.name?.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-xs px-2 py-1 rounded-full border border-red-900/30 bg-red-900/10 hover:bg-red-900/20 hover:border-red-500/30 text-gray-200 transition-colors duration-200"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Pornstars */}
        <div className="mt-10 pt-8 border-t border-red-900/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Star size={18} className="text-pink-400" />
            <span>Popular Pornstars</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {footerPornstars.slice(0, 12).map((star, index) => (
              <Link
                key={index}
                href={`/pornstar/${star.slug || star.name?.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-xs px-2 py-1 rounded-full border border-pink-900/30 bg-pink-900/10 hover:bg-pink-900/20 hover:border-pink-500/30 text-gray-200 transition-colors duration-200"
              >
                {star.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-10 pt-8 border-t border-red-900/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} bestprn. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-red-400 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-red-400 transition-colors duration-200">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-red-400 transition-colors duration-200">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
