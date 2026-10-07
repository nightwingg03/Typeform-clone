"""Public form read routes (no authentication)."""

import re

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.domain import DomainError
from app.schemas import PublicFormDetail, ResponseCreated, ResponseSubmit
from app.services import forms as forms_service
from app.services import responses as responses_service

router = APIRouter(prefix="/public", tags=["public"])

UUID_PATTERN = re.compile(
    r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
)


def _parse_idempotency_key(raw: str | None) -> str:
    if raw is None or not raw.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Idempotency-Key header is required",
        )
    key = raw.strip()
    if not UUID_PATTERN.fullmatch(key):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Idempotency-Key must be a UUID",
        )
    return key.lower()


@router.get("/forms/{slug}", response_model=PublicFormDetail)
def get_public_form(slug: str, db: Session = Depends(get_db)) -> PublicFormDetail:
    form = forms_service.get_public_form_by_slug(db, slug)
    if form is None:
        # Draft and missing slugs both return the same 404 so drafts are not enumerable.
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    return form


@router.post(
    "/forms/{slug}/responses",
    response_model=ResponseCreated,
    status_code=status.HTTP_201_CREATED,
)
def submit_response(
    slug: str,
    body: ResponseSubmit,
    db: Session = Depends(get_db),
    idempotency_key_header: str | None = Header(default=None, alias="Idempotency-Key"),
) -> ResponseCreated:
    idempotency_key = _parse_idempotency_key(idempotency_key_header)
    try:
        result = responses_service.submit_response(
            db, slug, body.answers, idempotency_key
        )
    except DomainError as exc:
        if exc.detail == "Idempotency-Key already used":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=exc.detail,
            )
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=exc.detail,
        )

    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    return result
