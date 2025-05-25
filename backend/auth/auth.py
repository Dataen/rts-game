from typing import Tuple
from fastapi import HTTPException, Security
from fastapi.security import APIKeyCookie, APIKeyHeader
from fastapi_sso import OpenID
from jose import jwt
from datetime import datetime, timedelta, timezone
import os

async def get_logged_user(authorization: str = Security(APIKeyHeader(name="Authorization"))):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    token = authorization[len("Bearer "):]
    try:
        claims = jwt.decode(token, key=os.getenv("JWT_SECRET_KEY", ""), algorithms=["HS256"])
        return OpenID(**claims["pld"])  # or however you unpack claims
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token") from e

def create_jwt(openid: OpenID) -> Tuple[str, datetime]:
    expiration = datetime.now(tz=timezone.utc) + timedelta(days=1)
    return jwt.encode(
        {
            "pld": openid.model_dump(), 
            "exp": datetime.now(tz=timezone.utc) + timedelta(days=1), 
            "sub": openid.id
        }, 
        key=os.getenv("JWT_SECRET_KEY", ""), 
        algorithm="HS256"
    ), expiration