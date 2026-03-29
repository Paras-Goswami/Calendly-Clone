from datetime import datetime, date, timedelta
import pytz
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.availability import Availability
from app.models.booking import Booking, BookingStatus
from app.models.event_type import EventType
from app.schemas.booking import BookingCreate, TimeSlot
from app.services.event_type_service import get_event_type_by_id, get_default_user
from app.utils.exceptions import NotFoundError, SlotUnavailableError, ValidationError
from app.utils.logging import get_logger

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _generate_slots(windows, duration, target_date):
    slots = []

    for window in windows:
        tz = pytz.timezone(window.timezone)

        start = tz.localize(
            datetime.combine(target_date, window.start_time)
        ).astimezone(pytz.utc)

        end = tz.localize(
            datetime.combine(target_date, window.end_time)
        ).astimezone(pytz.utc)

        current = start
        while current + timedelta(minutes=duration) <= end:
            slot_end = current + timedelta(minutes=duration)
            slots.append((current, slot_end))
            current = slot_end

    return slots


def _get_booked_slots(db, event_type_id, target_date):
    day_start = datetime(target_date.year, target_date.month, target_date.day, tzinfo=pytz.utc)
    day_end = day_start + timedelta(days=1)

    bookings = db.query(Booking).filter(
        Booking.event_type_id == event_type_id,
        Booking.status == BookingStatus.CONFIRMED,
        Booking.start_time >= day_start,
        Booking.start_time < day_end
    ).all()

    return [(b.start_time, b.end_time) for b in bookings]


def _filter_slots(all_slots, booked_slots):
    available = []

    for start, end in all_slots:
        conflict = any(
            not (end <= b_start or start >= b_end)
            for b_start, b_end in booked_slots
        )

        if not conflict:
            available.append(TimeSlot(start_time=start, end_time=end))

    return available


def _get_day_availability(db, user_id, day):
    return db.query(Availability).filter(
        Availability.user_id == user_id,
        Availability.day_of_week == day
    ).all()


# ---------------------------------------------------------------------------
# PUBLIC FUNCTIONS
# ---------------------------------------------------------------------------

def get_available_slots(db: Session, date: date, event_type_id: int):
    event_type = get_event_type_by_id(db, event_type_id)
    user = get_default_user(db)

    day = date.weekday()

    windows = _get_day_availability(db, user.id, day)

    if not windows:
        return {"slots": []}

    all_slots = _generate_slots(windows, event_type.duration_minutes, date)
    booked = _get_booked_slots(db, event_type.id, date)

    available = _filter_slots(all_slots, booked)

    return {"slots": available}


# ---------------------------------------------------------------------------
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.services.event_type_service import get_event_type_by_slug
from app.utils.exceptions import ValidationError


def create_booking(db: Session, slug: str, payload):
    # ✅ Get event type using slug
    event_type = get_event_type_by_slug(db, slug)

    if not event_type:
        raise ValidationError("Invalid event type")

    # ✅ Convert date + time
    try:
        start_datetime = datetime.strptime(
            f"{payload.date} {payload.start_time}",
            "%Y-%m-%d %H:%M:%S"
        )
    except:
        raise ValidationError("Invalid date/time format")

    duration = event_type.duration_minutes
    end_datetime = start_datetime + timedelta(minutes=duration)

    # ✅ Prevent double booking
    existing = db.query(Booking).filter(
        Booking.event_type_id == event_type.id,
        Booking.start_time < end_datetime,
        Booking.end_time > start_datetime
    ).first()

    if existing:
        raise ValidationError("This slot is already booked")

    # ✅ Create booking
    booking = Booking(
        event_type_id=event_type.id,
        invitee_name=payload.invitee_name,
        invitee_email=payload.invitee_email,
        notes=payload.notes,
        start_time=start_datetime,
        end_time=end_datetime,
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return booking
# ---------------------------------------------------------------------------

def list_upcoming_meetings(db: Session):
    now = datetime.now(pytz.utc)

    return db.query(Booking).filter(
        Booking.start_time >= now,
        Booking.status == BookingStatus.CONFIRMED
    ).order_by(Booking.start_time.asc()).all()


def list_past_meetings(db: Session):
    now = datetime.now(pytz.utc)

    return db.query(Booking).filter(
        Booking.start_time < now
    ).order_by(Booking.start_time.desc()).all()


def cancel_booking(db: Session, booking_id: int):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise NotFoundError("Booking not found")

    booking.status = BookingStatus.CANCELLED

    db.commit()
    db.refresh(booking)

    return booking


def get_booking_by_id(db: Session, booking_id: int):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise NotFoundError("Booking not found")

    return booking