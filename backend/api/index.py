from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.core.config import get_settings
from api.routes.auth import router as auth_router
from api.routes.health import router as health_router
from api.routes.profiles import router as profiles_router
from api.routes.skills import router as skills_router
from api.routes.swap_requests import router as swap_requests_router

app = FastAPI(title="SkillSwap API", redirect_slashes=False)

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(profiles_router, prefix="/api/profiles", tags=["profiles"])
app.include_router(skills_router, prefix="/api/skills", tags=["skills"])
app.include_router(swap_requests_router, prefix="/api/swap-requests", tags=["swap-requests"])
