from sqlalchemy.orm import Session
from app.models.user import User
from app.utils.logging import get_logger

logger = get_logger(__name__)


def seed_default_user(db: Session) -> None:
    """Ensure exactly one default user exists. Idempotent."""
    existing = db.query(User).first()
    if not existing:
        user = User(
            name="Default User",
            email="user@schedulr.com",
            timezone="UTC",
        )
        db.add(user)
        db.commit()
        logger.info("Seeded default user (id=1)")
    else:
        logger.info("Default user already exists (id=%d)", existing.id)