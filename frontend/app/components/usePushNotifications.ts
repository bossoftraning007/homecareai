'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePushNotifications() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  const subscribe = useCallback(async () => {
    if (!isSupported || !VAPID_PUBLIC_KEY) {
      console.log('Push not supported or VAPID key missing')
      return null
    }

    try {
      const registration = await navigator.serviceWorker.ready

      // Check if already subscribed
      let existingSub = await registration.pushManager.getSubscription()
      if (existingSub) {
        setSubscription(existingSub)
        return existingSub
      }

      // Subscribe
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      const newSub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      })

      setSubscription(newSub)
      setPermission('granted')

      // Get JWT token from Supabase
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      // Send subscription to backend with auth
      await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newSub.toJSON()),
      })

      return newSub
    } catch (err) {
      console.error('Failed to subscribe to push:', err)
      return null
    }
  }, [isSupported])

  const unsubscribe = useCallback(async () => {
    if (!subscription) return

    try {
      await subscription.unsubscribe()
      setSubscription(null)

      // Get JWT token
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      // Notify backend
      await fetch('/api/notifications/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      })
    } catch (err) {
      console.error('Failed to unsubscribe:', err)
    }
  }, [subscription])

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'denied'

    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') {
      await subscribe()
    }
    return result
  }, [subscribe])

  return {
    isSupported,
    permission,
    subscription,
    subscribe,
    unsubscribe,
    requestPermission,
  }
}
