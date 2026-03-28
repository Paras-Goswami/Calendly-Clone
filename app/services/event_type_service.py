from sqlalchemy.orm import Session
from sqlalchemy import func
import re

from app.models.event_type import EventType
from app.models.user import User
from app.schemas.event_type import EventTypeCreate, EventTypeUpdate
from app.utils.exceptions import NotFoundError, ConflictError
from app.utils.logging import get_logger

logger = get_logger(__name__)

from fastapi import HTTPException

def get_event_type_by_slug(db: Session, slug: str):
    event = db.query(EventType).filter(EventType.slug == slug).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    return event
def _generate_unique_slug(db: Session, base_slug: str, exclude_id: int | None = None) -> str:
    """Appends a numeric suffix to make a slug unique if needed."""
    slug = base_slug
    counter = 1
    while True:
        query = db.query(EventType).filter(EventType.slug == slug)
        if exclude_id:
            query = query.filter(EventType.id != exclude_id)
        if not query.first():
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1


def get_default_user(db: Session) -> User:
    user = db.query(User).first()
    if not user:
        raise NotFoundError("User", "default")
    return user


def create_event_type(db: Session, payload: EventTypeCreate) -> EventType:
    user = get_default_user(db)

    # Derive slug from name if not provided
    base_slug = payload.slug or re.sub(r"[^a-z0-9]+", "-", payload.name.lower()).strip("-")
    slug = _generate_unique_slug(db, base_slug)

    event_type = EventType(
        user_id=user.id,
        name=payload.name,
        slug=slug,
        duration_minutes=payload.duration_minutes,
        description=payload.description,
        is_active=payload.is_active,
    )
    db.add(event_type)
    db.commit()
    db.refresh(event_type)
    logger.info("Created event type id=%d slug=%s", event_type.id, event_type.slug)
    return event_type


def get_event_type_by_id(db: Session, event_type_id: int) -> EventType:
    et = db.query(EventType).filter(EventType.id == event_type_id).first()
    if not et:
        raise NotFoundError("EventType", event_type_id)
    return et


def get_event_type_by_slug(db: Session, slug: str) -> EventType:
    et = db.query(EventType).filter(EventType.slug == slug, EventType.is_active == True).first()
    if not et:
        raise NotFoundError("EventType", slug)
    return et


def list_event_types(db: Session, skip: int = 0, limit: int = 20) -> tuple[list[EventType], int]:
    user = get_default_user(db)
    query = db.query(EventType).filter(EventType.user_id == user.id)
    total = query.count()
    items = query.order_by(EventType.created_at.desc()).offset(skip).limit(limit).all()
    return items, total


def update_event_type(db: Session, event_type_id: int, payload: EventTypeUpdate) -> EventType:
    et = get_event_type_by_id(db, event_type_id)

    update_data = payload.model_dump(exclude_unset=True)

    if "slug" in update_data and update_data["slug"]:
        new_slug = _generate_unique_slug(db, update_data["slug"], exclude_id=et.id)
        update_data["slug"] = new_slug

    for field, value in update_data.items():
        setattr(et, field, value)

    db.commit()
    db.refresh(et)
    logger.info("Updated event type id=%d", et.id)
    return et


def delete_event_type(db: Session, event_type_id: int) -> None:
    et = get_event_type_by_id(db, event_type_id)
    db.delete(et)
    db.commit()
    logger.info("Deleted event type id=%d", event_type_id)