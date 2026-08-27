"""Push notification service for HomeCare AI."""
import os
import json
import time
import httpx
from pywebpush import webpush, WebPushException

VAPID_PUBLIC_KEY = os.environ.get("VAPID_PUBLIC_KEY", "")
VAPID_PRIVATE_KEY = os.environ.get("VAPID_PRIVATE_KEY", "")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")


async def save_subscription(user_id, subscription):
    """Save push subscription to database."""
    try:
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            print("[PUSH] Supabase not configured")
            return False

        endpoint = subscription.get("endpoint")
        p256dh = subscription.get("keys", {}).get("p256dh")
        auth = subscription.get("keys", {}).get("auth")

        async with httpx.AsyncClient() as client:
            # Check if exists
            check = await client.get(
                f"{SUPABASE_URL}/rest/v1/push_subscriptions?endpoint=eq.{endpoint}&select=id",
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                },
            )
            existing = check.json() if check.status_code == 200 else []

            if existing:
                await client.patch(
                    f"{SUPABASE_URL}/rest/v1/push_subscriptions?endpoint=eq.{endpoint}",
                    headers={
                        "apikey": SUPABASE_SERVICE_KEY,
                        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                        "Content-Type": "application/json",
                        "Prefer": "return=minimal",
                    },
                    json={"user_id": user_id, "p256dh": p256dh, "auth": auth},
                )
            else:
                await client.post(
                    f"{SUPABASE_URL}/rest/v1/push_subscriptions",
                    headers={
                        "apikey": SUPABASE_SERVICE_KEY,
                        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                        "Content-Type": "application/json",
                        "Prefer": "return=minimal",
                    },
                    json={"user_id": user_id, "endpoint": endpoint, "p256dh": p256dh, "auth": auth},
                )

        print(f"[PUSH] Subscription saved for user: {user_id}")
        return True
    except Exception as e:
        print(f"[PUSH] Save failed: {e}")
        return False


async def get_all_subscriptions():
    """Get all push subscriptions."""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{SUPABASE_URL}/rest/v1/push_subscriptions?select=*",
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                },
            )
            if resp.status_code == 200:
                data = resp.json()
                # Filter out test subscriptions
                return [
                    {
                        "user_id": sub["user_id"],
                        "endpoint": sub["endpoint"],
                        "keys": {"p256dh": sub["p256dh"], "auth": sub["auth"]},
                    }
                    for sub in data
                    if sub["endpoint"] != "test123"
                ]
    except Exception as e:
        print(f"[PUSH] Get subscriptions failed: {e}")
    return []


def send_push(subscription_info, title, body, url="/"):
    """Send push notification to one subscription."""
    if not VAPID_PRIVATE_KEY or not VAPID_PUBLIC_KEY:
        print("[PUSH] VAPID keys not configured")
        return False

    try:
        payload = json.dumps({
            "title": title,
            "body": body,
            "icon": "/logo.svg",
            "badge": "/logo.svg",
            "data": {"url": url},
            "tag": f"homecare-{int(time.time())}",
            "renotify": True,
            "requireInteraction": True,
            "vibrate": [300, 100, 300, 100, 300],
        })

        print(f"[PUSH] Sending to: {subscription_info['endpoint'][:50]}...")

        webpush(
            subscription_info=subscription_info,
            data=payload,
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims={"sub": "mailto:admin@homecareai.vercel.app"},
        )
        print("[PUSH] ✅ Sent!")
        return True
    except WebPushException as e:
        print(f"[PUSH] WebPush failed: {e}")
        if e.response and e.response.status_code == 410:
            print("[PUSH] Subscription expired, should remove from DB")
        return False
    except Exception as e:
        print(f"[PUSH] Error: {e}")
        return False


async def broadcast_push(title, body, url="/"):
    """Send push to all subscribers."""
    subs = await get_all_subscriptions()
    if not subs:
        return {"status": "no_subscribers", "sent": 0, "failed": 0}

    print(f"[PUSH] Broadcasting to {len(subs)} users")

    sent = 0
    failed = 0

    for sub in subs:
        if send_push(sub, title, body, url):
            sent += 1
        else:
            failed += 1

    result = {"status": "completed", "sent": sent, "failed": failed, "total": len(subs)}
    print(f"[PUSH] Broadcast done: {result}")
    return result
