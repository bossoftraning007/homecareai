"""Dashboard API - Health Score, AI Briefing, Vitals, Goals, Family Mode."""
from datetime import datetime, timedelta
from fastapi import APIRouter, Request, HTTPException
from config.database import get_supabase

router = APIRouter()


def get_user_id(request: Request):
    user_id = request.headers.get("x-user-id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    return {"id": user_id}


@router.get("/dashboard")
async def get_dashboard_data(request: Request):
    """Get all dashboard data: health score, briefing, vitals, goals, family."""
    try:
        current_user = get_user_id(request)
        supabase = get_supabase()
        user_id = current_user["id"]
        today = datetime.utcnow().strftime("%Y-%m-%d")

        # 1. Today's wellness log
        wellness_result = supabase.table("wellness_logs").select("*").eq(
            "user_id", user_id
        ).eq("log_date", today).execute()
        today_wellness = wellness_result.data[0] if wellness_result.data else None

        # 2. Recent vitals (last 7 days)
        seven_days_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
        vitals_result = supabase.table("vitals").select("*").eq(
            "user_id", user_id
        ).gte("recorded_at", seven_days_ago).order("recorded_at", ascending=False).execute()
        recent_vitals = vitals_result.data or []

        # 3. Active medications
        meds_result = supabase.table("medications").select("*").eq(
            "user_id", user_id
        ).eq("is_active", True).execute()
        active_meds = meds_result.data or []

        # 4. Today's medication timeline
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0).isoformat()
        today_end = (datetime.utcnow() + timedelta(days=1)).replace(hour=0, minute=0, second=0).isoformat()
        timeline_result = supabase.table("medication_timeline").select("*, medications(*)").eq(
            "user_id", user_id
        ).gte("scheduled_time", today_start).lt("scheduled_time", today_end).order("scheduled_time").execute()
        med_timeline = timeline_result.data or []

        # 5. Health goals
        goals_result = supabase.table("health_goals").select("*").eq("user_id", user_id).eq("is_active", True).execute()
        goals = goals_result.data or []

        # 6. Recent achievements
        achievements_result = supabase.table("achievements").select("*").eq(
            "user_id", user_id
        ).order("earned_at", ascending=False).limit(5).execute()
        achievements = achievements_result.data or []

        # 7. Streak freezes
        freezes_result = supabase.table("streak_freezes").select("*").eq("user_id", user_id).execute()
        freezes = freezes_result.data[0] if freezes_result.data else {"freezes_available": 1, "freezes_used": 0}

        # 8. Family links (caregivers viewing this user)
        family_result = supabase.table("family_links").select("*, profiles:patient_id(*)").eq(
            "patient_id", user_id
        ).eq("status", "active").execute()
        caregivers = family_result.data or []

        # 9. Recent symptoms (last 5)
        symptoms_result = supabase.table("timeline_events").select("*").eq(
            "user_id", user_id
        ).eq("event_type", "symptom").order("event_date", ascending=False).limit(5).execute()
        recent_symptoms = symptoms_result.data or []

        # 10. Calculate health score
        health_score = calculate_health_score(today_wellness, recent_vitals)

        # 11. Generate AI briefing
        ai_briefing = generate_ai_briefing(today_wellness, health_score, recent_vitals, active_meds)

        # 12. Total XP and level
        total_xp = sum(g.get("xp_points", 0) for g in goals)
        level = get_level_from_xp(total_xp)

        return {
            "health_score": health_score,
            "ai_briefing": ai_briefing,
            "today_wellness": today_wellness,
            "recent_vitals": recent_vitals,
            "active_medications": active_meds,
            "medication_timeline": med_timeline,
            "goals": goals,
            "achievements": achievements,
            "streak_freezes": freezes,
            "caregivers": caregivers,
            "recent_symptoms": recent_symptoms,
            "total_xp": total_xp,
            "user_level": level,
            "current_date": today,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/dashboard/quick-log")
async def quick_log(request: Request):
    """Quick log from dashboard: water, mood, sleep, etc."""
    try:
        current_user = get_user_id(request)
        supabase = get_supabase()
        body = await request.json()
        today = datetime.utcnow().strftime("%Y-%m-%d")

        log_type = body.get("type")  # water, mood, sleep, exercise

        if log_type == "water":
            existing = supabase.table("wellness_logs").select("*").eq("user_id", current_user["id"]).eq("log_date", today).execute()
            if existing.data:
                current_glasses = existing.data[0].get("water_glasses", 0)
                supabase.table("wellness_logs").update({
                    "water_glasses": current_glasses + 1,
                    "updated_at": datetime.utcnow().isoformat(),
                }).eq("id", existing.data[0]["id"]).execute()
            else:
                supabase.table("wellness_logs").insert({
                    "user_id": current_user["id"],
                    "log_date": today,
                    "water_glasses": 1,
                }).execute()
            return {"success": True, "type": "water"}

        elif log_type == "mood":
            mood = body.get("mood", "happy")
            existing = supabase.table("wellness_logs").select("*").eq("user_id", current_user["id"]).eq("log_date", today).execute()
            if existing.data:
                supabase.table("wellness_logs").update({"mood": mood, "updated_at": datetime.utcnow().isoformat()}).eq("id", existing.data[0]["id"]).execute()
            else:
                supabase.table("wellness_logs").insert({"user_id": current_user["id"], "log_date": today, "mood": mood}).execute()
            return {"success": True, "type": "mood", "mood": mood}

        elif log_type == "medication_taken":
            timeline_id = body.get("timeline_id")
            if timeline_id:
                supabase.table("medication_timeline").update({
                    "status": "taken",
                    "taken_at": datetime.utcnow().isoformat(),
                }).eq("id", timeline_id).execute()
            return {"success": True, "type": "medication_taken"}

        else:
            raise HTTPException(status_code=400, detail="Invalid log type")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/dashboard/snooze-medication")
async def snooze_medication(request: Request):
    """Snooze a medication reminder."""
    try:
        current_user = get_user_id(request)
        supabase = get_supabase()
        body = await request.json()
        timeline_id = body.get("timeline_id")
        minutes = int(body.get("minutes", 15))

        if timeline_id:
            snooze_until = (datetime.utcnow() + timedelta(minutes=minutes)).isoformat()
            supabase.table("medication_timeline").update({
                "status": "snoozed",
                "snooze_until": snooze_until,
            }).eq("id", timeline_id).execute()
        return {"success": True, "snooze_until": snooze_until if timeline_id else None}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/dashboard/add-vital")
async def add_vital(request: Request):
    """Add a vital reading."""
    try:
        current_user = get_user_id(request)
        supabase = get_supabase()
        body = await request.json()

        vital_data = {
            "user_id": current_user["id"],
            "metric_type": body.get("metric_type"),
            "value": body.get("value"),
            "unit": body.get("unit", ""),
            "notes": body.get("notes", ""),
        }

        result = supabase.table("vitals").insert(vital_data).select().single().execute()
        return {"vital": result.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/dashboard/use-streak-freeze")
async def use_streak_freeze(request: Request):
    """Use a streak freeze to keep streak alive."""
    try:
        current_user = get_user_id(request)
        supabase = get_supabase()

        existing = supabase.table("streak_freezes").select("*").eq("user_id", current_user["id"]).execute()

        if existing.data:
            freezes_avail = existing.data[0].get("freezes_available", 0)
            if freezes_avail > 0:
                supabase.table("streak_freezes").update({
                    "freezes_available": freezes_avail - 1,
                    "freezes_used": existing.data[0].get("freezes_used", 0) + 1,
                    "updated_at": datetime.utcnow().isoformat(),
                }).eq("user_id", current_user["id"]).execute()
                return {"success": True, "freezes_remaining": freezes_avail - 1}

        return {"success": False, "message": "No freezes available"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def calculate_health_score(wellness: dict, vitals: list) -> dict:
    """Calculate daily health score out of 100."""
    sleep_score = 0
    nutrition_score = 0
    activity_score = 0
    mood_score = 0
    hydration_score = 0

    if wellness:
        # Sleep (25 points)
        sleep_hours = wellness.get("sleep_hours") or 0
        sleep_quality = wellness.get("sleep_quality") or 3
        if sleep_hours >= 7 and sleep_hours <= 9:
            sleep_score = 20 + (sleep_quality * 1)
        elif sleep_hours >= 6:
            sleep_score = 15 + (sleep_quality * 1)
        else:
            sleep_score = max(5, sleep_quality * 3)
        sleep_score = min(25, sleep_score)

        # Hydration (20 points)
        water = wellness.get("water_glasses", 0)
        hydration_score = min(20, water * 2.5)

        # Activity (25 points)
        exercise = wellness.get("exercise_minutes", 0)
        if exercise >= 30:
            activity_score = 25
        elif exercise >= 15:
            activity_score = 18
        elif exercise > 0:
            activity_score = 10
        else:
            activity_score = 5

        # Mood (30 points)
        mood = wellness.get("mood", "neutral")
        energy = wellness.get("energy_level", 3)
        mood_scores = {"happy": 25, "calm": 22, "energetic": 28, "tired": 12, "sad": 8, "anxious": 10, "stressed": 8, "angry": 8}
        mood_score = mood_scores.get(mood, 15) + min(5, energy)
        mood_score = min(30, mood_score)

    # Vitals check (affects total)
    vitals_alert = False
    for v in vitals:
        if v.get("metric_type") == "heart_rate" and (v.get("value", 0) > 120 or v.get("value", 0) < 50):
            vitals_alert = True
        if v.get("metric_type") == "bp_systolic" and v.get("value", 0) > 140:
            vitals_alert = True

    total = sleep_score + hydration_score + activity_score + mood_score + (10 if not vitals_alert else 0)

    # Build breakdown
    breakdown = [
        {"category": "Sleep", "score": int(sleep_score), "max": 25, "icon": "💤"},
        {"category": "Hydration", "score": int(hydration_score), "max": 20, "icon": "💧"},
        {"category": "Activity", "score": int(activity_score), "max": 25, "icon": "🏃"},
        {"category": "Mood & Energy", "score": int(mood_score), "max": 30, "icon": "😊"},
    ]

    return {
        "total": int(total),
        "breakdown": breakdown,
        "vitals_alert": vitals_alert,
        "grade": get_grade(int(total)),
    }


def get_grade(score: int) -> str:
    if score >= 90: return "A+"
    if score >= 80: return "A"
    if score >= 70: return "B"
    if score >= 60: return "C"
    return "D"


def get_level_from_xp(xp: int) -> dict:
    if xp >= 1000:
        return {"name": "Diamond", "icon": "💎", "color": "cyan", "next_xp": None}
    elif xp >= 500:
        return {"name": "Gold", "icon": "🥇", "color": "yellow", "next_xp": 1000}
    elif xp >= 200:
        return {"name": "Silver", "icon": "🥈", "color": "gray", "next_xp": 500}
    else:
        return {"name": "Bronze", "icon": "🥉", "color": "amber", "next_xp": 200}


def generate_ai_briefing(wellness: dict, score: dict, vitals: list, meds: list) -> dict:
    """Generate personalized AI daily briefing."""
    greeting = "Good morning"
    hour = datetime.utcnow().hour
    if 12 <= hour < 17:
        greeting = "Good afternoon"
    elif 17 <= hour < 21:
        greeting = "Good evening"
    elif hour >= 21 or hour < 5:
        greeting = "Hello"

    if not wellness:
        return {
            "greeting": f"{greeting}!",
            "message": "Let's start tracking your health today! Log your first wellness check-in to unlock personalized insights.",
            "tip": "💡 Tip: Start by logging your mood, water intake, and sleep.",
            "priority": "Get Started",
        }

    messages = []
    tips = []

    # Sleep analysis
    sleep = wellness.get("sleep_hours") or 0
    if sleep < 6:
        messages.append("your sleep was low last night")
        tips.append("Try a 20-minute power nap and aim for 7+ hours tonight")
    elif sleep >= 7 and sleep <= 9:
        messages.append("you had great sleep")
    else:
        messages.append("you slept a bit too much")
        tips.append("Try setting a consistent wake-up time")

    # Hydration
    water = wellness.get("water_glasses", 0)
    if water >= 6:
        messages.append("your hydration is on point")
    else:
        messages.append(f"you need more water (only {water} glasses so far)")
        tips.append(f"Drink {max(0, 8 - water)} more glasses today")

    # Activity
    exercise = wellness.get("exercise_minutes", 0)
    if exercise < 15:
        tips.append("Take a 10-minute walk after lunch to boost your energy")
    elif exercise >= 30:
        messages.append("you crushed your exercise goal")

    # Mood
    mood = wellness.get("mood", "")
    if mood in ["stressed", "anxious"]:
        tips.append("Try 5 minutes of deep breathing or meditation")
    elif mood in ["sad", "tired"]:
        tips.append("A short walk in sunlight can boost your mood")

    # Vitals alert
    if score.get("vitals_alert"):
        tips.append("⚠️ Some vital readings need attention. Check the vitals tab.")

    # Build greeting
    if messages:
        msg_text = ", ".join(messages)
        greeting_text = f"{greeting}! {msg_text.capitalize()}."
    else:
        greeting_text = f"{greeting}! Here's your health snapshot."

    # Priority action
    priority = None
    if not wellness.get("mood"):
        priority = "Log your mood"
    elif water < 4:
        priority = "Drink water"
    elif exercise < 15:
        priority = "Get active"
    elif tips:
        priority = tips[0]

    return {
        "greeting": greeting_text,
        "message": "Let's keep building healthy habits today.",
        "tip": tips[0] if tips else "Keep up the great work!",
        "all_tips": tips,
        "priority": priority,
    }
