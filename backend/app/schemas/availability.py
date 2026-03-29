from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import time, datetime
from typing import Optional, ClassVar


class AvailabilitySlotBase(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6, description="0=Monday, 6=Sunday")
    start_time: time = Field(..., examples=["09:00:00"])
    end_time: time = Field(..., examples=["17:00:00"])
    timezone: str = Field("UTC", max_length=50, examples=["America/New_York"])

    @model_validator(mode="after")
    def validate_time_range(self):
        if self.start_time >= self.end_time:
            raise ValueError("start_time must be before end_time")
        return self


class AvailabilitySlotCreate(AvailabilitySlotBase):
    pass


class AvailabilitySlotUpdate(BaseModel):
    day_of_week: Optional[int] = Field(None, ge=0, le=6)
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    timezone: Optional[str] = Field(None, max_length=50)

    @model_validator(mode="after")
    def validate_time_range(self):
        if self.start_time and self.end_time:
            if self.start_time >= self.end_time:
                raise ValueError("start_time must be before end_time")
        return self


class AvailabilitySlotResponse(AvailabilitySlotBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# Bulk set: replace all availability in one call
class AvailabilityBulkSet(BaseModel):
    slots: list[AvailabilitySlotCreate] = Field(..., min_length=1)


class WeeklyAvailabilityResponse(BaseModel):
    """Groups availability slots by day name for readable API responses."""
    slots: list[AvailabilitySlotResponse]

    DAY_NAMES: ClassVar[dict[int, str]] = {
        0: "Monday",
        1: "Tuesday",
        2: "Wednesday",
        3: "Thursday",
        4: "Friday",
        5: "Saturday",
        6: "Sunday"
    }