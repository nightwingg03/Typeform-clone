"""Initial demo data when the database has no forms."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Form
from app.schemas import AnswerSubmit
from app.services import forms as forms_service
from app.services import questions as questions_service
from app.services import responses as responses_service


def run_seed(db: Session) -> None:
    """Insert seed forms only when the forms table is empty."""
    form_count = db.scalar(select(func.count()).select_from(Form)) or 0
    if form_count > 0:
        return

    _seed_customer_feedback(db)
    _seed_event_registration(db)
    _seed_product_survey_draft(db)


def _seed_customer_feedback(db: Session) -> None:
    form = forms_service.create_form(db, "Customer feedback")
    form_id = form.id

    name_q = questions_service.create_question(db, form_id, "short_text")
    email_q = questions_service.create_question(db, form_id, "email")
    source_q = questions_service.create_question(db, form_id, "multiple_choice")
    rating_q = questions_service.create_question(db, form_id, "rating")
    extra_q = questions_service.create_question(db, form_id, "long_text")

    questions_service.update_question(
        db, form_id, name_q.id, title="Your name", required=True
    )
    questions_service.update_question(
        db, form_id, email_q.id, title="Your email", required=True
    )
    questions_service.update_question(
        db,
        form_id,
        source_q.id,
        title="How did you hear about us?",
        required=True,
        config={
            "choices": [
                {"id": "a", "label": "Search"},
                {"id": "b", "label": "Friend"},
                {"id": "c", "label": "Ad"},
            ]
        },
    )
    questions_service.update_question(
        db,
        form_id,
        rating_q.id,
        title="Rate your experience",
        required=True,
        config={"max": 5},
    )
    questions_service.update_question(
        db,
        form_id,
        extra_q.id,
        title="Anything else?",
        required=False,
    )

    forms_service.publish_form(db, form_id)
    published = forms_service.get_form(db, form_id)
    if published is None:
        raise RuntimeError("Seed failed: customer feedback form missing")

    by_title = {q.title: q.id for q in published.questions}
    submissions = [
        [
            ("Your name", "Ada"),
            ("Your email", "ada@example.com"),
            ("How did you hear about us?", "a"),
            ("Rate your experience", 5),
            ("Anything else?", "Great"),
        ],
        [
            ("Your name", "Ben"),
            ("Your email", "ben@example.com"),
            ("How did you hear about us?", "a"),
            ("Rate your experience", 4),
        ],
        [
            ("Your name", "Cam"),
            ("Your email", "cam@example.com"),
            ("How did you hear about us?", "b"),
            ("Rate your experience", 3),
            ("Anything else?", "Ok"),
        ],
    ]
    for i, rows in enumerate(submissions):
        answers = [
            AnswerSubmit(question_id=by_title[title], value=value)
            for title, value in rows
        ]
        responses_service.submit_response(
            db,
            published.slug,
            answers,
            idempotency_key=f"seed-customer-feedback-{i}",
        )


def _seed_event_registration(db: Session) -> None:
    form = forms_service.create_form(db, "Event registration")
    form_id = form.id

    attend_q = questions_service.create_question(db, form_id, "yes_no")
    meal_q = questions_service.create_question(db, form_id, "dropdown")
    size_q = questions_service.create_question(db, form_id, "number")
    notes_q = questions_service.create_question(db, form_id, "short_text")

    questions_service.update_question(
        db, form_id, attend_q.id, title="Will you attend?", required=True
    )
    questions_service.update_question(
        db,
        form_id,
        meal_q.id,
        title="Meal",
        required=True,
        config={
            "choices": [
                {"id": "veg", "label": "Vegetarian"},
                {"id": "chicken", "label": "Chicken"},
            ]
        },
    )
    questions_service.update_question(
        db, form_id, size_q.id, title="Party size", required=True
    )
    questions_service.update_question(
        db, form_id, notes_q.id, title="Notes", required=False
    )

    forms_service.publish_form(db, form_id)
    published = forms_service.get_form(db, form_id)
    if published is None:
        raise RuntimeError("Seed failed: event registration form missing")

    by_title = {q.title: q.id for q in published.questions}
    submissions = [
        [
            ("Will you attend?", True),
            ("Meal", "veg"),
            ("Party size", 2),
            ("Notes", "Window"),
        ],
        [
            ("Will you attend?", False),
            ("Meal", "chicken"),
            ("Party size", 1),
        ],
    ]
    for i, rows in enumerate(submissions):
        answers = [
            AnswerSubmit(question_id=by_title[title], value=value)
            for title, value in rows
        ]
        responses_service.submit_response(
            db,
            published.slug,
            answers,
            idempotency_key=f"seed-event-registration-{i}",
        )


def _seed_product_survey_draft(db: Session) -> None:
    form = forms_service.create_form(db, "Product survey draft")
    form_id = form.id
    question = questions_service.create_question(db, form_id, "short_text")
    questions_service.update_question(
        db,
        form_id,
        question.id,
        title="First question",
        required=False,
    )
