from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.booking import BookingCreate, BookingResponse, AvailableDateResponse, TimeSlot
from app.services import booking_service as svc

router = APIRouter(prefix="/book", tags=["Public Booking"])


@router.get(
    "/{slug}/dates",
    response_model=list[AvailableDateResponse],
    summary="Get available dates for an event type in a given month",
)
def get_available_dates(
    slug: str,
    month: int = Query(..., ge=1, le=12, description="Month (1–12)"),
    year: int = Query(..., ge=2024, le=2100, description="4-digit year"),
    db: Session = Depends(get_db),
):
    return svc.get_available_dates(db, slug, month, year)


@router.get(
    "/{slug}/slots",
    response_model=list[TimeSlot],
    summary="Get available time slots for an event type on a specific date",
)
def get_available_slots(
    slug: str,
    date: date = Query(..., description="Date in YYYY-MM-DD format"),
    db: Session = Depends(get_db),
):
    return svc.get_available_slots(db, slug, date)


@router.post(
    "/{slug}",
    response_model=BookingResponse,
    status_code=201,
    summary="Create a booking for an event type",
)
def create_booking(
    slug: str,
    payload: BookingCreate,
    db: Session = Depends(get_db),
):
    return svc.create_booking(db, slug, payload)