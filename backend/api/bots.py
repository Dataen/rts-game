import asyncio
import os
import subprocess
from typing import List
from uuid import uuid4

from fastapi.responses import FileResponse, PlainTextResponse
from fastapi_sso import OpenID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from api.matches import get_bot_by_uuid
from util.file_extension import file_extension
from database.database import get_async_db
from schema.bot import Bot, BotCreate
from schema.match import Match
from database.models import Bot as BotModel
from database.models import Match as MatchModel
from fastapi import APIRouter, Depends, File, HTTPException, Path, UploadFile
from auth.auth import get_logged_user

BASE_CODE_DIR = "uploads"

router = APIRouter()

from fastapi import HTTPException


@router.get("/api/bots/{bot_uuid}", response_model=Bot)
async def get_bot(bot_uuid: str, db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(BotModel).where(BotModel.uuid == bot_uuid))
    bot = result.scalars().first()
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    return Bot(
        id=str(bot.uuid),
        name=bot.name,
        language=bot.language, # type: ignore
        rating=bot.rating,
        user_id=bot.user_id,
        creation_date=bot.creation_date,
    )

@router.get("/api/bots", response_model=List[Bot])
async def get_bots(db: AsyncSession = Depends(get_async_db)):
    results = await db.execute(select(BotModel))
    bots = results.scalars().all()
    return [
        Bot(
            id=str(bot.uuid),
            name=bot.name,
            language=bot.language, # type: ignore
            rating=bot.rating,
            user_id=bot.user_id,
            creation_date=bot.creation_date
        )
        for bot in bots
    ]

@router.post("/api/bots", response_model=Bot)
async def create_bot(
    new_bot: BotCreate, 
    db: AsyncSession = Depends(get_async_db),
    user: OpenID = Depends(get_logged_user)
):
    bot = BotModel(
        uuid=str(uuid4()),
        name=new_bot.name,
        language=new_bot.language,
        user_id=user.id,
        rating=1000.0
    )
    db.add(bot)
    await db.commit()
    await db.refresh(bot)
    
    return Bot(
        id=bot.uuid,
        name=bot.name,
        language=bot.language, # type: ignore
        rating=bot.rating,
        user_id=bot.user_id,
        creation_date=bot.creation_date,
    )

@router.delete("/api/bots/{bot_uuid}")
async def delete_bot(bot_uuid: str, db: AsyncSession = Depends(get_async_db)):
    # Get the bot by UUID
    result = await db.execute(select(BotModel).where(BotModel.uuid == bot_uuid))
    bot = result.scalar_one_or_none()

    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")

    # Check if the bot is part of any matches
    result = await db.execute(
        select(MatchModel).where(
            (MatchModel.bot_1_id == bot.id) | (MatchModel.bot_2_id == bot.id)
        )
    )
    match = result.first()
    if match:
        raise HTTPException(status_code=400, detail="Bot has existing matches and cannot be deleted")

    # Delete the bot
    await db.delete(bot)
    await db.commit()
    return {"message": "Bot deleted successfully"}


@router.post("/api/bots/{bot_uuid}/code")
async def upload_bot_code(
    bot_uuid: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_async_db),
    user: OpenID = Depends(get_logged_user)
):
    bot = await get_bot_by_uuid(bot_uuid, db)

    bot_dir = os.path.join(BASE_CODE_DIR, str(user.id), str(bot_uuid))
    os.makedirs(bot_dir, exist_ok=True)

    file_path = os.path.join(bot_dir, f"main.{file_extension(bot.language)}") # type: ignore
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    return {"detail": "Code uploaded successfully"}


@router.get("/api/bots/{bot_uuid}/code")
async def get_bot_code(
    bot_uuid: str, 
    db: AsyncSession = Depends(get_async_db),
    user: OpenID = Depends(get_logged_user)
):    
    bot = await get_bot_by_uuid(bot_uuid, db)

    if bot.user_id != user.id:
        raise HTTPException(status_code=403, detail="Stay in your lane")
    
    bot_dir = os.path.join(BASE_CODE_DIR, str(user.id), str(bot_uuid))
    file_path = os.path.join(bot_dir, f"main.{file_extension(bot.language)}") # type: ignore

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Code not found")

    return FileResponse(file_path, media_type="text/plain")


@router.post("/api/bots/{bot_uuid}/run", response_class=PlainTextResponse)
async def run_bot_code(
    bot_uuid: str, 
    db: AsyncSession = Depends(get_async_db),
    user: OpenID = Depends(get_logged_user)
):
    bot = await get_bot_by_uuid(bot_uuid, db)

    if bot.user_id != user.id:
        raise HTTPException(status_code=403, detail="Stay in your lane")
    
    bot_dir = os.path.join(BASE_CODE_DIR, str(user.id), str(bot_uuid))
    file_name = f"main.{file_extension(bot.language)}" # type: ignore
    code_path = os.path.join(bot_dir, file_name)

    if not os.path.exists(code_path):
        raise HTTPException(status_code=404, detail="Code not found")

    try:
        proc = await asyncio.create_subprocess_exec(
            "docker", "run", "--rm",
            "-v", f"{os.path.abspath(bot_dir)}:/code",
            "python:3.11", "python", f"/code/{file_name}",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT
        )

        try:
            stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=5.0)
        except asyncio.TimeoutError:
            proc.kill()
            return "⏰ Execution timed out"

        return stdout.decode("utf-8")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to run code: {str(e)}")