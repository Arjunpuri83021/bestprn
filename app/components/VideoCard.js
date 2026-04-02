'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play, Clock, Eye, Star } from 'lucide-react'
import { api } from '../lib/api'

export default function VideoCard({ video, priority = false }) {
  const [imageError, setImageError] = useState(false)
  const [previewLoaded, setPreviewLoaded] = useState(false)  // Phase 1: previewImage done?
  const [hdLoaded, setHdLoaded] = useState(false)            // Phase 2: HD imageUrl done?

  // Get video number with multiple fallbacks
  const getVideoNumber = () => {
    return video.dynamicVideoNo || video.videoNo || null;
  }


  // Format view count
  const formatViews = (views) => {
    if (!views) return '0'
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toString()
  }

  // Format duration with random seconds
  const formatDuration = (minutes) => {
    if (!minutes) return '0:00'
    const mins = parseInt(minutes)
    const hours = Math.floor(mins / 60)
    const remainingMins = mins % 60

    // Generate random seconds (0-59) based on video ID for consistency
    const videoId = video._id || video.id || '0'
    const seed = videoId.slice(-2) // Use last 2 characters of ID as seed
    const randomSeconds = parseInt(seed, 16) % 60 // Convert to number and get 0-59
    const formattedSeconds = randomSeconds.toString().padStart(2, '0')

    if (hours > 0) {
      return `${hours}:${remainingMins.toString().padStart(2, '0')}:${formattedSeconds}`
    }
    return `${mins}:${formattedSeconds}`
  }

  // Build URL segment: {id}-{title-slug}
  const slugify = (str = '') => String(str).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const getVideoUrlSegment = () => {
    const id = video._id || video.id || ''
    const title = video.titel || video.title || ''
    const s = slugify(title)
    return s ? `${id}-${s}` : id
  }

  // Get video title
  const getVideoTitle = () => {
    return video.titel || video.title || 'Untitled Video'
  }

  // Get pornstar names
  const getPornstarNames = () => {
    if (Array.isArray(video.name)) {
      return video.name.slice(0, 2) // Show max 2 names
    }
    return []
  }

  // Get tags
  const getTags = () => {
    if (Array.isArray(video.tags)) {
      return video.tags.slice(0, 3) // Show max 3 tags
    }
    return []
  }

  // Handle video click to update views
  const handleVideoClick = async () => {
    try {
      const videoId = video._id || video.id
      const currentViews = parseInt(video.views) || 0

      // Update views in background (don't wait for response)
      api.updateViews(videoId, currentViews).catch(error => {
        console.log('Failed to update views:', error)
      })
    } catch (error) {
      console.log('Error updating views:', error)
    }
  }

  return (
    <div className="video-card rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm group transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30">
      <Link href={`/video/${getVideoUrlSegment()}`} onClick={handleVideoClick}>
        <div className="relative aspect-video bg-gray-800">
          {/* ── Progressive Image Loading (2-Phase LQIP) ─────────────────
               Phase 1: previewImage (42KB) loads for ALL cards first.
               Phase 2: HD imageUrl mounts in DOM only AFTER its
                        previewImage onLoad fires — browser won't even
                        request HD until preview is ready. */}
          {!imageError && video.imageUrl ? (
            <div className="absolute inset-0">

              {/* ── PHASE 1: Low-quality preview (always shown until HD ready) ── */}
              {video.previewImage ? (
                <Image
                  src={video.previewImage}
                  alt=""
                  fill
                  className={`object-cover transition-opacity duration-500 ${hdLoaded ? 'opacity-0' : 'opacity-100'
                    }`}
                  priority={priority}
                  onLoad={() => setPreviewLoaded(true)}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  aria-hidden="true"
                />
              ) : (
                /* No previewImage — show spinner while HD loads */
                !hdLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-red-400/60 border-t-transparent rounded-full animate-spin" />
                  </div>
                )
              )}

              {/* ── PHASE 2: HD image — only MOUNTS after preview loaded ─────── */}
              {(previewLoaded || !video.previewImage) && (
                <Image
                  src={video.imageUrl}
                  alt={getVideoTitle()}
                  fill
                  className={`object-cover transition-opacity duration-700 ${hdLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  priority={false}              // never priority — preview handles first paint
                  onLoad={() => setHdLoaded(true)}
                  onError={() => setImageError(true)}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              )}

            </div>
          ) : (
            // Fallback — no imageUrl at all
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
              <Play className="w-12 h-12 text-gray-500" />
            </div>
          )}

          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 border-2 border-red-500/50 bg-gradient-to-br from-red-600/80 to-pink-600/80 backdrop-blur-sm shadow-lg shadow-red-500/30">
              <Play className="w-6 h-6 text-white ml-1" fill="white" />
            </div>
          </div>

          {/* Duration Badge */}
          {video.minutes && (
            <div className="absolute bottom-2 right-2 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1 border border-white/15 bg-black/60 backdrop-blur-sm">
              <Clock size={12} />
              <span>{formatDuration(video.minutes)}</span>
            </div>
          )}

          {/* Views Badge */}
          {video.views && (
            <div className="absolute top-2 right-2 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1 border border-white/15 bg-black/60 backdrop-blur-sm">
              <Eye size={12} />
              <span>{formatViews(video.views)}</span>
            </div>
          )}


          {/* Quality Badge */}
          <div className="absolute top-2 left-2 text-white text-xs px-2 py-1 rounded-full font-bold border border-red-400/30 bg-gradient-to-r from-red-600 to-pink-600 shadow-lg shadow-red-500/20">
            HD
          </div>
        </div>
      </Link>

      {/* Video Info */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Link href={`/video/${getVideoUrlSegment()}`} onClick={handleVideoClick}>
          <h3 className="text-white font-semibold text-sm line-clamp-2 hover:text-pink-400 transition-colors duration-200">
            {getVideoTitle()}
          </h3>
        </Link>

        {/* Pornstars */}
        {getPornstarNames().length > 0 && (
          <div className="flex flex-wrap gap-1">
            {getPornstarNames().map((name, index) => (
              <Link
                key={index}
                href={`/pornstar/${name.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-xs text-pink-400 hover:text-pink-300 transition-colors duration-200 flex items-center space-x-1 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20"
              >
                <Star size={10} fill="currentColor" />
                <span>{name}</span>
              </Link>
            ))}
          </div>
        )}



        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-3">
            {video.views && (
              <div className="flex items-center space-x-1">
                <Eye size={12} />
                <span>{formatViews(video.views)} views</span>
              </div>
            )}
            {video.createdAt && (
              <div className="flex items-center space-x-1">
                <Clock size={12} />
                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Video Code - Right Side */}
          {getVideoNumber() && (
            <div className="flex items-center space-x-1">
              <span className="text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">#{getVideoNumber()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
