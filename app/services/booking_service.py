from datetime import datetime, date, timedelta
from zoneinfo import ZoneInfo

import pytz
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.models.availability import Availability
from app.models.booking import Booking, BookingStatus
from app.models.event_type import EventType
from app.schemas.booking import BookingCreate, TimeSlot, AvailableDateResponse
from app.services.event_type_service import get_event_type_by_slug, get_event_type_by_id, get_default_user
from app.utils.exceptions import NotFoundError, SlotUnavailableError, ValidationError
from app.utils.logging import get_logger

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _to_utc(dt: datetime, tz_name: str) -> datetime:
    """Convert a naive or tz-aware datetime to UTC."""
    tz = pytz.timezone(tz_name)
    if dt.tzinfo is None:
        dt = tz.localize(dt)
    return dt.astimezone(pytz.utc)


def _generate_slots(
    availability_windows: list[Availability],
    duration_minutes: int,
    target_date: date,
) -> list[tuple[datetime, datetime]]:
    """
    Given a list of availability windows for a specific day and a duration,
    produce all possible (start, end) UTC slots with no overlap.
    """
    slots = []
    for window in availability_windows:
        tz = pytz.timezone(window.timezone)

        # Build tz-aware start and end datetimes for this window on target_date
        window_start = tz.localize(
            datetime.combine(target_date, window.start_time)
        ).astimezone(pytz.utc)
        window_end = tz.localize(
            datetime.combine(target_date, window.end_time)
        ).astimezone(pytz.utc)

        slot_start = window_start
        while slot_start + timedelta(minutes=duration_minutes) <= window_end:
            slot_end = slot_start + timedelta(minutes=duration_minutes)
            slots.append((slot_start, slot_end))
            slot_start = slot_end  # non-overlapping; advance by full duration

    return slots


def _get_booked_slots_for_date(
    db: Session, event_type_id: int, target_date: date
) -> list[tuple[datetime, datetime]]:
    """Fetch confirmed bookings for an event type on a given UTC date."""
    day_start = datetime(target_date.year, target_date.month, target_date.day,
                         tzinfo=pytz.utc)
    day_end = day_start + timedelta(days=1)

    bookings = (
        db.query(Booking)
        .filter(
            Booking.event_type_id == event_type_id,
            Booking.status == BookingStatus.CONFIRMED,
            Booking.start_time >= day_start,
            Booking.start_time < day_end,
        )
        .all()
    )
    return [(b.start_time, b.end_time) for b in bookings]


def _filter_available_slots(
    all_slots: list[tuple[datetime, datetime]],
    booked: list[tuple[datetime, datetime]],
    now_utc: datetime,
) -> list[TimeSlot]:
    """Remove past and already-booked slots."""
    available = []
    for start, end in all_slots:
        if start <= now_utc:
            continue  # Skip slots in the past
        conflict = any(
            not (end <= b_start or start >= b_end)
            for b_start, b_end in booked
        )
        if not conflict:
            available.append(TimeSlot(start_time=start, end_time=end))
    return available


def _get_availability_for_day(
    db: Session, user_id: int, day_of_week: int
) -> list[Availability]:
    return (
        db.query(Availability)
        .filter(
            Availability.user_id == user_id,
            Availability.day_of_week == day_of_week,
        )
        .order_by(Availability.start_time)
        .all()
    )


# ---------------------------------------------------------------------------
# Public service functions
# ---------------------------------------------------------------------------

def get_available_dates(
    db: Session,
    event_type_slug: str,
    month: int,
    year: int,
) -> list[AvailableDateResponse]:
    """Return all dates in a given month that have at least one open slot."""
    et = get_event_type_by_slug(db, event_type_slug)
    user = get_default_user(db)
    now_utc = datetime.now(tz=pytz.utc)

    # Build date range for the requested month
    from calendar import monthrange
    _, days_in_month = monthrange(year, month)
    start_date = date(year, month, 1)
    end_date = date(year, month, days_in_month)

    available_dates = []
    current = start_date

    while current <= end_date:
        python_dow = current.weekday()  # 0=Monday
        windows = _get_availability_for_day(db, user.id, python_dow)

        if windows:
            all_slots = _generate_slots(windows, et.duration_minutes, current)
            booked = _get_booked_slots_for_date(db, et.id, current)
            open_slots = _filter_available_slots(all_slots, booked, now_utc)

            if open_slots:
                available_dates.append(
                    AvailableDateResponse(date=current, available_slots=len(open_slots))
                )

        current += timedelta(days=1)

    return available_dates


