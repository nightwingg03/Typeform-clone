"""Form list, create, read, update, delete, and duplicate."""

import copy

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.domain import DomainError, assert_can_publish, normalize_theme_color, slug_from_title
from app.models import Form, Question, utc_now
from app.schemas import FormDetail, FormListItem, PublicFormDetail, QuestionOut, format_utc_datetime

COPY_SUFFIX = " (copy)"


def _slug_exists(db: Session, slug: str) -> bool:
    return db.scalar(select(Form.id).where(Form.slug == slug)) is not None


def _response_count(db: Session, form_id: int) -> int:
    from app.models import Response

    return db.scalar(
        select(func.count()).select_from(Response).where(Response.form_id == form_id)
    ) or 0


def _duplicate_title(title: str) -> str:
    candidate = f"{title}{COPY_SUFFIX}"
    if len(candidate) <= 200:
        return candidate
    keep = 200 - len(COPY_SUFFIX)
    return f"{title[:keep]}{COPY_SUFFIX}"


def _form_to_list_item(db: Session, form: Form) -> FormListItem:
    return FormListItem(
        id=form.id,
        title=form.title,
        slug=form.slug,
        status=form.status,
        response_count=_response_count(db, form.id),
        updated_at=format_utc_datetime(form.updated_at),
    )


def _form_to_detail(db: Session, form: Form) -> FormDetail:
    questions = sorted(form.questions, key=lambda q: q.position)
    return FormDetail(
        id=form.id,
        title=form.title,
        slug=form.slug,
        status=form.status,
        theme_color=form.theme_color,
        thank_you_title=form.thank_you_title,
        thank_you_message=form.thank_you_message,
        created_at=format_utc_datetime(form.created_at),
        updated_at=format_utc_datetime(form.updated_at),
        response_count=_response_count(db, form.id),
        questions=[
            QuestionOut(
                id=q.id,
                position=q.position,
                type=q.type,
                title=q.title,
                description=q.description,
                required=q.required,
                config=q.config,
            )
            for q in questions
        ],
    )


def _load_form(db: Session, form_id: int) -> Form | None:
    return db.scalar(
        select(Form)
        .where(Form.id == form_id)
        .options(selectinload(Form.questions))
    )


def list_forms(db: Session) -> list[FormListItem]:
    forms = db.scalars(select(Form).order_by(Form.updated_at.desc())).all()
    return [_form_to_list_item(db, form) for form in forms]


def create_form(db: Session, title: str) -> FormDetail:
    slug = slug_from_title(title, lambda s: _slug_exists(db, s))
    now = utc_now()
    form = Form(
        title=title,
        slug=slug,
        status="draft",
        created_at=now,
        updated_at=now,
    )
    db.add(form)
    db.commit()
    db.refresh(form)
    return _form_to_detail(db, form)


def get_form(db: Session, form_id: int) -> FormDetail | None:
    form = _load_form(db, form_id)
    if form is None:
        return None
    return _form_to_detail(db, form)


def update_form(
    db: Session,
    form_id: int,
    *,
    title: str | None = None,
    theme_color: str | None = None,
    thank_you_title: str | None = None,
    thank_you_message: str | None = None,
) -> FormDetail | None:
    form = _load_form(db, form_id)
    if form is None:
        return None

    if title is not None:
        form.title = title
    if theme_color is not None:
        form.theme_color = normalize_theme_color(theme_color)
    if thank_you_title is not None:
        form.thank_you_title = thank_you_title
    if thank_you_message is not None:
        form.thank_you_message = thank_you_message

    form.updated_at = utc_now()
    db.commit()
    db.refresh(form)
    return _form_to_detail(db, form)


def delete_form(db: Session, form_id: int) -> bool:
    form = db.get(Form, form_id)
    if form is None:
        return False
    db.delete(form)
    db.commit()
    return True


def publish_form(db: Session, form_id: int) -> FormDetail | None:
    form = _load_form(db, form_id)
    if form is None:
        return None

    if form.status != "published":
        # Publish gate: at least one question and every title non-empty after strip.
        assert_can_publish(form.questions)
        form.status = "published"
        form.updated_at = utc_now()
        db.commit()
        db.refresh(form)

    return _form_to_detail(db, form)


def unpublish_form(db: Session, form_id: int) -> FormDetail | None:
    form = _load_form(db, form_id)
    if form is None:
        return None

    if form.status != "draft":
        form.status = "draft"
        form.updated_at = utc_now()
        db.commit()
        db.refresh(form)

    return _form_to_detail(db, form)


def get_public_form_by_slug(db: Session, slug: str) -> PublicFormDetail | None:
    form = db.scalar(
        select(Form)
        .where(Form.slug == slug, Form.status == "published")
        .options(selectinload(Form.questions))
    )
    if form is None:
        return None

    questions = sorted(form.questions, key=lambda q: q.position)
    return PublicFormDetail(
        title=form.title,
        slug=form.slug,
        theme_color=form.theme_color,
        thank_you_title=form.thank_you_title,
        thank_you_message=form.thank_you_message,
        questions=[
            QuestionOut(
                id=q.id,
                position=q.position,
                type=q.type,
                title=q.title,
                description=q.description,
                required=q.required,
                config=q.config,
            )
            for q in questions
        ],
    )


def duplicate_form(db: Session, form_id: int) -> FormDetail | None:
    form = _load_form(db, form_id)
    if form is None:
        return None

    new_title = _duplicate_title(form.title)
    slug = slug_from_title(new_title, lambda s: _slug_exists(db, s))
    now = utc_now()
    copy_form = Form(
        title=new_title,
        slug=slug,
        status="draft",
        theme_color=form.theme_color,
        thank_you_title=form.thank_you_title,
        thank_you_message=form.thank_you_message,
        created_at=now,
        updated_at=now,
    )
    db.add(copy_form)
    db.flush()

    for question in sorted(form.questions, key=lambda q: q.position):
        db.add(
            Question(
                form_id=copy_form.id,
                position=question.position,
                type=question.type,
                title=question.title,
                description=question.description,
                required=question.required,
                config=copy.deepcopy(question.config),
            )
        )

    db.commit()
    loaded = _load_form(db, copy_form.id)
    if loaded is None:
        raise DomainError("Form not found")
    return _form_to_detail(db, loaded)
