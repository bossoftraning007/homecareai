"""Recovery prediction service for the Live Health Twin feature."""
from datetime import datetime, timedelta
from typing import Optional
from dataclasses import dataclass, field


# Recovery timelines based on symptom-remedy combinations (in hours)
RECOVERY_BASELINES: dict[str, dict[str, float]] = {
    "cold": {
        "honey_lemon": 72,
        "ginger_tea": 96,
        "steam_inhalation": 48,
        "turmeric_milk": 120,
        "default": 96,
    },
    "cough": {
        "honey_lemon": 96,
        "ginger_tea": 120,
        "steam_inhalation": 72,
        "turmeric_milk": 144,
        "default": 120,
    },
    "headache": {
        "peppermint_tea": 24,
        "hydration": 12,
        "rest": 24,
        "ginger_tea": 48,
        "default": 36,
    },
    "fever": {
        "turmeric_milk": 72,
        "hydration": 48,
        "rest": 72,
        "ginger_tea": 96,
        "default": 72,
    },
    "sore_throat": {
        "honey_lemon": 48,
        "salt_water_gargle": 24,
        "turmeric_milk": 72,
        "default": 60,
    },
    "nausea": {
        "ginger_tea": 24,
        "peppermint_tea": 12,
        "hydration": 24,
        "default": 36,
    },
    "indigestion": {
        "ginger_tea": 24,
        "fennel_tea": 12,
        "hydration": 24,
        "default": 36,
    },
    "fatigue": {
        "rest": 48,
        "hydration": 24,
        "green_tea": 36,
        "default": 48,
    },
    "body_pain": {
        "turmeric_milk": 72,
        "ginger_tea": 96,
        "rest": 48,
        "default": 72,
    },
    "stress": {
        "meditation": 24,
        "chamomile_tea": 12,
        "deep_breathing": 12,
        "default": 36,
    },
}

# Severity multipliers (higher severity = longer recovery)
SEVERITY_MULTIPLIERS = {
    1: 0.6,
    2: 0.8,
    3: 1.0,
    4: 1.3,
    5: 1.6,
}


@dataclass
class Milestone:
    title: str
    description: str
    expected_day: int
    expected_hour: int = 0
    improvement_percent: int = 0
    status: str = "pending"


@dataclass
class RecoveryPlan:
    title: str
    symptom: str
    remedy: str
    severity: int
    total_hours: float
    milestones: list[Milestone] = field(default_factory=list)
    expected_completion: Optional[datetime] = None


def _normalize_key(text: str) -> str:
    """Normalize symptom/remedy text for matching."""
    return text.lower().strip().replace(" ", "_").replace("-", "_")


def get_recovery_hours(symptom: str, remedy: str, severity: int) -> float:
    """Calculate expected recovery hours based on symptom, remedy, and severity."""
    symptom_key = _normalize_key(symptom)
    remedy_key = _normalize_key(remedy)

    symptom_data = RECOVERY_BASELINES.get(symptom_key, {})
    base_hours = symptom_data.get(remedy_key, symptom_data.get("default", 72))

    multiplier = SEVERITY_MULTIPLIERS.get(severity, 1.0)
    return base_hours * multiplier


def generate_milestones(symptom: str, remedy: str, total_hours: float) -> list[Milestone]:
    """Generate recovery milestones based on total recovery time."""
    milestones = []

    if total_hours <= 24:
        # Short recovery: 3 milestones
        milestones = [
            Milestone(
                title="Initial Relief",
                description=f"First signs of {symptom} easing as {remedy.replace('_', ' ')} takes effect",
                expected_day=0,
                expected_hour=int(total_hours * 0.25),
                improvement_percent=20,
            ),
            Milestone(
                title="Significant Improvement",
                description=f"{symptom.replace('_', ' ')} noticeably reduced, energy returning",
                expected_day=0,
                expected_hour=int(total_hours * 0.6),
                improvement_percent=60,
            ),
            Milestone(
                title="Near Recovery",
                description=f"Almost fully recovered from {symptom.replace('_', ' ')}",
                expected_day=0,
                expected_hour=int(total_hours * 0.9),
                improvement_percent=90,
            ),
        ]
    elif total_hours <= 72:
        # Medium recovery: 4 milestones
        milestones = [
            Milestone(
                title="Symptom Stabilization",
                description=f"{symptom.replace('_', ' ')} stops getting worse, body responding to remedy",
                expected_day=0,
                expected_hour=int(total_hours * 0.15),
                improvement_percent=10,
            ),
            Milestone(
                title="First Relief Window",
                description=f"Noticeable reduction in {symptom.replace('_', ' ')} intensity",
                expected_day=0,
                expected_hour=int(total_hours * 0.35),
                improvement_percent=35,
            ),
            Milestone(
                title="Halfway Recovery",
                description=f"{symptom.replace('_', ' ')} significantly improved, continue remedy routine",
                expected_day=1,
                expected_hour=int((total_hours - 24) * 0.3) if total_hours > 24 else 0,
                improvement_percent=55,
            ),
            Milestone(
                title="Recovery Milestone",
                description=f"Almost fully healed, {symptom.replace('_', ' ')} nearly gone",
                expected_day=int(total_hours / 24),
                expected_hour=int(total_hours % 24),
                improvement_percent=85,
            ),
        ]
    else:
        # Long recovery: 5 milestones
        total_days = int(total_hours / 24)
        milestones = [
            Milestone(
                title="Stabilization Phase",
                description=f"Body begins responding to {remedy.replace('_', ' ')}, symptoms contained",
                expected_day=0,
                expected_hour=int(total_hours * 0.1),
                improvement_percent=10,
            ),
            Milestone(
                title="Early Improvement",
                description=f"First noticeable reduction in {symptom.replace('_', ' ')}",
                expected_day=max(1, int(total_days * 0.2)),
                expected_hour=12,
                improvement_percent=25,
            ),
            Milestone(
                title="Mid-Recovery Checkpoint",
                description=f"Steady progress, {symptom.replace('_', ' ')} reduced by half",
                expected_day=int(total_days * 0.4),
                expected_hour=12,
                improvement_percent=50,
            ),
            Milestone(
                title="Accelerated Healing",
                description=f"Body in recovery mode, {symptom.replace('_', ' ')} fading",
                expected_day=int(total_days * 0.7),
                expected_hour=12,
                improvement_percent=75,
            ),
            Milestone(
                title="Full Recovery Target",
                description=f"Expected complete recovery from {symptom.replace('_', ' ')}",
                expected_day=total_days,
                expected_hour=int(total_hours % 24),
                improvement_percent=95,
            ),
        ]

    return milestones


