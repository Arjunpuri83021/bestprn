'use client'

import { useMemo, useState } from 'react'

export default function VideoSectionsClient({ videoDetails, comments, moreDetails }) {
  const tabs = useMemo(
    () => [
      { key: 'details', label: 'Video Details', color: 'red' },
      { key: 'comments', label: 'Comments', color: 'pink' },
    ],
    []
  )

  const [active, setActive] = useState(null)

  const renderActive = () => {
    if (active === 'details') return videoDetails
    if (active === 'comments') return comments
    return null
  }

  return (
    <div className="mt-6">
      <div className="video-sections-scroll flex flex-row flex-nowrap gap-3 overflow-x-auto">
        {tabs.map((t) => {
          const isActive = active === t.key

          const base =
            'shrink-0 inline-flex items-center justify-center rounded-lg border px-4 py-3 font-medium transition-colors'

          const styles =
            t.color === 'red'
              ? isActive
                ? 'border-red-500/60 bg-red-500/20 text-red-200'
                : 'border-gray-700 bg-gray-800/50 text-red-400 hover:text-red-300'
              : t.color === 'pink'
                ? isActive
                  ? 'border-pink-500/60 bg-pink-500/20 text-pink-200'
                  : 'border-gray-700 bg-gray-800/50 text-pink-400 hover:text-pink-300'
                : isActive
                  ? 'border-rose-500/60 bg-rose-500/20 text-rose-200'
                  : 'border-gray-700 bg-gray-800/50 text-rose-400 hover:text-rose-300'

          return (
            <button
              key={t.key}
              type="button"
              className={`${base} ${styles}`}
              onClick={() => setActive((prev) => (prev === t.key ? null : t.key))}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <style jsx>{`
        .video-sections-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.22) rgba(255, 255, 255, 0.06);
        }
        .video-sections-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .video-sections-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.06);
          border-radius: 9999px;
        }
        .video-sections-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.22);
          border-radius: 9999px;
        }
        .video-sections-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.32);
        }
      `}</style>

      {active && (
        <div className="mt-4 w-full">
          <div className="w-full rounded-lg border border-gray-700 bg-gray-800/30 p-4">
            {renderActive()}
          </div>
        </div>
      )}
    </div>
  )
}
