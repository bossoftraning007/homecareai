import os
from supabase import create_client

supabase_url = os.environ.get("SUPABASE_URL", "")
supabase_key = os.environ.get("SUPABASE_ANON_KEY", os.environ.get("SUPABASE_KEY", ""))

supabase = None
if supabase_url and supabase_key:
    try:
        supabase = create_client(supabase_url, supabase_key)
    except Exception as e:
        print(f"Warning: Failed to create Supabase client: {e}")


def get_supabase():
    """Get the Supabase client instance."""
    if not supabase:
        raise Exception("Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables in Render.")
    return supabase
