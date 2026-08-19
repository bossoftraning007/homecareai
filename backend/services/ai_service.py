import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-70b-versatile",
    "gemma2-9b-it",
    "mixtral-8x7b-32768",
    "llama-3.1-8b-instant",
]


def load_system_prompt():
    """Load the system prompt from file."""
    with open("prompts/system_prompt.txt", "r", encoding="utf-8") as f:
        return f.read()


def load_symptom_data():
    """Load symptom knowledge base."""
    with open("data/symptoms.json", "r", encoding="utf-8") as f:
        return json.load(f)


def get_ai_response(messages: list) -> dict:
    """Get AI response with follow-up suggestions and related symptoms."""
    system_prompt = load_system_prompt()
    symptom_data = load_symptom_data()

    enhanced_prompt = f"""{system_prompt}

NATURAL REMEDIES KNOWLEDGE BASE:
{json.dumps(symptom_data, indent=2)}

Use this knowledge base to provide accurate, natural, safe home care guidance.

IMPORTANT - After your main response, ALWAYS include these sections at the END:

===FOLLOWUPS===
3 short follow-up questions the user might ask next (each max 8 words).
Format: one question per line, no numbers, no bullets.

===RELATED===
2-3 related symptoms/conditions user should know about (each max 5 words).
Format: one per line, no numbers, no bullets.

Example format:
[Your main response here...]

===FOLLOWUPS===
How long should I take this?
What if symptoms get worse?
Can children take this remedy?

===RELATED===
Sore throat
Sinus infection
Body aches
"""

    full_messages = [
        {"role": "system", "content": enhanced_prompt}
    ] + messages

    last_error = None

    for model in MODELS:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=full_messages,
                max_tokens=1000,
                temperature=0.5
            )
            content = response.choices[0].message.content
            return parse_ai_response(content)
        except Exception as e:
            error_str = str(e)
            if "rate_limit" in error_str.lower() or "429" in error_str:
                last_error = e
                continue
            if "model" in error_str.lower() or "404" in error_str:
                last_error = e
                continue
            raise e

    raise Exception(f"All models unavailable. Last error: {last_error}")


def parse_ai_response(content: str) -> dict:
    """Parse AI response to extract main message, followups, and related symptoms."""
    followups = []
    related = []
    main_content = content

    # Extract followups
    if "===FOLLOWUPS===" in content:
        parts = content.split("===FOLLOWUPS===")
        main_content = parts[0].strip()
        rest = parts[1] if len(parts) > 1 else ""

        if "===RELATED===" in rest:
            fp_part, rel_part = rest.split("===RELATED===")
            followups = [
                line.strip() 
                for line in fp_part.strip().split("\n") 
                if line.strip() and not line.startswith("===")
            ][:3]
            related = [
                line.strip() 
                for line in rel_part.strip().split("\n") 
                if line.strip() and not line.startswith("===")
            ][:3]
        else:
            followups = [
                line.strip() 
                for line in rest.strip().split("\n") 
                if line.strip() and not line.startswith("===")
            ][:3]

    return {
        "reply": main_content,
        "followups": followups,
        "related": related,
    }