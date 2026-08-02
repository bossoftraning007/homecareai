import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def load_system_prompt():
    """Load the system prompt from file."""
    with open("prompts/system_prompt.txt", "r", encoding="utf-8") as f:
        return f.read()


def load_symptom_data():
    """Load symptom knowledge base."""
    with open("data/symptoms.json", "r", encoding="utf-8") as f:
        return json.load(f)


def get_ai_response(messages: list) -> str:
    """Get AI response with natural home care guidance."""
    system_prompt = load_system_prompt()
    symptom_data = load_symptom_data()

    # Combine system prompt with knowledge base
    system_with_data = f"""{system_prompt}

NATURAL REMEDIES KNOWLEDGE BASE:
{json.dumps(symptom_data, indent=2)}

Use this knowledge base to provide accurate, natural, safe home care guidance.
Prefer home remedies from this knowledge base when relevant to the user's symptoms.
"""

    full_messages = [
        {"role": "system", "content": system_with_data}
    ] + messages

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=full_messages,
        max_tokens=800,
        temperature=0.5
    )

    return response.choices[0].message.content