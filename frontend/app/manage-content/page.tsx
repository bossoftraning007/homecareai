'use client'
import { useEffect } from 'react'

// This route has been merged into /admin for unified high-security access.
// Redirect all traffic there.
export default function ManageContentRedirect() {
  useEffect(() => {
    window.location.href = '/admin?tab=content'
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="text-4xl mb-3">🔒</div>
        <p className="text-emerald-300">Redirecting to admin...</p>
      </div>
    </div>
  )
}
