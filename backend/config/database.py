import os
from supabase import create_client

supabase_url = os.getenv("SUPABASE_URL", "")
supabase_key = os.getenv("SUPABASE_ANON_KEY", os.getenv("SUPABASE_KEY", ""))

supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None


def get_supabase():
    """Get the Supabase client instance."""
    if not supabase:
        raise Exception("Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.")
    return supabase
