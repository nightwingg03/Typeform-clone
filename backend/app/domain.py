"""Pure validation for slugs, theme colors, question configs, answers, and publish rules."""

import re
from collections.abc import Callable
from typing import Any

from app.models import QUESTION_TYPES

CHOICE_ID_PATTERN = re.compile(r"^[a-zA-Z0-9_-]{1,32}$")
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
THEME_COLOR_PATTERN = re.compile(r"^#[0-9A-Fa-f]{6}$")

NUMBER_MAX = 999_999_999_999_999
SHORT_TEXT_MAX = 500
LONG_TEXT_MAX = 5000
PLACEHOLDER_MAX = 120
CHOICE_LABEL_MAX = 120

DEFAULT_CHOICES = [
    {"id": "a", "label": "Choice 1"},
    {"id": "b", "label": "Choice 2"},
]

CONTACT_INFO_KEYS = (
    "first_name_placeholder",
    "last_name_placeholder",
    "phone_placeholder",
    "email_placeholder",
    "company_placeholder",
)

CONTACT_ANSWER_KEYS = ("first_name", "last_name", "phone", "email", "company")

DEFAULT_CONTACT_INFO_CONFIG = {
    "first_name_placeholder": "Jane",
    "last_name_placeholder": "Smith",
    "phone_placeholder": "",
    "email_placeholder": "name@example.com",
    "company_placeholder": "Acme Corporation",
}


class DomainError(Exception):
    """Business rule violation; map to HTTP 422 or 409 in routers."""

    def __init__(self, detail: str) -> None:
        self.detail = detail
        super().__init__(detail)


def slug_from_title(title: str, slug_exists: Callable[[str], bool]) -> str:
    """Build a unique slug from a form title (create and duplicate only)."""
    raw = title.strip().lower()
    base = re.sub(r"[^a-z0-9]+", "-", raw).strip("-")
    if not base:
        base = "form"
    if len(base) > 70:
        base = base[:70].rstrip("-")

    if not slug_exists(base):
        return base

    for suffix_num in range(2, 100):
        suffix = f"-{suffix_num}"
        max_base = 80 - len(suffix)
        candidate = base[:max_base].rstrip("-") + suffix
        if not slug_exists(candidate):
            return candidate

    raise DomainError("Could not generate unique slug")


def normalize_theme_color(color: str) -> str:
    """Validate hex theme color and return uppercase storage form."""
    if not THEME_COLOR_PATTERN.fullmatch(color):
        raise DomainError("Invalid theme color")
    return color.upper()


def default_config_for_type(question_type: str) -> dict[str, Any]:
    """Default question config for a supported type."""
    if question_type not in QUESTION_TYPES:
        raise DomainError("Invalid question type")

    if question_type in ("short_text", "long_text", "email", "number"):
        return {"placeholder": ""}
    if question_type == "yes_no":
        return {}
    if question_type == "rating":
        return {"max": 5}
    if question_type in ("multiple_choice", "dropdown"):
        return {"choices": [dict(c) for c in DEFAULT_CHOICES]}
    if question_type == "contact_info":
        return dict(DEFAULT_CONTACT_INFO_CONFIG)
    raise DomainError("Invalid question type")


def validate_config(question_type: str, config: Any) -> dict[str, Any]:
    """Validate and normalize question config; reject unknown or missing keys."""
    if question_type not in QUESTION_TYPES:
        raise DomainError("Invalid question type")
    if not isinstance(config, dict):
        raise DomainError("Invalid config")

    if question_type in ("short_text", "long_text", "email", "number"):
        return _validate_text_config(config)
    if question_type == "yes_no":
        return _validate_yes_no_config(config)
    if question_type == "rating":
        return _validate_rating_config(config)
    if question_type in ("multiple_choice", "dropdown"):
        return _validate_choices_config(config)
    if question_type == "contact_info":
        return _validate_contact_info_config(config)
    raise DomainError("Invalid question type")


