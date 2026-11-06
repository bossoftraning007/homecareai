"""Gamification API: XP, levels, streaks, badges, achievements for health actions
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Request, HTTPException
from config.database import get_supabase
import uuid

router = APIRouter()

LEVELS = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"]
XP_PER_LEVEL = 1000
STREAK_BONUS_THRESHOLD = 7


def get_user_id(request: Request):
    user_id = request.headers.get("x-user-id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    return {"id": user_id}


def get_level(xp: int) -> tuple:
    level_idx = min(xp // XP_PER_LEVEL, len(LEVELS) - 1)
    xp_to_next = ((level_idx + 1) * XP_PER_LEVEL) - xp
    return LEVELS[level_idx], xp_to_next, level_idx


@router.get("/gamification/profile")
async def get_gamification_profile(request: Request):
    """Get user's XP, level, streak, badges."""
    try:
        current_user = get_user_id(request)
        supabase = get_supabase()

        profile = supabase.table("profiles").select("xp, current_streak, last_active_date, badges").eq(
            "id", current_user["id"]
        ).execute()
        profile_data = profile.data[0] if profile.data else None

        if not profile_data:
            supabase.table("profiles").insert({
                "id": current_user["id"],
                "xp": 0,
                "current_streak": 0,
                "badges": [],
            }).execute()
            profile_data = {"xp": 0, "current_streak": 0, "badges": []}

        xp = profile_data.get("xp", 0)
        level_name, xp_to_next, level_idx = get_level(xp)

        return {
            "xp": xp,
            "level_name": level_name,
            "level_index": level_idx,
            "xp_to_next_level": xp_to_next,
            "xp_percent": ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100 if XP_PER_LEVEL > 0 else 0,
            "current_streak": profile_data.get("current_streak", 0),
            "badges": profile_data.get("badges", []),
            "next_badge_threshold": 3,
            "total_badges": len(profile_data.get("badges", [])),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/gamification/award-xp")
async def award_xp(request: Request):
    """Award XP for completing health actions (logging, streak, etc)."""
    try:
        current_user = get_user_id(request)
        supabase = get_supabase()
        body = await request.json()

        xp_to_add = body.get("xp", 10)
        action = body.get("action", "generic")

        profile = supabase.table("profiles").select("xp, current_streak, last_active_date, badges").eq(
            "id", current_user["id"]
        ).execute()
        profile_data = profile.data[0] if profile.data else {"xp": 0, "current_streak": 0, "badges": [], "last_active_date": None}

        current_xp = profile_data.get("xp", 0) + xp_to_add
        streak = profile_data.get("current_streak", 0)
        badges = profile_data.get("badges", [])
        last_active = profile_data.get("last_active_date")

        # Check streak bonus
        streak_bonus = 0
        today = datetime.utcnow().date()
        if last_active:
            try:
                last_date = datetime.fromisoformat(last_active).date()
                if (today - last_date).days == 1:
                    streak += 1
                elif (today - last_date).days > 1:
                    streak = 1
            except:
                streak = 1
        else:
            streak = 1

        # Streak bonus for 7+ days
        if streak >= STREAK_BONUS_THRESHOLD:
            streak_bonus = 50

        current_xp += streak_bonus

        # Check for new badges
        new_badges = []
        if streak >= 3 and "3-Day Streak" not in badges:
            badges.append("3-Day Streak")
            new_badges.append("3-Day Streak")
        if streak >= 7 and "7-Day Streak" not in badges:
            badges.append("7-Day Streak")
            new_badges.append("7-Day Streak")
        if streak >= 30 and "30-Day Streak" not in badges:
            badges.append("30-Day Streak")
            new_badges.append("30-Day Streak")
        if current_xp >= 500 and "500 XP" not in badges:
            badges.append("500 XP")
            new_badges.append("500 XP")
        if current_xp >= 1000 and "1K Club" not in badges:
            badges.append("1K Club")
            new_badges.append("1K Club")

        # Update profile
        supabase.table("profiles").update({
            "xp": current_xp,
            "current_streak": streak,
            "last_active_date": today.isoformat(),
            "badges": badges,
            "updated_at": datetime.utcnow().isoformat(),
        }).eq("id", current_user["id"]).execute()

        level_name, xp_to_next, level_idx = get_level(current_xp)

        new_level = level_idx > (profile_data.get("xp", 0) // XP_PER_LEVEL) if profile_data.get("xp") else True

        return {
            "xp_gained": xp_to_add + streak_bonus,
            "streak_bonus": streak_bonus,
            "total_xp": current_xp,
            "level_name": level_name,
            "level_index": level_idx,
            "xp_to_next_level": xp_to_next,
            "current_streak": streak,
            "new_badges": new_badges,
            "level_up": new_level,
            "action": action,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/gamification/leaderboard")
async def get_leaderboard(request: Request, limit: int = 10):
    """Get top users by XP."""
    try:
        current_user = get_user_id(request)
        supabase = get_supabase()

        result = supabase.table("profiles").select("id, full_name, xp, current_streak, badges").order(
            "xp", desc=True
        ).limit(limit).execute()
        users = result.data or []

        leaderboard = []
        for u in users:
            level_name, _, _ = get_level(u.get("xp", 0))
            leaderboard.append({
                "id": u.get("id"),
                "name": u.get("full_name", "Anonymous"),
                "xp": u.get("xp", 0),
                "level": level_name,
                "streak": u.get("current_streak", 0),
                "badges": u.get("badges", []),
            })

        return {"leaderboard": leaderboard}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/gamification/challenges")
async def get_challenges(request: Request):
    """Get daily/weekly challenges."""
    try:
        challenges = [
            {"id": "daily_log", "title": "Log Your Health", "description": "Log your wellness data for today", "xp": 20, "type": "daily"},
            {"id": "daily_vital", "title": "Track Vitals", "description": "Log at least one vital sign", "xp": 25, "type": "daily"},
            {"id": "weekly_streak", "title": "7-Day Streak", "description": "Maintain a 7-day streak", "xp": 100, "type": "weekly"},
            {"id": "symptom_check", "title": "Symptom Tracker", "description": "Use the Symptom Time Machine", "xp": 30, "type": "daily"},
            {"id": "remedy_try", "title": "Try a Remedy", "description": "Log a kitchen remedy you tried", "xp": 15, "type": "daily"},
        ]
        return {"challenges": challenges}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/gamification/complete-challenge")
async def complete_challenge(request: Request):
    """Complete a challenge and earn XP."""
    try:
        current_user = get_user_id(request)
        body = await request.json()
        challenge_id = body.get("challenge_id", "")

        challenge_xp = {
            "daily_log": 20,
            "daily_vital": 25,
            "weekly_streak": 100,
            "symptom_check": 30,
            "remedy_try": 15,
        }

        xp = challenge_xp.get(challenge_id, 10)
        supabase = get_supabase()

        # Use the award-xp logic
        profile = supabase.table("profiles").select("xp, current_streak, last_active_date, badges").eq(
            "id", current_user["id"]
        ).execute()
        profile_data = profile.data[0] if profile.data else {"xp": 0, "current_streak": 0, "badges": [], "last_active_date": None}

        current_xp = (profile_data.get("xp", 0) or 0) + xp
        streak = profile_data.get("current_streak", 0)
        badges = profile_data.get("badges", [])
        today_str = datetime.utcnow().date().isoformat()

        supabase.table("profiles").update({
            "xp": current_xp,
            "last_active_date": today_str,
            "updated_at": datetime.utcnow().isoformat(),
        }).eq("id", current_user["id"]).execute()

        level_name, xp_to_next, level_idx = get_level(current_xp)

        return {
            "xp_gained": xp,
            "total_xp": current_xp,
            "level_name": level_name,
            "xp_to_next_level": xp_to_next,
            "challenge_id": challenge_id,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
