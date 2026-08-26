"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { usePushNotifications } from "@/app/components/usePushNotifications"

export default function TestNotificationsPage() {
  const { theme } = useTheme()
  const { isSupported, permission, subscription, requestPermission, subscribe } = usePushNotifications()
  const [logs, setLogs] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  const isDark = theme === "dark"

  useEffect(() => {
    setMounted(true)
  }, [])

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`])
  }

  const checkServiceWorker = async () => {
    if (!("serviceWorker" in navigator)) {
      addLog("❌ Service workers not supported")
      return
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      addLog(`Found ${registrations.length} service worker(s)`)

      for (const reg of registrations) {
        addLog(`SW Scope: ${reg.scope}`)
        addLog(`SW State: ${reg.installing ? "installing" : reg.waiting ? "waiting" : reg.active ? "active" : "unknown"}`)

        const pushManager = reg.pushManager
        if (pushManager) {
          const sub = await pushManager.getSubscription()
          if (sub) {
            addLog(`✅ Push subscription found: ${sub.endpoint.substring(0, 50)}...`)
          } else {
            addLog("❌ No push subscription found")
          }
        }
      }
    } catch (err: any) {
      addLog(`❌ Error: ${err.message}`)
    }
  }

  const testNotification = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification("Test Notification", {
        body: "This is a test notification from HomeCare AI!",
        icon: "/logo.svg",
        badge: "/logo.svg",
        requireInteraction: true,
        vibrate: [200, 100, 200],
      } as NotificationOptions)
      addLog("✅ Test notification sent!")
    } catch (err: any) {
      addLog(`❌ Failed: ${err.message}`)
    }
  }

  const testPushEvent = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      // Simulate a push event
      const pushEvent = new MessageEvent("message", {
        data: {
          json: () => ({
            title: "Push Test",
            body: "This simulates a push notification!",
            icon: "/logo.svg",
          }),
        },
      })

      // Send message to service worker
      if (registration.active) {
        registration.active.postMessage({
          type: "TEST_PUSH",
          payload: {
            title: "Push Test",
            body: "This simulates a push notification!",
            icon: "/logo.svg",
          },
        })
        addLog("✅ Test push message sent to SW")
      }
    } catch (err: any) {
      addLog(`❌ Failed: ${err.message}`)
    }
  }

  if (!mounted) return null

  return (
    <div
      className={`min-h-screen p-4 ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-emerald-950 to-green-950 text-white"
          : "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 text-gray-900"
      }`}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">🔔 Push Notification Debug</h1>

        {/* Status */}
        <div
          className={`p-4 rounded-xl ${
            isDark ? "bg-gray-800/70 border border-emerald-800" : "bg-white/70 border border-green-200"
          }`}
        >
          <h2 className="font-semibold mb-2">Status</h2>
          <div className="space-y-1 text-sm">
            <div>Service Worker Supported: {isSupported ? "✅ Yes" : "❌ No"}</div>
            <div>Notification Permission: {permission}</div>
            <div>Push Subscription: {subscription ? "✅ Active" : "❌ None"}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={checkServiceWorker}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
          >
            Check SW Status
          </button>

          {permission === "default" && (
            <button
              onClick={requestPermission}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"
            >
              Request Permission
            </button>
          )}

          {permission === "granted" && !subscription && (
            <button
              onClick={subscribe}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium"
            >
              Subscribe to Push
            </button>
          )}

          <button
            onClick={testNotification}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium"
          >
            Test Local Notification
          </button>

           <button
             onClick={testPushEvent}
             className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
           >
             Test Push Event
           </button>

           <button
             onClick={async () => {
               addLog("=== DEBUG SUBSCRIBE ===")
               try {
                 const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
                 addLog(`VAPID key: ${vapidKey ? vapidKey.substring(0, 30) + "..." : "MISSING!"}`)

                 const reg = await navigator.serviceWorker.ready
                 addLog("SW ready")

                 const existing = await reg.pushManager.getSubscription()
                 if (existing) {
                   addLog("Already subscribed!")
                   return
                 }

                 addLog("Subscribing to push...")
                 const key = vapidKey!
                 const padding = "=".repeat((4 - (key.length % 4)) % 4)
                 const base64 = (key + padding).replace(/-/g, "+").replace(/_/g, "/")
                 const raw = window.atob(base64)
                 const arr = new Uint8Array(raw.length)
                 for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)

                 const sub = await reg.pushManager.subscribe({
                   userVisibleOnly: true,
                   applicationServerKey: arr,
                 })
                 addLog("✅ Subscribed! Sending to server...")

                 const res = await fetch("/api/notifications/push/subscribe", {
                   method: "POST",
                   headers: { "Content-Type": "application/json" },
                   body: JSON.stringify(sub.toJSON()),
                 })
                 addLog(`Server response: ${res.status}`)
               } catch (err: any) {
                 addLog(`❌ Error: ${err.message}`)
               }
             }}
             className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium"
           >
             Debug Subscribe
           </button>
        </div>

        {/* Logs */}
        <div
          className={`p-4 rounded-xl ${
            isDark ? "bg-gray-800/70 border border-emerald-800" : "bg-white/70 border border-green-200"
          }`}
        >
          <h2 className="font-semibold mb-2">Logs</h2>
          <div className="space-y-1 text-sm font-mono max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet. Click a button above.</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={log.includes("❌") ? "text-red-400" : log.includes("✅") ? "text-green-400" : ""}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div
          className={`p-4 rounded-xl text-sm ${
            isDark ? "bg-yellow-900/30 border border-yellow-800 text-yellow-200" : "bg-yellow-50 border border-yellow-200 text-yellow-800"
          }`}
        >
          <h3 className="font-semibold mb-2">Troubleshooting Tips:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Make sure you&apos;re using HTTPS (or localhost)</li>
            <li>Check browser notification settings for this site</li>
            <li>On mobile: check system notification settings for the browser</li>
            <li>Close and reopen the browser/app after subscribing</li>
            <li>On iOS: Add to Home Screen for push notifications to work</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
