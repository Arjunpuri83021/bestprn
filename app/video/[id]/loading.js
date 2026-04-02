export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Loading skeleton for video player */}
      <div className="mb-8">
        <div className="relative video-container rounded-lg overflow-hidden bg-gray-800 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
        </div>
      </div>

      {/* Loading skeleton for meta info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
        </div>
      </div>

      {/* Loading skeleton for description */}
      <div className="mb-12 space-y-2">
        <div className="h-6 bg-gray-700 rounded w-1/4 animate-pulse"></div>
        <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse"></div>
      </div>

      {/* Loading skeleton for related videos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-700 rounded w-1/4 animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded w-1/6 animate-pulse"></div>
        </div>
        <div className="grid video-grid">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-700"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-700 rounded w-16"></div>
                  <div className="h-6 bg-gray-700 rounded w-20"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-700 rounded w-20"></div>
                  <div className="h-4 bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
