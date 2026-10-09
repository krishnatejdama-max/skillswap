from typing import Literal

from pydantic import BaseModel


class SkillCreate(BaseModel):
    title: str
    description: str | None = None
    category: str | None = None
    type: Literal["offer", "want"]


class SkillUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    type: Literal["offer", "want"] | None = None


class SkillOut(BaseModel):
    id: str
    user_id: str
    title: str
    description: str | None = None
    category: str | None = None
    type: str
    created_at: str
