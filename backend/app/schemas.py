"""Pydantic request and response models."""

from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, ConfigDict, field_validator

from app.models import QUESTION_TYPES


def _strip_title(value: str) -> str:
    stripped = value.strip()
    if not stripped:
        raise ValueError("Title cannot be empty")
    if len(stripped) > 200:
        raise ValueError("Title is too long")
    return stripped


def _strip_thank_you_title(value: str) -> str:
    stripped = value.strip()
    if not stripped:
        raise ValueError("Thank-you title cannot be empty")
    if len(stripped) > 200:
        raise ValueError("Thank-you title is too long")
    return stripped


def _strip_thank_you_message(value: str) -> str:
    if len(value) > 1000:
        raise ValueError("Thank-you message is too long")
    return value


class FormCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        return _strip_title(value)


class FormPatch(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str | None = None
    theme_color: str | None = None
    thank_you_title: str | None = None
    thank_you_message: str | None = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return _strip_title(value)

    @field_validator("thank_you_title")
    @classmethod
    def validate_thank_you_title(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return _strip_thank_you_title(value)

    @field_validator("thank_you_message")
    @classmethod
    def validate_thank_you_message(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return _strip_thank_you_message(value)


class QuestionCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: str

    @field_validator("type")
    @classmethod
    def validate_type(cls, value: str) -> str:
        if value not in QUESTION_TYPES:
            raise ValueError("Invalid question type")
        return value


class QuestionPatch(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str | None = None
    description: str | None = None
    required: bool | None = None
    type: str | None = None
    config: dict[str, Any] | None = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return _strip_title(value)

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str | None) -> str | None:
        if value is None:
            return None
        if len(value) > 1000:
            raise ValueError("Description is too long")
        return value

    @field_validator("type")
    @classmethod
    def validate_type(cls, value: str | None) -> str | None:
        if value is None:
            return None
        if value not in QUESTION_TYPES:
            raise ValueError("Invalid question type")
        return value


class QuestionReorder(BaseModel):
    model_config = ConfigDict(extra="forbid")

    question_ids: list[int]


class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    position: int
    type: str
    title: str
    description: str
    required: bool
    config: dict[str, Any]


class FormListItem(BaseModel):
    id: int
    title: str
    slug: str
    status: str
    response_count: int
    updated_at: str


class FormListResponse(BaseModel):
    forms: list[FormListItem]


class FormDetail(BaseModel):
    id: int
    title: str
    slug: str
    status: str
    theme_color: str
    thank_you_title: str
    thank_you_message: str
    created_at: str
    updated_at: str
    response_count: int
    questions: list[QuestionOut]


class PublicFormDetail(BaseModel):
    title: str
    slug: str
    theme_color: str
    thank_you_title: str
    thank_you_message: str
    questions: list[QuestionOut]


class AnswerSubmit(BaseModel):
    model_config = ConfigDict(extra="forbid")

    question_id: int
    value: Any


class ResponseSubmit(BaseModel):
    model_config = ConfigDict(extra="forbid")

    answers: list[AnswerSubmit]


class ResponseCreated(BaseModel):
    id: int
    submitted_at: str


class ResponseListItem(BaseModel):
    id: int
    submitted_at: str


class ResponseListResponse(BaseModel):
    responses: list[ResponseListItem]


class AnswerDetail(BaseModel):
    question_id: int | None
    question_title: str
    question_type: str
    value: Any


class ResponseDetail(BaseModel):
    id: int
    form_id: int
    submitted_at: str
    answers: list[AnswerDetail]


class ChoiceSummaryItem(BaseModel):
    id: str
    label: str
    count: int


class RatingDistributionItem(BaseModel):
    value: int
    count: int


class SummaryQuestion(BaseModel):
    question_id: int
    position: int
    type: str
    title: str
    answered_count: int
    choices: list[ChoiceSummaryItem] | None = None
    yes_count: int | None = None
    no_count: int | None = None
    average: float | None = None
    distribution: list[RatingDistributionItem] | None = None


class FormSummary(BaseModel):
    form_id: int
    response_count: int
    questions: list[SummaryQuestion]


def format_utc_datetime(value: datetime) -> str:
    """Serialize a UTC datetime as ISO-8601 with a Z suffix."""
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