def _validate_text_config(config: dict[str, Any]) -> dict[str, str]:
    allowed = {"placeholder"}
    unknown = set(config.keys()) - allowed
    if unknown:
        raise DomainError("Invalid config")
    if "placeholder" not in config:
        raise DomainError("Invalid config")
    placeholder = config["placeholder"]
    if not isinstance(placeholder, str):
        raise DomainError("Invalid config")
    if len(placeholder) > PLACEHOLDER_MAX:
        raise DomainError("Invalid config")
    return {"placeholder": placeholder}


def _validate_yes_no_config(config: dict[str, Any]) -> dict[str, Any]:
    if config != {}:
        raise DomainError("Invalid config")
    return {}


def _validate_rating_config(config: dict[str, Any]) -> dict[str, int]:
    allowed = {"max"}
    unknown = set(config.keys()) - allowed
    if unknown:
        raise DomainError("Invalid config")
    if "max" not in config:
        raise DomainError("Invalid config")
    max_val = config["max"]
    if type(max_val) is bool or not isinstance(max_val, int):
        raise DomainError("Invalid config")
    if max_val < 3 or max_val > 10:
        raise DomainError("Invalid config")
    return {"max": max_val}


def _validate_choices_config(config: dict[str, Any]) -> dict[str, list[dict[str, str]]]:
    allowed = {"choices"}
    unknown = set(config.keys()) - allowed
    if unknown:
        raise DomainError("Invalid config")
    if "choices" not in config:
        raise DomainError("Invalid config")
    choices = config["choices"]
    if not isinstance(choices, list):
        raise DomainError("Invalid config")
    if len(choices) < 1 or len(choices) > 20:
        raise DomainError("Invalid config")

    seen_ids: set[str] = set()
    normalized: list[dict[str, str]] = []
    for item in choices:
        if not isinstance(item, dict):
            raise DomainError("Invalid config")
        if set(item.keys()) != {"id", "label"}:
            raise DomainError("Invalid config")
        choice_id = item["id"]
        label = item["label"]
        if not isinstance(choice_id, str) or not CHOICE_ID_PATTERN.fullmatch(choice_id):
            raise DomainError("Invalid config")
        if choice_id in seen_ids:
            raise DomainError("Invalid config")
        seen_ids.add(choice_id)
        if not isinstance(label, str):
            raise DomainError("Invalid config")
        stripped = label.strip()
        if len(stripped) < 1 or len(stripped) > CHOICE_LABEL_MAX:
            raise DomainError("Invalid config")
        normalized.append({"id": choice_id, "label": stripped})

    return {"choices": normalized}


def _validate_contact_info_config(config: dict[str, Any]) -> dict[str, str]:
    allowed = set(CONTACT_INFO_KEYS)
    unknown = set(config.keys()) - allowed
    if unknown:
        raise DomainError("Invalid config")
    if allowed - set(config.keys()):
        raise DomainError("Invalid config")
    normalized: dict[str, str] = {}
    for key in CONTACT_INFO_KEYS:
        val = config[key]
        if not isinstance(val, str):
            raise DomainError("Invalid config")
        if len(val) > PLACEHOLDER_MAX:
            raise DomainError("Invalid config")
        normalized[key] = val
    return normalized


def validate_answer_value(
    question_type: str,
    config: dict[str, Any],
    required: bool,
    value: Any,
) -> Any | None:
    """
    Validate a submitted answer for the question's current type and config.

    Returns the normalized value to store, or None when an optional answer should
    be omitted (empty text). Raises DomainError when invalid.
    """
    if question_type not in QUESTION_TYPES:
        raise DomainError("Invalid question")

    if type(value) is bool and question_type != "yes_no":
        raise DomainError("Invalid answer")

    if question_type == "short_text":
        return _validate_text_answer(value, required, SHORT_TEXT_MAX)
    if question_type == "long_text":
        return _validate_text_answer(value, required, LONG_TEXT_MAX)
    if question_type == "email":
        return _validate_email_answer(value, required)
    if question_type == "number":
        return _validate_number_answer(value, required)
    if question_type in ("multiple_choice", "dropdown"):
        return _validate_choice_answer(value, required, question_type, config)
    if question_type == "yes_no":
        return _validate_yes_no_answer(value, required)
    if question_type == "rating":
        return _validate_rating_answer(value, required, config)
    if question_type == "contact_info":
        return _validate_contact_info_answer(value, required)
    raise DomainError("Invalid question")


