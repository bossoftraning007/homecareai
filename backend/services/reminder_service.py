"""
Scheduled Reminders Service
Handles daily medication reminders, wellness tips, and health check-ins.
Uses APScheduler for cron-like scheduling.
"""
import os
import httpx
from datetime import datetime, timezone

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

REMINDER_TYPES = {
    "medication": {
        "title": "💊 Medication Reminder",
        "body": "Time to take your medication!",
    },
    "water": {
        "title": "💧 Hydration Check",
        "body": "Have you drunk enough water today?",
    },
    "wellness": {
        "title": "🧘 Wellness Check",
        "body": "How are you feeling today? Take a moment for your health.",
    },
    "sleep": {
        "title": "😴 Sleep Reminder",
        "body": "Time to wind down for a good night's sleep.",
    },
}


async def get_active_reminders():
    """Get all active reminders from database."""
    if not SUPABASE_SERVICE_KEY:
        return []

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{SUPABASE_URL}/rest/v1/reminders?select=*&is_active=eq.true",
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                },
            )
            if resp.status_code == 200:
                return resp.json()
    except Exception as e:
        print(f"Failed to get reminders: {e}")
    return []


async def create_reminder(user_id: str, reminder_type: str, scheduled_time: str, message: str = None):
    """Create a new reminder for user."""
    if not SUPABASE_SERVICE_KEY:
        return None

    reminder = {
        "user_id": user_id,
        "type": reminder_type,
        "scheduled_time": scheduled_time,
        "message": message or REMINDER_TYPES.get(reminder_type, {}).get("body", "Time for your reminder!"),
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{SUPABASE_URL}/rest/v1/reminders",
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation",
                },
                json=reminder,
            )
            if resp.status_code == 201:
                return resp.json()[0]
    except Exception as e:
        print(f"Failed to create reminder: {e}")
    return None


async def send_reminder_notification(user_id: str, title: str, body: str):
    """Send reminder notification to user."""
    if not SUPABASE_SERVICE_KEY:
        return

    notification = {
        "user_id": user_id,
        "type": "reminder",
        "title": title,
        "body": body,
        "icon": "⏰",
        "priority": "normal",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{SUPABASE_URL}/rest/v1/notifications",
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal",
                },
                json=notification,
            )
    except Exception as e:
        print(f"Failed to send reminder notification: {e}")


async def process_due_reminders():
    """Process all reminders that are due now."""
    reminders = await get_active_reminders()
    now = datetime.now()
    current_time = now.strftime("%H:%M")

    for reminder in reminders:
        scheduled = reminder.get("scheduled_time", "")
        if scheduled <= current_time:
            await send_reminder_notification(
                reminder["user_id"],
                reminder.get("title", "⏰ Reminder"),
                reminder.get("message", "Time for your reminder!"),
            )

    return len(reminders)
