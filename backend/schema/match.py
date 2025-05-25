from datetime import datetime
from typing import Optional

from schema.base_schema import BaseSchema

class Match(BaseSchema):
    uuid: str
    user_id: str
    created_at: datetime
    finished_at: Optional[datetime]
    bot_A_uuid: str
    bot_B_uuid: str
    winner_uuid: Optional[str]

class MatchCreate(BaseSchema):
    bot_A_uuid: str
    bot_B_uuid: str