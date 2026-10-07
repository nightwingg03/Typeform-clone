"""Question create, update, delete, and reorder."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.domain import DomainError, default_config_for_type, validate_config
from app.models import Form, Question
from app.schemas import QuestionOut

MAX_QUESTIONS = 50
REORDER_DETAIL = "Question order must include each question once"

TYPE_LABELS: dict[str, str] = {
    "short_text": "Short text",
    "long_text": "Long text",
    "multiple_choice": "Multiple choice",
    "dropdown": "Dropdown",
    "email": "Email",
    "number": "Number",
    "yes_no": "Yes/No",
    "rating": "Rating",
    "contact_info": "Contact Info",
}


def _to_out(question: Question) -> QuestionOut:
    return QuestionOut(
        id=question.id,
        position=question.position,
        type=question.type,
        title=question.title,
        description=question.description,
        required=question.required,
        config=question.config,
    )


def _form_exists(db: Session, form_id: int) -> bool:
    return db.get(Form, form_id) is not None


def _get_question_on_form(db: Session, form_id: int, question_id: int) -> Question | None:
    return db.scalar(
        select(Question).where(
            Question.id == question_id,
            Question.form_id == form_id,
        )
    )


def create_question(db: Session, form_id: int, question_type: str) -> QuestionOut | None:
    if not _form_exists(db, form_id):
        return None

    count = db.scalar(
        select(func.count()).select_from(Question).where(Question.form_id == form_id)
    ) or 0
    if count >= MAX_QUESTIONS:
        raise DomainError("A form can have at most 50 questions")

    config = default_config_for_type(question_type)
    question = Question(
        form_id=form_id,
        position=count,
        type=question_type,
        title=TYPE_LABELS[question_type],
        description="",
        required=False,
        config=config,
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    return _to_out(question)


def update_question(
    db: Session,
    form_id: int,
    question_id: int,
    *,
    title: str | None = None,
    description: str | None = None,
    required: bool | None = None,
    question_type: str | None = None,
    config: dict | None = None,
) -> QuestionOut | None:
    if not _form_exists(db, form_id):
        return None

    question = _get_question_on_form(db, form_id, question_id)
    if question is None:
        return None

    new_type = question_type if question_type is not None else question.type

    if question_type is not None:
        question.type = question_type
        if config is None:
            question.config = default_config_for_type(question_type)
        else:
            question.config = validate_config(new_type, config)
    elif config is not None:
        question.config = validate_config(question.type, config)

    if title is not None:
        question.title = title
    if description is not None:
        question.description = description
    if required is not None:
        question.required = required

    db.commit()
    db.refresh(question)
    return _to_out(question)


def delete_question(db: Session, form_id: int, question_id: int) -> bool:
    if not _form_exists(db, form_id):
        return False

    question = _get_question_on_form(db, form_id, question_id)
    if question is None:
        return False

    db.delete(question)
    db.flush()

    remaining = db.scalars(
        select(Question)
        .where(Question.form_id == form_id)
        .order_by(Question.position)
    ).all()
    for index, item in enumerate(remaining):
        item.position = index

    db.commit()
    return True


def reorder_questions(
    db: Session, form_id: int, question_ids: list[int]
) -> list[QuestionOut] | None:
    if not _form_exists(db, form_id):
        return None

    questions = db.scalars(
        select(Question).where(Question.form_id == form_id).order_by(Question.position)
    ).all()
    existing_ids = {q.id for q in questions}
    requested = list(question_ids)

    if len(requested) != len(existing_ids):
        raise DomainError(REORDER_DETAIL)
    if len(set(requested)) != len(requested):
        raise DomainError(REORDER_DETAIL)
    if set(requested) != existing_ids:
        raise DomainError(REORDER_DETAIL)

    id_to_question = {q.id: q for q in questions}
    ordered = [id_to_question[qid] for qid in requested]

    for question in questions:
        question.position = question.position + 1000
    db.flush()

    for index, question in enumerate(ordered):
        question.position = index

    db.commit()

    return [_to_out(q) for q in ordered]
