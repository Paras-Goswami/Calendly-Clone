from pydantic import BaseModel, Field, EmailStr
from datetime import datetime, date
from typing import Optional
from app.models.booking import BookingStatus
from app.schemas.event_type import EventTypeResponse


class BookingCreate(BaseModel):
    invitee_name: str = Field(..., min_length=1, max_length=150, examples=["Jane Doe"])
    invitee_email: EmailStr = Field(..., examples=["jane@example.com"])
    start_time: datetime = Field(..., description="UTC datetime for the booking start")
    notes: Optional[str] = Field(None, max_length=500)


class BookingResponse(BaseModel):
    id: int
    event_type_id: int
    invitee_name: str
    invitee_email: str
    start_time: datetime
    end_time: datetime
    status: BookingStatus
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    event_type: Optional[EventTypeResponse] = None

    model_config = {"from_attributes": True}


class AvailableDateResponse(BaseModel):
    date: date
    available_slots: int


class TimeSlot(BaseModel):
    start_time: datetime
    end_time: datetime


class PaginatedBookings(BaseModel):
    items: list[BookingResponse]
    total: int
    page: int
    page_size: int
    total_pages: int