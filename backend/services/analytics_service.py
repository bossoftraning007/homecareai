"""
Notification Analytics Service
Tracks delivery, open rates, and engagement for notifications.
"""
import os
import httpx
from datetime import datetime, timezone, timedelta

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")


async def track_notification_sent(notification_id: str):
    """Track when a notification is sent."""
    await _update_analytics("sent_count", 1)


async def track_notification_delivered(notification_id: str):
    """Track when a notification is delivered to device."""
    await _update_analytics("delivered_count", 1)


async def track_notification_opened(notification_id: str):
    """Track when a user opens/clicks a notification."""
    if not SUPABASE_SERVICE_KEY:
        return

    try:
        async with httpx.AsyncClient() as client:
            # Mark notification as read
            await client.patch(
                f"{SUPABASE_URL}/rest/v1/notifications?id=eq.{notification_id}",
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal",
                },
                json={
                    "is_read": True,
                    "read_at": datetime.now(timezone.utc).isoformat(),
                },
            )
            # Increment open count
            await _update_analytics("opened_count", 1)
    except Exception as e:
        print(f"Failed to track notification open: {e}")


async def track_push_sent(user_id: str, success: bool):
    """Track push notification delivery."""
    if success:
        await _update_analytics("push_sent_count", 1)
    else:
        await _update_analytics("push_failed_count", 1)


async def _update_analytics(field: str, increment: int = 1):
    """Update analytics counter."""
    if not SUPABASE_SERVICE_KEY:
        return

    today = datetime.now().strftime("%Y-%m-%d")

    try:
        async with httpx.AsyncClient() as client:
            # Check if today's record exists
            resp = await client.get(
                f"{SUPABASE_URL}/rest/v1/notification_analytics?date=eq.{today}&select=id,{field}",
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                },
            )

            if resp.status_code == 200 and resp.json():
                # Update existing
                record_id = resp.json()[0]["id"]
                current_value = resp.json()[0].get(field, 0)
                await client.patch(
                    f"{SUPABASE_URL}/rest/v1/notification_analytics?id=eq.{record_id}",
                    headers={
                        "apikey": SUPABASE_SERVICE_KEY,
                        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                        "Content-Type": "application/json",
                        "Prefer": "return=minimal",
                    },
                    json={field: current_value + increment},
                )
            else:
                # Create new record
                await client.post(
                    f"{SUPABASE_URL}/rest/v1/notification_analytics",
                    headers={
                        "apikey": SUPABASE_SERVICE_KEY,
                        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                        "Content-Type": "application/json",
                        "Prefer": "return=minimal",
                    },
                    json={
                        "date": today,
                        field: increment,
                    },
                )
    except Exception as e:
        print(f"Failed to update analytics: {e}")


async def get_analytics(days: int = 7):
    """Get notification analytics for the last N days."""
    if not SUPABASE_SERVICE_KEY:
        return []

    start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{SUPABASE_URL}/rest/v1/notification_analytics?date=gte.{start_date}&order=date.desc",
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                },
            )
            if resp.status_code == 200:
                return resp.json()
    except Exception as e:
        print(f"Failed to get analytics: {e}")
    return []


async def get_stats():
    """Get overall notification stats."""
    analytics = await get_analytics(30)

    total_sent = sum(a.get("sent_count", 0) for a in analytics)
    total_delivered = sum(a.get("delivered_count", 0) for a in analytics)
    total_opened = sum(a.get("opened_count", 0) for a in analytics)
    total_push_sent = sum(a.get("push_sent_count", 0) for a in analytics)
    total_push_failed = sum(a.get("push_failed_count", 0) for a in analytics)

    return {
        "total_sent": total_sent,
        "total_delivered": total_delivered,
        "total_opened": total_opened,
        "open_rate": round((total_opened / total_sent * 100) if total_sent > 0 else 0, 1),
        "total_push_sent": total_push_sent,
        "total_push_failed": total_push_failed,
        "push_success_rate": round((total_push_sent / (total_push_sent + total_push_failed) * 100) if (total_push_sent + total_push_failed) > 0 else 0, 1),
        "daily_breakdown": analytics,
    }
