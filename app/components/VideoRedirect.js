'use client'

import Image from 'next/image'
import { useCallback, useState, useEffect } from 'react'
import { Play, AlertCircle } from 'lucide-react'
import { api } from '../lib/api'

// Extract domain name from URL
function extractDomain(url) {
  if (!url) return null
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return null
  }
}

function isDirectMp4(url) {
  if (!url) return false
  try {
    const u = new URL(url)
    return u.pathname.toLowerCase().endsWith('.mp4')
  } catch {
    return String(url).toLowerCase().includes('.mp4')
  }
}

export default function VideoRedirect({ link, imageUrl, title, video }) {
  // Auto-show iframe if iframeUrl is available
  const [showIframe, setShowIframe] = useState(!!video?.iframeUrl)
  const hasIframe = !!video?.iframeUrl
  const domain = extractDomain(link)

  const handlePlay = useCallback(async () => {
    if (!showIframe && hasIframe) {
      setShowIframe(true)
    }

    // Update views in background
    if (video && (video._id || video.id)) {
      try {
        const videoId = video._id || video.id
        const currentViews = parseInt(video.views) || 0

        api.updateViews(videoId, currentViews).catch(error => {
          console.log('Failed to update views:', error)
        })
      } catch (error) {
        console.log('Error updating views:', error)
      }
    }

    // If no iframe URL, redirect to external link
    if (!hasIframe && link) {
      window.location.href = link
    }
  }, [link, video, hasIframe, showIframe])

  // If iframe is available and should be shown, display it
  if (showIframe && video?.iframeUrl) {
    if (isDirectMp4(video.iframeUrl)) {
      return (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
          <video
            src={video.iframeUrl}
            className="w-full h-full"
            controls
            playsInline
            preload="metadata"
          />
        </div>
      )
    }

    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          src={video.iframeUrl}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-pointer-lock allow-top-navigation-by-user-activation"
          title={title || 'Video player'}
        />
      </div>
    )
  }

  // Show thumbnail with play button
  return (
    <div className="relative w-full aspect-video">
      <div className="absolute inset-0 rounded-lg overflow-hidden bg-black flex items-center justify-center">
        {/* Blurred background */}
        {imageUrl && (
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={imageUrl}
              alt="Background"
              fill
              className="object-cover"
              style={{ filter: 'blur(40px)', opacity: 0.3 }}
              sizes="100vw"
            />
          </div>
        )}

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-4 md:gap-8 px-4 w-full">
          {/* Small centered thumbnail */}
          <div
            className="video-thumbnail-preview relative rounded-lg overflow-hidden shadow-2xl cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={handlePlay}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title || 'Video thumbnail'}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 192px, (max-width: 768px) 256px, 320px"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gray-800" />
            )}

            {/* Duration badge */}
            {video?.minutes && (
              <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-black/80 text-white text-xs md:text-sm font-semibold px-1.5 py-0.5 md:px-2 md:py-1 rounded">
                {video.minutes}:00
              </div>
            )}
          </div>

          {/* Watch button */}
          {!hasIframe && domain && (
            <button
              onClick={handlePlay}
              disabled={!link}
              className="bg-white hover:bg-gray-100 text-black font-semibold text-sm md:text-base px-6 py-2.5 md:px-10 md:py-4 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Watch this video on {domain}
            </button>
          )}
        </div>

        {hasIframe && (
          <div className="absolute bottom-2 right-2 bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs px-2 py-1 rounded z-20 font-semibold">
            Play Here
          </div>
        )}
      </div>
    </div>
  )
}
