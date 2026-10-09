from fastapi import APIRouter, Depends, HTTPException, Query, status
from gotrue.types import User

from api.core.auth import get_current_user
from api.core.supabase import get_supabase_client
from api.models.swap_requests import SwapRequestCreate, SwapRequestOut, SwapRequestStatusUpdate

router = APIRouter()


def _get_swap_request_row(request_id: str) -> dict | None:
    try:
        result = (
            get_supabase_client()
            .table("swap_requests")
            .select("*")
            .eq("id", request_id)
            .execute()
        )
        return result.data[0] if result.data else None
    except Exception:
        return None


@router.post("", response_model=SwapRequestOut, status_code=status.HTTP_201_CREATED)
async def create_swap_request(
    body: SwapRequestCreate,
    current_user: User = Depends(get_current_user),
):
    if body.receiver_id == str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot send a swap request to yourself.",
        )

    payload = {
        "requester_id": str(current_user.id),
        "receiver_id": body.receiver_id,
        "offered_skill_id": body.offered_skill_id,
        "requested_skill_id": body.requested_skill_id,
        "status": "pending",
    }
    if body.message is not None:
        payload["message"] = body.message

    try:
        result = get_supabase_client().table("swap_requests").insert(payload).execute()
        row = result.data[0] if result.data else None
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create swap request.",
        )

    if not row:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create swap request.",
        )

    return row


@router.get("", response_model=list[SwapRequestOut])
async def list_swap_requests(
    direction: str = Query("all", pattern="^(sent|received|all)$"),
    current_user: User = Depends(get_current_user),
):
    uid = str(current_user.id)
    client = get_supabase_client()

    try:
        if direction == "sent":
            result = (
                client.table("swap_requests")
                .select("*")
                .eq("requester_id", uid)
                .order("created_at", desc=True)
                .execute()
            )
        elif direction == "received":
            result = (
                client.table("swap_requests")
                .select("*")
                .eq("receiver_id", uid)
                .order("created_at", desc=True)
                .execute()
            )
        else:
            result = (
                client.table("swap_requests")
                .select("*")
                .or_(f"requester_id.eq.{uid},receiver_id.eq.{uid}")
                .order("created_at", desc=True)
                .execute()
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch swap requests.",
        )

    return result.data or []


@router.patch("/{request_id}/status", response_model=SwapRequestOut)
async def update_swap_request_status(
    request_id: str,
    body: SwapRequestStatusUpdate,
    current_user: User = Depends(get_current_user),
):
    uid = str(current_user.id)
    swap = _get_swap_request_row(request_id)

    if swap is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Swap request not found.")

    is_receiver = swap["receiver_id"] == uid
    is_requester = swap["requester_id"] == uid

    if not is_receiver and not is_requester:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this swap request.",
        )

    if body.status in ("accepted", "declined") and not is_receiver:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the receiver can accept or decline a swap request.",
        )

    try:
        result = (
            get_supabase_client()
            .table("swap_requests")
            .update({"status": body.status})
            .eq("id", request_id)
            .execute()
        )
        row = result.data[0] if result.data else None
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update swap request.",
        )

    if not row:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update swap request.",
        )

    return row
