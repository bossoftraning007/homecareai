"""Push notification service."""
import os
import json
import httpx
from pywebpush import webpush, WebPushException

VAPID_PUBLIC_KEY = os.environ.get("VAPID_PUBLIC_KEY", "")
VAPID_PRIVATE_KEY = os.environ.get("VAPID_PRIVATE_KEY", "")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")


async def save_subscription(user_id, subscription):
    """Save push subscription to database."""
    try:
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
                    },
                    json={"user_id": user_id, "endpoint": endpoint, "p256dh": p256dh, "auth": auth},
                )

        print(f"[PUSH] Saved subscription for user: {user_id}")
        return True
    except Exception as e:
        print(f"[PUSH] Save error: {e}")
        return False


async def get_all_subscriptions():
    """Get all push subscriptions."""
    try:
        print("[PUSH] Getting subscriptions...")
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{SUPABASE_URL}/rest/v1/push_subscriptions?select=*",
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                },
            )
            print(f"[PUSH] Response status: {resp.status_code}")
            if resp.status_code == 200:
                data = resp.json()
                print(f"[PUSH] Found {len(data)} rows")
                return [
                    {
                        "user_id": sub["user_id"],
                        "endpoint": sub["endpoint"],
                        "keys": {"p256dh": sub["p256dh"], "auth": sub["auth"]},
                    }
                    for sub in data
                    if sub.get("endpoint") and sub["endpoint"] != "test123"
                ]
            else:
                print(f"[PUSH] Error response: {resp.text}")
    except Exception as e:
        print(f"[PUSH] Get error: {e}")
        import traceback
        traceback.print_exc()
    return []


def send_push(subscription_info, title, body, url="/"):
    """Send push notification."""
    if not VAPID_PRIVATE_KEY or not VAPID_PUBLIC_KEY:
        print("[PUSH] VAPID keys missing")
        return False

    try:
        payload = json.dumps({
            "title": title,
            "body": body,
            "url": url,
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
        print(f"[PUSH] WebPush error: {e}")
        if e.response:
            print(f"[PUSH] Response: {e.response.status_code} - {e.response.text}")
        return False
    except Exception as e:
        print(f"[PUSH] Error: {e}")
        return False
