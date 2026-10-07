"""HTTP routes for questions on a form."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.domain import DomainError
from app.models import Form
from app.schemas import QuestionCreate, QuestionOut, QuestionPatch, QuestionReorder
from app.services import questions as questions_service

router = APIRouter(prefix="/forms/{form_id}/questions", tags=["questions"])


def _ensure_form(db: Session, form_id: int) -> None:
    if db.get(Form, form_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")


def _raise_domain_error(exc: DomainError) -> None:
    raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=exc.detail)


@router.post("", response_model=QuestionOut, status_code=status.HTTP_201_CREATED)
def create_question(
    form_id: int, body: QuestionCreate, db: Session = Depends(get_db)
) -> QuestionOut:
    _ensure_form(db, form_id)
    try:
        question = questions_service.create_question(db, form_id, body.type)
    except DomainError as exc:
        _raise_domain_error(exc)

    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    return question


@router.put("/reorder", response_model=list[QuestionOut])
def reorder_questions(
    form_id: int, body: QuestionReorder, db: Session = Depends(get_db)
) -> list[QuestionOut]:
    _ensure_form(db, form_id)
    try:
        result = questions_service.reorder_questions(db, form_id, body.question_ids)
    except DomainError as exc:
        _raise_domain_error(exc)

    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    return result


@router.patch("/{question_id}", response_model=QuestionOut)
def patch_question(
    form_id: int,
    question_id: int,
    body: QuestionPatch,
    db: Session = Depends(get_db),
) -> QuestionOut:
    _ensure_form(db, form_id)
    try:
        question = questions_service.update_question(
            db,
            form_id,
            question_id,
            title=body.title,
            description=body.description,
            required=body.required,
            question_type=body.type,
            config=body.config,
        )
    except DomainError as exc:
        _raise_domain_error(exc)

    if question is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return question


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(
    form_id: int, question_id: int, db: Session = Depends(get_db)
) -> Response:
    _ensure_form(db, form_id)
    if not questions_service.delete_question(db, form_id, question_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
