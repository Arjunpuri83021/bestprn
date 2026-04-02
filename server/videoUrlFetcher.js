/**
 * Dynamic Video URL Fetcher for bestprn
 * 
 * Features:
 * - Fast, non-blocking URL fetching
 * - Intelligent caching with TTL
 * - Background refresh for stale URLs
 * - Bulk fetching support
 * - Error handling and retries
 */

const axios = require('axios');
const cheerio = require('cheerio');

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes (in milliseconds)
const STALE_WHILE_REVALIDATE = true; // Serve stale data while refreshing in background

// In-memory cache (will be replaced with Redis/DB in production)
const urlCache = new Map();

/**
 * Normalize text by removing extra whitespace and special characters
 */
function normalizeText(input) {
  if (!input) return '';
  return String(input)
    .replace(/\s+/g, ' ')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim();
}

/**
 * Extract base URL without query parameters (for caching key)
 */
function getBaseVideoUrl(url) {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  } catch {
    return url.split('?')[0];
  }
}

/**
 * Check if URL has AWS signature parameters (expires)
 */
function isSignedUrl(url) {
  return url && (url.includes('X-Amz-') || url.includes('X-Amz-Signature'));
}

/**
 * Extract video ID from OGPorn URL
 */
function extractVideoIdFromSlug(slug) {
  if (!slug) return '';
  // Remove trailing slash and extract slug
  const cleanSlug = slug.replace(/\/$/, '');
  return cleanSlug;
}

/**
 * Fetch fresh video URL from OGPorn
 * Uses lightweight request (no Playwright for speed)
 */