def _validate_text_answer(value: Any, required: bool, max_len: int) -> str | None:
    if value is None:
        if required:
            raise DomainError("Answer required")
        return None
    if not isinstance(value, str):
        raise DomainError("Invalid answer")
    trimmed = value.strip()
    if not trimmed:
        if required:
            raise DomainError("Answer required")
        return None
    if len(trimmed) > max_len:
        raise DomainError("Invalid answer")
    return trimmed


def _validate_email_answer(value: Any, required: bool) -> str | None:
    if value is None:
        if required:
            raise DomainError("Answer required")
        return None
    if not isinstance(value, str):
        raise DomainError("Invalid answer")
    trimmed = value.strip()
    if not trimmed:
        if required:
            raise DomainError("Answer required")
        return None
    if len(trimmed) > 254:
        raise DomainError("Invalid answer")
    if not EMAIL_PATTERN.fullmatch(trimmed):
        raise DomainError("Invalid answer")
    return trimmed


def _validate_number_answer(value: Any, required: bool) -> int | None:
    if value is None:
        if required:
            raise DomainError("Answer required")
        return None
    if type(value) is bool or not isinstance(value, int):
        raise DomainError("Invalid answer")
    if value < 1 or value > NUMBER_MAX:
        raise DomainError("Invalid answer")
    return value


def _validate_choice_answer(
    value: Any,
    required: bool,
    question_type: str,
    config: dict[str, Any],
) -> str | None:
    if value is None:
        if required:
            raise DomainError("Answer required")
        return None
    if not isinstance(value, str):
        raise DomainError("Invalid answer")
    if not value:
        if required:
            raise DomainError("Answer required")
        return None
    valid_config = validate_config(question_type, config)
    choice_ids = {c["id"] for c in valid_config["choices"]}
    if value not in choice_ids:
        raise DomainError("Invalid answer")
    return value


def _validate_yes_no_answer(value: Any, required: bool) -> bool | None:
    if value is None:
        if required:
            raise DomainError("Answer required")
        return None
    if type(value) is not bool:
        raise DomainError("Invalid answer")
    return value


def _validate_rating_answer(
    value: Any, required: bool, config: dict[str, Any]
) -> int | None:
    if value is None:
        if required:
            raise DomainError("Answer required")
        return None
    if type(value) is bool or not isinstance(value, int):
        raise DomainError("Invalid answer")
    rating_config = validate_config("rating", config)
    max_val = rating_config["max"]
    if value < 1 or value > max_val:
        raise DomainError("Invalid answer")
    return value


def _validate_contact_info_answer(value: Any, required: bool) -> dict[str, str] | None:
    if value is None:
        if required:
            raise DomainError("Answer required")
        return None
    if not isinstance(value, dict):
        raise DomainError("Invalid answer")
    if set(value.keys()) != set(CONTACT_ANSWER_KEYS):
        raise DomainError("Invalid answer")

    normalized: dict[str, str] = {}
    for key in CONTACT_ANSWER_KEYS:
        field = value[key]
        if not isinstance(field, str):
            raise DomainError("Invalid answer")
        normalized[key] = field.strip()

    if not any(normalized.values()):
        if required:
            raise DomainError("Answer required")
        return None

    if required:
        for key in CONTACT_ANSWER_KEYS:
            if not normalized[key]:
                raise DomainError("Answer required")

    email = normalized["email"]
    if email and not EMAIL_PATTERN.fullmatch(email):
        raise DomainError("Invalid answer")
    if required and not EMAIL_PATTERN.fullmatch(email):
        raise DomainError("Invalid answer")

    for key in ("first_name", "last_name", "phone", "company"):
        if normalized[key] and len(normalized[key]) > SHORT_TEXT_MAX:
            raise DomainError("Invalid answer")

    return normalized


def assert_can_publish(questions: list[Any]) -> None:
    """Raise DomainError when the form cannot be published."""
    if not questions:
        raise DomainError("Add a question before publishing")
    for question in questions:
        title = getattr(question, "title", None)
        if title is None or not str(title).strip():
            raise DomainError("Every question needs a title")
