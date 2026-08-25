from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from services.push_service import send_push_notification, send_broadcast_push, save_subscription, get_all_subscriptions
from services.email_service import send_notification_email
from services.analytics_service import track_push_sent, track_notification_opened
from services.auth_service import get_current_user
from config.database import get_supabase

router = APIRouter()


class SubscriptionRequest(BaseModel):
    endpoint: str
    keys: dict


class PushBroadcastRequest(BaseModel):
    title: str
    body: str
    url: Optional[str] = None
    send_email: Optional[bool] = False


class EmailNotificationRequest(BaseModel):
    user_id: str
    title: str
    body: str
    action_url: Optional[str] = None


@router.post("/push/subscribe")
async def subscribe_push(request: Request, current_user: dict = Depends(get_current_user)):
    """Subscribe to push notifications."""
    data = await request.json()
    await save_subscription(current_user["id"], data)
    return {"status": "subscribed"}


@router.post("/push/unsubscribe")
async def unsubscribe_push(request: Request, current_user: dict = Depends(get_current_user)):
    """Unsubscribe from push notifications."""
    # TODO: Remove from database
    return {"status": "unsubscribed"}


@router.post("/push/broadcast")
async def broadcast_push(req: PushBroadcastRequest, current_user: dict = Depends(get_current_user)):
    """Send push notification to all subscribed users (admin only)."""
    # Check admin
    supabase = get_supabase()
    profile = supabase.table("profiles").select("is_admin").eq("id", current_user["id"]).single().execute()
    if not profile.data or not profile.data.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")

    # Send push notifications
    result = await send_broadcast_push(req.title, req.body, req.url)

    # Track analytics
    for _ in range(result.get("sent", 0)):
        await track_push_sent("broadcast", True)
    for _ in range(result.get("failed", 0)):
        await track_push_sent("broadcast", False)

    # Send emails if requested
    if req.send_email:
        users = supabase.table("profiles").select("id, email, full_name").execute()
        for user in users.data or []:
            if user.get("email"):
                await send_notification_email(
                    user["email"],
                    user.get("full_name", "User"),
                    req.title,
                    req.body,
                    req.url,
                )

    return result


@router.post("/email/send")
async def send_email_notification(req: EmailNotificationRequest, current_user: dict = Depends(get_current_user)):
    """Send email notification to specific user."""
    supabase = get_supabase()
    user = supabase.table("profiles").select("email, full_name").eq("id", req.user_id).single().execute()

    if not user.data or not user.data.get("email"):
        raise HTTPException(status_code=404, detail="User email not found")

    success = await send_notification_email(
        user.data["email"],
        user.data.get("full_name", "User"),
        req.title,
        req.body,
        req.action_url,
    )

    return {"status": "sent" if success else "failed"}


@router.get("/subscriptions")
async def list_subscriptions(current_user: dict = Depends(get_current_user)):
    """List all push subscriptions (admin only)."""
    supabase = get_supabase()
    profile = supabase.table("profiles").select("is_admin").eq("id", current_user["id"]).single().execute()
    if not profile.data or not profile.data.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")

    subscriptions = await get_all_subscriptions()
    return {"subscriptions": subscriptions, "count": len(subscriptions)}


from fastapi import Request
