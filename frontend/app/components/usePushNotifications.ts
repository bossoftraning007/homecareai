'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homecareai-backend.onrender.com'
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePushNotifications(userId: string | null) {
  const [subscribed, setSubscribed] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if (!userId) return
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setSubscribed(!!sub)
        })
      })
    }
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [userId])

  const subscribe = async () => {
    if (!userId) return false

    if (!('serviceWorker' in navigator)) return false
    if (permission !== 'granted') {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result !== 'granted') return false
    }

    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      await axios.post(`${API_URL}/api/push/subscribe/${userId}`, {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.getKey('p256dh') ? btoa(String.fromCharCode(...Array.from(new Uint8Array(sub.getKey('p256dh') as ArrayBuffer)))) : '',
          auth: sub.getKey('auth') ? btoa(String.fromCharCode(...Array.from(new Uint8Array(sub.getKey('auth') as ArrayBuffer)))) : '',
        },
      })

      setSubscribed(true)
      return true
    } catch (err) {
      console.error('Subscription failed:', err)
      return false
    }
  }

  const unsubscribe = async () => {
    if (!('serviceWorker' in navigator)) return
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await sub.unsubscribe()
      setSubscribed(false)
    }
  }

  return { subscribed, permission, subscribe, unsubscribe }
}
