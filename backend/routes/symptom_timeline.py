"""Symptom Time Machine - Root Cause Analysis API
Interactive Q&A system that builds a timeline to find root cause.
"""
from datetime import datetime
from fastapi import APIRouter, Request, HTTPException
from config.database import get_supabase
import re

router = APIRouter()

# Red flag symptoms (EMERGENCY)
RED_FLAGS = [
    "chest pain", "chest pressure", "crushing chest",
    "can't breathe", "cannot breathe", "difficulty breathing", "shortness of breath",
    "stroke", "face drooping", "slurred speech", "one side weak",
    "severe bleeding", "bleeding heavily", "blood loss",
    "unconscious", "passed out", "fainted",
    "severe head injury", "seizure", "convulsion",
    "suicide", "kill myself", "end my life",
    "anaphylaxis", "throat closing", "can't swallow",
    "severe burn", "third degree",
]

# Symptom-to-question mapping (smart follow-ups)
SYMPTOM_QUESTIONS = {
    "headache": [
        {"q": "When did the headache start?", "type": "text"},
        {"q": "Where exactly is the pain? (front, back, sides, all over)", "type": "text"},
        {"q": "How would you rate the pain? (1-10, where 10 is worst)", "type": "scale"},
        {"q": "Did you sleep well last night? (hours slept)", "type": "text"},
        {"q": "Have you been drinking enough water today?", "type": "yes_no"},
        {"q": "Are you feeling stressed or anxious lately?", "type": "yes_no"},
        {"q": "Have you eaten in the last 4 hours?", "type": "yes_no"},
        {"q": "Do you have any other symptoms? (nausea, vision changes, fever)", "type": "text"},
    ],
    "fever": [
        {"q": "What is your temperature? (in °F if possible)", "type": "text"},
        {"q": "When did the fever start?", "type": "text"},
        {"q": "Are you experiencing chills or sweating?", "type": "text"},
        {"q": "Do you have cough, sore throat, or body aches?", "type": "yes_no"},
        {"q": "Have you been around anyone sick recently?", "type": "yes_no"},
        {"q": "Have you traveled anywhere in the last 2 weeks?", "type": "yes_no"},
    ],
    "cough": [
        {"q": "Is your cough dry or with phlegm/mucus?", "type": "text"},
        {"q": "How long have you had this cough? (days)", "type": "text"},
        {"q": "Do you have chest pain or difficulty breathing?", "type": "yes_no"},
        {"q": "Do you have a fever?", "type": "yes_no"},
        {"q": "Are you exposed to dust, smoke, or pollution?", "type": "yes_no"},
        {"q": "Is it worse at night or in the morning?", "type": "text"},
    ],
    "stomach": [
        {"q": "Where exactly is the pain? (upper, lower, left, right)", "type": "text"},
        {"q": "When did it start?", "type": "text"},
        {"q": "Have you eaten anything unusual in the last 24 hours?", "type": "yes_no"},
        {"q": "Do you have nausea, vomiting, or diarrhea?", "type": "yes_no"},
        {"q": "How would you rate the pain? (1-10)", "type": "scale"},
        {"q": "When was your last meal?", "type": "text"},
    ],
    "fatigue": [
        {"q": "How long have you been feeling tired?", "type": "text"},
        {"q": "How many hours do you sleep per night on average?", "type": "text"},
        {"q": "Do you wake up feeling rested?", "type": "yes_no"},
        {"q": "Are you stressed or anxious?", "type": "yes_no"},
        {"q": "Have you been eating well and drinking water?", "type": "yes_no"},
        {"q": "Do you exercise regularly?", "type": "yes_no"},
    ],
}


def detect_emergency(symptom: str) -> list:
    """Detect emergency red flags in user input."""
    symptom_lower = symptom.lower()
    flags = []
    for flag in RED_FLAGS:
        if flag in symptom_lower:
            flags.append(flag)
    return flags


