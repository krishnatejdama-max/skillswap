from pydantic import BaseModel


class ProfileUpdate(BaseModel):
    full_name: str | None = None
    location: str | None = None
    bio: str | None = None


class ProfileOut(BaseModel):
    id: str
    email: str | None = None          # present for own profile, omitted for public
    full_name: str | None = None
    location: str | None = None
    bio: str | None = None
