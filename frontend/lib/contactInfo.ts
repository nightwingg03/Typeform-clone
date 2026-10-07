import type { ContactInfoAnswer, ContactInfoConfig, Question } from "./types";
import { DEFAULT_CONTACT_INFO_CONFIG } from "./types";

export function contactConfigFromQuestion(question: Question): ContactInfoConfig {
  const c = question.config;
  if (
    "first_name_placeholder" in c &&
    typeof c.first_name_placeholder === "string"
  ) {
    return c as ContactInfoConfig;
  }
  return DEFAULT_CONTACT_INFO_CONFIG;
}

export function emptyContactAnswer(): ContactInfoAnswer {
  return {
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    company: "",
  };
}

export function contactAnswerFromValue(value: unknown): ContactInfoAnswer {
  if (!value || typeof value !== "object") return emptyContactAnswer();
  const v = value as Record<string, unknown>;
  return {
    first_name: typeof v.first_name === "string" ? v.first_name : "",
    last_name: typeof v.last_name === "string" ? v.last_name : "",
    phone: typeof v.phone === "string" ? v.phone : "",
    email: typeof v.email === "string" ? v.email : "",
    company: typeof v.company === "string" ? v.company : "",
  };
}

export function isContactAnswerEmpty(value: unknown): boolean {
  const a = contactAnswerFromValue(value);
  return !Object.values(a).some((s) => s.trim() !== "");
}