def get_questions_for_symptom(symptom: str) -> list:
    """Get smart follow-up questions based on symptom type."""
    symptom_lower = symptom.lower()
    for keyword, questions in SYMPTOM_QUESTIONS.items():
        if keyword in symptom_lower:
            return questions
    # Default generic questions
    return [
        {"q": "When did this symptom start?", "type": "text"},
        {"q": "How would you rate the severity? (1-10)", "type": "scale"},
        {"q": "How often does it occur? (constant, intermittent, occasional)", "type": "text"},
        {"q": "What makes it worse?", "type": "text"},
        {"q": "What makes it better?", "type": "text"},
        {"q": "Do you have any other symptoms?", "type": "text"},
        {"q": "How is your sleep lately?", "type": "text"},
        {"q": "How is your stress level lately? (low, medium, high)", "type": "text"},
        {"q": "Are you eating and drinking well?", "type": "yes_no"},
    ]


def analyze_root_causes(initial_symptom: str, answers: list) -> dict:
    """Analyze the Q&A to find likely root causes."""
    # Build context from answers
    qa_text = f"Initial symptom: {initial_symptom}\n\n"
    for a in answers:
        qa_text += f"Q: {a.get('question', '')}\nA: {a.get('answer', '')}\n\n"

    qa_lower = qa_text.lower()

    # Pattern matching for root causes
    likely_causes = []
    confidence_scores = {}
    timeline = []
    recommendations = []
    red_flags_found = []

    # Check for red flags
    red_flags_found = detect_emergency(qa_text)

    # Sleep-related
    sleep_hours = None
    for answer in answers:
        ans = answer.get("answer", "").lower()
        if "hour" in ans or "hr" in ans:
            numbers = re.findall(r'\d+', ans)
            if numbers and any(kw in answer.get("question", "").lower() for kw in ["sleep", "slept"]):
                sleep_hours = float(numbers[0])

    if sleep_hours and sleep_hours < 6:
        likely_causes.append("Insufficient sleep")
        confidence_scores["Insufficient sleep"] = 85
        timeline.append({"event": "Slept less than 6 hours", "impact": "high"})
        recommendations.append("Prioritize 7-9 hours of sleep tonight")
    elif sleep_hours and sleep_hours >= 7:
        recommendations.append("Your sleep duration is good - other factors may be involved")

    # Stress
    if "yes" in qa_lower and "stress" in qa_lower:
        likely_causes.append("Stress or anxiety")
        confidence_scores["Stress or anxiety"] = 70
        timeline.append({"event": "Reported feeling stressed", "impact": "medium"})
        recommendations.append("Try 5-10 minutes of deep breathing or meditation")
        recommendations.append("Consider light exercise to reduce stress")

    # Hydration
    if "no" in qa_lower and ("water" in qa_lower or "drink" in qa_lower):
        likely_causes.append("Dehydration")
        confidence_scores["Dehydration"] = 65
        timeline.append({"event": "Insufficient water intake", "impact": "medium"})
        recommendations.append("Drink at least 8 glasses of water today")
        recommendations.append("Avoid caffeine and sugary drinks")

    # Food-related
    if "no" in qa_lower and ("eaten" in qa_lower or "eating" in qa_lower):
        likely_causes.append("Skipped meal or low blood sugar")
        confidence_scores["Skipped meal or low blood sugar"] = 60
        timeline.append({"event": "Missed recent meal", "impact": "medium"})
        recommendations.append("Eat a balanced meal with protein and complex carbs")
        recommendations.append("Don't skip meals - have small frequent meals")

    # Severity-based
    severity_score = 5
    for answer in answers:
        ans = answer.get("answer", "")
        nums = re.findall(r'\d+', ans)
        if nums and "rate" in answer.get("question", "").lower():
            severity_score = int(nums[0])

    if severity_score >= 8:
        recommendations.append("Severity is high - consider consulting a doctor soon")
    elif severity_score <= 3:
        recommendations.append("Severity is mild - try home remedies and rest")

    # Specific symptom patterns
    if "headache" in initial_symptom.lower():
        if sleep_hours and sleep_hours < 6:
            likely_causes.insert(0, "Sleep deprivation causing headache")
            confidence_scores["Sleep deprivation causing headache"] = 90
        if "yes" in qa_lower and "water" in qa_lower:
            timeline.append({"event": "May be dehydrated", "impact": "medium"})
        if "yes" in qa_lower and "stress" in qa_lower:
            timeline.append({"event": "Stress contributing to headache", "impact": "high"})

    # Default if no patterns matched
    if not likely_causes:
        likely_causes = ["Unknown - need more data"]
        confidence_scores["Unknown - need more data"] = 30
        recommendations.append("Continue tracking symptoms")
        recommendations.append("Log daily wellness for better predictions")

    # Add general recommendations
    recommendations.append("Track this symptom daily to identify patterns")
    recommendations.append("Consult a doctor if symptoms persist for more than 3 days")

    # Determine severity
    severity = "mild"
    if red_flags_found:
        severity = "severe"
    elif severity_score >= 7 or len(likely_causes) >= 3:
        severity = "moderate"

    return {
        "likely_causes": likely_causes[:5],
        "confidence_scores": confidence_scores,
        "recommendations": recommendations,
        "timeline_events": timeline,
        "red_flags": red_flags_found,
        "severity": severity,
    }


