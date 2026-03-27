from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.event_type import (
    EventTypeCreate, EventTypeUpdate, EventTypeResponse, PaginatedEventTypes
)
from app.services import event_type_service as svc
from app.utils.pagination import pagination_params, paginate_response

router = APIRouter(prefix="/event-types", tags=["Event Types"])


@router.post(
    "/",
    response_model=EventTypeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new event type",
)
def create_event_type(
    payload: EventTypeCreate,
    db: Session = Depends(get_db),
):
    return svc.create_event_type(db, payload)


@router.get(
    "/",
    response_model=PaginatedEventTypes,
    summary="List all event types (paginated)",
)
def list_event_types(
    pagination: dict = Depends(pagination_params),
    db: Session = Depends(get_db),
):
    items, total = svc.list_event_types(db, skip=pagination["skip"], limit=pagination["limit"])
    return paginate_response(items, total, pagination["page"], pagination["page_size"])


@router.get(
    "/{event_type_id}",
    response_model=EventTypeResponse,
    summary="Get a single event type by ID",
)
def get_event_type(
    event_type_id: int,
    db: Session = Depends(get_db),
):
    return svc.get_event_type_by_id(db, event_type_id)


@router.patch(
    "/{event_type_id}",
    response_model=EventTypeResponse,
    summary="Partially update an event type",
)
def update_event_type(
    event_type_id: int,
    payload: EventTypeUpdate,
    db: Session = Depends(get_db),
):
    return svc.update_event_type(db, event_type_id, payload)


@router.delete(
    "/{event_type_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an event type (and all its bookings)",
)
def delete_event_type(
    event_type_id: int,
    db: Session = Depends(get_db),
):
    svc.delete_event_type(db, event_type_id)