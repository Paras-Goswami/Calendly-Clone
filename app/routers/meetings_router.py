from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.booking import BookingResponse, PaginatedBookings
from app.services import booking_service as svc
from app.utils.pagination import pagination_params, paginate_response

router = APIRouter(prefix="/meetings", tags=["Meetings"])


@router.get(
    "/upcoming",
    response_model=PaginatedBookings,
    summary="List upcoming confirmed meetings (future bookings)",
)
def list_upcoming(
    pagination: dict = Depends(pagination_params),
    db: Session = Depends(get_db),
):
    items, total = svc.list_upcoming_meetings(
        db, skip=pagination["skip"], limit=pagination["limit"]
    )
    return paginate_response(items, total, pagination["page"], pagination["page_size"])


@router.get(
    "/past",
    response_model=PaginatedBookings,
    summary="List past meetings (all statuses)",
)
def list_past(
    pagination: dict = Depends(pagination_params),
    db: Session = Depends(get_db),
):
    items, total = svc.list_past_meetings(
        db, skip=pagination["skip"], limit=pagination["limit"]
    )
    return paginate_response(items, total, pagination["page"], pagination["page_size"])


@router.get(
    "/{booking_id}",
    response_model=BookingResponse,
    summary="Get a single meeting by ID",
)
def get_meeting(
    booking_id: int,
    db: Session = Depends(get_db),
):
    return svc.get_booking_by_id(db, booking_id)


@router.patch(
    "/{booking_id}/cancel",
    response_model=BookingResponse,
    summary="Cancel a meeting",
)
def cancel_meeting(
    booking_id: int,
    db: Session = Depends(get_db),
):
    return svc.cancel_booking(db, booking_id)