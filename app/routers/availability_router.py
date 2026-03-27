from fastapi import APIRouter, Depends, status
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
    summary="Add a single availability time slot",
)
def create_slot(
    payload: AvailabilitySlotCreate,
    db: Session = Depends(get_db),
):
    return svc.create_availability_slot(db, payload)


@router.put(
    "/bulk",
    response_model=WeeklyAvailabilityResponse,
    summary="Replace ALL availability slots in one call (weekly schedule reset)",
)
def bulk_set_availability(
    payload: AvailabilityBulkSet,
    db: Session = Depends(get_db),
):
    slots = svc.bulk_set_availability(db, payload)
    return WeeklyAvailabilityResponse(slots=slots)


@router.patch(
    "/{slot_id}",
    response_model=AvailabilitySlotResponse,
    summary="Update a single availability slot",
)
def update_slot(
    slot_id: int,
    payload: AvailabilitySlotUpdate,
    db: Session = Depends(get_db),
):
    return svc.update_availability_slot(db, slot_id, payload)


@router.delete(
    "/{slot_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a single availability slot",
)
def delete_slot(
    slot_id: int,
    db: Session = Depends(get_db),
):
    svc.delete_availability_slot(db, slot_id)