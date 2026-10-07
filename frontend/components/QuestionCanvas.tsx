"use client";

import { ContactFieldsPreview } from "@/components/ContactFieldsUi";
import { contactConfigFromQuestion } from "@/lib/contactInfo";
import type { Question } from "@/lib/types";
import { PEARL_BG, PEARL_INK, PEARL_LINE } from "@/lib/pearlWhite";

interface QuestionCanvasProps {
  question: Question | null;
  endingSelected: boolean;
  thankYouTitle: string;
  thankYouMessage: string;
  questionNumber: number;
  onPatch: (patch: Partial<Question>) => void;
  onPatchThankYou: (patch: {
    thank_you_title?: string;
    thank_you_message?: string;
  }) => void;
}

const INK = PEARL_INK;
const LINE = PEARL_LINE;

function choiceLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

export function QuestionCanvas({
  question,
  endingSelected,
  thankYouTitle,
  thankYouMessage,
  questionNumber,
  onPatch,
  onPatchThankYou,
}: QuestionCanvasProps) {
  if (endingSelected) {
    return (
      <div className="flex flex-1 flex-col overflow-y-auto bg-white p-8">
        <div className="mx-auto w-full max-w-2xl rounded-xl border border-[var(--border-subtle)] p-10 shadow-sm" style={{ background: PEARL_BG }}>
          <p className="text-xs font-medium uppercase text-[var(--muted)]">
            End screen
          </p>
          <input
            className="mt-4 w-full border-0 bg-transparent text-2xl font-normal outline-none text-[var(--question)]"
            value={thankYouTitle}
            onChange={(e) => onPatchThankYou({ thank_you_title: e.target.value })}
          />
          <textarea
            className="mt-4 w-full resize-none border-0 bg-transparent text-lg outline-none text-[var(--muted)]"
            rows={3}
            value={thankYouMessage}
            onChange={(e) =>
              onPatchThankYou({ thank_you_message: e.target.value })
            }
          />
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-1 items-center justify-center bg-white text-sm text-[var(--muted)]">
        Select a question or add content
      </div>
    );
  }

  const placeholder =
    "placeholder" in question.config ? question.config.placeholder : "";

  const renderPreview = () => {
    if (question.type === "long_text") {
      return (
        <textarea
          readOnly
          className="mt-6 w-full resize-none border-0 border-b bg-transparent text-2xl opacity-80"
          style={{ borderColor: LINE }}
          placeholder={placeholder}
          rows={3}
        />
      );
    }
    if (
      question.type === "short_text" ||
      question.type === "email" ||
      question.type === "number"
    ) {
      return (
        <input
          readOnly
          className="mt-6 w-full border-0 border-b bg-transparent text-2xl opacity-80"
          style={{ borderColor: LINE }}
          placeholder={placeholder}
        />
      );
    }
    if (question.type === "dropdown" || question.type === "multiple_choice") {
      const choices =
        "choices" in question.config ? question.config.choices : [];
      return (
        <div className="mt-6 flex flex-col gap-2">
          {choices.map((choice, i) => (
            <div
              key={choice.id}
              className="editor-gray-box flex items-center gap-3 px-4 py-3"
              style={{ borderColor: LINE, borderRadius: 4 }}
            >
              {question.type === "multiple_choice" ? (
                <span
                  className="flex h-7 w-7 items-center justify-center text-sm text-white"
                  style={{ background: INK, borderRadius: 4 }}
                >
                  {choiceLetter(i)}
                </span>
              ) : null}
              <input
                className="flex-1 border-0 bg-transparent outline-none"
                value={choice.label}
                onChange={(e) => {
                  const next = choices.map((c) =>
                    c.id === choice.id ? { ...c, label: e.target.value } : c,
                  );
                  onPatch({ config: { choices: next } });
                }}
                onBlur={(e) => {
                  const next = choices.map((c) =>
                    c.id === choice.id ? { ...c, label: e.target.value } : c,
                  );
                  onPatch({ config: { choices: next } });
                }}
              />
            </div>
          ))}
        </div>
      );
    }
    if (question.type === "yes_no") {
      return (
        <div className="mt-6 flex flex-col gap-2">
          {["Yes", "No"].map((label) => (
            <div
              key={label}
              className="editor-gray-box px-4 py-3"
              style={{ borderColor: LINE, borderRadius: 4 }}
            >
              {label}
            </div>
          ))}
        </div>
      );
    }
    if (question.type === "rating") {
      const max =
        "max" in question.config && typeof question.config.max === "number"
          ? question.config.max
          : 5;
      return (
        <div className="mt-6 flex gap-2 text-2xl" style={{ color: INK }}>
          {Array.from({ length: max }, (_, i) => (
            <span key={i}>★</span>
          ))}
        </div>
      );
    }
    if (question.type === "contact_info") {
      return (
        <ContactFieldsPreview config={contactConfigFromQuestion(question)} />
      );
    }
    return null;
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-white p-6 min-h-0">
      <div
        className="mx-auto w-full max-w-2xl flex-1 p-10"
        style={{ background: PEARL_BG, color: INK }}
      >
        <div className="flex items-start gap-3">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center text-[11px] font-medium text-white"
            style={{ background: INK, borderRadius: 4 }}
          >
            {questionNumber}
          </span>
          <div className="min-w-0 flex-1">
            <input
              className="w-full border-0 bg-transparent text-[26px] font-normal outline-none text-[var(--question)]"
              value={question.title}
              onChange={(e) => onPatch({ title: e.target.value })}
              onBlur={(e) => onPatch({ title: e.target.value.trim() })}
            />
            <textarea
              className="mt-3 w-full resize-none border-0 bg-transparent text-lg outline-none text-[var(--muted)]"
              placeholder="Description (optional)"
              value={question.description}
              rows={2}
              onChange={(e) => onPatch({ description: e.target.value })}
              onBlur={(e) => onPatch({ description: e.target.value })}
            />
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  );
}
