'use client'
import { usePushNotifications } from './usePushNotifications'
import { toast } from 'react-hot-toast'

export function PushNotificationManager() {
  const { isSupported, permission, requestPermission } = usePushNotifications()

  // Show a toast suggesting to enable notifications
  if (isSupported && permission === 'default') {
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span>🔔 Enable notifications for health tips?</span>
          <button
            onClick={() => {
              requestPermission()
              toast.dismiss(t.id)
            }}
            className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm font-medium"
          >
            Enable
          </button>
        </div>
      ),
      { duration: 10000, position: 'bottom-center' }
    )
  }

  return null
}
