import os
import httpx
from fastapi import HTTPException, Request

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", os.environ.get("SUPABASE_KEY", ""))


async def get_current_user(request: Request):
    """
    Extract and validate the current user from the Authorization header.
    Expects: Bearer <supabase_jwt_token>
    """
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = auth_header.replace("Bearer ", "")

    if not token:
        raise HTTPException(status_code=401, detail="Missing token")

    # Verify token with Supabase
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{SUPABASE_URL}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": SUPABASE_ANON_KEY,
                }
            )

            if response.status_code != 200:
                print(f"[AUTH] Token validation failed: {response.status_code} - {response.text}")
                raise HTTPException(status_code=401, detail="Invalid or expired token")

            user_data = response.json()
            return {
                "id": user_data.get("id"),
                "email": user_data.get("email"),
                "user_metadata": user_data.get("user_metadata", {}),
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
