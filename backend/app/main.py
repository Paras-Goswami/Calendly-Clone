from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import engine, SessionLocal, Base
from app.db.seed import seed_default_user
from app.models import *  # registers all models

# Routers
from app.routers.event_types_router import router as event_types_router
from app.routers.availability_router import router as availability_router
from app.routers.booking_router import router as booking_router
from app.routers.meetings_router import router as meetings_router

from app.utils.logging import get_logger

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Schedulr API...")

    # Create tables
    Base.metadata.create_all(bind=engine)

    # Seed default user
    with SessionLocal() as db:
        seed_default_user(db)

    logger.info("Schedulr API is ready.")
    yield
    logger.info("Schedulr API shutting down.")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Schedulr API",
    description=(
        "A Calendly-like scheduling backend. "
        "Manage event types, set weekly availability, "
        "and let invitees book time slots."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS Configuration (FINAL)
# ---------------------------------------------------------------------------

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://calendly-clone.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Exception Handler
# ---------------------------------------------------------------------------

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception on %s %s", request.method, request.url)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred."},
    )

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(event_types_router)
app.include_router(availability_router)
app.include_router(booking_router)
app.include_router(meetings_router)

# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "service": "schedulr-api"}


@app.get("/", include_in_schema=False)
def root():
    return {
        "message": "Welcome to Schedulr API. Visit /docs for API docs."
    }