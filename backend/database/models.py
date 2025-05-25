from datetime import datetime, timezone
from uuid import uuid4
from sqlalchemy import Enum, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.ext.declarative import declarative_base

from schema.bot_language import BotLanguage

Base = declarative_base()

class Bot(Base):
    __tablename__ = "bots"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(UUID(as_uuid=False), default=uuid4, unique=True, nullable=False)

    user_id: Mapped[str] = mapped_column(String, nullable=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    language: Mapped[str] = mapped_column(Enum(BotLanguage), nullable=False)
    rating: Mapped[float] = mapped_column(Float, default=1000.0)
    creation_date: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=datetime.now(timezone.utc))

    # Relationships
    matches_as_bot_a = relationship("Match", foreign_keys="Match.bot_a_id", back_populates="bot_a")
    matches_as_bot_b = relationship("Match", foreign_keys="Match.bot_b_id", back_populates="bot_b")
    matches_won = relationship("Match", foreign_keys="Match.winner_bot_id", back_populates="winner")


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(UUID(as_uuid=False), default=uuid4, unique=True, nullable=False)

    user_id: Mapped[str] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), default=datetime.now(timezone.utc))
    finished_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=True)

    bot_a_id: Mapped[int] = mapped_column(ForeignKey("bots.id"))
    bot_b_id: Mapped[int] = mapped_column(ForeignKey("bots.id"))
    winner_bot_id: Mapped[int] = mapped_column(ForeignKey("bots.id"), nullable=True)

    bot_a = relationship("Bot", foreign_keys=[bot_a_id], back_populates="matches_as_bot_a")
    bot_b = relationship("Bot", foreign_keys=[bot_b_id], back_populates="matches_as_bot_b")
    winner = relationship("Bot", foreign_keys=[winner_bot_id], back_populates="matches_won")