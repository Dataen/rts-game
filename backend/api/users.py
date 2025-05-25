from fastapi import APIRouter, Depends
from fastapi_sso import OpenID

from auth.auth import get_logged_user
from schema.user import User

router = APIRouter()

@router.get("/api/user/me")
async def get_user_info(user: OpenID = Depends(get_logged_user)):
    return User.model_validate(user.model_dump())