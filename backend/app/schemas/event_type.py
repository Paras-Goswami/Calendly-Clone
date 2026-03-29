from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional
import re


class EventTypeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150, examples=["30-Minute Meeting"])
    duration_minutes: int = Field(..., gt=0, le=480, examples=[30])
    description: Optional[str] = Field(None, max_length=1000)
    is_active: bool = True


class EventTypeCreate(EventTypeBase):
    slug: Optional[str] = Field(
        None,
        min_length=2,
        max_length=150,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
        examples=["30-minute-meeting"],
    )

    @field_validator("slug", mode="before")
    @classmethod
    def auto_generate_slug(cls, v, info):
        if v:
            return v.lower().strip()
        # Auto-generate from name if not provided
        name = info.data.get("name", "")
        slug = re.sub(r"[^a-z0-9]+", "-", name.lower().strip()).strip("-")
        return slug


class EventTypeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    duration_minutes: Optional[int] = Field(None, gt=0, le=480)
    description: Optional[str] = Field(None, max_length=1000)
    is_active: Optional[bool] = None
    slug: Optional[str] = Field(
        None,
        min_length=2,
        max_length=150,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
    )


class EventTypeResponse(EventTypeBase):
    id: int
    user_id: int
    slug: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PaginatedEventTypes(BaseModel):
    items: list[EventTypeResponse]
    total: int
    page: int
    page_size: int
    total_pages: int