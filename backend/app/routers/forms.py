"""HTTP routes for form CRUD and duplicate."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.domain import DomainError
from app.schemas import FormCreate, FormDetail, FormListResponse, FormPatch
from app.services import forms as forms_service

router = APIRouter(prefix="/forms", tags=["forms"])


def _raise_domain_error(exc: DomainError) -> None:
    if exc.detail == "Could not generate unique slug":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=exc.detail)
    raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=exc.detail)


@router.get("", response_model=FormListResponse)
def list_forms(db: Session = Depends(get_db)) -> FormListResponse:
    return FormListResponse(forms=forms_service.list_forms(db))


@router.post("", response_model=FormDetail, status_code=status.HTTP_201_CREATED)
def create_form(body: FormCreate, db: Session = Depends(get_db)) -> FormDetail:
    try:
        return forms_service.create_form(db, body.title)
    except DomainError as exc:
        _raise_domain_error(exc)


@router.get("/{form_id}", response_model=FormDetail)
def get_form(form_id: int, db: Session = Depends(get_db)) -> FormDetail:
    form = forms_service.get_form(db, form_id)
    if form is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    return form


@router.patch("/{form_id}", response_model=FormDetail)
def patch_form(
    form_id: int, body: FormPatch, db: Session = Depends(get_db)
) -> FormDetail:
    if (
        body.title is None
        and body.theme_color is None
        and body.thank_you_title is None
        and body.thank_you_message is None
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No fields to update",
        )

    try:
        form = forms_service.update_form(
            db,
            form_id,
            title=body.title,
            theme_color=body.theme_color,
            thank_you_title=body.thank_you_title,
            thank_you_message=body.thank_you_message,
        )
    except DomainError as exc:
        _raise_domain_error(exc)

    if form is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    return form


@router.delete("/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_form(form_id: int, db: Session = Depends(get_db)) -> Response:
    if not forms_service.delete_form(db, form_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{form_id}/publish", response_model=FormDetail)
def publish_form(form_id: int, db: Session = Depends(get_db)) -> FormDetail:
    try:
        form = forms_service.publish_form(db, form_id)
    except DomainError as exc:
        _raise_domain_error(exc)

    if form is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    return form


@router.post("/{form_id}/unpublish", response_model=FormDetail)
def unpublish_form(form_id: int, db: Session = Depends(get_db)) -> FormDetail:
    form = forms_service.unpublish_form(db, form_id)
    if form is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    return form


@router.post("/{form_id}/duplicate", response_model=FormDetail, status_code=status.HTTP_201_CREATED)
def duplicate_form(form_id: int, db: Session = Depends(get_db)) -> FormDetail:
    try:
        form = forms_service.duplicate_form(db, form_id)
    except DomainError as exc:
        _raise_domain_error(exc)

    if form is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    return form
