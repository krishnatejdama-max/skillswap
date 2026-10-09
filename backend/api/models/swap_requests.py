from typing import Literal

from pydantic import BaseModel


class SwapRequestCreate(BaseModel):
    receiver_id: str
    offered_skill_id: str
    requested_skill_id: str
    message: str | None = None


class SwapRequestStatusUpdate(BaseModel):
    status: Literal["accepted", "declined", "completed"]


class SwapRequestOut(BaseModel):
    id: str
    requester_id: str
    receiver_id: str
    offered_skill_id: str
    requested_skill_id: str
    message: str | None = None
    status: str
    created_at: str
