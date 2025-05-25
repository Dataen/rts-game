from datetime import datetime

from schema.bot_language import BotLanguage
from schema.base_schema import BaseSchema

class Bot(BaseSchema):
    id: str
    name: str
    language: BotLanguage
    rating: float
    user_id: str
    creation_date: datetime

class BotCreate(BaseSchema):
    name: str
    language: BotLanguage