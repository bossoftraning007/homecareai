"""Family Health War Room API
Manage family members and aggregate their health data.
V2 - force redeploy
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


@router.get("/family")
async def get_family_members(request: Request):
    """Get all family members for the current user."""
    try:
        current_user = get_user_id(request)
        supabase = get_supabase()

        result = supabase.table("family_members").select("*").eq(
            "owner_id", current_user["id"]
        ).eq("is_active", True).order("created_at").execute()

        members = result.data or []

        # For each member, get latest health summary
        for member in members:
            if member.get("member_user_id"):
                # Has account - get their data
                member_id = member["member_user_id"]
                summary = await get_member_health_summary(supabase, member_id)
            else:
                # No account - just basic info
                summary = {
                    "last_logged": None,
                    "health_score": None,
                    "alerts": [],
                }
            member["health_summary"] = summary

        return {"members": members}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/family")
async def add_family_member(request: Request):
    """Add a new family member."""
    try:
        current_user = get_user_id(request)
        supabase = get_supabase()
        body = await request.json()

        name = body.get("full_name", "").strip()
        if not name:
            raise HTTPException(status_code=400, detail="Name is required")

        # If email provided, check if user exists
        member_user_id = None
        invite_status = "pending"
        member_email = body.get("member_email", "").strip() or None

        if member_email:
            # Check if email is registered
            # (Note: Supabase admin API would be needed for this, skipping for now)
            invite_status = "pending"

        member_data = {
            "owner_id": current_user["id"],
            "full_name": name,
            "relationship": body.get("relationship", "other"),
            "date_of_birth": body.get("date_of_birth"),
            "gender": body.get("gender"),
            "member_email": member_email,
            "avatar_color": body.get("avatar_color", "blue"),
            "invite_status": invite_status,
        }

        result = supabase.table("family_members").insert(member_data).select().single().execute()
        return {"member": result.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/family/{member_id}")
async def delete_family_member(request: Request, member_id: str):
    """Remove a family member."""
    try:
        current_user = get_user_id(request)
        supabase = get_supabase()

        # Verify ownership
        existing = supabase.table("family_members").select("owner_id").eq("id", member_id).single().execute()
        if not existing.data or existing.data["owner_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized")

        supabase.table("family_members").update({"is_active": False}).eq("id", member_id).execute()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/family/war-room")
async def get_war_room(request: Request):
    """Get aggregated family health overview."""
    try:
        current_user = get_user_id(request)
        supabase = get_supabase()

        # Get all family members (including self)
        result = supabase.table("family_members").select("*").eq(
            "owner_id", current_user["id"]
        ).eq("is_active", True).execute()
        members = result.data or []

        # Aggregate alerts
        all_alerts = []
        healthy_count = 0
        warning_count = 0
        critical_count = 0

        for member in members:
            if member.get("member_user_id"):
                summary = await get_member_health_summary(supabase, member["member_user_id"])
                for alert in summary.get("alerts", []):
                    all_alerts.append({
                        "member_name": member["full_name"],
                        "member_id": member["id"],
                        "relationship": member["relationship"],
                        "avatar_color": member.get("avatar_color", "blue"),
                        **alert,
                    })
                    if alert.get("severity") == "critical":
                        critical_count += 1
                    elif alert.get("severity") == "warning":
                        warning_count += 1
                if not summary.get("alerts"):
                    healthy_count += 1
            else:
                healthy_count += 1

        # Sort alerts by severity
        all_alerts.sort(key=lambda a: {"critical": 0, "warning": 1, "info": 2}.get(a.get("severity", "info"), 3))

        return {
            "total_members": len(members),
            "healthy": healthy_count,
            "warnings": warning_count,
            "critical": critical_count,
            "alerts": all_alerts[:10],  # Top 10
            "members": members,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_member_health_summary(supabase, user_id: str) -> dict:
    """Get health summary for a single member."""
    try:
        seven_days_ago = (datetime.utcnow() - timedelta(days=7)).strftime("%Y-%m-%d")

        # Get latest wellness log
        wellness = supabase.table("wellness_logs").select("*").eq(
            "user_id", user_id
        ).order("log_date", ascending=False).limit(7).execute()

        # Get latest vitals
        vitals = supabase.table("vitals").select("*").eq(
            "user_id", user_id
        ).order("recorded_at", ascending=False).limit(10).execute()

        alerts = []
        last_logged = None
        health_score = 100

        # Check wellness
        if wellness.data:
            latest = wellness.data[0]
            last_logged = latest.get("log_date")

            # Check sleep
            sleep = latest.get("sleep_hours") or 0
            if sleep < 5:
                alerts.append({
                    "type": "low_sleep",
                    "title": "Sleep Concern",
                    "description": f"Slept only {sleep}h",
                    "severity": "warning",
                    "metric": "sleep",
                })
                health_score -= 15

            # Check mood
            mood = latest.get("mood")
            if mood in ["stressed", "sad", "anxious"]:
                alerts.append({
                    "type": "mood_concern",
                    "title": "Mood Alert",
                    "description": f"Feeling {mood}",
                    "severity": "warning",
                    "metric": "mood",
                })
                health_score -= 10

        # Check vitals
        if vitals.data:
            for v in vitals.data:
                if v.get("metric_type") == "bp_systolic" and v.get("value", 0) > 140:
                    alerts.append({
                        "type": "high_bp",
                        "title": "High Blood Pressure",
                        "description": f"BP: {v['value']} mmHg",
                        "severity": "critical",
                        "metric": "blood_pressure",
                    })
                    health_score -= 20
                elif v.get("metric_type") == "heart_rate" and v.get("value", 0) > 100:
                    alerts.append({
                        "type": "high_hr",
                        "title": "Elevated Heart Rate",
                        "description": f"HR: {v['value']} bpm",
                        "severity": "warning",
                        "metric": "heart_rate",
                    })
                    health_score -= 10

        # Check if no data in 7 days
        if not last_logged:
            last_logged_dt = datetime.utcnow() - timedelta(days=10)
        else:
            last_logged_dt = datetime.strptime(last_logged, "%Y-%m-%d")

        days_since_log = (datetime.utcnow() - last_logged_dt).days
        if days_since_log > 3:
            alerts.append({
                "type": "no_data",
                "title": "No Recent Activity",
                "description": f"No logs in {days_since_log} days",
                "severity": "info",
            })

        return {
            "last_logged": last_logged,
            "health_score": max(0, min(100, health_score)),
            "alerts": alerts,
        }
    except Exception:
        return {
            "last_logged": None,
            "health_score": None,
            "alerts": [],
        }
