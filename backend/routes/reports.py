"""Health Reports API - Generate PDF reports."""
from datetime import datetime, timedelta
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from config.database import get_supabase
from services.pdf_service import generate_weekly_report, generate_monthly_report

router = APIRouter()


def get_user_id(request: Request):
    """Get user from x-user-id header."""
    user_id = request.headers.get("x-user-id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    return {"id": user_id}


@router.get("/reports/weekly")
async def generate_weekly_report_endpoint(request: Request):
    """Generate weekly health report PDF."""
    try:
        current_user = get_user_id(request)
        supabase = get_supabase()

        # Get user profile
        profile = supabase.table("profiles").select("full_name").eq("id", current_user["id"]).single().execute()
        user_name = profile.data.get("full_name", "User") if profile.data else "User"

        # Calculate week range
        today = datetime.utcnow().date()
        week_start = today - timedelta(days=7)
        week_end = today

        start_str = week_start.strftime("%Y-%m-%d")
        end_str = week_end.strftime("%Y-%m-%d")

        # Fetch wellness logs
        logs_result = supabase.table("wellness_logs").select("*").eq(
            "user_id", current_user["id"]
        ).gte("log_date", start_str).order("log_date", ascending=True).execute()
        wellness_logs = logs_result.data or []

        # Fetch medications
        meds_result = supabase.table("medications").select("*").eq(
            "user_id", current_user["id"]
        ).eq("is_active", True).execute()
        medications = meds_result.data or []

        # Fetch symptoms from timeline
        symptoms_result = supabase.table("timeline_events").select("*").eq(
            "user_id", current_user["id"]
        ).gte("event_date", start_str).eq("event_type", "symptom").execute()
        symptoms = symptoms_result.data or []

        # Calculate insights
        insights = calculate_insights(wellness_logs)

        # Generate PDF
        pdf_bytes = generate_weekly_report(
            user_name=user_name,
            week_start=start_str,
            week_end=end_str,
            wellness_logs=wellness_logs,
            medications=medications,
            symptoms=symptoms,
            insights=insights,
        )

        # Return as downloadable file
        filename = f"health_report_weekly_{end_str}.pdf"
        return StreamingResponse(
            iter([pdf_bytes]),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reports/monthly")
async def generate_monthly_report_endpoint(request: Request):
    """Generate monthly health report PDF."""
    try:
        current_user = get_user_id(request)
        supabase = get_supabase()

        # Get user profile
        profile = supabase.table("profiles").select("full_name").eq("id", current_user["id"]).single().execute()
        user_name = profile.data.get("full_name", "User") if profile.data else "User"

        # Calculate month range
        today = datetime.utcnow().date()
        month_start = today - timedelta(days=30)

        start_str = month_start.strftime("%Y-%m-%d")
        month_name = today.strftime("%B %Y")

        # Fetch wellness logs
        logs_result = supabase.table("wellness_logs").select("*").eq(
            "user_id", current_user["id"]
        ).gte("log_date", start_str).order("log_date", ascending=True).execute()
        wellness_logs = logs_result.data or []

        # Fetch medications
        meds_result = supabase.table("medications").select("*").eq(
            "user_id", current_user["id"]
        ).execute()
        medications = meds_result.data or []

        # Fetch symptoms
        symptoms_result = supabase.table("timeline_events").select("*").eq(
            "user_id", current_user["id"]
        ).gte("event_date", start_str).eq("event_type", "symptom").execute()
        symptoms = symptoms_result.data or []

        # Calculate insights
        insights = calculate_insights(wellness_logs)

        # Generate PDF
        pdf_bytes = generate_monthly_report(
            user_name=user_name,
            month_name=month_name,
            wellness_logs=wellness_logs,
            medications=medications,
            symptoms=symptoms,
            insights=insights,
        )

        filename = f"health_report_monthly_{today.strftime('%Y%m')}.pdf"
        return StreamingResponse(
            iter([pdf_bytes]),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def calculate_insights(logs: list) -> dict:
    """Calculate insights from wellness logs."""
    if not logs:
        return {
            "insights": ["No data available. Start tracking to see insights!"],
            "averages": {"sleep_hours": 0, "sleep_quality": 0, "energy_level": 0, "water_glasses": 0, "exercise_minutes": 0},
            "mood_distribution": {},
            "most_common_mood": "N/A",
        }

    total = len(logs)
    avg_sleep = sum(l.get("sleep_hours", 0) or 0 for l in logs) / total
    avg_quality = sum(l.get("sleep_quality", 0) or 0 for l in logs) / total
    avg_energy = sum(l.get("energy_level", 0) or 0 for l in logs) / total
    avg_water = sum(l.get("water_glasses", 0) or 0 for l in logs) / total
    avg_exercise = sum(l.get("exercise_minutes", 0) or 0 for l in logs) / total

    mood_counts = {}
    for log in logs:
        mood = log.get("mood", "unknown")
        mood_counts[mood] = mood_counts.get(mood, 0) + 1

    most_common = max(mood_counts, key=mood_counts.get) if mood_counts else "N/A"

    insights = []
    if avg_sleep < 7:
        insights.append("You're averaging less than 7 hours. Try going to bed earlier.")
    elif avg_sleep >= 7:
        insights.append("Great job getting 7+ hours of sleep!")
    if avg_quality < 3:
        insights.append("Sleep quality could improve. Avoid screens before bed.")
    if avg_energy < 3:
        insights.append("Energy levels are low. Consider more sleep and hydration.")
    if avg_water < 8:
        insights.append("Try to drink at least 8 glasses of water daily.")
    if avg_exercise < 30:
        insights.append("Aim for 30 minutes of exercise daily.")
    if most_common == "stressed":
        insights.append("Consider stress management techniques like meditation.")
    if most_common == "happy":
        insights.append("You've been feeling happy often! Keep it up!")

    # Correlation
    good_sleep_days = [l for l in logs if (l.get("sleep_hours") or 0) >= 7]
    if good_sleep_days:
        good_energy = sum(l.get("energy_level", 3) or 3 for l in good_sleep_days) / len(good_sleep_days)
        if good_energy >= 4:
            insights.append("On days you sleep 7+ hours, your energy is much better!")

    return {
        "insights": insights,
        "averages": {
            "sleep_hours": round(avg_sleep, 1),
            "sleep_quality": round(avg_quality, 1),
            "energy_level": round(avg_energy, 1),
            "water_glasses": round(avg_water, 1),
            "exercise_minutes": round(avg_exercise),
        },
        "mood_distribution": mood_counts,
        "most_common_mood": most_common,
    }