async function fetchFreshOgPornUrl(videoSlug) {
  try {
    const url = `https://ogporn.com/${videoSlug}/`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000,
      maxRedirects: 5,
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Method 1: Look for video tags with src
    let videoUrl = '';
    $('video source[src], video[src]').each((i, el) => {
      const src = $(el).attr('src') || $(el).find('source').attr('src');
      if (src && src.includes('.mp4')) {
        videoUrl = src;
        return false; // Break loop
      }
    });
    
    // Method 2: Search HTML for MP4 URLs
    if (!videoUrl) {
      const mp4Regex = /https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*/gi;
      const matches = html.match(mp4Regex);
      if (matches && matches.length > 0) {
        // Prefer URLs with vcdn or Nubiles
        const preferredUrl = matches.find(u => u.includes('vcdn') || u.includes('Nubiles'));
        videoUrl = preferredUrl || matches[0];
      }
    }
    
    // Method 3: Look in script tags
    if (!videoUrl) {
      const scripts = $('script');
      scripts.each((i, el) => {
        const content = $(el).html();
        if (content) {
          const configPattern = /file["']?\s*:\s*["']([^"']+\.mp4[^"']*)["']/gi;
          const match = configPattern.exec(content);
          if (match && match[1]) {
            videoUrl = match[1];
            return false;
          }
        }
      });
    }
    
    if (videoUrl) {
      // Decode HTML entities
      videoUrl = videoUrl.replace(/&#038;/g, '&').replace(/&amp;/g, '&');
      
      return {
        success: true,
        url: videoUrl,
        baseUrl: getBaseVideoUrl(videoUrl),
        fetchedAt: new Date().toISOString(),
      };
    }
    
    return {
      success: false,
      error: 'No video URL found',
    };
    
  } catch (error) {
    console.error(`Error fetching OGPorn URL:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get cached URL if still valid
 */
function getCachedUrl(cacheKey) {
  const cached = urlCache.get(cacheKey);
  if (!cached) return null;
  
  const now = Date.now();
  const age = now - cached.timestamp;
  
  // If within TTL, return cached
  if (age < CACHE_TTL) {
    return {
      ...cached,
      isStale: false,
    };
  }
  
  // If stale but within revalidate window, return stale and trigger refresh
  if (STALE_WHILE_REVALIDATE && age < CACHE_TTL * 2) {
    return {
      ...cached,
      isStale: true,
    };
  }
  
  // Too old, remove from cache
  urlCache.delete(cacheKey);
  return null;
}

/**
 * Cache a URL with timestamp
 */
function cacheUrl(cacheKey, data) {
  urlCache.set(cacheKey, {
    ...data,
    timestamp: Date.now(),
  });
  
  // Cleanup old entries (keep cache size manageable)
  if (urlCache.size > 1000) {
    const entries = Array.from(urlCache.entries());
    const oldestHalf = entries.slice(0, Math.floor(entries.length / 2));
    oldestHalf.forEach(([key]) => urlCache.delete(key));
  }
}

/**
 * Main function: Get video URL (fast, with caching)
 * 
 * @param {string} videoSlug - Video slug (e.g., "girls-who-lie-d3")
 * @param {boolean} forceRefresh - Force fetch fresh URL (ignore cache)
 * @returns {Promise<{success: boolean, url?: string, baseUrl?: string, isStale?: boolean, error?: string}>}
 */
async function getVideoUrl(videoSlug, forceRefresh = false) {
  const cacheKey = `ogporn:${videoSlug}`;
  
  // Check cache first (unless forced refresh)
  if (!forceRefresh) {
    const cached = getCachedUrl(cacheKey);
    if (cached) {
      // If stale, trigger background refresh (non-blocking)
      if (cached.isStale) {
        setImmediate(() => {
          fetchFreshOgPornUrl(videoSlug).then(freshData => {
            if (freshData.success) {
              cacheUrl(cacheKey, freshData);
            }
          });
        });
      }
      
      return {
        success: true,
        url: cached.url,
        baseUrl: cached.baseUrl,
        isStale: cached.isStale,
        fetchedAt: cached.fetchedAt,
      };
    }
  }
  
  // Fetch fresh URL
  const freshData = await fetchFreshOgPornUrl(videoSlug);
  
  if (freshData.success) {
    cacheUrl(cacheKey, freshData);
    
    return {
      success: true,
      url: freshData.url,
      baseUrl: freshData.baseUrl,
      isStale: false,
      fetchedAt: freshData.fetchedAt,
    };
  }
  
  return freshData;
}

/**
 * Bulk fetch multiple video URLs (parallel, with concurrency limit)
 * 
 * @param {string[]} videoSlugs - Array of video slugs
 * @param {number} concurrency - Max concurrent requests (default: 5)
 * @returns {Promise<Map<string, {success: boolean, url?: string, error?: string}>>}
 */
async function bulkGetVideoUrls(videoSlugs, concurrency = 5) {
  const results = new Map();
  const queue = [...videoSlugs];
  const inProgress = new Set();
  
  return new Promise((resolve) => {
    const processNext = async () => {
      if (queue.length === 0 && inProgress.size === 0) {
        resolve(results);
        return;
      }
      
      while (inProgress.size < concurrency && queue.length > 0) {
        const slug = queue.shift();
        inProgress.add(slug);
        
        getVideoUrl(slug)
          .then(result => {
            results.set(slug, result);
            inProgress.delete(slug);
            processNext();
          })
          .catch(err => {
            results.set(slug, {
              success: false,
              error: err.message,
            });
            inProgress.delete(slug);
            processNext();
          });
      }
    };
    
    processNext();
  });
}

/**
 * API Route Handler for Next.js API Routes
 * Usage: GET /api/video-url?slug=girls-who-lie-d3
 */
async function apiHandler(req, res) {
  try {
    const { slug, forceRefresh } = req.query;
    
    if (!slug) {
      return res.status(400).json({
        success: false,
        error: 'Missing slug parameter',
      });
    }
    
    const result = await getVideoUrl(slug, forceRefresh === 'true');
    
    if (result.success) {
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// Export functions
module.exports = {
  getVideoUrl,
  bulkGetVideoUrls,
  fetchFreshOgPornUrl,
  getBaseVideoUrl,
  isSignedUrl,
  apiHandler,
  CACHE_TTL,
};
