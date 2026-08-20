import os
import json
from groq import Groq
from dotenv import load_dotenv
from services.language_detector import detect_language_simple

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODELS = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "groq/compound",
    "groq/compound-mini",
    "qwen/qwen3.6-27b",
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


def build_prompt(messages: list) -> tuple:
    """Build the enhanced prompt with knowledge base and detected language."""
    system_prompt = load_system_prompt()
    symptom_data = load_symptom_data()

    latest_user_msg = ""
    for msg in reversed(messages):
        if msg.get("role") == "user":
            latest_user_msg = msg["content"]
            break

    detected_lang = detect_language_simple(latest_user_msg)

    enhanced_prompt = f"""{system_prompt}

NATURAL REMEDIES KNOWLEDGE BASE:
{json.dumps(symptom_data, indent=2)}

Use this knowledge base to provide accurate, natural, safe home care guidance.

DETECTED USER LANGUAGE: {detected_lang} (respond in this language, or English if uncertain)

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
    return enhanced_prompt, detected_lang


def get_ai_response(messages: list) -> dict:
    """Get AI response with follow-up suggestions and related symptoms."""
    enhanced_prompt, detected_lang = build_prompt(messages)

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
                temperature=0.3,
            )
            content = response.choices[0].message.content
            result = parse_ai_response(content)
            result["language"] = detected_lang
            return result
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


def get_ai_response_stream(messages: list):
    """Stream AI response as Server-Sent Events (SSE)."""
    enhanced_prompt, detected_lang = build_prompt(messages)

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
                temperature=0.3,
                stream=True,
            )
            full_content = ""
            for chunk in response:
                content_chunk = chunk.choices[0].delta.content or ""
                if content_chunk:
                    full_content += content_chunk
                    yield content_chunk

            yield "\n===STREAM_END===\n"

            result = parse_ai_response(full_content)
            followups_json = json.dumps(result.get("followups", []))
            related_json = json.dumps(result.get("related", []))

            yield f"\n===FOLLOWUPS||{followups_json}===\n"
            yield f"\n===RELATED||{related_json}===\n"
            yield f"\n===LANG||{detected_lang}===\n"

            return
        except Exception as e:
            error_str = str(e)
            if "rate_limit" in error_str.lower() or "429" in error_str:
                last_error = e
                continue
            if "model" in error_str.lower() or "404" in error_str:
                last_error = e
                continue
            raise e

    error_msg = f"All models unavailable. Last error: {last_error}"
    yield f"\n===ERROR||{error_msg}===\n"


def parse_ai_response(content: str) -> dict:
    """Parse AI response to extract main message, followups, and related symptoms."""
    followups = []
    related = []
    main_content = content

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
