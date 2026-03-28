import pytz
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.availability import Availability
from app.schemas.availability import AvailabilitySlotCreate, AvailabilitySlotUpdate, AvailabilityBulkSet
from app.services.event_type_service import get_default_user
from app.utils.exceptions import NotFoundError, ValidationError
from app.utils.logging import get_logger
from app.models.booking import Booking
from app.models.event_type import EventType
logger = get_logger(__name__)

VALID_TIMEZONES = set(pytz.all_timezones)


def _validate_timezone(tz: str) -> None:
    if tz not in VALID_TIMEZONES:
        raise ValidationError(f"Invalid timezone: '{tz}'. Use a valid IANA timezone string.")


def list_availability(db: Session) -> list[Availability]:
    user = get_default_user(db)
    return (
        db.query(Availability)
        .filter(Availability.user_id == user.id)
        .order_by(Availability.day_of_week, Availability.start_time)
        .all()
    )


def get_availability_slot(db: Session, slot_id: int) -> Availability:
    slot = db.query(Availability).filter(Availability.id == slot_id).first()
    if not slot:
        raise NotFoundError("AvailabilitySlot", slot_id)
    return slot


def create_availability_slot(db: Session, payload: AvailabilitySlotCreate) -> Availability:
    user = get_default_user(db)
    _validate_timezone(payload.timezone)

    slot = Availability(
        user_id=user.id,
        day_of_week=payload.day_of_week,
        start_time=payload.start_time,
        end_time=payload.end_time,
        timezone=payload.timezone,
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    logger.info("Created availability slot id=%d day=%d", slot.id, slot.day_of_week)
    return slot


def update_availability_slot(db: Session, slot_id: int, payload: AvailabilitySlotUpdate) -> Availability:
    slot = get_availability_slot(db, slot_id)
    update_data = payload.model_dump(exclude_unset=True)

    if "timezone" in update_data:
        _validate_timezone(update_data["timezone"])

    for field, value in update_data.items():
        setattr(slot, field, value)

    db.commit()
    db.refresh(slot)
    logger.info("Updated availability slot id=%d", slot_id)
    return slot


def delete_availability_slot(db: Session, slot_id: int) -> None:
    slot = get_availability_slot(db, slot_id)
    db.delete(slot)
    db.commit()
    logger.info("Deleted availability slot id=%d", slot_id)


def bulk_set_availability(db: Session, payload: AvailabilityBulkSet) -> list[Availability]:
    user = get_default_user(db)

    for slot in payload.slots:
        _validate_timezone(slot.timezone)

    db.query(Availability).filter(Availability.user_id == user.id).delete()

    new_slots = [
        Availability(
            user_id=user.id,
            day_of_week=s.day_of_week,
            start_time=s.start_time,
            end_time=s.end_time,
            timezone=s.timezone,
        )
        for s in payload.slots
    ]
    db.add_all(new_slots)
    db.commit()

    for slot in new_slots:
        db.refresh(slot)

    logger.info("Bulk set %d availability slots for user_id=%d", len(new_slots), user.id)
    return new_slots


# =========================
# ✅🔥 NEW FUNCTION (FIX)
# =========================


from app.models.booking import Booking
from app.models.event_type import EventType
from app.services.event_type_service import get_event_type_by_slug


def get_available_slots_by_slug(db: Session, slug: str, date: str):
    """
    Returns slots using slug (frontend-friendly)
    """

    try:
        selected_date = datetime.strptime(date, "%Y-%m-%d").date()
    except Exception:
        raise ValidationError("Invalid date format. Use YYYY-MM-DD")

    # ✅ Get event type using slug
    event_type = get_event_type_by_slug(db, slug)

    if not event_type:
        raise NotFoundError("EventType", slug)

    duration = event_type.duration_minutes

    # ✅ Get user availability
    user = get_default_user(db)
    weekday = selected_date.weekday()

    availability = db.query(Availability).filter(
        Availability.user_id == user.id,
        Availability.day_of_week == weekday
    ).first()

    if not availability:
        return []

    # ✅ Create datetime range
    start_time = datetime.combine(selected_date, availability.start_time)
    end_time = datetime.combine(selected_date, availability.end_time)

    # ✅ Generate slots
    slots = []
    current = start_time

    while current + timedelta(minutes=duration) <= end_time:
        slots.append(current.strftime("%H:%M"))
        current += timedelta(minutes=duration)

    # ✅ Remove booked slots
    bookings = db.query(Booking).filter(
        Booking.event_type_id == event_type.id,
        Booking.start_time >= start_time,
        Booking.end_time <= end_time
    ).all()

    booked_times = [
        b.start_time.strftime("%H:%M") for b in bookings
    ]

    available_slots = [
        s for s in slots if s not in booked_times
    ]

    return available_slots