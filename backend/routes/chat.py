from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List
from services.safety_check import check_red_flags, get_urgent_message
from services.ai_service import get_ai_response

router = APIRouter()


class Message(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., max_length=2000)


class ChatRequest(BaseModel):
    messages: List[Message] = Field(..., max_length=20)


class ChatResponse(BaseModel):
    reply: str
    is_emergency: bool
    followups: List[str] = []
    related: List[str] = []


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Handle chat messages with safety checks."""

    latest_message = ""
    for msg in reversed(request.messages):
        if msg.role == "user":
            latest_message = msg.content
            break

    # Red flag check
    if check_red_flags(latest_message):
        return ChatResponse(
            reply=get_urgent_message(),
            is_emergency=True,
            followups=[],
            related=[]
        )

    messages_dict = [
        {"role": msg.role, "content": msg.content}
        for msg in request.messages
    ]

    try:
        result = get_ai_response(messages_dict)
        return ChatResponse(
            reply=result["reply"],
            is_emergency=False,
            followups=result.get("followups", []),
            related=result.get("related", [])
        )
    except Exception:
        return ChatResponse(
            reply="Sorry, something went wrong. Please try again.",
            is_emergency=False,
            followups=[],
            related=[]
        )