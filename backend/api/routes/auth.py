from fastapi import APIRouter, Depends, HTTPException, status
from gotrue.errors import AuthApiError
from gotrue.types import User

from api.core.auth import get_current_user
from api.core.supabase import get_supabase_client
from api.models.auth import AuthResponse, LoginRequest, SignupRequest, UserOut

router = APIRouter()


def _fetch_profile(user_id: str) -> dict | None:
    """Return the profiles row for user_id, or None if not found."""
    try:
        result = (
            get_supabase_client()
            .table("profiles")
            .select("*")
            .eq("id", user_id)
            .execute()
        )
        return result.data[0] if result.data else None
    except Exception:
        return None


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(body: SignupRequest):
    client = get_supabase_client()

    try:
        result = client.auth.sign_up({"email": body.email, "password": body.password})
    except AuthApiError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=exc.message)

    if result.user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Signup failed. The email may already be registered.",
        )

    # Persist display name in the profiles table (non-fatal if it fails)
    try:
        client.table("profiles").upsert(
            {"id": str(result.user.id), "full_name": body.full_name}
        ).execute()
    except Exception:
        pass

    user_out = UserOut(
        id=str(result.user.id),
        email=result.user.email or body.email,
        full_name=body.full_name,
    )

    if result.session is None:
        # Supabase email confirmation is enabled — no token issued yet
        return AuthResponse(
            access_token=None,
            user=user_out,
            message="Check your email to confirm your account.",
        )

    return AuthResponse(access_token=result.session.access_token, user=user_out)


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    client = get_supabase_client()

    try:
        result = client.auth.sign_in_with_password({"email": body.email, "password": body.password})
    except AuthApiError:
        # Never expose the raw Supabase error for login (avoids user-enumeration hints)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if result.user is None or result.session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    profile = _fetch_profile(str(result.user.id))

    return AuthResponse(
        access_token=result.session.access_token,
        user=UserOut(
            id=str(result.user.id),
            email=result.user.email or body.email,
            full_name=profile.get("full_name") if profile else None,
            location=profile.get("location") if profile else None,
            bio=profile.get("bio") if profile else None,
        ),
    )


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    profile = _fetch_profile(str(current_user.id))

    if profile is None:
        # Auto-create a minimal profile so authenticated users are never rejected
        try:
            get_supabase_client().table("profiles").upsert(
                {"id": str(current_user.id)}
            ).execute()
        except Exception:
            pass
        profile = {"id": str(current_user.id), "full_name": None, "location": None, "bio": None}

    return UserOut(
        id=profile["id"],
        email=current_user.email or "",
        full_name=profile.get("full_name"),
        location=profile.get("location"),
        bio=profile.get("bio"),
    )
