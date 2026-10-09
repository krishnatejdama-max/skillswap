from fastapi import APIRouter, Depends, HTTPException, status
from gotrue.types import User

from api.core.auth import get_current_user
from api.core.supabase import get_supabase_client
from api.models.profiles import ProfileOut, ProfileUpdate

router = APIRouter()


def _get_profile_row(user_id: str) -> dict | None:
    try:
        result = (
            get_supabase_client()
            .table("profiles")
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )
        return result.data
    except Exception:
        return None


@router.get("/me", response_model=ProfileOut)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    profile = _get_profile_row(str(current_user.id))
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")
    return ProfileOut(
        id=profile["id"],
        email=current_user.email or "",
        full_name=profile.get("full_name"),
        location=profile.get("location"),
        bio=profile.get("bio"),
    )


@router.patch("/me", response_model=ProfileOut)
async def update_my_profile(
    body: ProfileUpdate,
    current_user: User = Depends(get_current_user),
):
    update_data = body.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields provided to update.")

    update_data["id"] = str(current_user.id)

    try:
        result = (
            get_supabase_client()
            .table("profiles")
            .upsert(update_data)
            .execute()
        )
        row = result.data[0] if result.data else None
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update profile.")

    if not row:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update profile.")

    return ProfileOut(
        id=row["id"],
        email=current_user.email or "",
        full_name=row.get("full_name"),
        location=row.get("location"),
        bio=row.get("bio"),
    )


@router.get("/{user_id}", response_model=ProfileOut)
async def get_public_profile(
    user_id: str,
    current_user: User = Depends(get_current_user),
):
    profile = _get_profile_row(user_id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")
    # Email is not exposed for other users' profiles
    return ProfileOut(
        id=profile["id"],
        full_name=profile.get("full_name"),
        location=profile.get("location"),
        bio=profile.get("bio"),
    )
