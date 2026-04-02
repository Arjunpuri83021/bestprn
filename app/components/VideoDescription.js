'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function VideoDescription({ children, title = 'Video Overview' }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-5">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      
      <div className={`text-gray-300 leading-relaxed space-y-3 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-none' : 'max-h-32'}`}>
        {children}
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-3 flex items-center gap-1 text-sm text-pink-400 hover:text-pink-300 transition-colors"
      >
        {isExpanded ? (
          <>
            <span>Show Less</span>
            <ChevronUp size={16} />
          </>
        ) : (
          <>
            <span>Show More</span>
            <ChevronDown size={16} />
          </>
        )}
      </button>
    </div>
  )
}
