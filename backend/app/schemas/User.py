from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    timezone: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    timezone: Optional[str] = Field(None, max_length=50)