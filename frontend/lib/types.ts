/** API shapes matching the backend JSON responses. */

export const QUESTION_TYPES = [
  "short_text",
  "long_text",
  "multiple_choice",
  "dropdown",
  "email",
  "number",
  "yes_no",
  "rating",
  "contact_info",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export interface ContactInfoConfig {
  first_name_placeholder: string;
  last_name_placeholder: string;
  phone_placeholder: string;
  email_placeholder: string;
  company_placeholder: string;
}

export const DEFAULT_CONTACT_INFO_CONFIG: ContactInfoConfig = {
  first_name_placeholder: "Jane",
  last_name_placeholder: "Smith",
  phone_placeholder: "",
  email_placeholder: "name@example.com",
  company_placeholder: "Acme Corporation",
};

export interface ContactInfoAnswer {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  company: string;
}

export type QuestionConfig =
  | { placeholder: string }
  | { max: number }
  | { choices: { id: string; label: string }[] }
  | ContactInfoConfig
  | Record<string, never>;

export interface Question {
  id: number;
  position: number;
  type: QuestionType;
  title: string;
  description: string;
  required: boolean;
  config: QuestionConfig;
}

export interface FormListItem {
  id: number;
  title: string;
  slug: string;
  status: "draft" | "published";
  response_count: number;
  updated_at: string;
}

export interface FormListResponse {
  forms: FormListItem[];
}

export interface FormDetail {
  id: number;
  title: string;
  slug: string;
  status: "draft" | "published";
  theme_color: string;
  thank_you_title: string;
  thank_you_message: string;
  created_at: string;
  updated_at: string;
  response_count: number;
  questions: Question[];
}

export interface PublicFormDetail {
  title: string;
  slug: string;
  theme_color: string;
  thank_you_title: string;
  thank_you_message: string;
  questions: Question[];
}

export interface ResponseListItem {
  id: number;
  submitted_at: string;
}

export interface ResponseListResponse {
  responses: ResponseListItem[];
}

export interface AnswerDetail {
  question_id: number | null;
  question_title: string;
  question_type: QuestionType;
  value: string | number | boolean | ContactInfoAnswer;
}

export interface ResponseDetail {
  id: number;
  form_id: number;
  submitted_at: string;
  answers: AnswerDetail[];
}

export interface ChoiceSummaryItem {
  id: string;
  label: string;
  count: number;
}

export interface RatingDistributionItem {
  value: number;
  count: number;
}

export interface SummaryQuestion {
  question_id: number;
  position: number;
  type: QuestionType;
  title: string;
  answered_count: number;
  choices?: ChoiceSummaryItem[];
  yes_count?: number;
  no_count?: number;
  average?: number | null;
  distribution?: RatingDistributionItem[];
}

export interface FormSummary {
  form_id: number;
  response_count: number;
  questions: SummaryQuestion[];
}

export interface RespondentForm {
  title: string;
  theme_color: string;
  thank_you_title: string;
  thank_you_message: string;
  questions: Question[];
}
