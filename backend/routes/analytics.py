from fastapi import APIRouter, Depends
from services.analytics_service import get_stats, get_analytics
from services.auth_service import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/notifications")
async def notification_stats(current_user: dict = Depends(get_current_user)):
    """Get notification analytics stats (admin only)."""
    from config.database import get_supabase
    supabase = get_supabase()

    # Check admin
    profile = supabase.table("profiles").select("is_admin").eq("id", current_user["id"]).execute()
    profile_data = profile.data[0] if profile.data else None
    if not profile_data or not profile_data.get("is_admin"):
        return {"error": "Admin access required"}

    stats = await get_stats()
    return stats


@router.get("/notifications/daily")
async def daily_analytics(days: int = 7, current_user: dict = Depends(get_current_user)):
    """Get daily notification analytics."""
    from config.database import get_supabase
    supabase = get_supabase()

    # Check admin
    profile = supabase.table("profiles").select("is_admin").eq("id", current_user["id"]).execute()
    profile_data = profile.data[0] if profile.data else None
    if not profile_data or not profile_data.get("is_admin"):
        return {"error": "Admin access required"}

    analytics = await get_analytics(days)
    return {"analytics": analytics}
