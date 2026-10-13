from functools import lru_cache

from supabase import Client, create_client

from api.core.config import get_settings


@lru_cache
def get_supabase_client() -> Client:
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def get_supabase_auth_client() -> Client:
    """Fresh client per call, used only for JWT verification in auth.py.
    Must NOT be cached — avoids polluting the shared DB client's auth state."""
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
