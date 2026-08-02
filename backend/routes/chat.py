from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from services.safety_check import check_red_flags, get_urgent_message
from services.ai_service import get_ai_response

router = APIRouter()


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]


class ChatResponse(BaseModel):
    reply: str
    is_emergency: bool


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Handle chat messages with safety checks."""

    # Get latest user message
    latest_message = ""
    for msg in reversed(request.messages):
        if msg.role == "user":
            latest_message = msg.content
            break

    # Red flag check first
    if check_red_flags(latest_message):
        return ChatResponse(
            reply=get_urgent_message(),
            is_emergency=True
        )

    # Convert to dict format for OpenAI
    messages_dict = [
        {"role": msg.role, "content": msg.content}
        for msg in request.messages
    ]

    # Get AI response
    try:
        reply = get_ai_response(messages_dict)
        return ChatResponse(
            reply=reply,
            is_emergency=False
        )
    except Exception as e:
        return ChatResponse(
            reply=f"❌ Sorry, something went wrong: {str(e)}",
            is_emergency=False
        )