RED_FLAGS = [
    "can't breathe", "cannot breathe", "breathing difficulty",
    "difficulty breathing", "shortness of breath",
    "chest pain", "heart pain",
    "seizure", "convulsion", "fits",
    "unconscious", "fainted", "not responding",
    "blood vomit", "vomiting blood",
    "blood in stool", "black stool", "bloody stool",
    "severe dehydration",
    "high fever infant", "baby high fever",
    "sudden severe headache", "worst headache of my life",
    "confusion", "not recognizing people",
    "stroke", "face drooping", "arm weakness",
    "severe allergic", "anaphylaxis", "throat swelling",
    "swallowing and breathing difficulty",
    "severe bleeding", "cannot stop bleeding",
]

URGENT_MESSAGE = """🚨 **URGENT — Please seek immediate medical care.**

Based on what you described, this may need emergency attention.

**Please do the following right now:**
- Go to the nearest hospital or emergency room
- Call emergency services (India: 108)
- Or ask someone to help you immediately

🌿 HomeCare AI is designed for minor symptoms only.
This situation needs professional medical care right away.

Please don't delay. Your safety matters most. ❤️"""


def check_red_flags(message: str) -> bool:
    """Check if user message contains any red flag symptoms."""
    message_lower = message.lower()
    for flag in RED_FLAGS:
        if flag in message_lower:
            return True
    return False


def get_urgent_message() -> str:
    """Return the urgent care message."""
    return URGENT_MESSAGE