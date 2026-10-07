"""Creator-facing response list, detail, and summary."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import FormSummary, ResponseDetail, ResponseListResponse
from app.services import responses as responses_service

router = APIRouter(prefix="/forms/{form_id}", tags=["results"])


@router.get("/responses", response_model=ResponseListResponse)
def list_responses(form_id: int, db: Session = Depends(get_db)) -> ResponseListResponse:
    result = responses_service.list_form_responses(db, form_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    return result


@router.get("/responses/{response_id}", response_model=ResponseDetail)
def get_response(
    form_id: int, response_id: int, db: Session = Depends(get_db)
) -> ResponseDetail:
    result = responses_service.get_form_response(db, form_id, response_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Response not found")
    return result


@router.get("/summary", response_model=FormSummary, response_model_exclude_none=True)
def get_summary(form_id: int, db: Session = Depends(get_db)) -> FormSummary:
    result = responses_service.get_form_summary(db, form_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    return result
