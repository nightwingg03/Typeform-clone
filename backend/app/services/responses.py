"""Public submissions and creator-facing response results."""

from collections import defaultdict

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.domain import DomainError, validate_answer_value, validate_config
from app.models import Answer, Form, IdempotencyKey, Question, Response, utc_now
from app.schemas import (
    AnswerDetail,
    AnswerSubmit,
    ChoiceSummaryItem,
    FormSummary,
    RatingDistributionItem,
    ResponseCreated,
    ResponseDetail,
    ResponseListItem,
    ResponseListResponse,
    SummaryQuestion,
    format_utc_datetime,
)


def _response_created_for_key(
    db: Session, idempotency_key: str, form_id: int
) -> ResponseCreated:
    row = db.get(IdempotencyKey, idempotency_key)
    if row is None:
        raise DomainError("Idempotency-Key already used")
    if row.form_id != form_id:
        raise DomainError("Idempotency-Key already used")
    response = db.get(Response, row.response_id)
    if response is None:
        raise DomainError("Idempotency-Key already used")
    return ResponseCreated(
        id=response.id,
        submitted_at=format_utc_datetime(response.submitted_at),
    )


def submit_response(
    db: Session,
    slug: str,
    answers: list[AnswerSubmit],
    idempotency_key: str,
) -> ResponseCreated | None:
    form = db.scalar(
        select(Form)
        .where(Form.slug == slug, Form.status == "published")
        .options(selectinload(Form.questions))
    )
    if form is None:
        return None

    existing = db.get(IdempotencyKey, idempotency_key)
    if existing is not None:
        if existing.form_id == form.id:
            return _response_created_for_key(db, idempotency_key, form.id)
        raise DomainError("Idempotency-Key already used")

    questions = sorted(form.questions, key=lambda q: q.position)
    question_by_id = {q.id: q for q in questions}
    seen_ids: set[int] = set()
    stored: list[tuple] = []

    for item in answers:
        if item.question_id in seen_ids:
            raise DomainError("Duplicate question")
        seen_ids.add(item.question_id)

        question = question_by_id.get(item.question_id)
        if question is None:
            raise DomainError("Invalid question")

        try:
            normalized = validate_answer_value(
                question.type,
                question.config,
                question.required,
                item.value,
            )
        except DomainError:
            raise DomainError(question.title)

        if normalized is not None:
            stored.append((question, normalized))

    try:
        for question in questions:
            if question.required and question.id not in seen_ids:
                raise DomainError(question.title)

        now = utc_now()
        response = Response(form_id=form.id, submitted_at=now, completed=True)
        db.add(response)
        db.flush()

        for question, value in stored:
            db.add(
                Answer(
                    response_id=response.id,
                    question_id=question.id,
                    position=question.position,
                    question_title=question.title,
                    question_type=question.type,
                    value=value,
                )
            )

        db.add(
            IdempotencyKey(
                key=idempotency_key,
                form_id=form.id,
                response_id=response.id,
            )
        )
        db.commit()
        db.refresh(response)
        return ResponseCreated(
            id=response.id,
            submitted_at=format_utc_datetime(response.submitted_at),
        )
    except DomainError:
        db.rollback()
        raise
    except IntegrityError:
        db.rollback()
        row = db.get(IdempotencyKey, idempotency_key)
        if row is not None and row.form_id == form.id:
            response = db.get(Response, row.response_id)
            if response is not None:
                return ResponseCreated(
                    id=response.id,
                    submitted_at=format_utc_datetime(response.submitted_at),
                )
        raise DomainError("Idempotency-Key already used")


def _form_exists(db: Session, form_id: int) -> bool:
    return db.get(Form, form_id) is not None


def list_form_responses(db: Session, form_id: int) -> ResponseListResponse | None:
    if not _form_exists(db, form_id):
        return None

    rows = db.scalars(
        select(Response)
        .where(Response.form_id == form_id)
        .order_by(Response.submitted_at.desc())
    ).all()
    return ResponseListResponse(
        responses=[
            ResponseListItem(
                id=row.id,
                submitted_at=format_utc_datetime(row.submitted_at),
            )
            for row in rows
        ]
    )


def get_form_response(
    db: Session, form_id: int, response_id: int
) -> ResponseDetail | None:
    if not _form_exists(db, form_id):
        return None

    response = db.scalar(
        select(Response)
        .where(Response.id == response_id, Response.form_id == form_id)
        .options(selectinload(Response.answers))
    )
    if response is None:
        return None

    answers = sorted(response.answers, key=lambda a: a.position)
    return ResponseDetail(
        id=response.id,
        form_id=response.form_id,
        submitted_at=format_utc_datetime(response.submitted_at),
        answers=[
            AnswerDetail(
                question_id=answer.question_id,
                question_title=answer.question_title,
                question_type=answer.question_type,
                value=answer.value,
            )
            for answer in answers
        ],
    )


def get_form_summary(db: Session, form_id: int) -> FormSummary | None:
    if not _form_exists(db, form_id):
        return None

    form = db.scalar(
        select(Form)
        .where(Form.id == form_id)
        .options(selectinload(Form.questions))
    )
    if form is None:
        return None

    response_count = db.scalar(
        select(func.count()).select_from(Response).where(Response.form_id == form_id)
    ) or 0

    answers = db.scalars(
        select(Answer)
        .join(Response, Answer.response_id == Response.id)
        .where(Response.form_id == form_id)
    ).all()

    by_question: dict[int, list[Answer]] = defaultdict(list)
    for answer in answers:
        if answer.question_id is not None:
            by_question[answer.question_id].append(answer)

    summary_questions: list[SummaryQuestion] = []
    for question in sorted(form.questions, key=lambda q: q.position):
        q_answers = by_question.get(question.id, [])
        answered_count = len(q_answers)
        base = {
            "question_id": question.id,
            "position": question.position,
            "type": question.type,
            "title": question.title,
            "answered_count": answered_count,
        }

        if question.type in ("multiple_choice", "dropdown"):
            config = validate_config(question.type, question.config)
            counts: dict[str, int] = defaultdict(int)
            for answer in q_answers:
                if isinstance(answer.value, str):
                    counts[answer.value] += 1
            choices = [
                ChoiceSummaryItem(
                    id=choice["id"],
                    label=choice["label"],
                    count=counts.get(choice["id"], 0),
                )
                for choice in config["choices"]
            ]
            summary_questions.append(SummaryQuestion(**base, choices=choices))
        elif question.type == "yes_no":
            yes_count = sum(1 for a in q_answers if a.value is True)
            no_count = sum(1 for a in q_answers if a.value is False)
            summary_questions.append(
                SummaryQuestion(**base, yes_count=yes_count, no_count=no_count)
            )
        elif question.type == "rating":
            config = validate_config("rating", question.config)
            max_rating = config["max"]
            distribution_counts: dict[int, int] = defaultdict(int)
            total = 0
            for answer in q_answers:
                if isinstance(answer.value, int) and not isinstance(answer.value, bool):
                    distribution_counts[answer.value] += 1
                    total += answer.value
            average = (
                round(total / answered_count, 2) if answered_count > 0 else None
            )
            distribution = [
                RatingDistributionItem(
                    value=star,
                    count=distribution_counts.get(star, 0),
                )
                for star in range(1, max_rating + 1)
            ]
            summary_questions.append(
                SummaryQuestion(
                    **base,
                    average=average,
                    distribution=distribution,
                )
            )
        else:
            summary_questions.append(SummaryQuestion(**base))

    return FormSummary(
        form_id=form.id,
        response_count=response_count,
        questions=summary_questions,
    )
