from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from services.reminder_service import create_reminder, get_active_reminders, process_due_reminders
from services.auth_service import get_current_user

router = APIRouter(prefix="/api/reminders", tags=["reminders"])


class ReminderRequest(BaseModel):
    type: str = "wellness"
    title: Optional[str] = None
    message: Optional[str] = None
    scheduled_time: str = "09:00"
    days_of_week: Optional[list] = None


@router.get("")
async def list_reminders(current_user: dict = Depends(get_current_user)):
    """Get all reminders for current user."""
    from config.database import get_supabase
    supabase = get_supabase()

    result = supabase.table("reminders").select("*").eq("user_id", current_user["id"]).execute()
    return {"reminders": result.data or []}


@router.post("")
async def create_new_reminder(req: ReminderRequest, current_user: dict = Depends(get_current_user)):
    """Create a new reminder."""
    from config.database import get_supabase
    supabase = get_supabase()

    reminder = {
        "user_id": current_user["id"],
        "type": req.type,
        "title": req.title or f"⏰ {req.type.title()} Reminder",
        "message": req.message or "Time for your reminder!",
        "scheduled_time": req.scheduled_time,
        "is_active": True,
    }

    if req.days_of_week:
        reminder["days_of_week"] = req.days_of_week

    result = supabase.table("reminders").insert(reminder).execute()
    return {"reminder": result.data[0] if result.data else None}


@router.patch("/{reminder_id}")
async def update_reminder(reminder_id: str, req: ReminderRequest, current_user: dict = Depends(get_current_user)):
    """Update a reminder."""
    from config.database import get_supabase
    supabase = get_supabase()

    update_data = {}
    if req.title:
        update_data["title"] = req.title
    if req.message:
        update_data["message"] = req.message
    if req.scheduled_time:
        update_data["scheduled_time"] = req.scheduled_time
    if req.type:
        update_data["type"] = req.type

    result = supabase.table("reminders").update(update_data).eq("id", reminder_id).eq("user_id", current_user["id"]).execute()
    return {"reminder": result.data[0] if result.data else None}


@router.delete("/{reminder_id}")
async def delete_reminder(reminder_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a reminder."""
    from config.database import get_supabase
    supabase = get_supabase()

    supabase.table("reminders").delete().eq("id", reminder_id).eq("user_id", current_user["id"]).execute()
    return {"status": "deleted"}


@router.post("/{reminder_id}/toggle")
async def toggle_reminder(reminder_id: str, current_user: dict = Depends(get_current_user)):
    """Toggle reminder active status."""
    from config.database import get_supabase
    supabase = get_supabase()

    # Get current status
    result = supabase.table("reminders").select("is_active").eq("id", reminder_id).eq("user_id", current_user["id"]).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Reminder not found")

    new_status = not result.data.get("is_active", True)
    supabase.table("reminders").update({"is_active": new_status}).eq("id", reminder_id).execute()

    return {"is_active": new_status}
