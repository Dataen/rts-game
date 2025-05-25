import os

from fastapi.responses import RedirectResponse
from auth.auth import create_jwt
from fastapi import APIRouter, HTTPException, Request
from fastapi_sso.sso.github import GithubSSO
from urllib.parse import urlencode

CLIENT_ID="Ov23liC1xYhbMGdCjyLH"

router = APIRouter()
github_sso: GithubSSO = None # type: ignore

def init_sso():
    global github_sso
    github_sso = GithubSSO(
        client_id=CLIENT_ID,
        client_secret=os.getenv("GITHUB_CLIENT_SECRET", ""),
        redirect_uri=os.getenv("SSO_REDIRECT_URL", ""),
    )

@router.get("/auth/login")
async def login():
    async with github_sso:
        return RedirectResponse(await github_sso.get_login_url())

@router.get("/auth/logout")
async def logout():
    frontend_url = os.getenv("FRONTEND_URL")
    response = RedirectResponse(url=f"{frontend_url}/login")
    response.delete_cookie(key="token")
    return response

@router.get("/auth/callback")
async def auth_callback(request: Request):
    async with github_sso:
        frontend_url = os.getenv("FRONTEND_URL")
        openid = await github_sso.verify_and_process(request)
        if not openid:
            raise HTTPException(status_code=401, detail="Authentication failed")

        token, expiration = create_jwt(openid)
        params = urlencode({"token": token, "token_type": "bearer"})
        redirect_url = f"{frontend_url}/auth/callback?{params}"

        response = RedirectResponse(redirect_url)
        response.set_cookie(key="token", value=token, expires=expiration)

        return response