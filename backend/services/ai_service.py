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

CRITICAL: After your main response, ALWAYS include these sections at the END:

===FOLLOWUPS===
3 relevant follow-up questions (one per line, max 10 words each)

===RELATED===
3 related symptoms/conditions (one per line, max 5 words each)

===SUGGESTIONS===
3 related symptoms as comma-separated values

===PREVENTION===
One specific prevention tip

Example complete response:
[Your detailed response with emojis and sections...]

===FOLLOWUPS===
How long have you had this?
Any other symptoms?
What triggers it?

===RELATED===
Sore throat
Sinus infection
Body aches

===SUGGESTIONS===
Sore Throat, Headache, Fever

===PREVENTION===
Wash hands frequently and avoid close contact with sick people.
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
            suggestions_json = json.dumps(result.get("suggestions", []))
            prevention_text = result.get("prevention", "")

            yield f"\n===FOLLOWUPS||{followups_json}===\n"
            yield f"\n===RELATED||{related_json}===\n"
            yield f"\n===SUGGESTIONS||{suggestions_json}===\n"
            yield f"\n===PREVENTION||{prevention_text}===\n"
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
    """Parse AI response to extract main message, followups, related symptoms, suggestions, and prevention."""
    followups = []
    related = []
    suggestions = []
    prevention = ""
    main_content = content

    # Extract sections using markers
    sections = {}
    current_section = None
    current_content = []
    
    for line in content.split('\n'):
        if line.strip().startswith('===') and line.strip().endswith('==='):
            if current_section:
                sections[current_section] = '\n'.join(current_content).strip()
            current_section = line.strip().strip('=').strip()
            current_content = []
        elif current_section:
            current_content.append(line)
    
    # Don't forget the last section
    if current_section and current_content:
        sections[current_section] = '\n'.join(current_content).strip()
    
    # Extract main content (before first section marker)
    if 'FOLLOWUPS' in sections:
        main_end = content.find('===FOLLOWUPS===')
        main_content = content[:main_end].strip()
    
    # Parse followups
    if 'FOLLOWUPS' in sections:
        followups = [
            line.strip().lstrip('- ').lstrip('• ')
            for line in sections['FOLLOWUPS'].split('\n')
            if line.strip() and not line.strip().startswith('===')
        ][:3]
    
    # Parse related
    if 'RELATED' in sections:
        related = [
            line.strip().lstrip('- ').lstrip('• ')
            for line in sections['RELATED'].split('\n')
            if line.strip() and not line.strip().startswith('===')
        ][:3]
    
    # Parse suggestions
    if 'SUGGESTIONS' in sections:
        suggestions = [
            s.strip()
            for s in sections['SUGGESTIONS'].split(',')
            if s.strip()
        ][:3]
    
    # Parse prevention
    if 'PREVENTION' in sections:
        prevention = sections['PREVENTION'].strip()

    return {
        "reply": main_content,
        "followups": followups,
        "related": related,
        "suggestions": suggestions,
        "prevention": prevention,
    }
