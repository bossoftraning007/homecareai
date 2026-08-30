"""Recovery API endpoints for the Live Health Twin feature."""
from datetime import datetime
from fastapi import APIRouter, Request, HTTPException
from config.database import get_supabase
from services.recovery_service import create_recovery_plan, calculate_progress
from services.timeline_service import log_event

router = APIRouter()


@router.get("/plans")
async def get_recovery_plans(request: Request):
    """Get all recovery plans for the current user."""
    try:
        supabase = get_supabase()
        user_id = request.headers.get("x-user-id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Authentication required")

        response = supabase.table("recovery_plans").select("*").eq("user_id", user_id).order("created_at", ascending=False).execute()

        return {"plans": response.data or []}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/plans")
async def create_new_plan(request: Request):
    """Create a new recovery plan."""
    try:
        supabase = get_supabase()
        user_id = request.headers.get("x-user-id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Authentication required")

        body = await request.json()
        symptom = body.get("symptom", "").strip()
        remedy = body.get("remedy", "").strip()
        severity = body.get("severity", 3)

        if not symptom or not remedy:
            raise HTTPException(status_code=400, detail="Symptom and remedy are required")

        # Generate recovery plan
        plan = create_recovery_plan(symptom, remedy, severity)

        # Save plan to database
        plan_data = {
            "user_id": user_id,
            "title": plan.title,
            "symptom": plan.symptom,
            "remedy": plan.remedy,
            "severity": plan.severity,
            "total_hours": plan.total_hours,
            "expected_completion": plan.expected_completion.isoformat() if plan.expected_completion else None,
        }

        try:
            response = supabase.table("recovery_plans").insert(plan_data).select().single().execute()
            plan_record = response.data
        except Exception as db_error:
            error_msg = str(db_error)
            if "relation" in error_msg and "does not exist" in error_msg:
                raise HTTPException(status_code=500, detail="Database tables not found. Please run the recovery_twin_schema.sql in Supabase.")
            raise HTTPException(status_code=500, detail=f"Database error: {error_msg}")

        # Save milestones
        milestones_data = []
        for m in plan.milestones:
            milestones_data.append({
                "plan_id": plan_record["id"],
                "title": m.title,
                "description": m.description,
                "expected_day": m.expected_day,
                "expected_hour": m.expected_hour,
                "improvement_percent": m.improvement_percent,
            })

        if milestones_data:
            try:
                supabase.table("recovery_milestones").insert(milestones_data).execute()
            except Exception as db_error:
                # Don't fail if milestones can't be saved
                print(f"Failed to save milestones: {db_error}")

        # Log timeline event
        try:
            await log_event(
                user_id=user_id,
                event_type="recovery",
                title=f"Recovery plan started: {plan.title}",
                description=f"Remedy: {plan.remedy} | Severity: {plan.severity}/5",
                icon="🧬",
                metadata={"plan_id": plan_record["id"], "symptom": symptom, "remedy": remedy},
            )
        except Exception as e:
            print(f"Failed to log timeline event: {e}")

        return {
            "plan": plan_record,
            "milestones": milestones_data,
            "total_hours": plan.total_hours,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/plans/{plan_id}")
async def get_plan_details(plan_id: str, request: Request):
    """Get details of a specific recovery plan with milestones and logs."""
    try:
        supabase = get_supabase()
        user_id = request.headers.get("x-user-id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Authentication required")

        # Get plan
        response = supabase.table("recovery_plans").select("*").eq("id", plan_id).eq("user_id", user_id).single().execute()
        plan = response.data

        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")

        # Get milestones
        milestones_resp = supabase.table("recovery_milestones").select("*").eq("plan_id", plan_id).order("expected_day", ascending=True).execute()

        # Get logs
        logs_resp = supabase.table("recovery_logs").select("*").eq("plan_id", plan_id).order("log_date", ascending=True).execute()

        # Calculate progress
        progress = calculate_progress(logs_resp.data or [], plan.get("total_hours", 72))

        return {
            "plan": plan,
            "milestones": milestones_resp.data or [],
            "logs": logs_resp.data or [],
            "progress": progress,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/plans/{plan_id}/log")
async def add_recovery_log(plan_id: str, request: Request):
    """Add a daily log entry to a recovery plan."""
    try:
        supabase = get_supabase()
        user_id = request.headers.get("x-user-id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Authentication required")

        body = await request.json()
        log_data = {
            "plan_id": plan_id,
            "user_id": user_id,
            "symptom_severity": body.get("symptom_severity"),
            "energy_level": body.get("energy_level"),
            "notes": body.get("notes", ""),
            "remedy_taken": body.get("remedy_taken", True),
        }

        response = supabase.table("recovery_logs").insert(log_data).select().single().execute()

        # Check if any milestones should be marked as reached
        _check_milestones(supabase, plan_id)

        return {"log": response.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/plans/{plan_id}/progress")
async def get_plan_progress(plan_id: str, request: Request):
    """Get progress for a specific plan."""
    try:
        supabase = get_supabase()
        user_id = request.headers.get("x-user-id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Authentication required")

        # Get plan
        response = supabase.table("recovery_plans").select("*").eq("id", plan_id).eq("user_id", user_id).single().execute()
        plan = response.data

        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")

        # Get logs
        logs_resp = supabase.table("recovery_logs").select("*").eq("plan_id", plan_id).order("log_date", ascending=True).execute()

        progress = calculate_progress(logs_resp.data or [], plan.get("total_hours", 72))

        return {"progress": progress, "plan": plan}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/plans/{plan_id}/complete")
async def complete_plan(plan_id: str, request: Request):
    """Mark a recovery plan as completed."""
    try:
        supabase = get_supabase()
        user_id = request.headers.get("x-user-id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Authentication required")

        response = supabase.table("recovery_plans").update({
            "status": "completed",
            "completed_at": datetime.utcnow().isoformat(),
        }).eq("id", plan_id).eq("user_id", user_id).select().single().execute()

        # Mark all pending milestones as reached
        supabase.table("recovery_milestones").update({
            "status": "reached",
            "reached_at": datetime.utcnow().isoformat(),
        }).eq("plan_id", plan_id).eq("status", "pending").execute()

        # Log timeline event
        await log_event(
            user_id=user_id,
            event_type="recovery",
            title="Recovery plan completed! 🎉",
            description="You completed your recovery journey",
            icon="🏆",
            metadata={"plan_id": plan_id, "completed": True},
        )

        return {"plan": response.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict")
async def predict_recovery(request: Request):
    """Get a recovery prediction without saving (preview mode)."""
    try:
        body = await request.json()
        symptom = body.get("symptom", "").strip()
        remedy = body.get("remedy", "").strip()
        severity = body.get("severity", 3)

        if not symptom or not remedy:
            raise HTTPException(status_code=400, detail="Symptom and remedy are required")

        plan = create_recovery_plan(symptom, remedy, severity)

        return {
            "title": plan.title,
            "total_hours": plan.total_hours,
            "total_days": round(plan.total_hours / 24, 1),
            "expected_completion": plan.expected_completion.isoformat() if plan.expected_completion else None,
            "milestones": [
                {
                    "title": m.title,
                    "description": m.description,
                    "expected_day": m.expected_day,
                    "expected_hour": m.expected_hour,
                    "improvement_percent": m.improvement_percent,
                }
                for m in plan.milestones
            ],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _check_milestones(supabase, plan_id: str):
    """Check and update milestone status based on current progress."""
    try:
        # Get plan start date
        response = supabase.table("recovery_plans").select("started_at").eq("id", plan_id).single().execute()
        plan = response.data

        if not plan or not plan.get("started_at"):
            return

        started_at = datetime.fromisoformat(plan["started_at"].replace("Z", "+00:00"))
        hours_elapsed = (datetime.utcnow() - started_at.replace(tzinfo=None)).total_seconds() / 3600

        # Get pending milestones
        milestones_resp = supabase.table("recovery_milestones").select("*").eq("plan_id", plan_id).eq("status", "pending").execute()
        milestones = milestones_resp.data

        if not milestones:
            return

        for m in milestones:
            milestone_hours = (m.get("expected_day", 0) * 24) + m.get("expected_hour", 0)
            if hours_elapsed >= milestone_hours:
                supabase.table("recovery_milestones").update({
                    "status": "reached",
                    "reached_at": datetime.utcnow().isoformat(),
                }).eq("id", m["id"]).execute()
    except Exception:
        pass