def create_recovery_plan(symptom: str, remedy: str, severity: int = 3) -> RecoveryPlan:
    """Create a complete recovery plan with milestones."""
    total_hours = get_recovery_hours(symptom, remedy, severity)
    milestones = generate_milestones(symptom, remedy, total_hours)

    plan = RecoveryPlan(
        title=f"{remedy.replace('_', ' ').title()} for {symptom.replace('_', ' ').title()}",
        symptom=symptom,
        remedy=remedy,
        severity=severity,
        total_hours=total_hours,
        milestones=milestones,
        expected_completion=datetime.utcnow() + timedelta(hours=total_hours),
    )

    return plan


def calculate_progress(plan_logs: list[dict], total_hours: float) -> dict:
    """Calculate recovery progress based on user logs."""
    if not plan_logs:
        return {
            "percent_complete": 0,
            "current_phase": "Just Started",
            "logs_count": 0,
            "avg_severity": 0,
            "avg_energy": 0,
            "trend": "neutral",
        }

    sorted_logs = sorted(plan_logs, key=lambda x: x.get("log_date", ""))
    latest = sorted_logs[-1]

    # Calculate time progress
    first_log_date = sorted_logs[0].get("log_date")
    if first_log_date:
        if isinstance(first_log_date, str):
            first_date = datetime.strptime(first_log_date, "%Y-%m-%d")
        else:
            first_date = first_log_date
        hours_elapsed = (datetime.utcnow() - first_date).total_seconds() / 3600
        time_progress = min(100, (hours_elapsed / total_hours) * 100)
    else:
        time_progress = 0

    # Calculate symptom improvement
    if len(sorted_logs) >= 2:
        first_severity = sorted_logs[0].get("symptom_severity", 3)
        latest_severity = latest.get("symptom_severity", 3)
        severity_improvement = max(0, ((first_severity - latest_severity) / first_severity) * 100)
    else:
        severity_improvement = 0

    # Average metrics
    severities = [l.get("symptom_severity", 3) for l in sorted_logs if l.get("symptom_severity")]
    energies = [l.get("energy_level", 3) for l in sorted_logs if l.get("energy_level")]

    avg_severity = sum(severities) / len(severities) if severities else 3
    avg_energy = sum(energies) / len(energies) if energies else 3

    # Determine trend
    if len(sorted_logs) >= 3:
        recent = sorted_logs[-3:]
        recent_severities = [l.get("symptom_severity", 3) for l in recent]
        if recent_severities[-1] < recent_severities[0]:
            trend = "improving"
        elif recent_severities[-1] > recent_severities[0]:
            trend = "worsening"
        else:
            trend = "stable"
    else:
        trend = "neutral"

    # Current phase based on time progress
    if time_progress < 20:
        current_phase = "Stabilization"
    elif time_progress < 40:
        current_phase = "Early Recovery"
    elif time_progress < 60:
        current_phase = "Active Healing"
    elif time_progress < 80:
        current_phase = "Regeneration"
    else:
        current_phase = "Final Recovery"

    return {
        "percent_complete": round(time_progress),
        "severity_improvement": round(severity_improvement),
        "current_phase": current_phase,
        "logs_count": len(sorted_logs),
        "avg_severity": round(avg_severity, 1),
        "avg_energy": round(avg_energy, 1),
        "trend": trend,
    }
