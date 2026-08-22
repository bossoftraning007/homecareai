from fastapi import APIRouter, HTTPException
from supabase import create_client
import os

router = APIRouter()

supabase_url = os.getenv("SUPABASE_URL", "")
supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
supabase_admin = create_client(supabase_url, supabase_service_key) if supabase_service_key else None


@router.get("/admin/users")
async def get_all_users():
    """Get all registered users from Supabase Auth (admin only)."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Service role key not configured")

    try:
        response = supabase_admin.auth.admin.listUsers()

        users = []
        for user in response:
            users.append({
                "id": user.id,
                "email": user.email,
                "full_name": getattr(user, 'user_metadata', {}).get('full_name') or
                              getattr(user, 'user_metadata', {}).get('name') or
                              (user.email.split('@')[0] if user.email else 'Unknown'),
                "created_at": user.created_at,
                "last_sign_in": getattr(user, 'last_sign_in_at', None),
                "email_confirmed": getattr(user, 'email_confirmed_at', None) is not None,
                "phone": getattr(user, 'phone', None),
            })

        return {
            "success": True,
            "total": len(users),
            "users": users,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/stats")
async def get_admin_stats():
    """Get admin dashboard statistics."""
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="Service role key not configured")

    try:
        response = supabase_admin.auth.admin.listUsers()
        total_users = len(response)
        active_today = sum(1 for u in response if getattr(u, 'last_sign_in_at', '') and u.last_sign_in_at.startswith(__import__('datetime').date.today().isoformat()))

        symptoms_count = 0
        try:
            sym_response = supabase_admin.table('symptoms_database').select('id', count='exact').execute()
            symptoms_count = sym_response.count or 0
        except:
            pass

        messages_count = 0
        try:
            msg_response = supabase_admin.table('messages').select('id', count='exact').execute()
            messages_count = msg_response.count or 0
        except:
            pass

        sos_count = 0
        try:
            sos_response = supabase_admin.table('messages').select('id', count='exact').eq('is_emergency', True).execute()
            sos_count = sos_response.count or 0
        except:
            pass

        return {
            "success": True,
            "stats": {
                "total_users": total_users,
                "active_today": active_today,
                "total_symptoms": symptoms_count,
                "total_messages": messages_count,
                "total_sos": sos_count,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
