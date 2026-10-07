"""FastAPI application entry."""

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exception_handlers import (
    http_exception_handler,
    request_validation_exception_handler,
)
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

from app.database import Base, SessionLocal, engine
from app.http_guards import body_too_large, rate_limit
from app.models import Answer, Form, IdempotencyKey, Question, Response  # noqa: F401
from app.routers.forms import router as forms_router
from app.routers.public import router as public_router
from app.routers.questions import router as questions_router
from app.routers.results import router as results_router
from app.seed import run_seed


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        run_seed(db)
    finally:
        db.close()
    yield


app = FastAPI(lifespan=lifespan, debug=False)


@app.middleware("http")
async def security_middleware(request: Request, call_next):
    blocked = body_too_large(request)
    if blocked is not None:
        blocked.headers["X-Content-Type-Options"] = "nosniff"
        return blocked
    blocked = rate_limit(request)
    if blocked is not None:
        blocked.headers["X-Content-Type-Options"] = "nosniff"
        return blocked
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        response = await http_exception_handler(request, exc)
    elif isinstance(exc, RequestValidationError):
        response = await request_validation_exception_handler(request, exc)
    else:
        response = JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forms_router, prefix="/api")
app.include_router(questions_router, prefix="/api")
app.include_router(public_router, prefix="/api")
app.include_router(results_router, prefix="/api")
