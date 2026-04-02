export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-gray-200">Loading...</p>
      </div>
    </div>
  )
}
