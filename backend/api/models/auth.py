from pydantic import BaseModel, EmailStr


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    full_name: str | None = None
    location: str | None = None
    bio: str | None = None


class AuthResponse(BaseModel):
    access_token: str | None = None
    user: UserOut
    message: str = "OK"
