from typing import Optional
import pydantic

from schema.base_schema import BaseSchema

class User(BaseSchema):
    id: Optional[str] = None
    email: Optional[pydantic.EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    display_name: Optional[str] = None
    picture: Optional[str] = None
    provider: Optional[str] = None