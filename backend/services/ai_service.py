import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Try models in order (fallback if rate limited)
MODELS = [
    "llama-3.1-8b-instant",         # Fast, high limit
    "llama-3.3-70b-versatile",      # High quality
    "llama-3.1-70b-versatile",      # Backup
    "mixtral-8x7b-32768",           # Alternative
]


def load_system_prompt():
    """Load the system prompt from file."""
    with open("prompts/system_prompt.txt", "r", encoding="utf-8") as f:
        return f.read()


def load_symptom_data():
    """Load symptom knowledge base."""
    with open("data/symptoms.json", "r", encoding="utf-8") as f:
        return json.load(f)


def get_ai_response(messages: list) -> str:
    """Get AI response with fallback across models."""
    system_prompt = load_system_prompt()
    symptom_data = load_symptom_data()

    system_with_data = f"""{system_prompt}

NATURAL REMEDIES KNOWLEDGE BASE:
{json.dumps(symptom_data, indent=2)}

Use this knowledge base to provide accurate, natural, safe home care guidance.
Prefer home remedies from this knowledge base when relevant to the user's symptoms.
"""

    full_messages = [
        {"role": "system", "content": system_with_data}
    ] + messages

    last_error = None

    # Try each model until one works
    for model in MODELS:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=full_messages,
                max_tokens=800,
                temperature=0.5
            )
            return response.choices[0].message.content
        except Exception as e:
            error_str = str(e)
            # If rate limited, try next model
            if "rate_limit" in error_str.lower() or "429" in error_str:
                last_error = e
                continue
            # Other errors, raise immediately
            raise e

    # All models rate limited
    raise Exception(f"All models rate limited. Please try again later. Details: {last_error}")