/** Client-side answer checks; must match backend Phase 2 rules. */

import { isContactAnswerEmpty } from "./contactInfo";
import type { Question } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NUMBER_MAX = 999_999_999_999_999;

export function isEmptyAnswer(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (typeof value === "object" && !Array.isArray(value)) {
    return isContactAnswerEmpty(value);
  }
  return false;
}

export function validateAnswer(
  question: Question,
  value: unknown,
): string | null {
  const { type, required, config } = question;

  if (isEmptyAnswer(value)) {
    return required ? "Please fill this in" : null;
  }

  if (type === "short_text" || type === "long_text") {
    if (typeof value !== "string") return "Please fill this in";
    return null;
  }

  if (type === "email") {
    if (typeof value !== "string" || !EMAIL_PATTERN.test(value.trim())) {
      return "Enter a valid email";
    }
    return null;
  }

  if (type === "number") {
    if (typeof value === "boolean" || typeof value !== "number") {
      return "Enter a whole number from 1";
    }
    if (!Number.isInteger(value) || value < 1 || value > NUMBER_MAX) {
      return "Enter a whole number from 1";
    }
    return null;
  }

  if (type === "multiple_choice" || type === "dropdown") {
    if (typeof value !== "string") return "Choose an option";
    const choices =
      "choices" in config && Array.isArray(config.choices)
        ? config.choices
        : [];
    if (!choices.some((c) => c.id === value)) return "Choose an option";
    return null;
  }

  if (type === "yes_no") {
    if (typeof value !== "boolean") return "Please fill this in";
    return null;
  }

  if (type === "rating") {
    if (typeof value === "boolean" || typeof value !== "number") {
      return "Pick a rating";
    }
    const max =
      "max" in config && typeof config.max === "number" ? config.max : 5;
    if (!Number.isInteger(value) || value < 1 || value > max) {
      return "Pick a rating";
    }
    return null;
  }

  if (type === "contact_info") {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return "Please fill this in";
    }
    const v = value as Record<string, unknown>;
    const fields = ["first_name", "last_name", "phone", "email", "company"] as const;
    for (const key of fields) {
      if (typeof v[key] !== "string") return "Please fill this in";
    }
    const trimmed = fields.map((k) => (v[k] as string).trim());
    if (required && trimmed.some((s) => !s)) {
      return "Please fill this in";
    }
    const email = trimmed[3];
    if (email && !EMAIL_PATTERN.test(email)) {
      return "Enter a valid email";
    }
    if (required && !EMAIL_PATTERN.test(email)) {
      return "Enter a valid email";
    }
    return null;
  }

  return "Please fill this in";
}