def get_available_slots(
    db: Session, event_type_slug: str, target_date: date
) -> list[TimeSlot]:
    """Return all open time slots for an event type on a specific date."""
    et = get_event_type_by_slug(db, event_type_slug)
    user = get_default_user(db)
    now_utc = datetime.now(tz=pytz.utc)

    python_dow = target_date.weekday()
    windows = _get_availability_for_day(db, user.id, python_dow)

    if not windows:
        return []

    all_slots = _generate_slots(windows, et.duration_minutes, target_date)
    booked = _get_booked_slots_for_date(db, et.id, target_date)
    return _filter_available_slots(all_slots, booked, now_utc)


def create_booking(
    db: Session, event_type_slug: str, payload: BookingCreate
) -> Booking:
    """
    Create a booking with optimistic locking to prevent double-booking.

    Strategy:
    1. Validate the slot is within availability windows.
    2. Use SELECT ... FOR UPDATE (row-level lock) on overlapping bookings.
    3. Re-check for conflicts inside the lock — if conflict exists, raise 409.
    4. Insert and commit.
    """
    et = get_event_type_by_slug(db, event_type_slug)

    start_utc = payload.start_time
    if start_utc.tzinfo is None:
        start_utc = start_utc.replace(tzinfo=pytz.utc)
    start_utc = start_utc.astimezone(pytz.utc)
    end_utc = start_utc + timedelta(minutes=et.duration_minutes)

    if start_utc <= datetime.now(tz=pytz.utc):
        raise ValidationError("Cannot book a slot in the past.")

    # --- Validate slot falls within user's availability ---
    user = get_default_user(db)
    python_dow = start_utc.astimezone(pytz.utc).date().weekday()
    windows = _get_availability_for_day(db, user.id, python_dow)
    all_slots = _generate_slots(windows, et.duration_minutes, start_utc.date())

    slot_valid = any(s == start_utc and e == end_utc for s, e in all_slots)
    if not slot_valid:
        raise ValidationError("The requested slot does not fall within available hours.")

    # --- Pessimistic lock: lock overlapping confirmed bookings ---
    # This prevents two concurrent requests from booking the same slot.
    overlapping = (
        db.query(Booking)
        .filter(
            Booking.event_type_id == et.id,
            Booking.status == BookingStatus.CONFIRMED,
            Booking.start_time < end_utc,
            Booking.end_time > start_utc,
        )
        .with_for_update()   # SELECT FOR UPDATE — acquires row-level lock
        .first()
    )

    if overlapping:
        raise SlotUnavailableError()

    booking = Booking(
        event_type_id=et.id,
        invitee_name=payload.invitee_name,
        invitee_email=payload.invitee_email,
        start_time=start_utc,
        end_time=end_utc,
        status=BookingStatus.CONFIRMED,
        notes=payload.notes,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    logger.info(
        "Booking confirmed id=%d event_type=%s start=%s invitee=%s",
        booking.id, event_type_slug, start_utc.isoformat(), payload.invitee_email,
    )
    return booking


def list_upcoming_meetings(
    db: Session, skip: int = 0, limit: int = 20
) -> tuple[list[Booking], int]:
    now_utc = datetime.now(tz=pytz.utc)
    query = (
        db.query(Booking)
        .filter(
            Booking.status == BookingStatus.CONFIRMED,
            Booking.start_time >= now_utc,
        )
        .order_by(Booking.start_time.asc())
    )
    total = query.count()
    return query.offset(skip).limit(limit).all(), total


def list_past_meetings(
    db: Session, skip: int = 0, limit: int = 20
) -> tuple[list[Booking], int]:
    now_utc = datetime.now(tz=pytz.utc)
    query = (
        db.query(Booking)
        .filter(Booking.start_time < now_utc)
        .order_by(Booking.start_time.desc())
    )
    total = query.count()
    return query.offset(skip).limit(limit).all(), total


def cancel_booking(db: Session, booking_id: int) -> Booking:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise NotFoundError("Booking", booking_id)

    if booking.status == BookingStatus.CANCELLED:
        raise ValidationError("Booking is already cancelled.")

    if booking.start_time <= datetime.now(tz=pytz.utc):
        raise ValidationError("Cannot cancel a meeting that has already started or passed.")

    booking.status = BookingStatus.CANCELLED
    db.commit()
    db.refresh(booking)
    logger.info("Cancelled booking id=%d", booking_id)
    return booking


def get_booking_by_id(db: Session, booking_id: int) -> Booking:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise NotFoundError("Booking", booking_id)
    return booking