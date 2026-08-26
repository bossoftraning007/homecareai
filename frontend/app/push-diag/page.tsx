"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"

export default function PushDiagnostic() {
  const { theme } = useTheme()
  const [logs, setLogs] = useState<string[]>([])
  const [sub, setSub] = useState<PushSubscription | null>(null)
  const [mounted, setMounted] = useState(false)
  const isDark = theme === "dark"

  useEffect(() => {
    setMounted(true)
    checkSubscription()
  }, [])

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`])
    console.log(msg)
  }

  const checkSubscription = async () => {
    if (!("serviceWorker" in navigator)) {
      addLog("❌ No service worker support")
      return
    }

    try {
      const reg = await navigator.serviceWorker.ready
      addLog("✅ SW active: " + reg.scope)

      const subscription = await reg.pushManager.getSubscription()
      if (subscription) {
        setSub(subscription)
        addLog("✅ Push subscribed: " + subscription.endpoint.substring(0, 50) + "...")
      } else {
        addLog("❌ No push subscription")
      }
    } catch (err: any) {
      addLog("❌ Error: " + err.message)
    }
  }

  const subscribe = async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

      if (!vapidKey) {
        addLog("❌ VAPID key missing")
        return
      }

      // Convert VAPID key
      const padding = "=".repeat((4 - (vapidKey.length % 4)) % 4)
      const base64 = (vapidKey + padding).replace(/-/g, "+").replace(/_/g, "/")
      const raw = window.atob(base64)
      const arr = new Uint8Array(raw.length)
      for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: arr,
      })

      setSub(subscription)
      addLog("✅ Subscribed!")

      // Save to server
      const res = await fetch("/api/notifications/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      })
      addLog("Server save: " + res.status)
    } catch (err: any) {
      addLog("❌ Subscribe failed: " + err.message)
    }
  }

  const testLocalNotification = async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification("Local Test", {
        body: "This is a local test - should appear immediately!",
        icon: "/logo.svg",
        badge: "/logo.svg",
        vibrate: [300, 100, 300, 100, 300],
        requireInteraction: true,
        tag: "local-test-" + Date.now(),
      })
      addLog("✅ Local notification sent - DO YOU SEE IT?")
    } catch (err: any) {
      addLog("❌ Failed: " + err.message)
    }
  }

  const testPushFromServer = async () => {
    try {
      addLog("Sending test push from server...")
      const res = await fetch("/api/notifications/push/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Test Push",
          body: "This is a test push from server!",
          url: "/",
        }),
      })
      const data = await res.json()
      addLog("Server response: " + JSON.stringify(data))
    } catch (err: any) {
      addLog("❌ Failed: " + err.message)
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
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">🔔 Push Diagnostic</h1>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={checkSubscription}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            Check Status
          </button>

          <button
            onClick={subscribe}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
          >
            Subscribe
          </button>

          <button
            onClick={testLocalNotification}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm"
          >
            Test Local Notification
          </button>

          <button
            onClick={testPushFromServer}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm"
          >
            Test Push from Server
          </button>
        </div>

        <div
          className={`p-4 rounded-xl font-mono text-sm max-h-96 overflow-y-auto ${
            isDark ? "bg-gray-800/70" : "bg-white/70"
          }`}
        >
          {logs.map((log, i) => (
            <div
              key={i}
              className={
                log.includes("❌")
                  ? "text-red-400"
                  : log.includes("✅")
                  ? "text-green-400"
                  : ""
              }
            >
              {log}
            </div>
          ))}
        </div>

        <div
          className={`p-4 rounded-xl text-sm ${
            isDark
              ? "bg-yellow-900/30 text-yellow-200"
              : "bg-yellow-50 text-yellow-800"
          }`}
        >
          <p className="font-bold">⚠️ IMPORTANT:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Notifications only show when browser is CLOSED or MINIMIZED</li>
            <li>If tab is open and active, notification won&apos;t appear</li>
            <li>Check Windows notification settings for your browser</li>
            <li>Close browser completely after subscribing</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
