"""Simple push notification test route."""
from fastapi import APIRouter, Request, HTTPException
from services.push_service import send_push, get_all_subscriptions

router = APIRouter()


@router.post("/send-test")
async def send_test_push(request: Request):
    """Send a test push notification to all subscribers."""
    try:
        # Get all subscriptions
        subs = await get_all_subscriptions()

        if not subs:
            return {"status": "no_subscribers", "message": "No subscriptions found"}

        # Send to first subscription
        sub = subs[0]
        success = send_push(sub, "Test Notification", "Hello from HomeCare AI! 🌿", "/")

        if success:
            return {"status": "sent", "message": "Push sent successfully"}
        else:
            return {"status": "failed", "message": "Push failed to send"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
