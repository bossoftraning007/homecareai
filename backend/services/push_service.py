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
        # Use service role key for bypassing RLS
        supabase_url = os.environ.get("SUPABASE_URL", "")
        service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

        if not supabase_url or not service_key:
            print("[PUSH] Supabase URL or service key not configured")
            return

        endpoint = subscription.get("endpoint")
        p256dh = subscription.get("keys", {}).get("p256dh")
        auth = subscription.get("keys", {}).get("auth")

        print(f"[PUSH] Saving subscription for user: {user_id}, endpoint: {endpoint[:50] if endpoint else 'None'}...")

        # Check if endpoint already exists using direct API call with service key
        async with httpx.AsyncClient() as client:
            # Check existing
            check_resp = await client.get(
                f"{supabase_url}/rest/v1/push_subscriptions?endpoint=eq.{endpoint}&select=id",
                headers={
                    "apikey": service_key,
                    "Authorization": f"Bearer {service_key}",
                },
            )
            existing = check_resp.json() if check_resp.status_code == 200 else []

            if existing:
                # Update
                print("[PUSH] Updating existing subscription")
                await client.patch(
                    f"{supabase_url}/rest/v1/push_subscriptions?endpoint=eq.{endpoint}",
                    headers={
                        "apikey": service_key,
                        "Authorization": f"Bearer {service_key}",
                        "Content-Type": "application/json",
                        "Prefer": "return=minimal",
                    },
                    json={
                        "user_id": user_id,
                        "p256dh": p256dh,
                        "auth": auth,
                    },
                )
            else:
                # Insert
                print("[PUSH] Inserting new subscription")
                insert_resp = await client.post(
                    f"{supabase_url}/rest/v1/push_subscriptions",
                    headers={
                        "apikey": service_key,
                        "Authorization": f"Bearer {service_key}",
                        "Content-Type": "application/json",
                        "Prefer": "return=minimal",
                    },
                    json={
                        "user_id": user_id,
                        "endpoint": endpoint,
                        "p256dh": p256dh,
                        "auth": auth,
                    },
                )
                print(f"[PUSH] Insert response: {insert_resp.status_code}")

        print("[PUSH] Subscription saved successfully")
    except Exception as e:
        print(f"[PUSH] Failed to save subscription: {e}")


async def get_all_subscriptions():
    """Get all push subscriptions from database."""
    try:
        supabase_url = os.environ.get("SUPABASE_URL", "")
        service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

        if not supabase_url or not service_key:
            return []

        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{supabase_url}/rest/v1/push_subscriptions?select=*",
                headers={
                    "apikey": service_key,
                    "Authorization": f"Bearer {service_key}",
                },
            )
            if resp.status_code == 200:
                data = resp.json()
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
        print(f"[PUSH] Failed to get subscriptions: {e}")
    return []


def send_push_notification(subscription_info: dict, title: str, body: str, icon: str = None, data: dict = None):
    """Send push notification to a single subscription."""
    if not VAPID_PRIVATE_KEY or not VAPID_PUBLIC_KEY:
        print("[PUSH] VAPID keys not configured")
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
        print(f"[PUSH] Sending to: {subscription_info.get('endpoint', '')[:50]}...")
        webpush(
            subscription_info=subscription_info,
            data=payload,
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims={
                "sub": "mailto:admin@homecareai.vercel.app",
            },
        )
        print("[PUSH] Sent successfully")
        return True
    except Exception as e:
        print(f"[PUSH] Push notification failed: {e}")
        return False


async def send_broadcast_push(title: str, body: str, url: str = None):
    """Send push notification to all subscribed users."""
    subscriptions = await get_all_subscriptions()
    if not subscriptions:
        return {"status": "no_subscribers", "sent": 0, "failed": 0}

    print(f"[PUSH] Broadcasting to {len(subscriptions)} subscriptions")

    sent = 0
    failed = 0

    for sub in subscriptions:
        # Skip test subscriptions
        if sub.get("endpoint") == "test123":
            continue
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

    print(f"[PUSH] Broadcast complete: {sent} sent, {failed} failed")
    return {"status": "completed", "sent": sent, "failed": failed, "total": len(subscriptions)}
