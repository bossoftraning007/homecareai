"""Wellness Tracker API endpoints for Sleep & Mood Tracking."""
from datetime import datetime, timedelta
from fastapi import APIRouter, Request, HTTPException
from config.database import get_supabase

router = APIRouter()


def get_user_id(request: Request):
    """Get user from x-user-id header."""
    user_id = request.headers.get("x-user-id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    return {"id": user_id}


@router.get("/wellness")
async def get_wellness_logs(request: Request):
    """Get user's wellness logs."""
    try:
        current_user = get_user_id(request)
        supabase = get_supabase()
        
        # Get query parameters
        days = int(request.query_params.get("days", "30"))
        
        start_date = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%d")
        
        result = supabase.table("wellness_logs").select("*").eq(
            "user_id", current_user["id"]
        ).gte("log_date", start_date).order("log_date", ascending=False).execute()
        
        return {"logs": result.data or []}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/wellness")
async def create_wellness_log(request: Request):
    """Create or update a wellness log for today."""
    try:
        current_user = get_user_id(request)
        supabase = get_supabase()
        
        body = await request.json()
        today = datetime.utcnow().strftime("%Y-%m-%d")
        
        # Check if log exists for today
        existing = supabase.table("wellness_logs").select("id").eq(
            "user_id", current_user["id"]
        ).eq("log_date", today).execute()
        
        log_data = {
            "user_id": current_user["id"],
            "log_date": today,
            "sleep_hours": body.get("sleep_hours"),
            "sleep_quality": body.get("sleep_quality"),
            "mood": body.get("mood"),
            "energy_level": body.get("energy_level"),
            "water_glasses": body.get("water_glasses", 0),
            "exercise_minutes": body.get("exercise_minutes", 0),
            "notes": body.get("notes", ""),
            "updated_at": datetime.utcnow().isoformat(),
        }
        
        if existing.data:
            # Update existing
            result = supabase.table("wellness_logs").update(log_data).eq(
                "id", existing.data[0]["id"]
            ).select().single().execute()
        else:
            # Create new
            result = supabase.table("wellness_logs").insert(log_data).select().single().execute()
        
        return {"log": result.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/wellness/insights")
async def get_wellness_insights(request: Request):
    """Get AI-powered insights based on wellness data."""
    try:
        current_user = get_user_id(request)
        supabase = get_supabase()
        
        # Get last 30 days of data
        start_date = (datetime.utcnow() - timedelta(days=30)).strftime("%Y-%m-%d")
        
        result = supabase.table("wellness_logs").select("*").eq(
            "user_id", current_user["id"]
        ).gte("log_date", start_date).order("log_date", ascending=True).execute()
        
        logs = result.data or []
        
        if not logs:
            return {
                "insights": ["Start logging your sleep and mood to get personalized insights!"],
                "averages": {},
                "trends": {},
            }
        
        # Calculate averages
        total_logs = len(logs)
        avg_sleep = sum(l.get("sleep_hours", 0) or 0 for l in logs) / total_logs
        avg_quality = sum(l.get("sleep_quality", 0) or 0 for l in logs) / total_logs
        avg_energy = sum(l.get("energy_level", 0) or 0 for l in logs) / total_logs
        avg_water = sum(l.get("water_glasses", 0) or 0 for l in logs) / total_logs
        avg_exercise = sum(l.get("exercise_minutes", 0) or 0 for l in logs) / total_logs
        
        # Mood distribution
        mood_counts = {}
        for log in logs:
            mood = log.get("mood", "unknown")
            mood_counts[mood] = mood_counts.get(mood, 0) + 1
        
        most_common_mood = max(mood_counts, key=mood_counts.get) if mood_counts else "unknown"
        
        # Generate insights
        insights = []
        
        if avg_sleep < 7:
            insights.append("You're averaging less than 7 hours of sleep. Try going to bed 30 minutes earlier.")
        elif avg_sleep > 8:
            insights.append("You're getting plenty of good sleep! Keep it up.")
        
        if avg_quality < 3:
            insights.append("Your sleep quality could improve. Try avoiding screens 1hr before bed.")
        
        if avg_energy < 3:
            insights.append("Your energy levels are low. More sleep and hydration might help.")
        
        if avg_water < 8:
            insights.append("You're drinking less than 8 glasses of water. Stay hydrated!")
        
        if avg_exercise < 30:
            insights.append("Try to get at least 30 minutes of exercise daily for better health.")
        
        if most_common_mood == "stressed":
            insights.append("You've been feeling stressed often. Consider relaxation techniques like deep breathing.")
        
        if most_common_mood == "happy":
            insights.append("Great! You've been feeling happy often. Keep doing what you're doing!")
        
        # Correlation insights
        good_sleep_days = [l for l in logs if (l.get("sleep_hours") or 0) >= 7]
        if good_sleep_days:
            good_energy = sum(l.get("energy_level", 3) or 3 for l in good_sleep_days) / len(good_sleep_days)
            if good_energy >= 4:
                insights.append("On days you sleep 7+ hours, your energy is significantly better!")
        
        return {
            "insights": insights,
            "averages": {
                "sleep_hours": round(avg_sleep, 1),
                "sleep_quality": round(avg_quality, 1),
                "energy_level": round(avg_energy, 1),
                "water_glasses": round(avg_water, 1),
                "exercise_minutes": round(avg_exercise, 1),
            },
            "mood_distribution": mood_counts,
            "most_common_mood": most_common_mood,
            "total_logs": total_logs,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
