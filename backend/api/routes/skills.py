from fastapi import APIRouter, Depends, HTTPException, Query, status
from gotrue.types import User

from api.core.auth import get_current_user
from api.core.supabase import get_supabase_client
from api.models.skills import SkillCreate, SkillOut, SkillUpdate

router = APIRouter()


def _get_skill_row(skill_id: str) -> dict | None:
    try:
        result = (
            get_supabase_client()
            .table("skills")
            .select("*")
            .eq("id", skill_id)
            .execute()
        )
        return result.data[0] if result.data else None
    except Exception:
        return None


@router.get("", response_model=list[SkillOut])
async def list_skills(
    type: str | None = Query(None, pattern="^(offer|want)$"),
    category: str | None = Query(None),
    user_id: str | None = Query(None),
    current_user: User = Depends(get_current_user),
):
    query = get_supabase_client().table("skills").select("*")
    if type is not None:
        query = query.eq("type", type)
    if category is not None:
        query = query.eq("category", category)
    if user_id is not None:
        query = query.eq("user_id", user_id)

    try:
        result = query.order("created_at", desc=True).execute()
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch skills.")

    return result.data or []


@router.post("", response_model=SkillOut, status_code=status.HTTP_201_CREATED)
async def create_skill(
    body: SkillCreate,
    current_user: User = Depends(get_current_user),
):
    payload = body.model_dump(exclude_none=True)
    payload["user_id"] = str(current_user.id)

    try:
        result = get_supabase_client().table("skills").insert(payload).execute()
        row = result.data[0] if result.data else None
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create skill: {exc}")

    if not row:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create skill.")

    return row


@router.patch("/{skill_id}", response_model=SkillOut)
async def update_skill(
    skill_id: str,
    body: SkillUpdate,
    current_user: User = Depends(get_current_user),
):
    skill = _get_skill_row(skill_id)
    if skill is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found.")
    if skill["user_id"] != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this skill.")

    update_data = body.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields provided to update.")

    try:
        result = (
            get_supabase_client()
            .table("skills")
            .update(update_data)
            .eq("id", skill_id)
            .execute()
        )
        row = result.data[0] if result.data else None
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update skill.")

    if not row:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update skill.")

    return row


@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_skill(
    skill_id: str,
    current_user: User = Depends(get_current_user),
):
    skill = _get_skill_row(skill_id)
    if skill is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found.")
    if skill["user_id"] != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this skill.")

    try:
        get_supabase_client().table("skills").delete().eq("id", skill_id).execute()
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete skill.")
