from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.push_service import subscription_store, send_notification_to_user

router = APIRouter()


class Subscription(BaseModel):
    endpoint: str
    keys: dict


class NotificationRequest(BaseModel):
    user_id: str
    title: str
    body: str
    icon: Optional[str] = None
    data: Optional[dict] = None


class BroadcastRequest(BaseModel):
    title: str
    body: str
    url: Optional[str] = None


@router.post("/subscribe/{user_id}")
async def subscribe_push(user_id: str, sub: Subscription):
    subscription_store[sub.user_id] = {
        'user_id': user_id,
        'endpoint': sub.endpoint,
        'keys': sub.keys,
    }
    return {"status": "subscribed", "user_id": user_id}


@router.post("/notify")
async def send_notification(req: NotificationRequest):
    sub = subscription_store.get(req.user_id)
    if not sub:
        return {"status": "not_subscribed"}
    
    success = send_notification_to_user(sub, req.title, req.body, req.icon, req.data)
    return {"status": "sent" if success else "failed"}


@router.post("/broadcast")
async def broadcast_push(req: BroadcastRequest):
    """Send push notification to all subscribed users."""
    if not subscription_store:
        return {"status": "no_subscribers", "message": "No users subscribed to push notifications"}

    success_count = 0
    fail_count = 0

    for user_id, sub in subscription_store.items():
        try:
            success = send_notification_to_user(
                sub,
                req.title,
                req.body,
                '/logo.svg',
                {'url': req.url or '/notifications'}
            )
            if success:
                success_count += 1
            else:
                fail_count += 1
        except Exception as e:
            print(f"Failed to send push to {user_id}: {e}")
            fail_count += 1

    return {
        "status": "completed",
        "success_count": success_count,
        "fail_count": fail_count,
        "total": len(subscription_store),
    }
