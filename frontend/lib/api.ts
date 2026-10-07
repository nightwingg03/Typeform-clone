/** HTTP client for `/api` routes (proxied to the backend). */

import type {
  FormDetail,
  FormListResponse,
  FormSummary,
  PublicFormDetail,
  Question,
  QuestionType,
  ResponseDetail,
  ResponseListResponse,
} from "./types";

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: HeadersInit = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  const response = await fetch(path, { ...options, headers });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const body = (await response.json()) as { detail?: string | unknown };
      if (typeof body.detail === "string") {
        message = body.detail;
      } else if (body.detail) {
        message = JSON.stringify(body.detail);
      }
    } catch {
      /* use default message */
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  listForms: () => request<FormListResponse>("/api/forms"),

  createForm: (title: string) =>
    request<FormDetail>("/api/forms", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),

  getForm: (id: number) => request<FormDetail>(`/api/forms/${id}`),

  patchForm: (
    id: number,
    body: Partial<{
      title: string;
      theme_color: string;
      thank_you_title: string;
      thank_you_message: string;
    }>,
  ) =>
    request<FormDetail>(`/api/forms/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteForm: (id: number) =>
    request<void>(`/api/forms/${id}`, { method: "DELETE" }),

  duplicateForm: (id: number) =>
    request<FormDetail>(`/api/forms/${id}/duplicate`, { method: "POST" }),

  publishForm: (id: number) =>
    request<FormDetail>(`/api/forms/${id}/publish`, { method: "POST" }),

  unpublishForm: (id: number) =>
    request<FormDetail>(`/api/forms/${id}/unpublish`, { method: "POST" }),

  createQuestion: (formId: number, type: QuestionType) =>
    request<Question>(`/api/forms/${formId}/questions`, {
      method: "POST",
      body: JSON.stringify({ type }),
    }),

  patchQuestion: (
    formId: number,
    questionId: number,
    body: Partial<{
      title: string;
      description: string;
      required: boolean;
      type: QuestionType;
      config: Question["config"];
    }>,
  ) =>
    request<Question>(`/api/forms/${formId}/questions/${questionId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteQuestion: (formId: number, questionId: number) =>
    request<void>(`/api/forms/${formId}/questions/${questionId}`, {
      method: "DELETE",
    }),

  reorderQuestions: (formId: number, questionIds: number[]) =>
    request<Question[]>(`/api/forms/${formId}/questions/reorder`, {
      method: "PUT",
      body: JSON.stringify({ question_ids: questionIds }),
    }),

  getPublicForm: (slug: string) =>
    request<PublicFormDetail>(`/api/public/forms/${slug}`),

  submitResponse: (
    slug: string,
    answers: {
      question_id: number;
      value: string | number | boolean | import("./types").ContactInfoAnswer;
    }[],
    idempotencyKey: string,
  ) =>
    request<{ id: number; submitted_at: string }>(
      `/api/public/forms/${slug}/responses`,
      {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({ answers }),
      },
    ),

  listResponses: (formId: number) =>
    request<ResponseListResponse>(`/api/forms/${formId}/responses`),

  getResponse: (formId: number, responseId: number) =>
    request<ResponseDetail>(`/api/forms/${formId}/responses/${responseId}`),

  getSummary: (formId: number) =>
    request<FormSummary>(`/api/forms/${formId}/summary`),
};
