from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List
from fastapi.responses import StreamingResponse
from services.safety_check import check_red_flags, get_urgent_message
from services.ai_service import get_ai_response_stream, parse_ai_response, get_ai_response

router = APIRouter()


class Message(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., max_length=2000)


class ChatRequest(BaseModel):
    messages: List[Message] = Field(..., max_length=20)


@router.post("/stream")
async def stream_chat(request: ChatRequest):
    latest_message = ""
    for msg in reversed(request.messages):
        if msg.role == "user":
            latest_message = msg.content
            break

    if check_red_flags(latest_message):
        return {
            "reply": get_urgent_message(),
            "is_emergency": True,
            "followups": [],
            "related": [],
        }

    messages_dict = [
        {"role": msg.role, "content": msg.content}
        for msg in request.messages
    ]

    return StreamingResponse(
        get_ai_response_stream(messages_dict),
        media_type="text/event-stream",
    )
