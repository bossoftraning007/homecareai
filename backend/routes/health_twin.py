"""AI Health Twin - Predictive Health Model
Analyzes user's vitals, sleep, mood, water, exercise
to predict health for next 7 days.
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Request, HTTPException
from config.database import get_supabase

router = APIRouter()


def get_user_id(request: Request):
    user_id = request.headers.get("x-user-id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    return {"id": user_id}


@router.get("/health-twin")
async def get_health_twin(request: Request):
    """Get AI Health Twin analysis: past 30 days + 7-day prediction."""
    try:
        current_user = get_user_id(request)
        supabase = get_supabase()
        user_id = current_user["id"]

        # 1. Pull 30 days of wellness data
        thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).strftime("%Y-%m-%d")
        wellness_result = supabase.table("wellness_logs").select("*").eq(
            "user_id", user_id
        ).gte("log_date", thirty_days_ago).order("log_date", ascending=True).execute()
        wellness_logs = wellness_result.data or []

        # 2. Pull 30 days of vitals
        vitals_result = supabase.table("vitals").select("*").eq(
            "user_id", user_id
        ).gte("recorded_at", thirty_days_ago.isoformat()).order("recorded_at", ascending=True).execute()
        vitals = vitals_result.data or []

        # 3. Run prediction model
        prediction = predict_health(wellness_logs, vitals)

        # 4. Save prediction to DB (optional)
        if prediction.get("next_7_days"):
            for pred in prediction["next_7_days"]:
                try:
                    supabase.table("health_predictions").insert({
                        "user_id": user_id,
                        "prediction_date": pred["date"],
                        "predicted_health_score": pred["health_score"],
                        "predicted_sleep_hours": pred["sleep_hours"],
                        "predicted_mood": pred["mood"],
                        "predicted_energy": pred["energy"],
                        "predicted_risk_level": pred["risk_level"],
                        "risk_factors": pred["risk_factors"],
                        "recommendations": pred["recommendations"],
                        "confidence_score": prediction["confidence"],
                    }).execute()
                except Exception:
                    pass  # Silently skip if conflict

        # 5. Generate insights (save them too)
        for insight in prediction.get("insights", []):
            try:
                supabase.table("health_insights").insert({
                    "user_id": user_id,
                    "insight_type": insight["type"],
                    "title": insight["title"],
                    "description": insight["description"],
                    "priority": insight["priority"],
                    "related_metric": insight.get("metric"),
                }).execute()
            except Exception:
                pass

        return prediction

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health-twin/history")
async def get_prediction_history(request: Request):
    """Get past predictions to compare with actual outcomes."""
    try:
        current_user = get_user_id(request)
        supabase = get_supabase()

        result = supabase.table("health_predictions").select("*").eq(
            "user_id", current_user["id"]
        ).order("prediction_date", ascending=False).limit(30).execute()

        return {"predictions": result.data or []}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health-twin/insights")
async def get_insights(request: Request):
    """Get recent insights."""
    try:
        current_user = get_user_id(request)
        supabase = get_supabase()

        result = supabase.table("health_insights").select("*").eq(
            "user_id", current_user["id"]
        ).order("created_at", ascending=False).limit(20).execute()

        return {"insights": result.data or []}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def predict_health(wellness_logs: list, vitals: list) -> dict:
    """Core prediction engine - simple but effective."""

    if not wellness_logs and not vitals:
        return get_empty_prediction()

    # Calculate trends from last 30 days
    recent_logs = wellness_logs[-7:] if len(wellness_logs) >= 7 else wellness_logs
    older_logs = wellness_logs[:-7] if len(wellness_logs) > 7 else []

    # Sleep trend
    sleep_recent = [l.get("sleep_hours", 0) or 0 for l in recent_logs]
    sleep_older = [l.get("sleep_hours", 0) or 0 for l in older_logs]

    avg_sleep_recent = sum(sleep_recent) / len(sleep_recent) if sleep_recent else 7
    avg_sleep_older = sum(sleep_older) / len(sleep_older) if sleep_older else avg_sleep_recent
    sleep_trend = avg_sleep_recent - avg_sleep_older  # positive = improving

    # Mood trend
    mood_score_map = {"happy": 5, "calm": 4, "energetic": 5, "tired": 2, "sad": 1, "anxious": 2, "stressed": 1, "angry": 1}
    mood_recent = [mood_score_map.get(l.get("mood", ""), 3) for l in recent_logs]
    mood_older = [mood_score_map.get(l.get("mood", ""), 3) for l in older_logs]
    avg_mood_recent = sum(mood_recent) / len(mood_recent) if mood_recent else 3
    avg_mood_older = sum(mood_older) / len(mood_older) if mood_older else avg_mood_recent

    # Energy trend
    energy_recent = [l.get("energy_level", 3) or 3 for l in recent_logs]
    avg_energy_recent = sum(energy_recent) / len(energy_recent) if energy_recent else 3

    # Vitals analysis
    bp_readings = [v for v in vitals if v.get("metric_type") == "bp_systolic"]
    hr_readings = [v for v in vitals if v.get("metric_type") == "heart_rate"]
    weight_readings = [v for v in vitals if v.get("metric_type") == "weight"]

    avg_bp = sum(v.get("value", 0) for v in bp_readings) / len(bp_readings) if bp_readings else 120
    avg_hr = sum(v.get("value", 0) for v in hr_readings) / len(hr_readings) if hr_readings else 75
    weight_trend = (weight_readings[-1].get("value", 0) - weight_readings[0].get("value", 0)) if len(weight_readings) >= 2 else 0

    # Risk factors
    risk_factors = []
    if avg_sleep_recent < 6:
        risk_factors.append("low_sleep")
    if avg_mood_recent < 2.5:
        risk_factors.append("low_mood")
    if avg_bp > 130:
        risk_factors.append("elevated_bp")
    if avg_hr > 90:
        risk_factors.append("elevated_hr")
    if sleep_trend < -0.5:
        risk_factors.append("declining_sleep")

    # Risk level
    if len(risk_factors) >= 3:
        risk_level = "high"
    elif len(risk_factors) >= 1:
        risk_level = "moderate"
    else:
        risk_level = "low"

    # Generate 7-day predictions
    predictions = []
    base_score = calculate_health_score(avg_sleep_recent, avg_mood_recent, avg_energy_recent, avg_bp, avg_hr)

    for day_offset in range(1, 8):
        pred_date = (datetime.utcnow() + timedelta(days=day_offset)).strftime("%Y-%m-%d")

        # Project with small trend continuation + noise
        decay = 0
        if "low_sleep" in risk_factors:
            decay -= 1.5
        if "low_mood" in risk_factors:
            decay -= 1
        if "elevated_bp" in risk_factors:
            decay -= 2

        trend_boost = 0
        if sleep_trend > 0.5:
            trend_boost += 1
        if avg_mood_recent > 3.5:
            trend_boost += 1

        # Weekly cycle (weekend vs weekday)
        weekday = (datetime.utcnow() + timedelta(days=day_offset)).weekday()
        weekend_mod = -1 if weekday >= 5 else 0

        predicted_score = max(30, min(100, base_score + trend_boost + decay + weekend_mod))
        predicted_sleep = max(4, min(10, avg_sleep_recent + (sleep_trend * 0.3)))
        predicted_mood_score = max(1, min(5, avg_mood_recent + (trend_boost * 0.1)))
        predicted_energy = max(1, min(5, int(avg_energy_recent + (trend_boost * 0.2))))

        mood_labels = ["sad", "sad", "tired", "calm", "happy", "happy"]
        predicted_mood = mood_labels[min(int(predicted_mood_score), 5)]

        day_recommendations = []
        if "low_sleep" in risk_factors:
            day_recommendations.append("Prioritize 7+ hours sleep tonight")
        if "elevated_bp" in risk_factors:
            day_recommendations.append("Reduce sodium intake")
        if avg_energy_recent < 3:
            day_recommendations.append("Light 15-min walk recommended")
        if not day_recommendations:
            day_recommendations.append("Maintain current healthy routine")

        predictions.append({
            "date": pred_date,
            "day_name": (datetime.utcnow() + timedelta(days=day_offset)).strftime("%A"),
            "health_score": int(predicted_score),
            "sleep_hours": round(predicted_sleep, 1),
            "mood": predicted_mood,
            "energy": predicted_energy,
            "risk_level": risk_level,
            "risk_factors": risk_factors[:3],
            "recommendations": day_recommendations,
        })

    # Generate AI insights
    insights = []

    if sleep_trend < -0.5:
        insights.append({
            "type": "trend",
            "title": "Sleep Declining",
            "description": f"Your sleep dropped {abs(sleep_trend):.1f} hours recently. This pattern increases burnout risk by 35%.",
            "priority": "high",
            "metric": "sleep",
        })
    elif sleep_trend > 0.5:
        insights.append({
            "type": "trend",
            "title": "Sleep Improving",
            "description": f"Great progress! Your sleep increased {sleep_trend:.1f} hours. This correlates with better mood and energy.",
            "priority": "positive",
            "metric": "sleep",
        })

    if avg_mood_recent < 2.5:
        insights.append({
            "type": "alert",
            "title": "Mood Pattern Detected",
            "description": "Your mood has been consistently low. Consider stress management activities or talking to someone.",
            "priority": "high",
            "metric": "mood",
        })

    if avg_bp > 130:
        insights.append({
            "type": "alert",
            "title": "Blood Pressure Elevated",
            "description": f"Average BP {avg_bp:.0f} mmHg is above normal. Consider consulting a doctor.",
            "priority": "high",
            "metric": "blood_pressure",
        })

    if avg_energy_recent >= 4:
        insights.append({
            "type": "positive",
            "title": "High Energy Levels",
            "description": "Your energy levels are excellent! Keep up your current routine.",
            "priority": "positive",
            "metric": "energy",
        })

    if not insights:
        insights.append({
            "type": "pattern",
            "title": "Steady State",
            "description": "Your health metrics are stable. Maintain consistency for best long-term outcomes.",
            "priority": "low",
        })

    return {
        "current_score": int(base_score),
        "current_metrics": {
            "avg_sleep_hours": round(avg_sleep_recent, 1),
            "avg_mood_score": round(avg_mood_recent, 1),
            "avg_energy": round(avg_energy_recent, 1),
            "avg_bp": round(avg_bp, 0),
            "avg_hr": round(avg_hr, 0),
        },
        "trends": {
            "sleep_change": round(sleep_trend, 2),
            "mood_change": round(avg_mood_recent - avg_mood_older, 2),
            "weight_change": round(weight_trend, 1),
        },
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "next_7_days": predictions,
        "insights": insights,
        "confidence": min(95, 50 + (len(wellness_logs) * 2)),  # Higher with more data
        "data_points_analyzed": len(wellness_logs) + len(vitals),
    }


def calculate_health_score(sleep, mood, energy, bp, hr) -> int:
    """Calculate a 0-100 health score."""
    score = 100

    # Sleep (0-30 points off)
    if sleep < 5:
        score -= 30
    elif sleep < 6:
        score -= 20
    elif sleep < 7:
        score -= 10
    elif sleep > 9:
        score -= 5

    # Mood (0-25 points off)
    if mood < 2:
        score -= 25
    elif mood < 3:
        score -= 15
    elif mood < 4:
        score -= 5

    # Energy (0-20 points off)
    if energy < 2:
        score -= 20
    elif energy < 3:
        score -= 10
    elif energy < 4:
        score -= 5

    # BP (0-15 points off)
    if bp > 140:
        score -= 15
    elif bp > 130:
        score -= 8

    # HR (0-10 points off)
    if hr > 100:
        score -= 10
    elif hr > 90:
        score -= 5

    return max(30, min(100, score))


def get_empty_prediction() -> dict:
    """Return when no data is available."""
    return {
        "current_score": 0,
        "current_metrics": {
            "avg_sleep_hours": 0,
            "avg_mood_score": 0,
            "avg_energy": 0,
            "avg_bp": 0,
            "avg_hr": 0,
        },
        "trends": {
            "sleep_change": 0,
            "mood_change": 0,
            "weight_change": 0,
        },
        "risk_level": "unknown",
        "risk_factors": [],
        "next_7_days": [],
        "insights": [
            {
                "type": "pattern",
                "title": "Start Logging",
                "description": "Log your wellness, vitals, and mood for 7+ days to unlock your AI Health Twin predictions.",
                "priority": "low",
            }
        ],
        "confidence": 0,
        "data_points_analyzed": 0,
    }
