"use client"

import { useState, useEffect } from "react"

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function PushTest() {
  const [logs, setLogs] = useState<string[]>([])
  const [sub, setSub] = useState<PushSubscription | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const log = (msg: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`])
    console.log(msg)
  }

  const checkSW = async () => {
    if (!("serviceWorker" in navigator)) {
      log("❌ No SW support")
      return
    }
    const reg = await navigator.serviceWorker.ready
    log(`✅ SW ready: ${reg.scope}`)

    const subscription = await reg.pushManager.getSubscription()
    if (subscription) {
      setSub(subscription)
      log(`✅ Already subscribed: ${subscription.endpoint.substring(0, 50)}...`)
    } else {
      log("❌ Not subscribed")
    }
  }

  const subscribe = async () => {
    try {
      log("Subscribing...")
      const reg = await navigator.serviceWorker.ready

      // Unsubscribe old if exists
      const oldSub = await reg.pushManager.getSubscription()
      if (oldSub) {
        await oldSub.unsubscribe()
        log("Unsubscribed old")
      }

      const key = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      const newSub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key,
      })

      setSub(newSub)
      log("✅ Subscribed!")

      // Save to server
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSub.toJSON()),
      })
      log(`Server save: ${res.status}`)
    } catch (err: any) {
      log(`❌ Error: ${err.message}`)
    }
  }

  const testLocal = async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification("Local Test", {
        body: "This is a local test!",
        icon: "/logo.svg",
        requireInteraction: true,
      })
      log("✅ Local notification sent!")
    } catch (err: any) {
      log(`❌ Error: ${err.message}`)
    }
  }

  const testServer = async () => {
    try {
      log("Sending server push...")
      const res = await fetch("/api/push/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      log(`Response: ${JSON.stringify(data)}`)
    } catch (err: any) {
      log(`❌ Error: ${err.message}`)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">🔔 Push Test</h1>

      <div className="flex gap-2 mb-4">
        <button onClick={checkSW} className="px-4 py-2 bg-blue-600 rounded">
          Check Status
        </button>
        <button onClick={subscribe} className="px-4 py-2 bg-green-600 rounded">
          Subscribe
        </button>
        <button onClick={testLocal} className="px-4 py-2 bg-orange-600 rounded">
          Test Local
        </button>
        <button onClick={testServer} className="px-4 py-2 bg-purple-600 rounded">
          Test Server Push
        </button>
      </div>

      <div className="bg-gray-800 rounded p-4 font-mono text-sm max-h-96 overflow-y-auto">
        {logs.map((log, i) => (
          <div key={i} className={log.includes("❌") ? "text-red-400" : log.includes("✅") ? "text-green-400" : "text-gray-300"}>
            {log}
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-yellow-900/30 rounded text-yellow-200 text-sm">
        <p className="font-bold">⚠️ Important:</p>
        <ul className="list-disc list-inside mt-2">
          <li>After subscribing, close this tab/browser</li>
          <li>Then click "Test Server Push"</li>
          <li>Notification should appear on your device!</li>
        </ul>
      </div>
    </div>
  )
}
