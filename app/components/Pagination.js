"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Pagination({ basePath = '/', currentPage = 1, totalPages = 1 }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (totalPages <= 1) return null

  const pageNumbers = getVisiblePages(currentPage, totalPages, isMobile)

  const pageHref = (page) => {
    // Query-based pagination: preserve existing query params
    if (basePath.includes('?')) {
      const [path, queryString] = basePath.split('?')
      const params = new URLSearchParams(queryString || '')
      if (page === 1) {
        params.delete('page')
      } else {
        params.set('page', String(page))
      }
      const qs = params.toString()
      return qs ? `${path}?${qs}` : path
    }
    if (basePath.endsWith('/')) basePath = basePath.slice(0, -1)
    return page === 1 ? `${basePath}` : `${basePath}/${page}`
  }

  return (
    <nav className="flex items-center justify-center gap-1 sm:gap-2 mt-8 flex-wrap px-2" aria-label="Pagination">
      <Link
        href={pageHref(Math.max(1, currentPage - 1))}
        className={`px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-md border text-xs sm:text-sm transition-colors whitespace-nowrap ${currentPage === 1 ? 'text-gray-500 border-gray-700 bg-gray-800/50 cursor-not-allowed pointer-events-none' : 'text-gray-100 border-red-900/30 bg-gray-900 hover:border-red-500 hover:text-white'}`}
      >
        {isMobile ? '←' : '← Prev'}
      </Link>

      <div className="flex items-center gap-1 sm:gap-2">
        {pageNumbers.map((p, idx) => (
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-1 sm:px-2 text-gray-400 select-none text-xs sm:text-sm">…</span>
          ) : (
            <Link
              key={`${p}-${idx}`}
              href={pageHref(p)}
              aria-current={p === currentPage ? 'page' : undefined}
              className={`px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-md border text-xs sm:text-sm transition-colors min-w-[32px] sm:min-w-[40px] text-center ${p === currentPage ? 'bg-gradient-to-r from-red-600 to-pink-600 border-red-500 text-white font-semibold shadow-lg shadow-red-500/30' : 'text-gray-100 border-red-900/30 bg-gray-900 hover:border-red-500 hover:text-white'}`}
            >
              {p}
            </Link>
          )
        ))}
      </div>

      <Link
        href={pageHref(Math.min(totalPages, currentPage + 1))}
        className={`px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-md border text-xs sm:text-sm transition-colors whitespace-nowrap ${currentPage === totalPages ? 'text-gray-500 border-gray-700 bg-gray-800/50 cursor-not-allowed pointer-events-none' : 'text-gray-100 border-red-900/30 bg-gray-900 hover:border-red-500 hover:text-white'}`}
      >
        {isMobile ? '→' : 'Next →'}
      </Link>
    </nav>
  )
}

function getVisiblePages(current, total, isMobile = false) {
  // Show fewer pages on mobile
  const delta = isMobile ? 1 : 2
  
  // Create a set to avoid duplicates
  const pages = new Set();
  
  // Add pages in a way that avoids duplicates
  pages.add(1); // Always add first page
  
  // Add pages around current page (avoiding first to prevent duplication)
  const start = Math.max(2, current - delta);
  const end = Math.min(total - 1, current + delta);
  
  for (let i = start; i <= end; i++) {
    pages.add(i);
  }
  
  // Add last page if it's different from first
  if (total > 1) {
    pages.add(total);
  }
  
  // Convert to sorted array
  const sortedPages = Array.from(pages).sort((a, b) => a - b);
  
  // Build result with ellipsis handling
  const result = [];
  
  for (let i = 0; i < sortedPages.length; i++) {
    const pageNum = sortedPages[i];
    
    // Add ellipsis or missing page numbers between current and previous
    if (i > 0) {
      const prevPage = sortedPages[i - 1];
      const gap = pageNum - prevPage;
      
      if (gap === 2) {
        // Gap of exactly 2 means one page is missing (e.g., 1 and 3, missing 2)
        result.push(prevPage + 1);
      } else if (gap > 2) {
        // Gap of more than 2, add ellipsis
        result.push('...');
      }
    }
    
    // Always add the current page number
    result.push(pageNum);
  }
  
  return result;
}
