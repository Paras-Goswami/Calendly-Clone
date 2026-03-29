from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.availability import (
    AvailabilitySlotCreate,
    AvailabilitySlotUpdate,
    AvailabilitySlotResponse,
    AvailabilityBulkSet,
    WeeklyAvailabilityResponse,
)
from app.services import availability_service as svc

router = APIRouter(prefix="/availability", tags=["Availability"])


@router.get(
    "/",
    response_model=WeeklyAvailabilityResponse,
    summary="Get all availability slots for the default user",
)
def list_availability(db: Session = Depends(get_db)):
    slots = svc.list_availability(db)
    return WeeklyAvailabilityResponse(slots=slots)


@router.post(
    "/",
    response_model=AvailabilitySlotResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_slot(payload: AvailabilitySlotCreate, db: Session = Depends(get_db)):
    return svc.create_availability_slot(db, payload)


@router.put(
    "/bulk",
    response_model=WeeklyAvailabilityResponse,
)
def bulk_set_availability(payload: AvailabilityBulkSet, db: Session = Depends(get_db)):
    slots = svc.bulk_set_availability(db, payload)
    return WeeklyAvailabilityResponse(slots=slots)


@router.patch("/{slot_id}", response_model=AvailabilitySlotResponse)
def update_slot(slot_id: int, payload: AvailabilitySlotUpdate, db: Session = Depends(get_db)):
    return svc.update_availability_slot(db, slot_id, payload)


@router.delete("/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_slot(slot_id: int, db: Session = Depends(get_db)):
    svc.delete_availability_slot(db, slot_id)
@router.get("/slots/{slug}")
def get_available_slots(
    slug: str,
    date: str = Query(...),
    db: Session = Depends(get_db),
):
    return svc.get_available_slots_by_slug(db, slug, date)