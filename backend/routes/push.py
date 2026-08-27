"""Push notification routes."""
from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from services.push_service import send_push, save_subscription, get_all_subscriptions
from services.auth_service import get_current_user
from config.database import get_supabase

router = APIRouter()


class SubscribeRequest(BaseModel):
    endpoint: str
    keys: dict


class BroadcastRequest(BaseModel):
    title: str
    body: str
    url: Optional[str] = "/"


async def broadcast_push(title: str, body: str, url: str = "/"):
    """Send push to all subscribers."""
    subs = await get_all_subscriptions()
    if not subs:
        return {"status": "no_subscribers", "sent": 0, "failed": 0}

    sent = 0
    failed = 0

    for sub in subs:
        if send_push(sub, title, body, url):
            sent += 1
        else:
            failed += 1

    return {"status": "completed", "sent": sent, "failed": failed, "total": len(subs)}


@router.post("/subscribe")
async def subscribe(request: Request):
    """Subscribe to push notifications."""
    try:
        data = await request.json()

        # Get user ID from JWT if available
        user_id = None
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            try:
                user = await get_current_user(request)
                user_id = user["id"]
            except Exception:
                pass

        await save_subscription(user_id, data)
        return {"status": "subscribed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/unsubscribe")
async def unsubscribe(request: Request):
    """Unsubscribe from push notifications."""
    # TODO: Remove from database
    return {"status": "unsubscribed"}


@router.post("/broadcast")
async def broadcast(req: BroadcastRequest, current_user: dict = Depends(get_current_user)):
    """Send push notification to all users (admin only)."""
    # Check admin
    supabase = get_supabase()
    profile = supabase.table("profiles").select("is_admin").eq("id", current_user["id"]).single().execute()

    if not profile.data or not profile.data.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")

    result = await broadcast_push(req.title, req.body, req.url)
    return result


@router.get("/subscriptions")
async def list_subscriptions(current_user: dict = Depends(get_current_user)):
    """List all push subscriptions (admin only)."""
    supabase = get_supabase()
    profile = supabase.table("profiles").select("is_admin").eq("id", current_user["id"]).single().execute()

    if not profile.data or not profile.data.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")

    subs = await get_all_subscriptions()
    return {"subscriptions": subs, "count": len(subs)}
