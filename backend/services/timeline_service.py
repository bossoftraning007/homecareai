"""Timeline event logging service."""
import os
from typing import Optional

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


async def log_event(
    user_id: str,
    event_type: str,
    title: str,
    description: Optional[str] = None,
    icon: str = "📌",
    metadata: Optional[dict] = None,
):
    """Log a timeline event for a user."""
    try:
        import httpx

        async with httpx.AsyncClient() as client:
            await client.post(
                f"{SUPABASE_URL}/rest/v1/timeline_events",
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal",
                },
                json={
                    "user_id": user_id,
                    "event_type": event_type,
                    "title": title,
                    "description": description,
                    "icon": icon,
                    "metadata": metadata or {},
                },
            )
    except Exception as e:
        # Don't break the app if timeline logging fails
        print(f"Timeline log error: {e}")
