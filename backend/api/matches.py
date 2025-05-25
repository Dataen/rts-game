from typing import List

from fastapi_sso import OpenID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from auth.auth import get_logged_user
from database.database import get_async_db
from schema.match import Match, MatchCreate
from database.models import Match as MatchModel, Bot as BotModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import joinedload

router = APIRouter()

@router.get("/api/matches/{match_uuid}", response_model=Match)
async def get_match(match_uuid: str, db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(
        select(MatchModel)
            .where(MatchModel.uuid == match_uuid)
            .options(
                joinedload(MatchModel.bot_a),
                joinedload(MatchModel.bot_b),
                joinedload(MatchModel.winner),
            )
        )
    match = result.scalars().first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return Match(
        uuid=match.uuid,
        user_id=match.user_id,
        created_at=match.created_at,
        finished_at=match.finished_at,
        bot_A_uuid=match.bot_a.uuid,
        bot_B_uuid=match.bot_b.uuid,
        winner_uuid=match.winner.uuid if match.winner else None
    )

@router.get("/api/matches", response_model=List[Match])
async def get_matches(db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(MatchModel).options(
        joinedload(MatchModel.bot_a),
        joinedload(MatchModel.bot_b),
        joinedload(MatchModel.winner),
    ))
    matches = result.scalars().all()
    return [
        Match(
            uuid=match.uuid,
            user_id=match.user_id,
            created_at=match.created_at,
            finished_at=match.finished_at,
            bot_A_uuid=match.bot_a.uuid,
            bot_B_uuid=match.bot_b.uuid,
            winner_uuid=match.winner.uuid if match.winner else None,
        )
        for match in matches
    ]


@router.get("/api/matches/bot/{bot_uuid}", response_model=List[Match])
async def get_matches_by_bot(bot_uuid: str, db: AsyncSession = Depends(get_async_db)):
    bot = await get_bot_by_uuid(bot_uuid, db)
    result = await db.execute(
        select(MatchModel).where(
            (MatchModel.bot_a_id == bot.id) | (MatchModel.bot_b_id == bot.id)
        ).options(
            joinedload(MatchModel.bot_a),
            joinedload(MatchModel.bot_b),
            joinedload(MatchModel.winner),
        )
    )    
    matches = result.scalars().all()
    return [
        Match(
            uuid=str(match.uuid),
            user_id=match.user_id,
            created_at=match.created_at,
            finished_at=match.finished_at,
            bot_A_uuid=match.bot_a.uuid,
            bot_B_uuid=match.bot_b.uuid,
            winner_uuid=match.winner_bot.uuid if match.winner_bot_id else None,
        )
        for match in matches
    ]

@router.post("/api/matches", response_model=Match)
async def create_match(
    match: MatchCreate, 
    db: AsyncSession = Depends(get_async_db),
    user: OpenID = Depends(get_logged_user)
):
    botA = await get_bot_by_uuid(match.bot_A_uuid, db)
    botB = await get_bot_by_uuid(match.bot_B_uuid, db)

    new_match = MatchModel(
        bot_a_id=botA.id,
        bot_b_id=botB.id,
        user_id=user.id
    )
    db.add(new_match)
    await db.commit()
    await db.refresh(new_match)
    return get_match(new_match.uuid, db)


async def get_bot_by_id(id: int, db: AsyncSession) -> BotModel:
    bot = await db.execute(select(BotModel).where(BotModel.id == id))
    bot_obj = bot.scalars().first()
    if not bot_obj:
        raise HTTPException(status_code=404, detail="Bot not found")
    return bot_obj

async def get_bot_by_uuid(uuid: str, db: AsyncSession) -> BotModel:
    bot = await db.execute(select(BotModel).where(BotModel.uuid == uuid))
    bot_obj = bot.scalars().first()
    if not bot_obj:
        raise HTTPException(status_code=404, detail="Bot not found")
    return bot_obj