@router.post("/symptom-timeline/start")
async def start_session(request: Request):
    """Start a new symptom analysis session."""
    try:
        current_user = get_user_id(request)
        supabase = get_supabase()
        body = await request.json()
        initial = body.get("symptom", "").strip()

        if not initial:
            raise HTTPException(status_code=400, detail="Please describe your symptom")

        # Check for emergency first
        red_flags = detect_emergency(initial)
        if red_flags:
            return {
                "emergency": True,
                "red_flags": red_flags,
                "message": "This sounds like a medical emergency. Please call your local emergency number (108 in India) immediately.",
            }

        # Create session
        result = supabase.table("symptom_sessions").insert({
            "user_id": current_user["id"],
            "initial_symptom": initial,
            "status": "in_progress",
        }).select().single().execute()

        session = result.data
        questions = get_questions_for_symptom(initial)

        return {
            "emergency": False,
            "session_id": session["id"],
            "initial_symptom": initial,
            "questions": questions,
            "current_question_index": 0,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/symptom-timeline/answer")
async def submit_answer(request: Request):
    """Submit an answer to a question."""
    try:
        current_user = get_user_id(request)
        supabase = get_supabase()
        body = await request.json()
        session_id = body.get("session_id")
        question = body.get("question")
        answer = body.get("answer")
        question_type = body.get("question_type", "text")
        question_index = body.get("question_index", 0)

        if not session_id or not question or answer is None:
            raise HTTPException(status_code=400, detail="Missing required fields")

        # Save the answer
        supabase.table("symptom_answers").insert({
            "session_id": session_id,
            "question": question,
            "answer": str(answer),
            "question_type": question_type,
        }).execute()

        # Get session to find initial symptom
        session_result = supabase.table("symptom_sessions").select("*").eq("id", session_id).single().execute()
        session = session_result.data

        # Get all questions for this symptom
        all_questions = get_questions_for_symptom(session["initial_symptom"])
        next_index = question_index + 1

        if next_index >= len(all_questions):
            # Session complete - analyze
            all_answers = supabase.table("symptom_answers").select("*").eq("session_id", session_id).order("asked_at").execute()
            analysis = analyze_root_causes(session["initial_symptom"], all_answers.data or [])

            # Save analysis
            supabase.table("symptom_analysis").insert({
                "session_id": session_id,
                "likely_causes": analysis["likely_causes"],
                "confidence_scores": analysis["confidence_scores"],
                "recommendations": analysis["recommendations"],
                "timeline_events": analysis["timeline_events"],
                "red_flags": analysis["red_flags"],
                "severity": analysis["severity"],
            }).execute()

            # Update session status
            supabase.table("symptom_sessions").update({
                "status": "completed",
                "completed_at": datetime.utcnow().isoformat(),
            }).eq("id", session_id).execute()

            return {
                "complete": True,
                "session_id": session_id,
                "analysis": analysis,
            }

        # Return next question
        return {
            "complete": False,
            "session_id": session_id,
            "question": all_questions[next_index],
            "current_question_index": next_index,
            "total_questions": len(all_questions),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/symptom-timeline/history")
async def get_history(request: Request):
    """Get all past sessions for user."""
    try:
        current_user = get_user_id(request)
        supabase = get_supabase()
        result = supabase.table("symptom_sessions").select("*, symptom_analysis(*)").eq(
            "user_id", current_user["id"]
        ).order("created_at", ascending=False).limit(20).execute()
        return {"sessions": result.data or []}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def get_user_id(request: Request):
    user_id = request.headers.get("x-user-id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    return {"id": user_id}
