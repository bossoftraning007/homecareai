import time
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Request, HTTPException, Depends
from services.auth_service import get_current_user
from config.database import get_supabase
from services.ai_service import AIService

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("")
async def get_notifications(
    request: Request,
    limit: int = 50,
    offset: int = 0,
    unread_only: bool = False,
    current_user: dict = Depends(get_current_user),
):
    """Get user notifications with pagination."""
    try:
        supabase = get_supabase()
        query = (
            supabase.table("notifications")
            .select("*")
            .eq("user_id", current_user["id"])
            .eq("is_archived", False)
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
        )
        if unread_only:
            query = query.eq("is_read", False)

        result = query.execute()
        notifications = result.data or []

        # Get unread count
        count_result = (
            supabase.table("notifications")
            .select("id", count="exact")
            .eq("user_id", current_user["id"])
            .eq("is_read", False)
            .eq("is_archived", False)
            .execute()
        )
        unread_count = count_result.count or 0

        return {
            "notifications": notifications,
            "unread_count": unread_count,
            "total": len(notifications),
            "offset": offset,
            "limit": limit,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/unread-count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    """Get count of unread notifications."""
    try:
        supabase = get_supabase()
        result = (
            supabase.table("notifications")
            .select("id", count="exact")
            .eq("user_id", current_user["id"])
            .eq("is_read", False)
            .eq("is_archived", False)
            .execute()
        )
        return {"unread_count": result.count or 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{notification_id}/read")
async def mark_as_read(
    notification_id: str, current_user: dict = Depends(get_current_user)
):
    """Mark a notification as read."""
    try:
        supabase = get_supabase()
        result = (
            supabase.table("notifications")
            .update({"is_read": True, "read_at": datetime.now(timezone.utc).isoformat()})
            .eq("id", notification_id)
            .eq("user_id", current_user["id"])
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Notification not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mark-all-read")
async def mark_all_as_read(current_user: dict = Depends(get_current_user)):
    """Mark all notifications as read."""
    try:
        supabase = get_supabase()
        result = (
            supabase.table("notifications")
            .update({"is_read": True, "read_at": datetime.now(timezone.utc).isoformat()})
            .eq("user_id", current_user["id"])
            .eq("is_read", False)
            .execute()
        )
        return {"success": True, "updated": len(result.data) if result.data else 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str, current_user: dict = Depends(get_current_user)
):
    """Archive (soft delete) a notification."""
    try:
        supabase = get_supabase()
        result = (
            supabase.table("notifications")
            .update({"is_archived": True})
            .eq("id", notification_id)
            .eq("user_id", current_user["id"])
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Notification not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ===== Preferences =====


@router.get("/preferences")
async def get_preferences(current_user: dict = Depends(get_current_user)):
    """Get user notification preferences."""
    try:
        supabase = get_supabase()
        result = (
            supabase.table("notification_preferences")
            .select("*")
            .eq("user_id", current_user["id"])
            .single()
            .execute()
        )
        return result.data or {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/preferences")
async def update_preferences(
    request: Request, current_user: dict = Depends(get_current_user)
):
    """Update user notification preferences."""
    try:
        data = await request.json()
        supabase = get_supabase()
        
        update_data = {
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        allowed_fields = [
            "remedy_followups",
            "emergency_alerts",
            "seasonal_advisories",
            "account_security",
            "marketing_broadcasts",
            "quiet_start_hour",
            "quiet_end_hour",
        ]
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]

        result = (
            supabase.table("notification_preferences")
            .upsert({"user_id": current_user["id"], **update_data})
            .execute()
        )
        return {"success": True, "preferences": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ===== Push Subscriptions =====


@router.post("/push/subscribe")
async def subscribe_push(
    request: Request, current_user: dict = Depends(get_current_user)
):
    """Register a push subscription for the current user."""
    try:
        data = await request.json()
        supabase = get_supabase()

        subscription = {
            "user_id": current_user["id"],
            "endpoint": data.get("endpoint"),
            "p256dh": data.get("keys", {}).get("p256dh"),
            "auth": data.get("keys", {}).get("auth"),
            "user_agent": request.headers.get("user-agent", ""),
        }

        result = (
            supabase.table("push_subscriptions")
            .upsert(subscription, on_conflict="user_id,endpoint")
            .execute()
        )
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/push/unsubscribe")
async def unsubscribe_push(
    request: Request, current_user: dict = Depends(get_current_user)
):
    """Remove a push subscription."""
    try:
        data = await request.json()
        supabase = get_supabase()

        supabase.table("push_subscriptions").delete().eq(
            "user_id", current_user["id"]
        ).eq("endpoint", data.get("endpoint")).execute()

        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ===== Admin Broadcast =====


@router.post("/admin/broadcast")
async def send_broadcast(
    request: Request, current_user: dict = Depends(get_current_user)
):
    """Send broadcast notification to all users (admin only)."""
    try:
        supabase = get_supabase()

        # Check admin using security definer function (bypasses RLS)
        admin_check = supabase.rpc("check_is_admin", {"user_id": current_user["id"]}).execute()
        is_admin = admin_check.data if admin_check.data is not None else False
        
        if not is_admin:
            raise HTTPException(status_code=403, detail="Admin access required")

        data = await request.json()
        title = data.get("title", "")
        body = data.get("body", "")
        action_url = data.get("action_url", "")

        if not title or not body:
            raise HTTPException(
                status_code=400, detail="Title and body are required"
            )

        # Get all users
        users_result = supabase.table("profiles").select("id").execute()
        users = users_result.data or []

        # Create broadcast log
        log_result = (
            supabase.table("broadcast_log")
            .insert({
                "admin_id": current_user["id"],
                "title": title,
                "body": body,
                "target_count": len(users),
            })
            .execute()
        )
        broadcast_id = log_result.data[0]["id"] if log_result.data else None

        # Create notifications for each user
        notifications = [
            {
                "user_id": user["id"],
                "type": "broadcast",
                "title": title,
                "body": body,
                "icon": "B",
                "action_url": action_url,
                "priority": "normal",
            }
            for user in users
        ]

        # Batch insert
        if notifications:
            supabase.table("notifications").insert(notifications).execute()

        # Update log
        if broadcast_id:
            supabase.table("broadcast_log").update(
                {"delivered_count": len(notifications)}
            ).eq("id", broadcast_id).execute()

        return {
            "success": True,
            "message": f"Broadcast sent to {len(users)} users",
            "broadcast_id": broadcast_id,
            "target_count": len(users),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/broadcasts")
async def get_broadcasts(current_user: dict = Depends(get_current_user)):
    """Get broadcast history (admin only)."""
    try:
        supabase = get_supabase()

        # Check admin
        profile = (
            supabase.table("profiles")
            .select("is_admin")
            .eq("id", current_user["id"])
            .single()
            .execute()
        )
        if not profile.data or not profile.data.get("is_admin"):
            raise HTTPException(status_code=403, detail="Admin access required")

        result = (
            supabase.table("broadcast_log")
            .select("*")
            .order("created_at", desc=True)
            .limit(50)
            .execute()
        )
        return {"broadcasts": result.data or []}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ===== Smart Notification Creation =====


@router.post("/create")
async def create_notification(
    request: Request, current_user: dict = Depends(get_current_user)
):
    """Create a notification for the current user (internal use)."""
    try:
        data = await request.json()
        supabase = get_supabase()

        notification = {
            "user_id": current_user["id"],
            "type": data.get("type", "remedy_followup"),
            "title": data.get("title", ""),
            "body": data.get("body", ""),
            "icon": data.get("icon", "B"),
            "action_url": data.get("action_url"),
            "action_text": data.get("action_text"),
            "priority": data.get("priority", "normal"),
            "metadata": data.get("metadata", {}),
        }

        result = supabase.table("notifications").insert(notification).execute()
        return {"success": True, "notification": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
