from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SAEnum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.session import Base


class BookingStatus(str, enum.Enum):
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    event_type_id = Column(Integer, ForeignKey("event_types.id", ondelete="CASCADE"), nullable=False, index=True)

    # Invitee details
    invitee_name = Column(String(150), nullable=False)
    invitee_email = Column(String(255), nullable=False, index=True)

    # Slot stored in UTC — display layer converts to user/invitee tz
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)

    status = Column(SAEnum(BookingStatus), default=BookingStatus.CONFIRMED, nullable=False, index=True)
    notes = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    event_type = relationship("EventType", back_populates="bookings")

    # Composite index: fast lookup for conflict detection
    __table_args__ = (
        Index("ix_bookings_event_type_start_status", "event_type_id", "start_time", "status"),
        Index("ix_bookings_start_end", "start_time", "end_time"),
    )