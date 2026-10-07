"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { ContactInfoAnswer, FormDetail, ResponseDetail } from "@/lib/types";
import { useToast } from "@/components/Toast";

function formatValue(
  answer: ResponseDetail["answers"][0],
  form: FormDetail | null,
): string {
  const { value, question_type, question_id } = answer;
  if (value === true) return "Yes";
  if (value === false) return "No";
  if (
    question_type === "contact_info" &&
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    const v = value as ContactInfoAnswer;
    return [
      v.first_name,
      v.last_name,
      v.phone,
      v.email,
      v.company,
    ]
      .filter(Boolean)
      .join(" · ");
  }
  if (
    (question_type === "multiple_choice" || question_type === "dropdown") &&
    form &&
    question_id
  ) {
    const question = form.questions.find((q) => q.id === question_id);
    if (question && "choices" in question.config) {
      const match = question.config.choices.find((c) => c.id === value);
      if (match) return match.label;
    }
  }
  return String(value);
}

export default function ResponseDetailPage() {
  const params = useParams();
  const formId = Number(params.id);
  const responseId = Number(params.responseId);
  const { showToast } = useToast();
  const [form, setForm] = useState<FormDetail | null>(null);
  const [response, setResponse] = useState<ResponseDetail | null>(null);

  const load = useCallback(async () => {
    try {
      const [formData, responseData] = await Promise.all([
        api.getForm(formId),
        api.getResponse(formId, responseId),
      ]);
      setForm(formData);
      setResponse(responseData);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load response");
    }
  }, [formId, responseId, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="app-shell min-h-screen px-6 py-8">
      <Link
        href={`/forms/${formId}/results`}
        className="text-sm font-medium text-[var(--muted)] hover:text-[var(--label)]"
      >
        ← Responses
      </Link>
      <h1 className="mt-4 text-xl font-semibold">Response</h1>
      {response ? (
        <p className="mt-1 text-sm text-[var(--muted)]">
          {new Date(response.submitted_at).toLocaleString()}
        </p>
      ) : null}
      <ul className="mt-8 space-y-6">
        {response?.answers.map((answer, index) => (
          <li key={`${answer.question_title}-${index}`} className="app-panel p-4">
            <div className="text-sm font-medium">{answer.question_title}</div>
            <div className="mt-1 text-[var(--label)]">
              {formatValue(answer, form)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
