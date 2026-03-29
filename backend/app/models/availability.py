from sqlalchemy import Column, Integer, String, Time, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class Availability(Base):
    """
    Stores weekly recurring availability windows per day-of-week.
    Multiple rows allowed for the same day (e.g. 09:00-12:00 and 14:00-17:00).
    """
    __tablename__ = "availability"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # 0=Monday … 6=Sunday  (Python weekday convention)
    day_of_week = Column(Integer, nullable=False)

    start_time = Column(Time, nullable=False)   # e.g. 09:00
    end_time = Column(Time, nullable=False)     # e.g. 17:00
    timezone = Column(String(50), nullable=False, default="UTC")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="availabilities")