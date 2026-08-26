import os
import json
import httpx
from pywebpush import webpush
from config.database import get_supabase

VAPID_PUBLIC_KEY = os.environ.get("VAPID_PUBLIC_KEY", "")
VAPID_PRIVATE_KEY = os.environ.get("VAPID_PRIVATE_KEY", "")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

# In-memory store for subscriptions (use database in production)
subscription_store = {}


async def save_subscription(user_id: str | None, subscription: dict):
    """Save push subscription to database."""
    try:
        supabase = get_supabase()
        if not supabase:
            return

        endpoint = subscription.get("endpoint")
        p256dh = subscription.get("keys", {}).get("p256dh")
        auth = subscription.get("keys", {}).get("auth")

        # Check if endpoint already exists
        existing = supabase.table("push_subscriptions").select("*").eq("endpoint", endpoint).execute()

        if existing.data:
            # Update existing
            supabase.table("push_subscriptions").update({
                "user_id": user_id,
                "p256dh": p256dh,
                "auth": auth,
            }).eq("endpoint", endpoint).execute()
        else:
            # Insert new
            supabase.table("push_subscriptions").insert({
                "user_id": user_id,
                "endpoint": endpoint,
                "p256dh": p256dh,
                "auth": auth,
            }).execute()
    except Exception as e:
        print(f"Failed to save subscription: {e}")


async def get_all_subscriptions():
    """Get all push subscriptions from database."""
    try:
        supabase = get_supabase()
        if not supabase:
            return []

        result = supabase.table("push_subscriptions").select("*").execute()
        data = result.data

        return [
            {
                "user_id": sub["user_id"],
                "endpoint": sub["endpoint"],
                "keys": {
                    "p256dh": sub["p256dh"],
                    "auth": sub["auth"],
                },
            }
            for sub in data
        ]
    except Exception as e:
        print(f"Failed to get subscriptions: {e}")
    return []


def send_push_notification(subscription_info: dict, title: str, body: str, icon: str = None, data: dict = None):
    """Send push notification to a single subscription."""
    if not VAPID_PRIVATE_KEY or not VAPID_PUBLIC_KEY:
        print("VAPID keys not configured")
        return False

    payload = json.dumps({
        "title": title,
        "body": body,
        "icon": icon or "/logo.svg",
        "badge": "/logo.svg",
        "data": data or {},
        "tag": data.get("tag", "homecare-notification") if data else "homecare-notification",
        "renotify": True,
        "requireInteraction": data.get("requireInteraction", False) if data else False,
    })

    try:
        webpush(
            subscription_info=subscription_info,
            data=payload,
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims={
                "sub": "mailto:admin@homecareai.vercel.app",
            },
        )
        return True
    except Exception as e:
        print(f"Push notification failed: {e}")
        return False


async def send_broadcast_push(title: str, body: str, url: str = None):
    """Send push notification to all subscribed users."""
    subscriptions = await get_all_subscriptions()
    if not subscriptions:
        return {"status": "no_subscribers", "sent": 0, "failed": 0}

    sent = 0
    failed = 0

    for sub in subscriptions:
        success = send_push_notification(
            sub,
            title,
            body,
            data={"url": url or "/notifications"},
        )
        if success:
            sent += 1
        else:
            failed += 1

    return {"status": "completed", "sent": sent, "failed": failed, "total": len(subscriptions)}
