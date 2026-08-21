from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Optional
from services.email_service import send_welcome_email, send_verification_email

router = APIRouter()


class AuthEvent(BaseModel):
    event: str  # "signup", "login", "email_verification"
    user_id: str
    email: str
    full_name: Optional[str] = ""
    verification_code: Optional[str] = None


class EmailResponse(BaseModel):
    success: bool
    message: str


@router.post("/auth/webhook", response_model=EmailResponse)
async def auth_webhook(event: AuthEvent):
    """Handle auth events and send appropriate emails."""

    user_name = event.full_name or event.email.split("@")[0]

    if event.event == "signup":
        success = await send_welcome_email(event.email, user_name, is_new_user=True)
        return EmailResponse(
            success=success,
            message="Welcome email sent" if success else "Failed to send welcome email",
        )

    elif event.event == "login":
        # Optional: Send login notification (can be enabled/disabled)
        return EmailResponse(
            success=True,
            message="Login recorded",
        )

    elif event.event == "email_verification":
        if not event.verification_code:
            return EmailResponse(
                success=False,
                message="Verification code required",
            )
        success = await send_verification_email(
            event.email, user_name, event.verification_code
        )
        return EmailResponse(
            success=success,
            message="Verification email sent" if success else "Failed to send verification email",
        )

    return EmailResponse(success=False, message="Unknown event type")


@router.post("/auth/send-welcome", response_model=EmailResponse)
async def manual_welcome_email(request: Request):
    """Manually trigger a welcome email."""
    data = await request.json()
    email = data.get("email", "")
    full_name = data.get("full_name", "")

    if not email:
        return EmailResponse(success=False, message="Email required")

    user_name = full_name or email.split("@")[0]
    success = await send_welcome_email(email, user_name, is_new_user=True)

    return EmailResponse(
        success=success,
        message="Welcome email sent" if success else "Failed to send",
    )
