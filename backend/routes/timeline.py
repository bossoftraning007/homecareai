"""Timeline API endpoints for My Health Journey."""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional
from config.database import get_supabase

router = APIRouter()


async def get_user_id(request: Request):
    """Get user from x-user-id header."""
    user_id = request.headers.get("x-user-id")
    if user_id:
        return {"id": user_id}
    raise HTTPException(status_code=401, detail="Authentication required")


class TimelineEventRequest(BaseModel):
    event_type: str
    title: str
    description: Optional[str] = None
    icon: Optional[str] = "📌"
    metadata: Optional[dict] = {}


@router.get("/timeline")
async def get_timeline(request: Request):
    """Get user's timeline events."""
    try:
        current_user = await get_user_id(request)
        supabase = get_supabase()
        result = supabase.table("timeline_events").select("*").eq(
            "user_id", current_user["id"]
        ).order("event_date", ascending=False).limit(100).execute()

        return {"events": result.data or []}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/timeline")
async def create_event(req: TimelineEventRequest, request: Request):
    """Create a new timeline event."""
    try:
        current_user = await get_user_id(request)
        supabase = get_supabase()
        result = supabase.table("timeline_events").insert({
            "user_id": current_user["id"],
            "event_type": req.event_type,
            "title": req.title,
            "description": req.description,
            "icon": req.icon,
            "metadata": req.metadata,
        }).select().single().execute()

        return {"event": result.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/timeline/insights")
async def get_insights(request: Request):
    """Get AI-powered insights based on timeline data."""
    try:
        current_user = await get_user_id(request)
        supabase = get_supabase()

        from datetime import datetime, timedelta
        month_ago = (datetime.utcnow() - timedelta(days=30)).isoformat()

        events = supabase.table("timeline_events").select("*").eq(
            "user_id", current_user["id"]
        ).gte("event_date", month_ago).order("event_date", ascending=False).execute()

        insights = []
        event_list = events.data or []

        if not event_list:
            return {
                "insights": ["🌱 Start your health journey by chatting with AI or logging wellness data!"],
                "event_count": 0,
                "weekly_summary": {},
            }

        types = {}
        for event in event_list:
            t = event.get("event_type", "other")
            types[t] = types.get(t, 0) + 1

        total = len(event_list)

        if types.get("medication", 0) >= 5:
            insights.append("💊 Great medication adherence! You've logged medications consistently.")

        if types.get("wellness", 0) >= 7:
            insights.append("📊 You're tracking wellness regularly. Keep it up for better insights!")

        if types.get("recovery", 0) >= 2:
            insights.append("🧬 You have multiple recovery plans. Stay committed to your healing!")

        if types.get("chat", 0) >= 10:
            insights.append("💬 You're actively using AI chat. Ask about related symptoms for more help!")

        recent = [e for e in event_list if (datetime.utcnow() - datetime.fromisoformat(e["event_date"].replace("Z", "+00:00"))).days < 7]
        if len(recent) >= 5:
            insights.append("🔥 Active week! You've been taking care of your health.")

        weekly = {}
        for event in event_list:
            day = event["event_date"][:10]
            if day not in weekly:
                weekly[day] = {"count": 0, "types": []}
            weekly[day]["count"] += 1
            weekly[day]["types"].append(event["event_type"])

        return {
            "insights": insights or ["📈 Keep logging your health data for personalized insights!"],
            "event_count": total,
            "weekly_summary": weekly,
            "by_type": types,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/timeline/weekly-story")
async def get_weekly_story(request: Request):
    """Generate a weekly health story based on timeline events."""
    try:
        current_user = await get_user_id(request)
        supabase = get_supabase()
        from datetime import datetime, timedelta

        week_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()

        events = supabase.table("timeline_events").select("*").eq(
            "user_id", current_user["id"]
        ).gte("event_date", week_ago).order("event_date", ascending=True).execute()

        event_list = events.data or []

        if not event_list:
            return {
                "story": "No activity this week. Start by chatting with AI or logging your wellness!",
                "highlights": [],
                "total_events": 0,
            }

        by_day = {}
        for event in event_list:
            day = datetime.fromisoformat(event["event_date"].replace("Z", "+00:00")).strftime("%A")
            if day not in by_day:
                by_day[day] = []
            by_day[day].append(event)

        story_parts = ["🌿 This Week in Your Health:\n"]
        highlights = []

        for day, day_events in by_day.items():
            event_types = [e["event_type"] for e in day_events]
            story_parts.append(f"\n📅 {day}:")
            for e in day_events:
                story_parts.append(f"  {e['icon']} {e['title']}")

            if "recovery" in event_types:
                highlights.append(f"🧬 Recovery progress on {day}")
            if "medication" in event_types:
                highlights.append(f"💊 Medications logged on {day}")

        return {
            "story": "\n".join(story_parts),
            "highlights": highlights,
            "total_events": len(event_list),
            "days_active": len(by_day),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
