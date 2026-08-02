'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="text-6xl mb-4">🌿</div>
      <h2 className="text-2xl font-bold text-green-800 mb-2">
        Something went wrong!
      </h2>
      <p className="text-green-700 mb-4">{error.message}</p>
      <button
        onClick={() => reset()}
        className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-all"
      >
        Try again
      </button>
    </div>
  )
}