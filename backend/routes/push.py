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
